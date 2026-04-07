import { useRef, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ── Estilos del documento PDF ─────────────────────────────────────────────────
const estilos = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap');

  .pdf-doc * { box-sizing: border-box; margin: 0; padding: 0; }
  .pdf-doc {
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 500;
    font-size: 10pt;
    color: #000;
    background: transparent;
    width: 816px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 8px 0 32px 0;
  }
  .pdf-pagina {
    width: 816px;
    min-height: 1056px;
    padding: 48px 56px 48px 56px;
    background: white;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 500;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    flex-shrink: 0;
  }
  .pdf-pagina-horizontal {
    width: 1056px;
    min-height: 816px;
    padding: 40px 48px;
    background: white;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 500;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    flex-shrink: 0;
  }
  /* ── Header ── */
  .pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 24px;
  }
  .pdf-header-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pdf-header-logo img {
    height: 52px;
    object-fit: contain;
  }
  .pdf-header-logo-text {
    font-size: 9pt;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1.3;
  }
  .pdf-header-info {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .pdf-header-imdai img {
    height: 40px;
    object-fit: contain;
  }
  .pdf-header-meta {
    font-size: 9pt;
    line-height: 1.6;
    text-align: left;
  }
  .pdf-header-meta strong { font-weight: bold; }

  /* ── Portada ── */
  .pdf-portada-titulo {
    text-align: center;
    margin-top: 60px;
    margin-bottom: 30px;
  }
  .pdf-portada-titulo h1 {
    font-size: 42pt;
    font-weight: normal;
    letter-spacing: 2px;
    line-height: 1.1;
  }
  .pdf-portada-titulo h1 strong {
    font-weight: 900;
    display: block;
  }
  .pdf-portada-dep {
    text-align: center;
    font-size: 18pt;
    font-weight: normal;
    letter-spacing: 3px;
    margin-bottom: 40px;
    text-transform: uppercase;
  }

  /* ── Carátula autorizaciones ── */
  .pdf-caratula-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 40px;
  }
  .pdf-caratula-tabla th {
    background: #4a1020;
    color: white;
    font-size: 10pt;
    font-weight: bold;
    text-align: center;
    padding: 10px 8px;
    border: 1px solid #000;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .pdf-caratula-tabla td {
    border: 1px solid #000;
    padding: 12px 10px;
    text-align: center;
    font-size: 9.5pt;
    vertical-align: top;
    min-height: 100px;
  }
  .pdf-caratula-nombre {
    font-style: italic;
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
  }
  .pdf-caratula-cargo {
    font-size: 9pt;
    display: block;
  }

  /* ── Índice ── */
  .pdf-indice h2 {
    font-size: 22pt;
    font-weight: 900;
    margin-bottom: 24px;
  }
  .pdf-indice-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dotted #ccc;
    font-size: 10pt;
  }
  .pdf-indice-item.nivel1 { font-weight: bold; font-size: 11pt; margin-top: 10px; }
  .pdf-indice-item.nivel2 { padding-left: 20px; }

  /* ── Capítulo heading ── */
  .pdf-cap-titulo {
    font-size: 18pt;
    font-weight: 800;
    font-family: 'Montserrat', Arial, sans-serif;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  /* ── Sección de texto ── */
  .pdf-seccion {
    margin-bottom: 6px;
  }
  .pdf-seccion-titulo {
    font-size: 10pt;
    font-weight: 800;
    font-family: 'Montserrat', Arial, sans-serif;
    text-transform: uppercase;
    color: #444;
    border-bottom: 2.5px solid #000;
    padding-bottom: 1px;
    margin-bottom: 4px;
  }
  .pdf-seccion-texto {
    font-size: 8.5pt;
    font-weight: 500;
    font-family: 'Montserrat', Arial, sans-serif;
    line-height: 1.2;
    text-align: justify;
  }
  .pdf-intro-texto {
    font-size: 11pt;
    font-weight: 500;
    font-family: 'Montserrat', Arial, sans-serif;
    line-height: 1.08;
    text-align: justify;
    text-justify: inter-word;
    text-align-last: left;
    width: 100%;
    margin-bottom: 14px;
  }

  /* ── Marco Normativo ── */
  .pdf-norma-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 9.5pt;
  }
  .pdf-norma-tabla th {
    background: #4a1020;
    color: white;
    padding: 6px 8px;
    text-align: left;
    border: 1px solid #000;
  }
  .pdf-norma-tabla td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: top;
  }
  .pdf-norma-tabla tr:nth-child(even) td { background: #fafafa; }

  /* ── Lista simple ── */
  .pdf-lista { margin: 6px 0 6px 16px; }
  .pdf-lista li { font-size: 10pt; line-height: 1.6; margin-bottom: 2px; }

  /* ── Tabla de inventario ── */
  .pdf-inv-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 9.5pt;
  }
  .pdf-inv-tabla th {
    background: #4a1020;
    color: white;
    padding: 7px 10px;
    text-align: center;
    border: 1px solid #000;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  .pdf-inv-tabla td {
    border: 1px solid #000;
    padding: 5px 10px;
    vertical-align: middle;
  }
  .pdf-inv-tabla tr:nth-child(even) td { background: #fafafa; }
  .pdf-inv-tabla .total-row td {
    background: #4a1020;
    color: white;
    font-weight: bold;
    text-align: center;
  }

  /* ── Descripción de puesto ── */
  .pdf-puesto-header {
    font-size: 14pt;
    font-weight: 800;
    font-family: 'Montserrat', Arial, sans-serif;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .pdf-info-puesto-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 9.5pt;
  }
  .pdf-info-puesto-tabla .header-gris {
    background: #4a1020;
    color: white;
    text-align: center;
    font-weight: bold;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: 7px;
    border: 1px solid #000;
  }
  .pdf-info-puesto-tabla td {
    border: 1px solid #000;
    padding: 6px 10px;
    vertical-align: top;
  }
  .pdf-info-puesto-tabla .label-cell {
    background: #f0f0f0;
    font-weight: bold;
    width: 30%;
    font-size: 9pt;
    text-transform: uppercase;
  }
  .pdf-objetivo-box {
    border: 1px solid #000;
    padding: 10px;
    margin-bottom: 14px;
    font-size: 9.5pt;
    line-height: 1.6;
  }
  .pdf-objetivo-titulo {
    background: #4a1020;
    color: white;
    text-align: center;
    font-weight: bold;
    font-size: 9pt;
    text-transform: uppercase;
    padding: 6px;
    letter-spacing: .5px;
    margin-bottom: 8px;
  }
  .pdf-objetivo-subtitulo {
    text-align: center;
    font-style: italic;
    font-size: 8.5pt;
    color: #555;
    margin-bottom: 8px;
  }
  .pdf-funciones-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 9.5pt;
  }
  .pdf-funciones-tabla .header-gris {
    background: #4a1020;
    color: white;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    padding: 7px;
    border: 1px solid #000;
    font-size: 9pt;
    letter-spacing: .5px;
  }
  .pdf-funciones-tabla .subheader {
    background: #d0d0d0;
    font-weight: bold;
    font-size: 9pt;
    text-transform: uppercase;
    padding: 5px 10px;
    border: 1px solid #000;
  }
  .pdf-funciones-tabla td {
    border: 1px solid #000;
    padding: 5px 10px;
    vertical-align: middle;
  }
  .pdf-funciones-tabla .num-cell {
    text-align: center;
    width: 40px;
    font-weight: bold;
  }
  .pdf-perfil-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 9.5pt;
  }
  .pdf-perfil-tabla .header-gris {
    background: #4a1020;
    color: white;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    padding: 7px;
    border: 1px solid #000;
    font-size: 9pt;
    letter-spacing: .5px;
  }
  .pdf-perfil-tabla td {
    border: 1px solid #000;
    padding: 6px 10px;
    vertical-align: top;
  }
  .pdf-perfil-tabla .label-bold {
    font-weight: bold;
    background: #f0f0f0;
    font-size: 9pt;
  }
  .pdf-escolaridad-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
    font-size: 9pt;
  }
  .pdf-escolaridad-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .pdf-check-box {
    width: 12px;
    height: 12px;
    border: 1px solid #000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9pt;
    font-weight: bold;
    flex-shrink: 0;
  }
  .pdf-firma-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    font-size: 9.5pt;
  }
  .pdf-firma-tabla .header-gris {
    background: #4a1020;
    color: white;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    padding: 7px;
    border: 1px solid #000;
    font-size: 9pt;
  }
  .pdf-firma-tabla td {
    border: 1px solid #000;
    padding: 8px 10px;
    vertical-align: top;
    min-height: 70px;
    text-align: center;
  }
  .pdf-firma-espacio {
    height: 50px;
    border-bottom: 1px solid #000;
    margin-bottom: 6px;
  }
  .pdf-compromiso {
    border: 1px solid #000;
    padding: 10px;
    margin: 14px 0;
    font-size: 8.5pt;
    line-height: 1.5;
    text-align: justify;
  }
  .pdf-cambios-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 9.5pt;
  }
  .pdf-cambios-tabla th {
    background: #4a1020;
    color: white;
    padding: 7px 8px;
    text-align: center;
    border: 1px solid #000;
    font-size: 9pt;
    text-transform: uppercase;
  }
  .pdf-cambios-tabla td {
    border: 1px solid #000;
    padding: 5px 8px;
    text-align: center;
  }
