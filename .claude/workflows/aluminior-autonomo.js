export const meta = {
  name: 'aluminior-autonomo',
  description: 'Arquitecto + trabajadores: mide/avanza los frentes accionables de Aluminior contra el oraculo, verifica cada hallazgo de forma adversarial y devuelve anexos propuestos. NO commitea (lo hace el arquitecto de la conversacion tras revisar) y NO toca decisiones del titular ni frentes bloqueados por datos.',
  phases: [
    { title: 'Mapa', detail: 'el arquitecto lista los frentes accionables' },
    { title: 'Trabajo', detail: 'un trabajador por frente + verificacion adversarial' },
    { title: 'Sintesis', detail: 'el arquitecto consolida y propone anexos T.33+' },
  ],
}

// Reglas del proyecto que TODO agente debe respetar (se inyectan en cada prompt).
const REGLAS = `
REGLAS (PROMPT-FABLE.md): 1) mide contra el oraculo antes de concluir; 2) ejecuta
lo que escribes; 3) nunca inventes un valor (si falta, se dice "sin valorar", no
cero); 4) cero datos personales; 7) di lo que no sabes y para; 8) enlaza por
VDatosLinDetDis exacto, NUNCA por proximidad de medida.
ENTORNO: repo C:\\Users\\sergi\\Desktop\\Aplicaciones\\Aluminior. CSV en EMP0016/
(.env RUTA_CSV_ORIGEN, DATABASE_URL). Scripts: npx tsx. BD Supabase SOLO LECTURA,
NUNCA npm run etl, NUNCA modificar datos. MDB originales en
C:\\Users\\sergi\\Desktop\\Productor\\Aluminio\\ solo lectura sobre copia via
PowerShell 32-bit + ODBC Access (helper en %TEMP%\\aluminior_explore\\leer-mdb.ps1);
NUNCA la aluminio.mdb activa. Contexto completo: CONTINUACION.md y PLAN.md (T.24-T.32).
`

const ESQUEMA_FRENTES = {
  type: 'object', additionalProperties: false,
  required: ['frentes'],
  properties: {
    frentes: {
      type: 'array', maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'titulo', 'tipo', 'accionable', 'tarea'],
        properties: {
          id: { type: 'string' },
          titulo: { type: 'string' },
          tipo: { type: 'string', enum: ['medicion', 'fix'] },
          accionable: { type: 'boolean', description: 'false si esta bloqueado por datos o es decision del titular' },
          razon_no_accionable: { type: 'string' },
          tarea: { type: 'string', description: 'que medir/corregir, concreto, contra que del oraculo' },
          hipotesis: {
            type: 'array', maxItems: 4,
            description: 'Si el frente es un problema DURO, descomponlo en 2-4 hipotesis/angulos INDEPENDIENTES que puedan probarse EN PARALELO (no pasos secuenciales). Vacio o 1 elemento = frente simple, un solo trabajador.',
            items: { type: 'string' },
          },
        },
      },
    },
  },
}
const ESQUEMA_TRABAJO = {
  type: 'object', additionalProperties: false,
  required: ['id', 'hallazgo', 'confianza'],
  properties: {
    id: { type: 'string' },
    hallazgo: { type: 'string', description: 'resultado con cifras clave' },
    script_dejado: { type: 'string', description: 'ruta del .mjs de solo lectura dejado sin commitear, o vacio' },
    propuesta_anexo: { type: 'string', description: 'borrador del anexo T.NN o del fix, o vacio si negativo' },
    confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
  },
}
const ESQUEMA_VERIF = {
  type: 'object', additionalProperties: false,
  required: ['id', 'veredicto', 'notas'],
  properties: {
    id: { type: 'string' },
    veredicto: { type: 'string', enum: ['CONFIRMADO', 'DUDOSO', 'REFUTADO'] },
    notas: { type: 'string', description: 'que se re-verifico y con que resultado; senala cualquier emparejamiento fabricado (regla 8) o grupo trivial (regla 9)' },
  },
}
const ESQUEMA_SINTESIS = {
  type: 'object', additionalProperties: false,
  required: ['resumen', 'anexos_propuestos', 'bloqueados', 'decisiones_titular'],
  properties: {
    resumen: { type: 'string' },
    anexos_propuestos: { type: 'array', items: { type: 'string' }, description: 'anexos T.33+ listos para que el arquitecto revise, escriba en PLAN.md y commitee' },
    bloqueados: { type: 'array', items: { type: 'string' } },
    decisiones_titular: { type: 'array', items: { type: 'string' } },
  },
}

// ── Fase 1: el ARQUITECTO mapea los frentes accionables ──────────────────
phase('Mapa')
const mapa = await agent(
  `Eres el ARQUITECTO de Aluminior. Lee CONTINUACION.md (seccion 3, "Que hacer en orden")
y los anexos T.24-T.32 de PLAN.md. Devuelve la lista de frentes con su estado.
Marca accionable=false (con razon) los BLOQUEADOS por datos (atribucion de junta T.30,
24 tramos S.9.1, bisagra GM4846, formula geometrica MO, AperturaTH como regla) y las
DECISIONES DEL TITULAR (conectar el predictor de asociados). Marca accionable=true solo
los que se avanzan MIDIENDO o con un fix bien acotado y verificable (p.ej. recuento por
geometria de EstructurasDiseño; MO de colocacion como campo manual; cabos menores).
Para cada accionable da una tarea CONCRETA y contra que del oraculo se contrasta.
PARALELISMO: si un frente es UN problema DURO (p.ej. el RECUENTO), no lo dejes como una
sola tarea secuencial: descomponlo en 2-4 HIPOTESIS/ANGULOS INDEPENDIENTES en el campo
"hipotesis" para probarlos EN PARALELO (p.ej. para el recuento: geometria de linea,
topologia de esquinas del arbol EstructurasDiseño, y config en ConfigDis.mdb). Cada
hipotesis debe poder medirse sin esperar a las otras. Frente simple = hipotesis vacio.
${REGLAS}`,
  { schema: ESQUEMA_FRENTES, label: 'arquitecto:mapa', phase: 'Mapa' },
)
const accionables = (mapa?.frentes ?? []).filter((f) => f.accionable)
log(`Frentes accionables: ${accionables.length} de ${mapa?.frentes?.length ?? 0}`)
if (!accionables.length) {
  return { resumen: 'No hay frentes accionables: todo esta bloqueado por datos o es decision del titular.', anexos_propuestos: [], bloqueados: (mapa?.frentes ?? []).filter((f) => !f.accionable).map((f) => `${f.id}: ${f.razon_no_accionable}`), decisiones_titular: [] }
}

