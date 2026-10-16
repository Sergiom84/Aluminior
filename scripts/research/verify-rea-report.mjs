/** Check only the finite deliverable: links, privacy boundary and source scope. */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const root = resolve(process.argv[2] ?? '.')
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
const files = [...new Set([...git(['diff', '--name-only', '307bf54']), ...git(['ls-files', '--others', '--exclude-standard'])])]
if (files.length === 0) throw new Error('Empty delivery scan')
const allowedDocs = new Set(['RELEVO-PARIDAD-PRODUCTOR.md', 'ROADMAP-PARIDAD-PRODUCTOR.md',
  'docs/CONTINUAR-EN-WINDOWS.md', 'docs/ESTADO-ACTUAL.md', 'docs/INDICE-DOCUMENTACION.md',
  'docs/paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md',
  'docs/paridad/INVESTIGACION-REA-PRODUCTOR-2026-10-16.md'])
const errors = []
let links = 0
for (const file of files) {
  if (!allowedDocs.has(file) && !/^scripts\/research\/(ProductorBoundedDecompile\.java|rea-productor-source-map\.mjs|verify-rea-productor\.py|verify-rea-report\.mjs)$/.test(file)) {
    errors.push(`Outside finite delivery scope: ${file}`)
    continue
  }
  const path = resolve(root, file)
  if (!existsSync(path) || statSync(path).size > 100000) {
    errors.push(`Missing or unexpected large file: ${file}`)
    continue
  }
  const text = readFileSync(path, 'utf8')
  // Scan values, not words such as "password" that occur in a safety description.
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./.test(text)) {
    errors.push(`Credential-shaped value: ${file}`)
  }
  if (file.endsWith('.md')) for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0]
    if (!target || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(target)) continue
    links++
    if (!existsSync(resolve(dirname(path), decodeURIComponent(target)))) errors.push(`Broken link in ${file}: ${target}`)
  }
}
const matrix = readFileSync(resolve(root, 'docs/paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md'), 'utf8')
const matrixRows = matrix.split(/\r?\n/).filter(line => line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| Capacidad')).length
if (matrixRows < 30) errors.push('Missing comparison rows')
const result = { passed: errors.length === 0, changed_files: files, links_checked: links,
  comparison_rows: matrixRows, errors,
  limitations: ['Pattern scan is bounded; source review remains necessary.', 'Link existence does not validate linked historical facts.'] }
writeFileSync(resolve(root, 'output/rea-productor-20261016/delivery-verification.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
if (errors.length) process.exitCode = 1