`

// ── Formateador de fecha ───────────────────────────────────────────────────────
const fmtFecha = (str) => {
  if (!str) return '—'
  const s = String(str).trim()

  // Formato YYYY-MM-DD — directo
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`

  // Formato "Fri Mar 06 2026 ..." — extraer partes manualmente
  const meses = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                  Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' }
  const partes = s.match(/(\w{3})\s+(\w{3})\s+(\d{2})\s+(\d{4})/)
  if (partes) {
    const mes = meses[partes[2]] || '01'
    const dia = partes[3]
    const anio = partes[4]
    return `${dia}/${mes}/${anio}`
  }

  return '—'
}

const extraerParrafos = (texto) => {
  if (!texto) return []

  const normalizado = String(texto).replace(/\r\n/g, '\n')

  if (/\n\s*\n/.test(normalizado)) {
    return normalizado
      .split(/\n\s*\n/)
      .map((bloque) => bloque.replace(/\n+/g, ' ').trim())
      .filter(Boolean)
  }

  const lineas = normalizado
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)

  if (lineas.length === 0) return []

  const parrafos = []
  let actual = ''

  lineas.forEach((linea, index) => {
    if (!actual) {
      actual = linea
      return
    }

    const terminaParrafo = /[.!?:;]"?$/.test(actual)
    const siguientePareceNuevoParrafo = /^[A-ZÁÉÍÓÚÑÜ]/.test(linea)

    if (terminaParrafo && siguientePareceNuevoParrafo) {
      parrafos.push(actual.trim())
      actual = linea
      return
    }

    actual = `${actual} ${linea}`.trim()

    if (index === lineas.length - 1) {
      parrafos.push(actual.trim())
    }
  })

  if (actual && (parrafos.length === 0 || parrafos[parrafos.length - 1] !== actual.trim())) {
    parrafos.push(actual.trim())
  }

  return parrafos.filter(Boolean)
}

const extraerParrafosAtribuciones = (texto) => {
  if (!texto) return []

  return extraerParrafos(
    String(texto)
      .replace(/\s+([IVXLCDM]+\))/g, '\n$1')
  )
}

const renderTextoConEncabezadoEnNegritas = (texto) => {
  const valor = String(texto || '').trim()
  const match = valor.match(/^([^.:]+[.:])\s*(.*)$/)

  if (!match) return valor

  return (
    <>
      <strong>{match[1]}</strong>
      {match[2] ? ` ${match[2]}` : ''}
    </>
  )
}

const renderTextoConSaltosPorPunto = (texto) => {
  const partes = String(texto || '')
    .split(/(?<=\.)\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean)

  return partes.map((parte, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {parte}
    </span>
  ))
}

const renderTextoPolitica = (texto) => {
  const valor = String(texto || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+(?=(Horario|Ubicaci[oó]n|Telefono|Tel[eé]fono|Correo)\s*:)/gi, '\n')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)

  return valor.map((linea, i) => {
    const match = linea.match(/^(Horario|Ubicaci[oó]n|Telefono|Tel[eé]fono|Correo)\s*:\s*(.*)$/i)

    if (!match) {
      return (
        <div key={i} style={{ marginBottom: 2, textAlign: 'justify', textJustify: 'inter-word', textAlignLast: 'left', width: '100%' }}>
          {linea}
        </div>
      )
    }

    let etiqueta = match[1].toUpperCase()
    if (etiqueta === 'TELEFONO') etiqueta = 'TELÉFONO'
    if (etiqueta === 'UBICACION') etiqueta = 'UBICACIÓN'

    return (
      <div key={i} style={{ marginBottom: 2, textAlign: 'justify', textJustify: 'inter-word', textAlignLast: 'left', width: '100%' }}>
        <span>{etiqueta}: </span>
        <span>{match[2]}</span>
      </div>
    )
  })
}

