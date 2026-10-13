# Aceptación PDF multipágina (P.2)

Desde la raíz del repositorio, con las dependencias del lock instaladas:

```bash
npx tsx packages/web/pruebas/pdf-multipagina/generar.ts output/pdf/p2
python3 packages/web/pruebas/pdf-multipagina/verificar.py output/pdf/p2 --render
```

Python necesita `pypdf`, `pdfplumber` y, para `--render`, `pypdfium2` y Pillow.
En Codex se utilizó el Python del runtime devuelto por
`load_workspace_dependencies`; no se añadieron paquetes al proyecto ni al sistema.

`fixture.ts` define seis documentos enteramente sintéticos; `generar.ts` produce
PDF con el componente real, datos JSON y un manifiesto de expectativas.
`verificar.py` consume esos archivos sin regenerar expectativas: valida A4,
pies, marcadores, importes y totales, límites y agrupación de dibujos/MO.
Devuelve 0 si cumple todo y 1 si hay fallo; guarda `verificacion.json`.
`--render` genera un PNG por página: revisarlos visualmente antes de aceptar.

No lee `.env`, abre BD, consulta catálogos comerciales ni usa precios reales.
La aceptación del endpoint sobre persistencia local se documenta por separado.
[Informe y límites](../../../../docs/paridad/PDF-MULTIPAGINA-2026-10-09.md).
