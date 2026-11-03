import { build } from 'esbuild'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

// Reutiliza sólo el montaje y gateway sintéticos vigentes, sin ejecutar su suite.
export async function abrirHarness(out, controlRef) {
  const source = resolve('scripts/pruebas-ui/alta-foco')
  const result = await build({ entryPoints: [resolve(source, 'entry.tsx')], bundle: true,
    outdir: out, jsx: 'automatic', format: 'iife', metafile: true,
    plugins: [{ name: 'acciones-sinteticas-sin-bd', setup(b) {
      if (controlRef) b.onLoad({ filter: /campos-alta\.tsx$/ }, () => ({
        contents: execFileSync('git', ['show', controlRef + ':packages/web/app/dashboard/presupuestos/[id]/_components/campos-alta.tsx'], { encoding: 'utf8' }), loader: 'tsx',
      }))
      b.onResolve({ filter: /(?:acciones\.ts|editar-cabecera-action|editor-linea-action\.ts|medidas-insercion-action\.ts)$/ }, args => {
        if (args.path.includes('_lib/')) return { path: resolve(source, 'acciones-sinteticas.js') }
      })
    } }],
  })
  const inputs = Object.keys(result.metafile.inputs)
  for (const component of ['anyadir-linea.tsx', 'disenador-estructura.tsx']) {
    assert(inputs.some(p => p.endsWith('/' + component)), 'Componente real ausente: ' + component)
  }
  assert(inputs.length > 0)
  assert.deepEqual(inputs.filter(p => /packages\/db\/|node_modules\/(?:postgres|pg|@supabase)\/|_lib\/(?:acciones|editar-cabecera-action|editor-linea-action|medidas-insercion-action)\./.test(p)), [])
  writeFileSync(resolve(out, 'inputs.json'), JSON.stringify(inputs, null, 2))
  const css = resolve('packages/web/app/globals.css')
  writeFileSync(resolve(out, 'globals.css'), (await postcss([tailwind()]).process(readFileSync(css, 'utf8'), { from: css })).css)
  const requests = []
  const server = createServer((req, res) => {
    requests.push({ method: req.method, path: req.url })
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return }
    if (['/entry.js', '/entry.css', '/globals.css'].includes(pathname)) {
      res.setHeader('Content-Type', pathname.endsWith('.js') ? 'text/javascript' : 'text/css')
      res.end(readFileSync(resolve(out, pathname.slice(1))))
    } else if (pathname === '/referencia-dialogo') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end('<!doctype html><html lang="es"><title>Referencia nativa</title><body><button>Exterior</button><dialog><button>A</button><button>B</button></dialog><script>document.querySelector("dialog").showModal()</script></body></html>')
    } else if (pathname === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Aluminior QA zoom</title><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/entry.css"></head><body><button id="documento">Documento QA</button><div id="root"></div><script>window.qa={calls:[],mode:'success'};document.getElementById('documento').focus()</script><script src="/entry.js"></script></body></html>`)
    } else { res.writeHead(404); res.end() }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { base: `http://127.0.0.1:${server.address().port}`, requests,
    close: () => new Promise(resolve => server.close(resolve)) }
}