const normalizarRutaOrganigrama = (ruta) => {
  if (!ruta) return ''
  if (/^https?:\/\//i.test(ruta)) return ruta
  return `http://localhost:3000${ruta}`
}

const estimarPesoPolitica = (politica = {}) => {
  const area = String(politica.area || '')
  const descripcion = String(politica.descripcion || '')
  return area.length * 2 + descripcion.length
}

const paginarPoliticas = (politicas = [], maxPesoPorPagina = 1800) => {
  if (!politicas.length) return [[]]

  const paginas = []
  let actual = []
  let pesoActual = 0

  politicas.forEach((politica) => {
    const peso = estimarPesoPolitica(politica)

    if (actual.length > 0 && pesoActual + peso > maxPesoPorPagina) {
      paginas.push(actual)
      actual = [politica]
      pesoActual = peso
      return
    }

    actual.push(politica)
    pesoActual += peso
  })

  if (actual.length > 0) paginas.push(actual)

  return paginas
}

const dividirTextoEnSegmentos = (texto, maxChars = 2600) => {
  const parrafos = extraerParrafos(texto)
  if (parrafos.length === 0) return []

  const segmentos = []

  parrafos.forEach((parrafo, parrafoIndex) => {
    const oraciones = parrafo.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [parrafo]
    let bloqueActual = ''

    oraciones.forEach((oracion) => {
      const limpia = oracion.trim()
      if (!limpia) return

      const candidata = bloqueActual ? `${bloqueActual} ${limpia}` : limpia

      if (candidata.length <= maxChars) {
        bloqueActual = candidata
        return
      }

      if (bloqueActual) {
        segmentos.push({ texto: bloqueActual, nuevoParrafo: false })
      }

      if (limpia.length <= maxChars) {
        bloqueActual = limpia
        return
      }

      const palabras = limpia.split(/\s+/)
      let subBloque = ''

      palabras.forEach((palabra) => {
        const subCandidata = subBloque ? `${subBloque} ${palabra}` : palabra
        if (subCandidata.length <= maxChars) {
          subBloque = subCandidata
        } else {
          if (subBloque) {
            segmentos.push({ texto: subBloque, nuevoParrafo: false })
          }
          subBloque = palabra
        }
      })

      bloqueActual = subBloque
    })

    if (bloqueActual) {
      segmentos.push({ texto: bloqueActual, nuevoParrafo: parrafoIndex > 0 })
    }
  })

  if (segmentos.length > 0) {
    segmentos[0].nuevoParrafo = false
  }

  return segmentos
}

const paginarSegmentos = (segmentos, maxCharsPorPagina = 3200) => {
  if (!segmentos.length) return [[]]

  const paginas = []
  let paginaActual = []
  let charsActuales = 0

  segmentos.forEach((segmento) => {
    const costoSeparacion = paginaActual.length > 0 ? 1 : 0
    const costoParrafo = segmento.nuevoParrafo && paginaActual.length > 0 ? 2 : 0
    const costoSegmento = segmento.texto.length + costoSeparacion + costoParrafo

    if (paginaActual.length > 0 && charsActuales + costoSegmento > maxCharsPorPagina) {
      paginas.push(paginaActual)
      paginaActual = [{ ...segmento, nuevoParrafo: false }]
      charsActuales = segmento.texto.length
      return
    }

    paginaActual.push(segmento)
    charsActuales += costoSegmento
  })

  if (paginaActual.length > 0) paginas.push(paginaActual)

  return paginas
}

const crearMapaPaginas = ({
  puestos = [],
  paginasAntecedentes = 1,
  paginaValoresSeparada = false,
  paginasPoliticas = 1,
  paginasOrganigramasEspecificos = 1,
}) => {
  const portada = 1
  const caratula = 2
  const indice = 3
  const portadaCapituloI = 4
  const capituloIParte1 = 5
  const capituloIParte2 = 6
  const introduccion = 7
  const antecedentes = 8
  const marcoNormativo = antecedentes + paginasAntecedentes
  const atribuciones = marcoNormativo + 1
  const objetivoMisionVision = atribuciones + 1
  const principiosValores = objetivoMisionVision + 1
  const valores = paginaValoresSeparada ? principiosValores + 1 : null
  const politicas = (valores || principiosValores) + 1
  const marcoConceptual = politicas + paginasPoliticas
  const portadaCapituloII = marcoConceptual + 1
  const organigramaGeneral = portadaCapituloII + 1
  const organigramasEspecificos = organigramaGeneral + 1
  const inventario = organigramasEspecificos + paginasOrganigramasEspecificos
  const primerPuesto = inventario + 1
  const cambios = primerPuesto + puestos.length

  return {
    portada,
    caratula,
    indice,
    portadaCapituloI,
    capituloIParte1,
    capituloIParte2,
    introduccion,
    antecedentes,
    marcoNormativo,
    atribuciones,
    objetivoMisionVision,
    principiosValores,
    valores,
    politicas,
    marcoConceptual,
    portadaCapituloII,
    organigramaGeneral,
    organigramasEspecificos,
    inventario,
    primerPuesto,
    cambios,
    total: cambios,
  }
}

// ── ESCOLARIDAD MAP ────────────────────────────────────────────────────────────
const ESCOLARIDAD_MAP = {
  '1': 'Primaria',
  '2': 'Secundaria',
  '3': 'Preparatoria o Técnica',
  '4': 'Carrera Profesional no terminada (2 años)',
  '5': 'Carrera profesional terminada',
  '6': 'Postgrado',
  '7': 'Licenciatura o carreras afines',
  '8': 'Área de especialidad requerida',
}

// ── Header de página ─────────────────────────────────────────────────────────
function HeaderPagina({ datos, numeroPagina, totalPaginas }) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse',
      marginBottom: 20
    }}>
      <tbody>
        <tr>
          {/* Logo Municipio — izquierda */}
          <td style={{ width: '42%', padding: '0 0 8px 0', verticalAlign: 'middle' }}>
            <img
              src="/LogoMunicipio.png"
              alt="Municipio de Benito Juárez"
              style={{ height: 100, width: 'auto', display: 'block' }}
              crossOrigin="anonymous"
            />
          </td>

          {/* Metadata — derecha */}
          <td style={{ width: '58%', padding: '0 0 8px 12px', verticalAlign: 'top' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

              {/* Logo IMDAI */}
              <img
                src="/LogoIMDAI.png"
                alt="IMDAI"
                style={{ height: 110, width: 'auto', display: 'block', flexShrink: 0, marginTop: 2 }}
                crossOrigin="anonymous"
              />

              {/* Todo el metadata incluido PÁGINA — alineado a la izquierda del texto */}
              <div style={{ flex: 1, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '11pt', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 800 }}>CÓDIGO:</span> {datos.codigo || '—'}<br />
                <span style={{ fontWeight: 800 }}>FECHA</span><br />
                <span style={{ fontWeight: 800 }}>DE EMISIÓN:</span> {fmtFecha(datos.fecha_elaboracion || datos.fecha_emision)}<br />
                <span style={{ fontWeight: 800 }}>VERSIÓN:</span> {datos.version || '01'}
                {/* PÁGINA entre líneas, con margen negativo para que las líneas lleguen hasta el logo */}
                <div style={{
                  borderTop: '1.5px solid #000',
                  borderBottom: '1.5px solid #000',
                  paddingTop: 3, paddingBottom: 3, marginTop: 4,
                  marginLeft: '-112px',
                  paddingLeft: '112px',
                }}>
                  <span style={{ fontWeight: 800 }}>PÁGINA:</span> {numeroPagina} DE {totalPaginas}
                </div>
              </div>

            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// ── PÁGINA 1: Portada ─────────────────────────────────────────────────────────
function PaginaPortada({ datos, total }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={1} totalPaginas={total} />
      <div className="pdf-portada-titulo">
        <h1>MANUAL DE<br/><strong>ORGANIZACIÓN</strong></h1>
      </div>
      <div className="pdf-portada-dep">{datos.dependencia}</div>
      {/* Logo portada pegado al final de la página */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <img
          src="/LogoPortada.png"
          alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  )
}

// ── PÁGINA 2: Carátula de Autorizaciones ─────────────────────────────────────
function PaginaCaratula({ datos, total }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={2} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: '24pt', fontWeight: 'normal', letterSpacing: 2 }}>MANUAL DE</div>
        <div style={{ fontSize: '30pt', fontWeight: '900', letterSpacing: 2 }}>ORGANIZACIÓN</div>
        <div style={{ fontSize: '14pt', marginTop: 16, letterSpacing: 3, textTransform: 'uppercase' }}>
          {datos.dependencia}
        </div>
      </div>

      {/* Tabla carátula rediseñada */}
      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        border: '3px solid #000', borderRadius: 12, overflow: 'hidden',
        fontFamily: 'Montserrat, Arial, sans-serif', marginTop: 20
      }}>
        {/* Headers */}
        <thead>
          <tr>
            {['ELABORÓ','REVISÓ','AUTORIZÓ','VALIDÓ'].map((h, i) => (
              <th key={i} style={{
                width: '25%', padding: '16px 10px', textAlign: 'center',
                fontWeight: 800, fontSize: '13pt', color: '#7a1020',
                borderBottom: 'none',
                borderRight: 'none',
                background: 'white'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Fila nombres en itálica */}
          <tr>
            {[datos.elaboro_nombre, datos.reviso_nombre, datos.autorizo_nombre, datos.valido_nombre].map((nombre, i) => (
              <td key={i} style={{
                padding: '20px 14px', textAlign: 'center', verticalAlign: 'top',
                fontStyle: 'italic', fontWeight: 500, fontSize: '10.5pt',
                borderRight: 'none',
                borderBottom: 'none', minHeight: 80
              }}>{nombre || ' '}</td>
            ))}
          </tr>
          {/* Espacio vacío para firma */}
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{
                height: 100,
                borderRight: 'none',
                borderBottom: 'none'
              }}></td>
            ))}
          </tr>
          {/* Fila cargos */}
          <tr>
            {[datos.elaboro_cargo, datos.reviso_cargo, datos.autorizo_cargo, datos.valido_cargo].map((cargo, i) => (
              <td key={i} style={{
                padding: '16px 14px', textAlign: 'center', verticalAlign: 'middle',
                fontWeight: 500, fontSize: '10.5pt',
                borderRight: 'none',
              }}>{cargo || ' '}</td>
            ))}
          </tr>
          {/* Espacio vacío debajo del cargo */}
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{
                height: 80,
                borderRight: 'none',
              }}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── PÁGINA 3: Índice ──────────────────────────────────────────────────────────
