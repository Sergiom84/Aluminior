"""Verify source parity, bounded native extraction and preserved binary identities.

Reads bytes only; never loads Productor, CLR, COM or a database.
"""
import argparse
import csv
import hashlib
import json
import pathlib
import struct


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pe_offset(data, address):
    pe = struct.unpack_from('<I', data, 0x3c)[0]
    assert data[pe:pe + 4] == b'PE\0\0'
    optional = pe + 24
    assert struct.unpack_from('<H', data, optional)[0] == 0x10b
    base = struct.unpack_from('<I', data, optional + 28)[0]
    sections = optional + struct.unpack_from('<H', data, pe + 20)[0]
    for index in range(struct.unpack_from('<H', data, pe + 6)[0]):
        section = sections + index * 40
        rva, size, offset = struct.unpack_from('<III', data, section + 12)
        delta = address - base - rva
        if 0 <= delta < size:
            return offset + delta
    raise ValueError(f'No file backing for {address:x}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worktree', required=True, type=pathlib.Path)
    parser.add_argument('--installation', required=True, type=pathlib.Path)
    parser.add_argument('--sample', required=True, type=pathlib.Path)
    parser.add_argument('--prior-native', required=True, type=pathlib.Path)
    args = parser.parse_args()
    output = args.worktree / 'output/rea-productor-20261016'
    sources = json.loads((output / 'source-map.json').read_text(encoding='utf-8'))
    original = json.loads((output / 'source-map-original.json').read_text(encoding='utf-8'))
    assert sources['files'], 'Empty source scan'
    left = {r['path']: r for r in sources['files']}
    right = {r['path']: r for r in original['files']}
    changed = [p for p in left.keys() & right.keys()
               if left[p]['normalized_sha256'] != right[p]['normalized_sha256']]
    assert not changed, changed
    assert not left.keys() - right.keys()
    generated_only = sorted(right.keys() - left.keys())
    assert generated_only == ['packages/web/next-env.d.ts'], generated_only
    for manifest in (sources, original):
        for record in manifest['files']:
            assert sha((pathlib.Path(manifest['root']) / record['path']).read_bytes()) == record['sha256'], record['path']
    source_check = dict(common_files=len(left), semantic_changes=changed,
                        original_only_generated=generated_only, all_manifest_hashes_current=True)
    data = args.sample.read_bytes()
    expected = 'f7c49752d6c00e61d7a0f56dd4c0347a79b8da1bec26a020321d3ca353e3809b'
    assert sha(data) == expected
    assert sha((args.installation / 'aluminioApp.exe').read_bytes()) == expected
    prior = json.loads(args.prior_native.read_text(encoding='utf-8'))
    start, end = int(prior['start'], 16), int(prior['end_exclusive'], 16)
    begin, finish = pe_offset(data, start), pe_offset(data, end)
    assert sha(data[begin:finish]) == prior['bytes_sha256']
    native = output / 'native'
    ranges = list(csv.DictReader((native / 'body-ranges.tsv').read_text().splitlines(), delimiter='\t'))
    assert ranges
    total = 0
    previous = start - 1
    for item in ranges:
        low, high = int(item['start'], 16), int(item['end_inclusive'], 16)
        assert start <= low <= high < end and low > previous
        offset = pe_offset(data, low)
        length = high - low + 1
        assert length == int(item['bytes'])
        assert sha(data[offset:offset + length]) == item['loaded_sha256']
        previous = high
        total += length
    result = dict(line.split('=', 1) for line in (native / 'bounded-result.txt').read_text().splitlines())
    assert result['decompile_completed'] == 'true'
    assert result['program_sha256'] == expected
    assert total == int(result['body_addresses'])
    assembly = (native / 'bounded.asm.txt').read_text().splitlines()
    assert len(assembly) == int(result['instructions'])
    for line in assembly:
        address = int(line.split()[0], 16)
        assert any(int(r['start'], 16) <= address <= int(r['end_inclusive'], 16) for r in ranges)
    pseudo = (native / 'bounded.pseudo.c.txt').read_text()
    assert 'bounded_candidate_01ad83e0' in pseudo
    native_check = dict(source_sha256=expected, source_and_copy_match=True,
                        prior_span_bytes=finish - begin, body_bytes=total,
                        body_ranges=len(ranges), instruction_lines=len(assembly),
                        body_hashes_match_source=True, decompile_completed=True,
                        warnings=[line for line in pseudo.splitlines() if 'WARNING:' in line],
                        limitations=['This verifies bytes and output existence, not pseudocode semantics or runtime behavior.'])
    managed = json.loads((output / 'managed/artifact-map.json').read_text(encoding='utf-8'))
    assert len(managed['records']) == managed['total'] == 123
    identities = set()
    for record in managed['records']:
        assert record['name'] not in identities
        identities.add(record['name'])
        assert record['exit_code'] == 0
        assert sha(pathlib.Path(record['path']).read_bytes()) == record['sha256'] == record['previous_sha256']
        evidence = json.loads(pathlib.Path(record['output']).read_text(encoding='utf-8'))
        assert evidence['subject']['digest']['sha256'] == record['sha256']
        assert evidence['evidence_id'] == record['evidence_id']
    il = json.loads((output / 'managed/il-contract-verification.json').read_text(encoding='utf-8'))
    assert len(il['checks']) == il['checked_method_bodies'] == 716
    assert sum(r['il_bytes'] for r in il['checks']) == il['il_bytes'] == 66669
    assert sum(r['instructions'] for r in il['checks']) == il['instructions'] == 26524
    assert len({(r['artifact'], r['token']) for r in il['checks']}) == 716
    managed_check = dict(current_binary_and_evidence_identities=123,
                         second_check_method_bodies=716, il_bytes=66669,
                         il_instructions=26524,
                         limitations=['IL opcode verification is a separate executed recover_contract_il.py check.',
                                      'Method/body counts do not verify functional equivalence.'])
    costemed = json.loads((native / 'costemed-static.json').read_text(encoding='utf-8'))
    assert sha(pathlib.Path(costemed['source']).read_bytes()) == costemed['source_sha256']
    assert costemed['selected_utf16_strings']
    native_check['costemed_static_identity_preserved'] = costemed['source_sha256']
    report = dict(status='pass', source_check=source_check, native_check=native_check,
                  managed_check=managed_check)
    (output / 'verification-root.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
