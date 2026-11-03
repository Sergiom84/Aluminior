import { build } from 'esbuild'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

export async function abrirHarness(out, controlRef) {
  const root = process.cwd()
  const source = resolve('scripts/pruebas-ui/alta-foco')
  const changed = execFileSync('git', ['diff', '--name-only', controlRef, '--', 'packages'], { encoding: 'utf8' })
    .trim().split(/\r?\n/).filter(Boolean)
  assert(changed.length > 0, 'El control requiere al menos un archivo de producto cambiado')
  for (const variant of ['actual', 'control']) {
    mkdirSync(resolve(out, variant), { recursive: true })
    const result = await build({ entryPoints: [resolve(source, 'entry.tsx')], bundle: true,
      outdir: resolve(out, variant), jsx: 'automatic', format: 'iife', metafile: true,
      plugins: [{ name: 'acciones-sinteticas-sin-bd', setup(b) {
        b.onResolve({ filter: /(?:acciones\.ts|editar-cabecera-action|editor-linea-action\.ts|medidas-insercion-action\.ts)$/ }, args => {
          if (args.path.includes('_lib/')) return { path: resolve(source, 'acciones-sinteticas.js') }
        })
        if (variant === 'control') b.onLoad({ filter: /\.[jt]sx?$/ }, args => {
          const relative = args.path.slice(root.length + 1).replaceAll('\\', '/')
          if (changed.includes(relative)) return {
            contents: execFileSync('git', ['show', controlRef + ':' + relative], { encoding: 'utf8' }), loader: 'tsx',
          }
        })
      } }],
    })
    const inputs = Object.keys(result.metafile.inputs)
    assert(inputs.some(p => p.endsWith('/anyadir-linea.tsx')), 'Componente real ausente')
    assert(inputs.some(p => p.endsWith('/disenador-estructura.tsx')), 'Diseñador real ausente')
    assert.deepEqual(inputs.filter(p => /packages\/db\/|node_modules\/(?:postgres|pg|@supabase)\/|_lib\/(?:acciones|editor-linea-action|medidas-insercion-action)\./.test(p)), [])
    writeFileSync(resolve(out, variant, 'inputs.json'), JSON.stringify(inputs, null, 2))
  }
  const cssPath = resolve('packages/web/app/globals.css')
  writeFileSync(resolve(out, 'globals.css'), (await postcss([tailwind()]).process(readFileSync(cssPath, 'utf8'), { from: cssPath })).css)
  const server = createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname
    const variant = pathname.startsWith('/control') ? 'control' : 'actual'
    if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
      const name = pathname.split('/').pop()
      if (!['entry.js', 'entry.css', 'globals.css'].includes(name)) { res.writeHead(404); res.end(); return }
      res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : 'text/css')
      res.end(readFileSync(name === 'globals.css' ? resolve(out, name) : resolve(out, variant, name)))
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/${variant}/entry.css"></head><body><button id="documento">Documento QA</button><div id="root"></div><script>window.qa={calls:[],mode:'success'};document.getElementById('documento').focus()</script><script src="/${variant}/entry.js"></script></body></html>`)
    }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { base: `http://127.0.0.1:${server.address().port}`, changed,
    close: () => new Promise(resolve => server.close(resolve)) }
}
