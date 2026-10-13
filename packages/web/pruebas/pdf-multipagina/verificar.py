#!/usr/bin/env python3
"""Aceptación de PDFs reales contra manifest.json; no consulta BD ni regenera esperados.

Uso: python verificar.py carpeta [--render]
Emite verificacion.json; --render añade PNG de todas las páginas para revisión humana.
Las comprobaciones geométricas no sustituyen esa inspección visual.
"""
import argparse
import json
import math
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


def normalizar(texto):
    texto = unicodedata.normalize("NFKC", texto).replace("\u00ad", "")
    texto = re.sub(r"[-\u2010]\s*\n\s*", "", texto)
    return " ".join(texto.split())


def clave_char(c):
    return c["x0"], c["top"], c["text"]


def comprobar_pdf(ruta, caso):
    errores, lineas, paginas = [], [], []

    def exigir(condicion, mensaje):
        if not condicion:
            errores.append(mensaje)

    lector = PdfReader(ruta, strict=True)
    exigir(not lector.is_encrypted, "PDF cifrado")
    for pagina in lector.pages:
        contenido = pagina.get_contents()
        exigir(contenido is not None and bool(contenido.get_data()), "Página sin contenido")
    with pdfplumber.open(ruta) as pdf:
        exigir(len(pdf.pages) == len(lector.pages), "Lectores discrepan en páginas")
        exigir(len(pdf.pages) >= caso["minPaginas"], "No alcanza minPaginas del escenario")
        for numero, pagina in enumerate(pdf.pages, 1):
            exigir(abs(pagina.width - 595.28) < .1 and abs(pagina.height - 841.89) < .1,
                    f"P{numero}: no es A4 vertical")
            filas = pagina.extract_text_lines()
            for fila in filas:
                fila.update(pagina=numero, texto=normalizar(fila["text"]))
            lineas.extend(filas)
            pies = [f for f in filas if re.search(r"Página \d+/\d+", f["texto"])]
            exigir(len(pies) == 1, f"P{numero}: pie ausente o repetido")
            if not pies:
                continue
            pie = pies[0]
            exigir(f"Página {numero}/{len(pdf.pages)}" in pie["texto"],
                    f"P{numero}: numeración de pie incoherente")
            objetos = pagina.rects + pagina.curves + pagina.lines + pagina.images
            separadores = [o for o in objetos if o["x1"] - o["x0"] > 400
                           and o["bottom"] - o["top"] <= 1
                           and pie["top"] - 10 <= o["top"] < pie["top"]]
            limite = min((o["top"] for o in separadores), default=pie["top"] - 4)
            chars_pie = {clave_char(c) for c in pie["chars"]}
            cuerpo = [c for c in pagina.chars if c["text"].strip()
                      and clave_char(c) not in chars_pie]
            exigir(bool(cuerpo), f"P{numero}: página vacía salvo pie")
            graficos = [o for o in objetos if o not in separadores]
            fuera = [o for o in cuerpo + graficos if not all(math.isfinite(o[k])
                     for k in ("x0", "x1", "top", "bottom")) or o["x0"] < 35
                     or o["x1"] > pagina.width - 35 or o["top"] < 35
                     or o["bottom"] > limite - .1]
            exigir(not fuera, f"P{numero}: {len(fuera)} elementos fuera del área útil o sobre el pie")
            paginas.append({"numero": numero, "texto": pagina.extract_text() or "",
                            "lineas": filas, "graficos": graficos})

    # Invariante independiente de identificadores únicos del fixture: ningún dibujo
    # puede continuar en otra página sin su rótulo. También detecta el baseline viejo.
    for pagina in paginas:
        rotulo, tiene_medidas = None, False
        for fila in pagina["lineas"]:
            if re.fullmatch(r"Línea \d+", fila["texto"]):
                exigir(rotulo is None or tiene_medidas,
                        f'P{pagina["numero"]}: {rotulo} sin medidas en su página')
                rotulo, tiene_medidas = fila["texto"], False
            elif re.fullmatch(r"[\d.,]+ × [\d.,]+ mm", fila["texto"]):
                exigir(rotulo is not None and not tiene_medidas,
                        f'P{pagina["numero"]}: medidas sin rótulo propio en su página')
                tiene_medidas = True
            elif re.match(r"^(Colocación|Fabricación) [\d.,—]+ h", fila["texto"]):
                exigir(rotulo is not None and tiene_medidas,
                        f'P{pagina["numero"]}: MO sin rótulo y medidas previos')
        exigir(rotulo is None or tiene_medidas,
                f'P{pagina["numero"]}: {rotulo} sin medidas en su página')

    texto = normalizar("\n".join(p["texto"] for p in paginas))
    for marcador in caso["marcadores"]:
        apariciones = len(re.findall(r"(?<!\w)" + re.escape(marcador) + r"(?!\w)", texto))
        exigir(apariciones == 1, f"Marcador {marcador}: {apariciones} apariciones")

    def unica(texto_esperado):
        halladas = [f for f in lineas if f["texto"] == normalizar(texto_esperado)]
        exigir(len(halladas) == 1, f"Texto único {texto_esperado!r}: {len(halladas)} apariciones")
        return halladas[0] if len(halladas) == 1 else None

    totales = []
    for clave, patron in [("base", r"^Base imponible "), ("iva", r"^IVA [\d.,]+% "),
                          ("total", r"^Total ")]:
        halladas = [f for f in lineas if re.match(patron, f["texto"])]
        exigir(len(halladas) == 1, f"Total {clave}: etiqueta ausente o repetida")
        if len(halladas) == 1:
            fila = halladas[0]
            totales.append(fila)
            exigir(re.sub(patron, "", fila["texto"]) == normalizar(caso["totales"][clave]),
                    f"Total {clave}: valor distinto al esperado")
    exigir(len({f["pagina"] for f in totales}) == 1, "Totales separados entre páginas")
    exigir([f["top"] for f in totales] == sorted(f["top"] for f in totales),
            "Orden de base, IVA y total incorrecto")

    etiquetas = [f for f in lineas if re.fullmatch(r"Línea \d+", f["texto"])]
    exigir(sorted(f["texto"] for f in etiquetas) ==
            sorted(f'Línea {d["orden"]}' for d in caso["dibujos"]),
            "Etiquetas de dibujo perdidas, inesperadas o duplicadas")
    bloques = []
    for dibujo in caso["dibujos"]:
        etiqueta = unica(f'Línea {dibujo["orden"]}')
        medidas = unica(dibujo["medidas"])
        manos = [unica(m) for m in dibujo["manoObra"]]
        grupo = [etiqueta, medidas, *manos]
        if any(f is None for f in grupo):
            continue
        misma = len({f["pagina"] for f in grupo}) == 1
        exigir(misma, f'Línea {dibujo["orden"]}: rótulo, medidas y MO separados entre páginas')
        if not misma:
            continue
        exigir(all(a["bottom"] <= b["top"] for a, b in zip(grupo, grupo[1:])),
                f'Línea {dibujo["orden"]}: orden visual incorrecto o solapado')
        pagina = next(p for p in paginas if p["numero"] == etiqueta["pagina"])
        trazos = [o for o in pagina["graficos"] if o["top"] >= etiqueta["bottom"]
                  and o["bottom"] <= medidas["top"] and o["x1"] - o["x0"] > .1
                  and o["bottom"] - o["top"] > .1]
        exigir(bool(trazos), f'Línea {dibujo["orden"]}: falta dibujo entre rótulo y medidas')
        bloques.append({"orden": dibujo["orden"], "pagina": etiqueta["pagina"],
                        "trazos": len(trazos)})

    for linea in caso.get("lineas", []):
        inicios = [f for f in lineas if re.search(r"\b" + re.escape(linea["inicio"]) + r"\b", f["texto"])]
        finales = [f for f in lineas if re.search(r"\b" + re.escape(linea["fin"]) + r"\b", f["texto"])]
        if len(inicios) != 1 or len(finales) != 1:
            continue  # La comprobación de marcadores ya informa de este fallo.
        inicio, final = inicios[0], finales[0]
        exigir((inicio["pagina"], inicio["top"]) <= (final["pagina"], final["top"]),
                f'Línea {linea["orden"]}: descripción fuera de orden')
        banda = " ".join(f["texto"] for f in lineas if f["pagina"] == inicio["pagina"]
                         and inicio["top"] - 2 <= f["top"] <= inicio["top"] + 25)
        # La lectura horizontal debe conservar el orden Precio -> Importe; si
        # ambos son iguales (cero/nulo), se requieren dos apariciones distintas.
        valores = [normalizar(linea[k]) for k in ("precio", "importe")]
        posicion = 0
        for clave, valor in zip(("precio", "importe"), valores):
            # Comparar el importe entero: 1,37 € no puede casar con 101,37 €,
            # ni un positivo con la cola de un importe negativo.
            patron = r"(?<![\w.,+\-\u2212])" + re.escape(valor) + r"(?![\w.,])"
            encontrada = re.compile(patron).search(banda, posicion)
            exigir(encontrada is not None, f'Línea {linea["orden"]}: {clave} ausente o fuera de orden')
            if encontrada is not None:
                posicion = encontrada.end()
    if any(not l["completa"] for l in caso.get("lineas", [])):
        exigir(texto.count("PRESUPUESTO INCOMPLETO") == 1, "Aviso incompleto ausente o duplicado")
    return {"archivo": ruta.name, "paginas": len(lector.pages), "marcadores": len(caso["marcadores"]),
            "bloques": bloques, "errores": errores, "correcto": not errores}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("carpeta", type=Path)
    parser.add_argument("--render", action="store_true", help="Renderiza todas las páginas a PNG")
    args = parser.parse_args()
    resultados = []
    try:
        manifest = json.loads((args.carpeta / "manifest.json").read_text())
        if not manifest["casos"]:
            raise ValueError("Manifest sin escenarios")
        for caso in manifest["casos"]:
            ruta = args.carpeta / caso["archivo"]
            try:
                resultado = comprobar_pdf(ruta, caso)
                if args.render:
                    import pypdfium2
                    with pypdfium2.PdfDocument(str(ruta)) as pdf:
                        for numero, pagina in enumerate(pdf, 1):
                            pagina.render(scale=1.5).to_pil().save(ruta.with_name(f"{ruta.stem}-{numero:02}.png"))
                    resultado["png"] = resultado["paginas"]
                resultados.append(resultado)
            except Exception as error:
                resultados.append({"archivo": ruta.name, "correcto": False,
                                   "errores": [f"{type(error).__name__}: {error}"]})
    except Exception as error:
        resultados.append({"correcto": False, "errores": [f"{type(error).__name__}: {error}"]})
    informe = {"correcto": all(r["correcto"] for r in resultados), "casos": resultados,
               "limite": "Geometría y texto verificados; los PNG requieren inspección visual humana."}
    serializado = json.dumps(informe, ensure_ascii=False, indent=2)
    (args.carpeta / "verificacion.json").write_text(serializado + "\n")
    print(serializado)
    return 0 if informe["correcto"] else 1


if __name__ == "__main__":
    sys.exit(main())