function PaginaIndice({ datos, total, mapaPaginas }) {
  const items = [
    { num: '01', label: 'Carátula de Autorización', pag: mapaPaginas.caratula, nivel: 1, linea: true },
    { num: '02', label: 'Índice', pag: mapaPaginas.indice, nivel: 1 },
    { num: '03', label: 'Capítulo I de Generales', pag: mapaPaginas.portadaCapituloI, nivel: 1 },
    { num: '3.1',  label: 'Introducción', pag: mapaPaginas.introduccion, nivel: 2 },
    { num: '3.2',  label: 'Antecedentes', pag: mapaPaginas.antecedentes, nivel: 2 },
    { num: '3.3',  label: 'Marco Normativo', pag: mapaPaginas.marcoNormativo, nivel: 2 },
    { num: '3.4',  label: 'Atribuciones Institucionales', pag: mapaPaginas.atribuciones, nivel: 2 },
    { num: '3.5',  label: 'Objetivo General', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.6',  label: 'Misión', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.7',  label: 'Visión', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.8',  label: 'Principios y Valores Institucionales', pag: mapaPaginas.principiosValores, nivel: 2 },
    ...(mapaPaginas.valores ? [{ num: '3.8', label: 'Valores Institucionales', pag: mapaPaginas.valores, nivel: 2 }] : []),
    { num: '3.9',  label: 'Políticas de Operación', pag: mapaPaginas.politicas, nivel: 2 },
    { num: '3.10', label: 'Marco Conceptual', pag: mapaPaginas.marcoConceptual, nivel: 2 },
    { num: '04', label: 'Capítulo II de Organización', pag: mapaPaginas.portadaCapituloII, nivel: 1 },
    { num: '4.1',  label: 'Organigrama General', pag: mapaPaginas.organigramaGeneral, nivel: 2 },
    { num: '4.2',  label: 'Organigramas Específicos', pag: mapaPaginas.organigramasEspecificos, nivel: 2 },
    { num: '4.3',  label: 'Inventario de Puestos', pag: mapaPaginas.inventario, nivel: 2 },
    { num: '4.4',  label: 'Descripción de Puestos', pag: mapaPaginas.primerPuesto, nivel: 2 },
    ...(datos.puestos || []).map((p, i) => ({
      num: `4.4.${i + 1}`, label: `Descripción de puesto ${p.nombre_puesto || ''}`, pag: mapaPaginas.primerPuesto + i, nivel: 2
    })),
    { num: '4.5',  label: 'Sección de Cambios', pag: mapaPaginas.cambios, nivel: 2 },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={3} totalPaginas={total} />

      {/* Título ÍNDICE */}
      <div style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800, fontSize: '28pt',
        color: '#000', marginBottom: 24
      }}>ÍNDICE</div>

      {items.map((item, i) => (
        <div key={i}>
          {item.nivel === 1 ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                gap: 16, marginTop: 14, marginBottom: item.linea ? 0 : 2,
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}>
                <span style={{
                  fontWeight: 800, fontSize: '20pt', color: '#888',
                  minWidth: 44, flexShrink: 0
                }}>{item.num}</span>
                <span style={{
                  fontWeight: 800, fontSize: '13pt', color: '#888', flex: 1
                }}>{item.label}</span>
                <span style={{
                  fontWeight: 500, fontSize: '11pt', color: '#000',
                  minWidth: 80
                }}>{item.pag}</span>
              </div>
              {item.linea && (
                <div style={{
                  height: 3, background: '#aaa',
                  marginTop: 6, marginBottom: 4,
                  marginRight: 70
                }} />
              )}
            </>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'baseline',
              gap: 16, paddingLeft: 15, marginBottom: 1,
              fontFamily: 'Montserrat, Arial, sans-serif',
            }}>
              <span style={{
                fontWeight: 500, fontSize: '10pt', color: '#000',
                minWidth: 36, flexShrink: 0
              }}>{item.num}</span>
              <span style={{
                fontWeight: 500, fontSize: '10pt', color: '#000', flex: 1
              }}>{item.label}</span>
              <span style={{
                fontWeight: 500, fontSize: '10pt', color: '#000',
                minWidth: 80
              }}>{item.pag}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── PÁGINA 4: Portada Capítulo I ─────────────────────────────────────────────
function PaginaPortadaCapituloI({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 400, fontSize: '42pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>CAPÍTULO 1</div>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800, fontSize: '42pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>DE GENERALES</div>
      </div>
      {/* Logo portada pegado al fondo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <img
          src="/LogoPortada.png"
          alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  )
}

// ── PÁGINA 5+: Contenido Capítulo I ──────────────────────────────────────────
function PaginaCapituloI({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">03. CAPÍTULO I DE GENERALES</div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PORTADA</div>
        <div className="pdf-seccion-texto">Anotar el nombre del Municipio de Benito Juárez, el Escudo del Municipio fecha de Elaboración, así como los datos de Identificación del Manual, como son; Nombre de la Dependencia, Unidad Administrativa o Entidad Municipal.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">CARÁTULA DE AUTORIZACIONES</div>
        <div className="pdf-seccion-texto">Hoja en la que se recaban las firmas en el documento, así como las firmas correspondientes de quien:</div>
        <div className="pdf-seccion-texto">· Elabora; Servidor Público que el titular de la dependencia, Unidad Administrativa y/o Entidad Municipal designe como enlace Responsable.</div>
        <div className="pdf-seccion-texto">· Revisa; Titulares de las direcciones Generales o Dirección de Área o titulares de las unidades administrativas que dependan directamente del servidor público que autoriza.</div>
        <div className="pdf-seccion-texto">· Autoriza; Los titulares de las dependencias y Unidades administrativas que se refieren los artículos 22, 23 y 24 del reglamento Orgánico de la Administración Pública Centralizada de Benito Juárez, Quintana Roo.</div>
        <div className="pdf-seccion-texto">· Validación; firma correspondiente únicamente al Titular del Instituto Municipal de Desarrollo Administrativo e Innovación del Municipio de Benito Juárez.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">INTRODUCCIÓN</div>
        <div className="pdf-seccion-texto">Sección inicial que describe brevemente el contenido del Manual de Organización, expone su utilidad y el propósito general que pretende cumplir a través del mismo.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ANTECEDENTES</div>
        <div className="pdf-seccion-texto">Apartado en el que se relata la información del origen y evolución de la dependencia, Unidad Administrativa y/o Entidad Municipal designe como enlace Responsable.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MARCO NORMATIVO</div>
        <div className="pdf-seccion-texto">Hace referencia a la normatividad en la cual se sustentan las funciones y actividades que se realizan. Respetando la pirámide Jurídica.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ATRIBUCIONES INSTITUCIONALES</div>
        <div className="pdf-seccion-texto">Indican las facultades que le corresponden a la dependencia, Unidad administrativa y/o Entidad Municipal, de conformidad a lo señalado en la normativa aplicable. Asimismo, señala las funciones que deben realizar los servidores públicos asignados a la dependencia, Unidad administrativa y/o Entidad Municipal.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">OBJETIVO</div>
        <div className="pdf-seccion-texto">Es el propósito global que desea alcanzar o que persigue la <em>{datos.dependencia}</em> para el cumplimiento de las actividades que por su atribución le corresponde.</div>
        {datos.objetivo_general && <div className="pdf-seccion-texto" style={{ marginTop: 4 }}>{datos.objetivo_general}</div>}
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MISIÓN</div>
        <div className="pdf-seccion-texto">Es la razón de ser de la <em>{datos.dependencia}</em>, con la cual todos los servidores públicos que laboran para la Institución deberán identificarse para su cumplimiento. Esta descripción debe ser clara, concreta y específica.</div>
        {datos.mision && <div className="pdf-seccion-texto" style={{ marginTop: 4 }}>{datos.mision}</div>}
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">VISIÓN</div>
        <div className="pdf-seccion-texto">En ella se expone a donde se dirige la <em>{datos.dependencia}</em> y como se ve a largo plazo; enunciar el escenario en el que se desea posicionar a la dependencia y/o entidad.</div>
        {datos.vision && <div className="pdf-seccion-texto" style={{ marginTop: 4 }}>{datos.vision}</div>}
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PRINCIPIOS Y VALORES INSTITUCIONALES</div>
        <div className="pdf-seccion-texto">Consiste en un referente ético que consolida y guía el pensamiento, las actitudes, prácticas y formas de actuación de los servidores públicos y colaboradores de la <em>{datos.dependencia}</em>. Representando el Conjunto de normas morales que regulan la conducta de los servidores públicos hacia los servicios que prestan a la ciudadanía y en el desarrollo de sus actividades.</div>
      </div>

    </div>
  )
}

// ── PÁGINA 6: Contenido Capítulo I (parte 2) ─────────────────────────────────
function PaginaCapituloI2({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">03. CAPÍTULO I DE GENERALES</div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">POLÍTICAS DE OPERACIÓN</div>
        <div className="pdf-seccion-texto">Son guías generales de acción que definen los límites y parámetros necesarios para ejecutar los procesos y actividades en cumplimiento de la función, planes, programas y proyectos previamente definidos por la organización que rigen la actuación de los integrantes de la institución, encaminados a lograr los objetivos y cumplir la misión.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ORGANIGRAMA GENERAL</div>
        <div className="pdf-seccion-texto">Representa grafica de la estructura orgánica general por la <em>{datos.dependencia}</em>, debidamente validada por la ley o reglamento que la defina.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ORGANIGRAMA ESPECÍFICO</div>
        <div className="pdf-seccion-texto">Es la representación gráfica de la estructura orgánica de un área en particular, que permite observar las líneas de autoridad y responsabilidad e identifica los canales de comunicación para el buen funcionamiento de la Dependencia, Unidad Administrativa y/o entidad Municipal.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MARCO CONCEPTUAL</div>
        <div className="pdf-seccion-texto">Son conceptos que se utilizan dentro del documento, con su descripción específica para ampliar la definición correspondiente que permita al lector una mejor comprensión del manual.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">INVENTARIO DE PUESTO</div>
        <div className="pdf-seccion-texto">Relaciona el nombre del puesto y de las personas que ocupan el puesto.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">DESCRIPCIÓN DE PUESTO</div>
        <div className="pdf-seccion-texto">Definición propias del puesto, dentro de los cuales se encuentran las funciones genéricas y específicas, acorde al catálogo de puestos aprobado e incluyendo los criterios determinados en los lineamientos y disposiciones en materia de transparencia.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">SECCIÓN DE CAMBIOS</div>
        <div className="pdf-seccion-texto">Se especifica el número de versión de acuerdo a las modificaciones validadas del documento, así como las razones de los cambios y sus fechas.</div>
      </div>

      <div className="pdf-seccion" style={{ marginTop: 24 }}>
        <div className="pdf-seccion-titulo">LENGUAJE INCLUYENTE CON PERSPECTIVA DE GÉNERO.</div>
        <div className="pdf-seccion-texto" style={{ lineHeight: 1.2 }}>En la <em>{datos.dependencia}</em> nos apegarnos a la igualdad social, reforzamos el respeto de género y la NO violencia contra las mujeres.</div>
        <div className="pdf-seccion-texto" style={{ marginTop: 3, lineHeight: 1.2 }}>Por ello, exhortamos para que la información contenida en este manual, sea plasmada a través del LENGUAJE INCLUYENTE, por lo mismo evitamos usar expresiones sutiles sexistas para prescindir de patrones de comportamiento y estereotipos de género.</div>
      </div>

      <div style={{
        marginTop: 14, fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800, fontSize: '9pt', textAlign: 'justify', lineHeight: 1.5
      }}>
        ESTE DOCUMENTO DEBERÁ SER CONOCIDO POR TODO EL PERSONAL QUE LABORA EN LA DEPENDENCIA, UNIDAD ADMINISTRATIVA O ENTIDAD MUNICIPAL QUE ELABORA ESTE MANUAL, CON LA FINALIDAD DE QUE SE IDENTIFIQUEN LOS PROCEDIMIENTOS QUE AQUÍ SE LLEVAN A CABO; PERO, SOBRE TODO, LAS FUNCIONES Y RESPONSABILIDADES QUE SE TIENEN CADA UNO DE LOS INVOLUCRADOS EN LOS PROCEDIMIENTOS QUE SE MENCIONAN.
      </div>

    </div>
  )
}

// ── PÁGINA: 3.1 Introducción ──────────────────────────────────────────────────
function PaginaIntroduccion({ datos, total, paginaInicio }) {
  const parrafosIntroduccion = extraerParrafos(datos.introduccion)

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.1 INTRODUCCIÓN</div>

      {parrafosIntroduccion.length > 0
        ? parrafosIntroduccion.map((parrafo, i) => (
            <div key={i} className="pdf-intro-texto"
              style={ i === 0 ? { textIndent: '1.5em' } : undefined }
            >{renderTextoConSaltosPorPunto(parrafo)}</div>
          ))
        : null
      }

      {/* Firma del superior jerárquico */}
      {(datos.superior_nombre || datos.superior_cargo) && (
        <div style={{
          marginTop: 60, textAlign: 'center',
          fontFamily: 'Montserrat, Arial, sans-serif',
        }}>
          <div style={{ width: 260, borderBottom: '1.5px solid #000', margin: '0 auto 8px auto' }} />
          <div style={{ fontWeight: 800, fontSize: '10pt', textTransform: 'uppercase' }}>
            {datos.superior_nombre}
          </div>
          <div style={{ fontWeight: 800, fontSize: '10pt', textTransform: 'uppercase' }}>
            {datos.superior_cargo}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PÁGINA: 3.2 Antecedentes ─────────────────────────────────────────────────
function PaginaAntecedentes({ datos, total, paginaInicio, parrafos = [], esContinuacion = false }) {
  const parrafosAntecedentes = parrafos.length > 0
    ? parrafos
    : extraerParrafos(datos.antecedentes).map((texto, i) => ({ texto, nuevoParrafo: i > 0 }))

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.2 ANTECEDENTES</div>

      {parrafosAntecedentes.length > 0
        ? parrafosAntecedentes.map((parrafo, i) => (
            <div
              key={i}
              className="pdf-intro-texto"
              style={{
                ...(parrafo.nuevoParrafo ? { marginTop: 14 } : {}),
              }}
            >
              {renderTextoConSaltosPorPunto(parrafo.texto)}
            </div>
          ))
        : (
          <div className="pdf-intro-texto">
            Apartado en el que se relata la informacion del origen y evolucion de la dependencia, unidad administrativa y/o entidad municipal.
          </div>
        )
      }
    </div>
  )
}

// ── PÁGINA: 3.3 Marco Normativo ──────────────────────────────────────────────
function PaginaMarcoNormativo({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.3 MARCO NORMATIVO</div>

      <div className="pdf-intro-texto">
        Hace referencia a la normatividad en la cual se sustentan las funciones y actividades que se realizan. Respetando la piramide juridica.
      </div>

      {datos.marco_normativo?.length > 0 ? (
        <table className="pdf-norma-tabla" style={{ marginTop: 6 }}>
          <thead>
            <tr>
              <th style={{ width: 30 }}>No.</th>
              <th>Nombre de la Normatividad</th>
              <th style={{ width: 120 }}>Fecha de Publicacion</th>
              <th style={{ width: 130 }}>Medio de Publicacion</th>
            </tr>
          </thead>
          <tbody>
            {datos.marco_normativo.map((n, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                <td>{n.nombre}</td>
                <td>{fmtFecha(n.fecha)}</td>
                <td>{n.medio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="pdf-intro-texto">
          No hay informacion de marco normativo registrada.
        </div>
      )}
    </div>
  )
}

// ── PÁGINA: 3.4 Atribuciones Institucionales ─────────────────────────────────
function PaginaAtribuciones({ datos, total, paginaInicio }) {
  const parrafosAtribuciones = extraerParrafosAtribuciones(datos.atribuciones)

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.4 ATRIBUCIONES INSTITUCIONALES</div>

      {parrafosAtribuciones.length > 0
        ? parrafosAtribuciones.map((parrafo, i) => (
            <div
              key={i}
              className="pdf-intro-texto"
              style={i === 0 ? { textIndent: '1.5em' } : undefined}
            >
              {parrafo}
            </div>
          ))
        : (
          <div className="pdf-intro-texto">
            Indican las facultades que le corresponden a la dependencia, unidad administrativa y/o entidad municipal, de conformidad con la normativa aplicable.
          </div>
        )
      }
    </div>
  )
}

// ── PÁGINA: 3.5, 3.6 y 3.7 ───────────────────────────────────────────────────
function PaginaObjetivoMisionVision({ datos, total, paginaInicio }) {
  const bloques = [
    { titulo: '3.5 OBJETIVO GENERAL', texto: datos.objetivo_general },
    { titulo: '3.6 MISIÓN', texto: datos.mision },
    { titulo: '3.7 VISIÓN', texto: datos.vision },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      {bloques.map((bloque, i) => {
        const parrafos = extraerParrafos(bloque.texto)
        const mostrarLineasTitulo = i > 0

        return (
          <div key={bloque.titulo} style={{ marginBottom: i === bloques.length - 1 ? 0 : 18 }}>
            {mostrarLineasTitulo && (
              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '3px solid #000',
                marginBottom: 6,
                marginLeft: '-56px',
              }} />
            )}

            <div style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 800,
              fontSize: '14pt',
              color: '#262626',
              marginBottom: 6,
              marginLeft: mostrarLineasTitulo ? '1.5cm' : 0,
            }}>
              {bloque.titulo}
            </div>

            {mostrarLineasTitulo && (
              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '3px solid #000',
                marginBottom: 6,
                marginLeft: '-56px',
              }} />
            )}

            <div style={{
              width: '100%',
              paddingTop: i === 0 ? 2 : 6,
              paddingLeft: '3cm',
            }}>
              {parrafos.length > 0 ? parrafos.map((parrafo, idx) => (
                <div
                  key={idx}
                  className="pdf-intro-texto"
                  style={{ marginBottom: idx === parrafos.length - 1 ? 0 : 14 }}
                >
                  {parrafo}
                </div>
              )) : (
                <div className="pdf-intro-texto" style={{ marginBottom: 0 }}>—</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── PÁGINA: 3.8 Principios y Valores Institucionales ─────────────────────────
function PaginaPrincipiosValores({ datos, total, paginaInicio, mostrarValores = false }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.8 PRINCIPIOS Y VALORES INSTITUCIONALES</div>

      <div style={{
        width: 'calc(50% + 56px)',
        borderTop: '3px solid #000',
        marginTop: 18,
        marginBottom: 8,
        marginLeft: '-56px',
      }} />

      <div style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800,
        fontSize: '14pt',
        color: '#262626',
        marginLeft: '2.5cm',
        marginBottom: 8,
      }}>
        PRINCIPIOS
      </div>

      <div style={{
        width: 'calc(50% + 56px)',
        borderTop: '3px solid #000',
        marginBottom: 12,
        marginLeft: '-56px',
      }} />

      {datos.principios?.length > 0 ? (
        <ul className="pdf-lista" style={{ marginLeft: '4cm', marginTop: 0 }}>
          {datos.principios.map((p, i) => (
            <li key={i} style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {renderTextoConEncabezadoEnNegritas(p)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="pdf-intro-texto" style={{ paddingLeft: '4cm' }}>No hay informacion de principios registrada.</div>
      )}
      {mostrarValores && (
        <>
          <div style={{
            width: 'calc(50% + 56px)',
            borderTop: '3px solid #000',
            marginTop: 18,
            marginBottom: 8,
            marginLeft: '-56px',
          }} />

          <div style={{
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: 800,
            fontSize: '14pt',
            color: '#262626',
            marginLeft: '2.5cm',
            marginBottom: 8,
          }}>
            VALORES
          </div>

          <div style={{
            width: 'calc(50% + 56px)',
            borderTop: '3px solid #000',
            marginBottom: 12,
            marginLeft: '-56px',
          }} />

          {datos.valores?.length > 0 ? (
            <ul className="pdf-lista" style={{ marginLeft: '4cm', marginTop: 0 }}>
              {datos.valores.map((v, i) => (
                <li key={i} style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                  {renderTextoConEncabezadoEnNegritas(v)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="pdf-intro-texto" style={{ paddingLeft: '4cm' }}>No hay informacion de valores registrada.</div>
          )}
        </>
      )}
    </div>
  )
}

function PaginaValores({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.8 PRINCIPIOS Y VALORES INSTITUCIONALES</div>

      <div style={{
        width: 'calc(50% + 56px)',
        borderTop: '3px solid #000',
        marginTop: 18,
        marginBottom: 8,
        marginLeft: '-56px',
      }} />

      <div style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800,
        fontSize: '14pt',
        color: '#262626',
        marginLeft: '2.5cm',
        marginBottom: 8,
      }}>
        VALORES
      </div>

      <div style={{
        width: 'calc(50% + 56px)',
        borderTop: '3px solid #000',
        marginBottom: 12,
        marginLeft: '-56px',
      }} />

      {datos.valores?.length > 0 ? (
        <ul className="pdf-lista" style={{ marginLeft: '4cm', marginTop: 0 }}>
          {datos.valores.map((v, i) => (
            <li key={i} style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
              {renderTextoConEncabezadoEnNegritas(v)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="pdf-intro-texto" style={{ paddingLeft: '4cm' }}>No hay informacion de valores registrada.</div>
      )}
    </div>
  )
}

// ── PÁGINA: 3.9 Políticas de Operación ───────────────────────────────────────
function PaginaPoliticasOperacion({ datos, total, paginaInicio, politicas = null }) {
  const politicasPagina = politicas || datos.politicas_operacion || []

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.9 POLÍTICAS DE OPERACIÓN</div>

      {politicasPagina.length > 0 ? (
        politicasPagina.map((pol, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {pol.area ? (
              <>
                <div style={{
                  fontWeight: 800,
                  fontSize: '11pt',
                  marginBottom: 2,
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  color: '#262626',
                  marginLeft: '1cm',
                  textTransform: 'uppercase',
                }}>
                  {`${String.fromCharCode(65 + i)}. ${pol.area}`}
                </div>
                <div style={{
                  marginBottom: 8,
                  color: '#262626',
                  paddingLeft: '3cm',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontWeight: 500,
                  fontSize: '11pt',
                  lineHeight: 1.08,
                  textAlign: 'left',
                }}>
                  {renderTextoPolitica(pol.descripcion)}
                </div>
              </>
            ) : (
              <div style={{
                marginLeft: '1cm',
                marginBottom: 8,
                color: '#262626',
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: 500,
                fontSize: '11pt',
                lineHeight: 1.08,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <span style={{ fontWeight: 800, flexShrink: 0 }}>•</span>
                <div style={{ flex: 1, textAlign: 'justify', textJustify: 'inter-word' }}>
                  {renderTextoPolitica(pol.descripcion)}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="pdf-intro-texto" style={{ color: '#262626', paddingLeft: '3cm' }}>No hay politicas de operacion registradas.</div>
      )}
    </div>
  )
}

function PaginaPortadaCapituloII({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 400, fontSize: '42pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>CAPÍTULO 2</div>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800, fontSize: '42pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>DE ORGANIZACIÓN</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <img
          src="/LogoPortada.png"
          alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  )
}

function PaginaOrganigramaGeneral({ datos, total, paginaInicio }) {
  const src = normalizarRutaOrganigrama(datos.organigrama_general?.ruta_archivo)

  return (
    <div className="pdf-pagina-horizontal" data-page-orientation="landscape">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.1 ORGANIGRAMA GENERAL</div>

      <div style={{
        height: 560,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid transparent',
        background: '#fff',
        overflow: 'hidden',
      }}>
        {src ? (
          <img
            src={src}
            alt="Organigrama General"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
            crossOrigin="anonymous"
          />
        ) : (
          <div style={{ color: '#262626', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12pt' }}>
            No hay organigrama general registrado.
          </div>
        )}
      </div>
    </div>
  )
}

function PaginaOrganigramaEspecifico({ datos, total, paginaInicio, organigrama = null, index = 0 }) {
  const src = normalizarRutaOrganigrama(organigrama?.ruta_archivo)
  const nombre = organigrama?.tipo || organigrama?.nombre || `Específico ${index + 1}`

  return (
    <div className="pdf-pagina-horizontal" data-page-orientation="landscape">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.2 ORGANIGRAMA ESPECÍFICO</div>

      <div style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800,
        fontSize: '13pt',
        color: '#262626',
        marginBottom: 10,
        textTransform: 'uppercase',
      }}>
        {nombre}
      </div>

      <div style={{
        height: 525,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid transparent',
        background: '#fff',
        overflow: 'hidden',
      }}>
        {src ? (
          <img
            src={src}
            alt={`Organigrama Especifico ${nombre}`}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
            crossOrigin="anonymous"
          />
        ) : (
          <div style={{ color: '#262626', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12pt' }}>
            No hay organigramas específicos registrados.
          </div>
        )}
      </div>
    </div>
  )
}

function PaginaMarcoConceptual({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.10 MARCO CONCEPTUAL</div>

      {datos.marco_conceptual?.length > 0 ? (
        <div style={{ paddingLeft: '0.3cm', paddingRight: '0.5cm', marginTop: 18 }}>
          {datos.marco_conceptual.map((concepto, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                columnGap: '26px',
                alignItems: 'start',
                marginBottom: 14,
                color: '#262626',
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}
            >
              <div style={{
                fontWeight: 800,
                fontSize: '11pt',
                lineHeight: 1.08,
                wordBreak: 'break-word',
              }}>
                {concepto.termino}
              </div>
              <div style={{
                fontWeight: 500,
                fontSize: '11pt',
                lineHeight: 1.08,
              }}>
                {concepto.definicion}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pdf-intro-texto" style={{ color: '#262626' }}>
          No hay informacion de marco conceptual registrada.
        </div>
      )}
    </div>
  )
}

// ── Página Inventario de Puestos ──────────────────────────────────────────────
function PaginaInventario({ datos, total, paginaInicio }) {
  const totalPersonas = (datos.inventario_puestos || []).reduce(
    (s, p) => s + (parseInt(p.num_personas) || 0), 0
  )
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">04. CAPÍTULO II DE ORGANIZACIÓN</div>
      <div className="pdf-seccion-titulo" style={{ marginBottom: 12 }}>4.3 INVENTARIO DE PUESTOS</div>
      <table className="pdf-inv-tabla">
        <thead>
          <tr>
            <th style={{ width: 50 }}>NÚM.</th>
            <th>NOMBRE DEL PUESTO / CARGO</th>
            <th style={{ width: 150 }}>NÚMERO DE PERSONAS</th>
          </tr>
        </thead>
        <tbody>
          {(datos.inventario_puestos || []).map((p, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{i + 1}</td>
              <td>{p.nombre_puesto}</td>
              <td style={{ textAlign: 'center' }}>{p.num_personas}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={2} style={{ textAlign: 'right', background: '#4a1020', color: 'white', fontWeight: 'bold', padding: '7px 10px', border: '1px solid #000' }}>TOTAL</td>
            <td style={{ textAlign: 'center', background: '#4a1020', color: 'white', fontWeight: 'bold', border: '1px solid #000' }}>{totalPersonas}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Página de descripción de un Puesto ───────────────────────────────────────
function PaginaPuesto({ datos, puesto, index, total, paginaInicio }) {
  const ESCOLARIDAD_OPTS_TABLA = [
    { val: '1', label: 'Primaria' },
    { val: '2', label: 'Secundaria' },
    { val: '3', label: 'Preparatoria o Técnica' },
    { val: '4', label: 'Carrera Profesional\nno terminada (2 años)' },
    { val: '5', label: 'Carrera profesional\nterminada' },
    { val: '6', label: 'Postgrado' },
    { val: '7', label: 'Licenciatura o\ncurreras afines.' },
    { val: '8', label: 'Área de especialidad\nrequerida' },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-puesto-header">
        4.4.{index + 1} DESCRIPCIÓN Y PERFIL DE {puesto.nombre_puesto?.toUpperCase() || 'PUESTO'}
      </div>

      {/* Tabla info general */}
      <table className="pdf-info-puesto-tabla">
        <tbody>
          <tr>
            <td colSpan={4} className="header-gris">INFORMACIÓN GENERAL DEL PUESTO</td>
          </tr>
          <tr>
            <td style={{ width: 60, textAlign: 'center', fontWeight: 'bold', background: '#7a1020', color: 'white', fontSize: '10pt' }} rowSpan={2}>
              4.4.{index + 1}
            </td>
            <td className="label-cell" style={{ width: '25%' }}>NOMBRE DEL PUESTO</td>
            <td colSpan={2}>{puesto.nombre_puesto}</td>
          </tr>
          <tr>
            <td className="label-cell">JEFE INMEDIATO</td>
            <td colSpan={2}>{puesto.jefe_inmediato || '—'}</td>
          </tr>
          <tr>
            <td colSpan={4} className="header-gris">SUBORDINADOS DIRECTOS</td>
          </tr>
          <tr>
            <td colSpan={2} className="label-cell" style={{ textAlign: 'center' }}>NÚMERO DE PERSONAS</td>
            <td colSpan={2} className="label-cell" style={{ textAlign: 'center' }}>NOMBRE DEL PUESTO</td>
          </tr>
          {(puesto.subordinados_directos?.length > 0) ? puesto.subordinados_directos.map((s, i) => (
            <tr key={i}>
              <td colSpan={2} style={{ textAlign: 'center' }}>{s.num_personas}</td>
              <td colSpan={2}>{s.nombre_puesto}</td>
            </tr>
          )) : (
            <tr><td colSpan={2} style={{ textAlign: 'center' }}>—</td><td colSpan={2}>N/A</td></tr>
          )}
          <tr>
            <td colSpan={4} className="header-gris">SUBORDINADOS INDIRECTOS</td>
          </tr>
          {(puesto.subordinados_indirectos?.length > 0) ? puesto.subordinados_indirectos.map((s, i) => (
            <tr key={i}>
              <td colSpan={2} style={{ textAlign: 'center' }}>{s.num_personas}</td>
              <td colSpan={2}>{s.nombre_puesto}</td>
            </tr>
          )) : (
            <tr><td colSpan={2} style={{ textAlign: 'center' }}>—</td><td colSpan={2}>N/A</td></tr>
          )}
          {/* Total */}
          <tr>
            <td colSpan={2} style={{ textAlign: 'center', background: '#4a1020', color: 'white', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>
              {(puesto.subordinados_directos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0) +
               (puesto.subordinados_indirectos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0)}
            </td>
            <td colSpan={2} style={{ background: '#4a1020', color: 'white', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>TOTAL</td>
          </tr>
        </tbody>
      </table>

      {/* Objetivo */}
      <div className="pdf-objetivo-box">
        <div className="pdf-objetivo-titulo">OBJETIVO GENERAL DEL PUESTO</div>
        <div className="pdf-objetivo-subtitulo">(Anote brevemente el objetivo o razón por la cual existe)</div>
        <div style={{ fontSize: '9.5pt', lineHeight: 1.6 }}>{puesto.objetivo_puesto || '—'}</div>
      </div>

      {/* Funciones */}
      <table className="pdf-funciones-tabla">
        <tbody>
          <tr>
            <td colSpan={2} className="header-gris">DESCRIPCIÓN ANALÍTICA DE FUNCIONES</td>
          </tr>
          <tr>
            <td colSpan={2} className="subheader">FUNCIONES INSTITUCIONALES</td>
          </tr>
          {(puesto.funciones_institucionales?.length > 0) ? puesto.funciones_institucionales.map((f, i) => (
            <tr key={i}>
              <td className="num-cell">{i + 1}.</td>
              <td>{f}</td>
            </tr>
          )) : (
            <tr><td className="num-cell">1.</td><td>N/A</td></tr>
          )}
          <tr>
            <td colSpan={2} className="subheader">FUNCIONES PROPIAS DEL PUESTO</td>
          </tr>
          {(puesto.funciones_propias?.length > 0) ? puesto.funciones_propias.map((f, i) => (
            <tr key={i}>
              <td className="num-cell">{i + 1}.</td>
              <td>{f}</td>
            </tr>
          )) : (
            <tr><td className="num-cell">1.</td><td>N/A</td></tr>
          )}
        </tbody>
      </table>

      {/* Perfil */}
      <table className="pdf-perfil-tabla">
        <tbody>
          <tr>
            <td colSpan={10} className="header-gris">PERFIL DEL PUESTO</td>
          </tr>
          <tr>
            <td colSpan={10} className="label-bold" style={{ padding: '6px 10px', fontSize: '9pt' }}>
              ESCOLARIDAD: Marque con una (X) el último grado de estudios requerido para desarrollar el puesto
            </td>
          </tr>
          <tr>
            {ESCOLARIDAD_OPTS_TABLA.map((opt, i) => (
              <td key={i} style={{ textAlign: 'center', border: '1px solid #000', padding: '4px 6px', fontSize: '8pt', width: `${100/8}%` }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{i + 1}.</div>
                <div style={{ marginBottom: 4 }}>{opt.label}</div>
                <div className="pdf-check-box">{puesto.escolaridad === opt.val ? 'X' : ''}</div>
              </td>
            ))}
          </tr>
          <tr>
            <td colSpan={4} className="label-bold">Licenciatura o carreras afines.</td>
            <td colSpan={6}>{puesto.carreras_afines || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={4} className="label-bold">Área de especialidad requerida (Conocimiento Técnico).</td>
            <td colSpan={6}>{puesto.especialidad || 'N/A'}</td>
          </tr>
          {/* Conocimiento específico */}
          <tr>
            <td colSpan={2} className="label-bold" rowSpan={3}>Conocimiento Específico.</td>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Idioma o Lengua:</td>
            <td colSpan={6}>{puesto.idiomas?.join(', ') || 'Español.'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Manejo de Programas Informáticos:</td>
            <td colSpan={6}>{puesto.programas_informaticos?.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Manejo de Equipo Especializado y/o Herramientas</td>
            <td colSpan={6}>{puesto.equipo_herramientas?.join(', ') || 'No aplica.'}</td>
          </tr>
          <tr>
            <td colSpan={4} className="label-bold">Experiencia:</td>
            <td colSpan={6}>{puesto.experiencia || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Compromiso */}
      <div className="pdf-compromiso">
        <strong>Compromiso del Servidor Público:</strong> Me comprometo a desempeñar con ética, profesionalismo y responsabilidad las funciones del cargo público que represento, incorporando la perspectiva de género y un enfoque basado en los Derechos Humanos en beneficio de la ciudadanía benitojuarense.
      </div>

      {/* Firma */}
      <table className="pdf-firma-tabla">
        <tbody>
          <tr>
            <td className="header-gris">SERVIDOR PÚBLICO OCUPANTE DEL PUESTO</td>
            <td className="header-gris">JEFE INMEDIATO</td>
          </tr>
          <tr>
            <td style={{ height: 70, verticalAlign: 'bottom', paddingBottom: 8, textAlign: 'center' }}>
              <div className="pdf-firma-espacio" />
              <div style={{ fontSize: '9pt' }}>
                <strong>Nombre y Cargo:</strong> {puesto.ocupante_nombre || ' '}
              </div>
            </td>
            <td style={{ height: 70, verticalAlign: 'bottom', paddingBottom: 8, textAlign: 'center' }}>
              <div className="pdf-firma-espacio" />
              <div style={{ fontSize: '9pt' }}>
                <strong>Nombre y Cargo:</strong> {puesto.jefe_inmediato || ' '}
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: '9pt' }}>
              <strong>Fecha:</strong> {fmtFecha(puesto.ocupante_fecha)}
            </td>
            <td style={{ fontSize: '9pt' }}>
              <strong>Fecha:</strong> {fmtFecha(puesto.ocupante_fecha)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Página Sección de Cambios ─────────────────────────────────────────────────
function PaginaCambios({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-seccion-titulo" style={{ marginBottom: 12, fontSize: '13pt' }}>4.5 SECCIÓN DE CAMBIOS</div>
      <table className="pdf-cambios-tabla">
        <thead>
          <tr>
            <th>REVISIÓN ANTERIOR</th>
            <th>REVISIÓN ACTUAL</th>
            <th>RAZÓN DE LA ÚLTIMA MODIFICACIÓN</th>
            <th>FECHA DE ACTUALIZACIÓN</th>
          </tr>
        </thead>
        <tbody>
          {(datos.cambios?.length > 0) ? datos.cambios.map((c, i) => (
            <tr key={i}>
              <td>{c.revision_anterior}</td>
              <td>{c.revision_actual}</td>
              <td style={{ textAlign: 'left', padding: '5px 10px' }}>{c.razon}</td>
              <td>{fmtFecha(c.fecha)}</td>
            </tr>
          )) : (
            <tr>
              <td>—</td><td>—</td><td>NO APLICA</td><td>—</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function GeneradorPDFManual({ datos, onCerrar }) {
  const docRef = useRef(null)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState('')
  const [fuenteLista, setFuenteLista] = useState(false)

  // Esperar a que Montserrat cargue antes de mostrar el documento
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap'
    document.head.appendChild(link)
    link.onload = () => {
      document.fonts.ready.then(() => setFuenteLista(true))
    }
    // Por si la fuente ya estaba cargada
    document.fonts.ready.then(() => setFuenteLista(true))
    return () => document.head.removeChild(link)
  }, [])

  const puestos = datos.puestos || []
  const paginaValoresSeparada = (datos.valores || []).length > 0
  const organigramasEspecificos = (datos.organigramas_especificos && datos.organigramas_especificos.length > 0)
    ? datos.organigramas_especificos
    : [null]
  const segmentosAntecedentes = dividirTextoEnSegmentos(datos.antecedentes, 2400)
  const paginasAntecedentes = paginarSegmentos(segmentosAntecedentes, 2800)
  const paginasPoliticas = paginarPoliticas(datos.politicas_operacion || [])
  const totalPaginasAntecedentes = paginasAntecedentes.length || 1
  const totalPaginasPoliticas = paginasPoliticas.length || 1
  const mapaPaginas = crearMapaPaginas({
    puestos,
    paginasAntecedentes: totalPaginasAntecedentes,
    paginaValoresSeparada,
    paginasPoliticas: totalPaginasPoliticas,
    paginasOrganigramasEspecificos: organigramasEspecificos.length,
  })
  const totalPaginas = mapaPaginas.total

  const generarPDF = async () => {
    setGenerando(true)
    setProgreso('Preparando documento...')
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
      const paginas = docRef.current.querySelectorAll('.pdf-pagina, .pdf-pagina-horizontal')

      for (let i = 0; i < paginas.length; i++) {
        setProgreso(`Procesando página ${i + 1} de ${paginas.length}...`)
        const orientation = paginas[i].dataset.pageOrientation === 'landscape' ? 'landscape' : 'portrait'
        const canvas = await html2canvas(paginas[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        if (i > 0) pdf.addPage('letter', orientation)
        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      }

      setProgreso('Guardando archivo...')
      const nombreArchivo = `Manual_Organizacion_${(datos.dependencia || 'dependencia').replace(/\s+/g, '_')}_${datos.codigo || 'v1'}.pdf`
      pdf.save(nombreArchivo)
      setProgreso('¡PDF generado exitosamente!')
      setTimeout(() => setProgreso(''), 3000)
    } catch (err) {
      console.error(err)
      setProgreso('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#525659',
      zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'auto', padding: '20px 0'
    }}>
      {/* Barra de acciones */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', gap: 12, alignItems: 'center',
        background: '#1a0a0f', padding: '12px 24px',
        borderRadius: 12, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        width: 860
      }}>
        <button
          onClick={generarPDF}
          disabled={generando}
          style={{
            padding: '10px 24px', background: '#e11d48', color: 'white',
            border: 'none', borderRadius: 8, fontWeight: '700', fontSize: '.9rem',
            cursor: generando ? 'not-allowed' : 'pointer', opacity: generando ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          {generando ? '⏳ Generando PDF...' : '⬇ Descargar PDF'}
        </button>
        {progreso && (
          <span style={{ color: progreso.includes('exitosamente') ? '#4ade80' : '#fbbf24', fontSize: '.85rem' }}>
            {progreso}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={onCerrar}
          style={{
            padding: '8px 18px', background: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
            cursor: 'pointer', fontSize: '.85rem'
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      {/* Inyectar estilos */}
      <style>{estilos}</style>

      {/* Documento renderizado */}
      {!fuenteLista ? (
        <div style={{ color: '#fff', fontSize: '1rem', marginTop: 40 }}>Cargando tipografía...</div>
      ) : (
      <div ref={docRef} className="pdf-doc">
        <PaginaPortada datos={datos} total={totalPaginas} />
        <PaginaCaratula datos={datos} total={totalPaginas} />
        <PaginaIndice datos={datos} total={totalPaginas} mapaPaginas={mapaPaginas} />
        <PaginaPortadaCapituloI datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.portadaCapituloI} />
        <PaginaCapituloI datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.capituloIParte1} />
        <PaginaCapituloI2 datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.capituloIParte2} />
        <PaginaIntroduccion datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.introduccion} />
        {paginasAntecedentes.map((parrafosPagina, i) => (
          <PaginaAntecedentes
            key={`antecedentes-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.antecedentes + i}
            parrafos={parrafosPagina}
            esContinuacion={i > 0}
          />
        ))}
        <PaginaMarcoNormativo datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.marcoNormativo} />
        <PaginaAtribuciones datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.atribuciones} />
        <PaginaObjetivoMisionVision datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.objetivoMisionVision} />
        <PaginaPrincipiosValores datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.principiosValores} />
        {mapaPaginas.valores && (
          <PaginaValores datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.valores} />
        )}
        {paginasPoliticas.map((politicasPagina, i) => (
          <PaginaPoliticasOperacion
            key={`politicas-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.politicas + i}
            politicas={politicasPagina}
          />
        ))}
        <PaginaMarcoConceptual datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.marcoConceptual} />
        <PaginaPortadaCapituloII datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.portadaCapituloII} />
        <PaginaOrganigramaGeneral datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.organigramaGeneral} />
        {organigramasEspecificos.map((organigrama, i) => (
          <PaginaOrganigramaEspecifico
            key={`organigrama-especifico-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.organigramasEspecificos + i}
            organigrama={organigrama}
            index={i}
          />
        ))}
        <PaginaInventario datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.inventario} />
        {puestos.map((puesto, i) => (
          <PaginaPuesto
            key={i}
            datos={datos}
            puesto={puesto}
            index={i}
            total={totalPaginas}
            paginaInicio={mapaPaginas.primerPuesto + i}
          />
        ))}
        <PaginaCambios datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.cambios} />
      </div>
      )}
    </div>
  )
}