// ── Fase 2: TRABAJADORES + verificacion adversarial ──────────────────────
// Un frente SIMPLE = un trabajador. Un frente DURO con >=2 hipotesis = un
// trabajador por hipotesis EN PARALELO + un sintetizador de frente. Asi el
// paralelismo aparece incluso cuando hay un solo frente duro (no se marcha
// secuencial pudiendo probar varios angulos a la vez).
phase('Trabajo')
const trabajar = (f, tarea, etiqueta) => agent(
  `Eres un TRABAJADOR de Aluminior. Frente ${f.id}: ${f.titulo}.
TAREA: ${tarea}
Trabaja SOLO LECTURA por defecto (deja el .mjs sin commitear). Si el frente es un fix
de codigo, describe el cambio y su verificacion pero NO commitees. Contrasta contra el
oraculo con enlace exacto (regla 8). Imprime nulos/ceros (regla 7). Reporta destilado
con cifras; si el resultado es negativo o el frente resulta bloqueado, dilo (tambien es
resultado). ${REGLAS}`,
  { schema: ESQUEMA_TRABAJO, label: etiqueta, phase: 'Trabajo' },
)
const verificar = (f, r) => agent(
  `Eres el VERIFICADOR adversarial. El trabajador reporto sobre el frente ${f.id}:
"${r.hallazgo}"
Intenta REFUTARLO: re-ejecuta o re-mide lo esencial, busca emparejamientos fabricados
(regla 8), grupos triviales (regla 9) y sobreajuste. Devuelve CONFIRMADO solo si
sobrevive; DUDOSO si no puedes decidir; REFUTADO si cae. ${REGLAS}`,
  { schema: ESQUEMA_VERIF, label: `verif:${f.id}`, phase: 'Trabajo' },
)
const trabajados = await parallel(accionables.map((f) => async () => {
  const hips = f.hipotesis ?? []
  if (hips.length >= 2) {
    const angulos = (await parallel(hips.map((h, i) => () =>
      trabajar(f, `Hipotesis INDEPENDIENTE a probar/refutar: ${h}. Es UN angulo del frente "${f.tarea}"; mide solo este, sin esperar a los demas.`, `hip:${f.id}:${i}`),
    ))).filter(Boolean)
    if (!angulos.length) return null
    const neto = await agent(
      `Eres el ARQUITECTO del frente ${f.id}: ${f.titulo}. Se probaron ${angulos.length} hipotesis EN PARALELO:
${JSON.stringify(angulos.map((a) => ({ hallazgo: a.hallazgo, confianza: a.confianza })))}
Consolida en UN hallazgo neto con cifras: que angulo cierra el frente (o por que no cierra ninguno, descartando cada uno). ${REGLAS}`,
      { schema: ESQUEMA_TRABAJO, label: `sint:${f.id}`, phase: 'Trabajo' },
    )
    return { frente: f, trabajo: neto, verif: await verificar(f, neto) }
  }
  const r = await trabajar(f, f.tarea, `trab:${f.id}`)
  return r ? { frente: f, trabajo: r, verif: await verificar(f, r) } : null
}))

// ── Fase 3: el ARQUITECTO consolida (solo lo CONFIRMADO) ──────────────────
phase('Sintesis')
const confirmados = trabajados.filter(Boolean).filter((t) => t.verif?.veredicto === 'CONFIRMADO')
const dudosos = trabajados.filter(Boolean).filter((t) => t.verif?.veredicto !== 'CONFIRMADO')
const sintesis = await agent(
  `Eres el ARQUITECTO. Consolida SOLO los hallazgos CONFIRMADOS y redacta, para cada uno,
un anexo T.33+ listo para PLAN.md (con cifras, correccion explicita si aplica -regla 6-,
y la nota de que no valora ninguna linea todavia si procede -T.20.3-).
CONFIRMADOS: ${JSON.stringify(confirmados.map((t) => ({ id: t.frente.id, hallazgo: t.trabajo.hallazgo, anexo: t.trabajo.propuesta_anexo })))}
NO consolidados (dudosos/refutados, se reportan pero NO se anexan): ${JSON.stringify(dudosos.map((t) => ({ id: t.frente.id, veredicto: t.verif?.veredicto, notas: t.verif?.notas })))}
Lista aparte lo BLOQUEADO y las DECISIONES DEL TITULAR que hayan aparecido.
El arquitecto de la conversacion revisara, escribira los anexos en PLAN.md, barrera
NIF/emails/moviles y commiteara (commits pequenos). NO commitees tu. ${REGLAS}`,
  { schema: ESQUEMA_SINTESIS, label: 'arquitecto:sintesis', phase: 'Sintesis' },
)
return sintesis
