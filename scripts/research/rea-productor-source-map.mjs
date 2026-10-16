/** Read source as data. Never import product modules, read .env, or connect to a DB. */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, relative, dirname } from 'node:path'

const [rootArg, outputArg, typescriptArg] = process.argv.slice(2)
if (!rootArg || !outputArg || !typescriptArg) {
  throw new Error('Usage: node rea-productor-source-map.mjs ROOT OUTPUT_JSON TYPESCRIPT_MODULE')
}
const root = resolve(rootArg)
const ts = createRequire(import.meta.url)(resolve(typescriptArg))
const omit = new Set(['node_modules', '.next', 'dist', 'coverage', '.git'])
const diagnostics = []
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const path = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) { diagnostics.push({ path: relative(root, path), reason: 'symlink excluded' }); return [] }
    if (omit.has(entry.name)) return []
    return entry.isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(entry.name) ? [path] : []
  })
}
const paths = ['packages', 'e2e'].flatMap(folder => walk(resolve(root, folder)))
if (!paths.length) throw new Error('Empty source scan')
const files = paths.map(path => {
  const buffer = readFileSync(path)
  const text = buffer.toString('utf8')
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
  const name = relative(root, path).replaceAll('\\', '/')
  const row = {
    path: name, sha256: createHash('sha256').update(buffer).digest('hex'),
    normalized_sha256: createHash('sha256').update(text.replaceAll('\r\n', '\n')).digest('hex'),
    lines: text.trimEnd().split(/\r?\n/).length,
    test: /\.test\.|\.spec\./.test(name), imports: [], declarations: [], tables: [], tests: [],
  }
  const line = node => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      row.imports.push({ specifier: node.moduleSpecifier.text, line: line(node) })
    }
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name) {
      row.declarations.push({ name: node.name.text, line: line(node), exported: !!node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) })
    }
    if (ts.isCallExpression(node)) {
      const call = node.expression.getText(source)
      const first = node.arguments[0]
      if (first && ts.isStringLiteralLike(first)) {
        if (call === 'pgTable') row.tables.push({ name: first.text, line: line(node) })
        if (/^(test|it|describe)(\.|$)/.test(call)) row.tests.push({ name: first.text, call, line: line(node) })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return row
})
const sourceDigest = createHash('sha256')
for (const file of files) sourceDigest.update(`${file.path}\0${file.normalized_sha256}\n`)
const packages = {}
for (const file of files) {
  const pkg = file.path.startsWith('packages/') ? file.path.split('/')[1] : 'e2e'
  packages[pkg] ??= { source_files: 0, test_files: 0, tables: 0 }
  packages[pkg][file.test ? 'test_files' : 'source_files']++
  packages[pkg].tables += file.tables.length
}
const result = {
  root, scope: 'All .ts/.tsx in packages and e2e; no symlinks, dependencies or generated output',
  source_digest: sourceDigest.digest('hex'), digest_policy: 'UTF-8 text with CRLF normalized to LF; raw hashes retained per file',
  limitations: ['Declarations and imports are static syntax, not executed behavior.',
    'Static test titles are not test pass results.', 'Absence of declarations does not prove universal absence of a capability.'],
  summary: { files: files.length, packages,
    dashboard_pages: files.filter(f => /^packages\/web\/app\/dashboard\/.*page\.tsx$/.test(f.path)).map(f => f.path),
    tables: files.flatMap(f => f.tables.map(table => ({ file: f.path, ...table }))) },
  diagnostics, files,
}
mkdirSync(dirname(resolve(outputArg)), { recursive: true })
writeFileSync(resolve(outputArg), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ output: resolve(outputArg), source_digest: result.source_digest,
  files: files.length, packages, dashboard_pages: result.summary.dashboard_pages.length,
  tables: result.summary.tables.length, diagnostics: diagnostics.length }))
