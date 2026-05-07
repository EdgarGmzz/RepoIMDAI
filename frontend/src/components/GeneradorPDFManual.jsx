import { Fragment, useRef, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'
import { API_BASE } from '../config.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

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
    width: 11in;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 8px 0 32px 0;
  }
  .pdf-pagina {
    width: 8.5in;
    height: 11in;
    padding: 48px 56px 48px 56px;
    background: white;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 500;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    flex-shrink: 0;
    overflow: hidden;
  }
  .pdf-pagina-horizontal {
    width: 11in;
    height: 8.5in;
    padding: 40px 48px;
    background: white;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 500;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    flex-shrink: 0;
    overflow: hidden;
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
    font-size: 45pt;
    font-weight: normal;
    letter-spacing: 2px;
    line-height: 1.1;
  }
  .pdf-portada-titulo h1 strong {
    font-weight: 900;
    display: block;
    font-size: 44pt;
  }
  .pdf-portada-dep {
    text-align: center;
    font-size: 24pt;
    font-weight: normal;
    letter-spacing: 3px;
    margin-top: 55px;
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
    line-height: 1.08;
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

  /* ── Marco Normativo / Marco Conceptual ── */
  .pdf-norma-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 9.5pt;
  }
  .pdf-norma-tabla th {
    background: #ffffff;
    color: #808080;
    padding: 6px 8px;
    text-align: left;
    border: 1px solid #000;
    font-weight: bold;
  }
  .pdf-norma-tabla td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: top;
  }

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
    background: #ffffff;
    color: #808080;
    padding: 7px 10px;
    text-align: center;
    border: 1px solid #000;
    font-size: 9pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  .pdf-inv-tabla .personas-cargo-header {
    width: 120px;
    font-size: 8pt;
    line-height: 1.12;
    padding: 6px 8px;
  }
  .pdf-inv-tabla td {
    border: 1px solid #000;
    padding: 5px 10px;
    vertical-align: middle;
  }
  .pdf-inv-tabla .total-row td {
    background: #7F7F7F;
    color: white;
    font-weight: bold;
    text-align: center;
  }
  .pdf-inv-titulo {
    margin-top: -13px;
    margin-bottom: 10px;
  }

  /* ── Descripción de puesto ── */
  .pdf-puesto-header {
    font-size: 14pt;
    font-weight: 800;
    font-family: 'Montserrat', Arial, sans-serif;
    text-transform: uppercase;
    margin-bottom: 12px;
    line-height: 1.12;
  }
  .pdf-info-puesto-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 10pt;
    table-layout: fixed;
  }
  .pdf-info-puesto-tabla .header-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    font-size: 10pt;
    text-transform: uppercase;
    letter-spacing: 0;
    padding: 4px 8px;
    border: 1.9px solid #000;
    vertical-align: middle;
  }
  .pdf-info-puesto-tabla td {
    border: 1.9px solid #000;
    padding: 3px 8px;
    vertical-align: middle;
    line-height: 1.15;
  }
  .pdf-info-puesto-tabla .label-cell {
    background: #9a9a9a;
    color: white;
    font-weight: 800;
    font-size: 10pt;
    text-transform: uppercase;
    text-align: center;
  }
  .pdf-info-puesto-tabla .puesto-num-cell {
    width: 58px;
    text-align: center;
    font-weight: 800;
    background: #fff;
    color: #000;
    font-size: 10pt;
  }
  .pdf-info-puesto-tabla .sub-num-cell {
    width: 150px;
    text-align: center;
    vertical-align: middle;
  }
  .pdf-info-puesto-tabla .sub-nombre-cell {
    padding-left: 0;
  }
  .pdf-subordinados-tabla {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 10pt;
  }
  .pdf-subordinados-tabla td {
    border: 1.9px solid #000;
    padding: 3px 8px;
    vertical-align: middle;
    line-height: 1.15;
  }
  .pdf-objetivo-box {
    border: 1px solid #000;
    padding: 12px 13px 12px 13px;
    margin-bottom: 14px;
    font-size: 10.5pt;
    line-height: 1.42;
  }
  .pdf-objetivo-titulo {
    background: #7F7F7F;
    color: white;
    text-align: center;
    font-weight: 800;
    font-size: 10pt;
    text-transform: uppercase;
    padding: 6px;
    letter-spacing: 0;
    margin-bottom: 10px;
  }
  .pdf-objetivo-subtitulo {
    text-align: center;
    font-style: italic;
    font-size: 9pt;
    color: #333;
    margin-bottom: 12px;
  }
  .pdf-funciones-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 11pt;
    table-layout: fixed;
  }
  .pdf-funciones-tabla .header-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 1px solid #000;
    font-size: 11pt;
    letter-spacing: 0;
  }
  .pdf-funciones-tabla .subheader {
    background: #9a9a9a;
    color: white;
    font-weight: 800;
    font-size: 11pt;
    text-transform: uppercase;
    padding: 4px 2px;
    border: 1px solid #000;
  }
  .pdf-funciones-tabla td {
    border: 1px solid #000;
    padding: 2px 4px;
    vertical-align: middle;
    line-height: 1.12;
  }
  .pdf-funciones-tabla .num-cell {
    text-align: center;
    width: 145px;
    font-weight: 500;
    font-size: 11pt;
  }
  .pdf-funciones-tabla .texto-cell {
    font-size: 11pt;
    text-align: justify;
    text-justify: inter-word;
    text-align-last: left;
  }
  .pdf-perfil-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 9.5pt;
    table-layout: fixed;
  }
  .pdf-perfil-tabla .header-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 1px solid #000;
    font-size: 12pt;
    letter-spacing: 0;
  }
  .pdf-perfil-tabla td {
    border: 1px solid #000;
    padding: 4px 10px;
    vertical-align: middle;
    line-height: 1.08;
  }
  .pdf-perfil-tabla .label-bold {
    font-weight: 800;
    color: #595959;
    background: #fff;
    font-size: 9.5pt;
  }
  .pdf-perfil-tabla .num-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    font-size: 10pt;
    width: 42px;
  }
  .pdf-perfil-tabla .perfil-opcion {
    font-weight: 800;
    color: #595959;
    font-size: 9.5pt;
  }
  .pdf-perfil-tabla .perfil-marca {
    text-align: center;
    color: #595959;
    font-weight: 500;
    width: 36px;
  }
  .pdf-perfil-tabla .perfil-descripcion {
    font-size: 9.5pt;
    color: #000;
  }
  .pdf-perfil-tabla .competencias-header {
    background: #9a9a9a;
    color: white;
    text-align: left;
    font-weight: 800;
    padding: 3px 10px;
    border: 1px solid #000;
    font-size: 12pt;
  }
  .pdf-perfil-tabla .competencias-label {
    font-weight: 800;
    color: #595959;
    background: #fff;
    font-size: 9.5pt;
  }
  .pdf-perfil-tabla .competencias-contenido {
    font-size: 9.5pt;
    color: #000;
    padding: 3px 10px;
    vertical-align: top;
    line-height: 1.08;
  }
  .pdf-perfil-tabla .competencias-categoria {
    font-weight: 800;
    color: #595959;
    margin-bottom: 1px;
  }
  .pdf-perfil-tabla .competencias-lista {
    margin: 0;
    padding-left: 34px;
    list-style-position: outside;
  }
  .pdf-perfil-tabla .competencias-lista li {
    margin: 0;
    padding-left: 6px;
    line-height: 1.12;
  }
  .pdf-responsabilidad-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    margin-bottom: 0;
    table-layout: fixed;
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 10.5pt;
  }
  .pdf-responsabilidad-tabla td {
    border: 1px solid #000;
    padding: 4px 10px;
    vertical-align: middle;
    line-height: 1.08;
  }
  .pdf-responsabilidad-tabla .header-gris {
    background: #9a9a9a;
    color: white;
    text-align: left;
    font-weight: 800;
    text-transform: uppercase;
    padding: 5px 10px;
    border: 1px solid #000;
    font-size: 12pt;
  }
  .pdf-responsabilidad-tabla .num-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    font-size: 12pt;
    width: 52px;
  }
  .pdf-responsabilidad-tabla .texto-principal {
    font-size: 12pt;
    color: #595959;
  }
  .pdf-responsabilidad-tabla .texto-principal strong {
    font-weight: 800;
  }
  .pdf-responsabilidad-tabla .nivel-label {
    color: #595959;
    font-size: 10.5pt;
    padding: 4px 4px;
  }
  .pdf-responsabilidad-tabla .nivel-marca {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    font-size: 10.5pt;
    padding: 4px;
  }
  .pdf-responsabilidad-tabla .item-texto {
    font-size: 12pt;
    color: #000;
    line-height: 1.18;
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
    margin-top: 0;
    font-size: 12pt;
    table-layout: fixed;
    font-family: 'Montserrat', Arial, sans-serif;
  }
  .pdf-firma-tabla .header-gris {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 1px solid #000;
    font-size: 11pt;
    line-height: 1.12;
    vertical-align: middle;
  }
  .pdf-firma-tabla td {
    border: 1px solid #000;
    padding: 0;
    vertical-align: top;
    text-align: center;
  }
  .pdf-firma-espacio {
    height: 98px;
  }
  .pdf-firma-titulo {
    background: #9a9a9a;
    color: white;
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
    padding: 6px 8px;
    border: 1px solid #000;
    font-size: 11pt;
  }
  .pdf-firma-datos {
    height: 102px;
    padding: 4px 16px;
    font-size: 12pt;
    line-height: 1.35;
    vertical-align: top;
  }
  .pdf-firma-datos strong {
    font-weight: 800;
  }
  .pdf-firma-fecha {
    padding: 4px 2px;
    text-align: left;
    font-size: 11.5pt;
    line-height: 1.1;
  }
  .pdf-firma-fecha strong {
    font-weight: 800;
  }
  .pdf-compromiso {
    border: 1px solid #000;
    padding: 4px 10px;
    margin: 0;
    font-size: 10.5pt;
    line-height: 1.1;
    text-align: justify;
    font-family: 'Montserrat', Arial, sans-serif;
  }
  .pdf-cambios-tabla {
    width: 100%;
    border-collapse: collapse;
    margin-top: 26px;
    table-layout: fixed;
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 12pt;
  }
  .pdf-cambios-tabla th {
    background: #D9D9D9;
    color: #000000;
    padding: 12px 8px 10px;
    text-align: center;
    border: 1px solid #000;
    font-size: 10.5pt;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1.12;
    vertical-align: middle;
  }
  .pdf-cambios-tabla td {
    border: 1px solid #000;
    padding: 12px 10px;
    height: 84px;
    text-align: center;
    vertical-align: middle;
    font-size: 12pt;
    line-height: 1.25;
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

const fmtFechaLarga = (str) => {
  if (!str) return '—'
  const s = String(str).trim()
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const dia = String(Number(iso[3]))
    const mes = meses[Number(iso[2]) - 1] || ''
    return `${dia} de ${mes} ${iso[1]}`
  }

  const partes = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (partes) {
    const dia = String(Number(partes[1]))
    const mes = meses[Number(partes[2]) - 1] || ''
    return `${dia} de ${mes} ${partes[3]}`
  }

  return fmtFecha(str)
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
    let texto = linea

    if (match) {
      let etiqueta = match[1].toUpperCase()
      if (etiqueta === 'TELEFONO') etiqueta = 'TELÉFONO'
      if (etiqueta === 'UBICACION') etiqueta = 'UBICACIÓN'
      texto = `${etiqueta}: ${match[2]}`
    }

    return (
      <div
        key={i}
        style={{
          margin: 0,
          padding: 0,
          lineHeight: 1.08,
          textAlign: 'justify',
          textJustify: 'inter-word',
          textAlignLast: 'left',
        }}
      >
        {texto}
      </div>
    )
  })
}

const normalizarRutaOrganigrama = (ruta) => {
  if (!ruta) return ''
  if (/^https?:\/\//i.test(ruta)) return ruta
  return `${API_BASE}${ruta}`
}

const esPdfOrganigrama = (ruta) => /\.pdf(?:[?#].*)?$/i.test(String(ruta || ''))

const renderizarPdfComoImagen = async (src) => {
  const respuesta = await fetch(src, { mode: 'cors', cache: 'no-store' })
  if (!respuesta.ok) throw new Error(`No se pudo descargar el PDF (${respuesta.status})`)

  const data = await respuesta.arrayBuffer()
  const encabezado = new TextDecoder('ascii').decode(new Uint8Array(data.slice(0, 1024)))
  if (!encabezado.includes('%PDF-')) {
    const tipo = respuesta.headers.get('content-type') || 'tipo desconocido'
    throw new Error(`La URL no devolvio un PDF valido (${tipo})`)
  }

  const pdf = await pdfjsLib.getDocument({
    data,
    disableRange: true,
    disableStream: true,
  }).promise
  const page = await pdf.getPage(1)
  const viewportBase = page.getViewport({ scale: 1 })
  const scale = Math.min(3, Math.max(1.4, 1500 / viewportBase.width))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: context, viewport }).promise
  return canvas.toDataURL('image/png')
}

const esperarImagenes = async (contenedor) => {
  const imagenes = Array.from(contenedor?.querySelectorAll('img') || [])
  await Promise.all(imagenes.map((img) => {
    if (img.complete) return Promise.resolve()
    return new Promise((resolve) => {
      img.onload = resolve
      img.onerror = resolve
    })
  }))
}

const esperarOrganigramasPdf = async (contenedor, timeoutMs = 15000) => {
  const inicio = Date.now()
  while (contenedor?.querySelector('[data-pdf-organigrama="loading"]')) {
    if (Date.now() - inicio > timeoutMs) break
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
}

const estimarAltoPolitica = (politica = {}) => {
  const area = String(politica.area || '')
  const descripcion = String(politica.descripcion || '')
  const charsPorLinea = 76
  const lineasArea = politica.esContinuacion || !area ? 0 : Math.max(1, Math.ceil(area.length / 68))
  const lineasDescripcion = Math.max(1, Math.ceil(descripcion.length / charsPorLinea))
  const saltos = (descripcion.match(/\n/g) || []).length

  return (lineasArea * 17) + (lineasDescripcion * 16) + (saltos * 10) + 32
}

const dividirTextoPlano = (texto, maxChars = 850) => {
  const valor = String(texto || '').trim()
  if (!valor) return ['']
  if (valor.length <= maxChars) return [valor]

  const segmentos = dividirTextoEnSegmentos(valor, maxChars)
  if (segmentos.length > 0) return segmentos.map((segmento) => segmento.texto)

  const partes = []
  for (let i = 0; i < valor.length; i += maxChars) {
    partes.push(valor.slice(i, i + maxChars))
  }
  return partes
}

const paginarPrincipiosValores = (principios = [], valores = [], maxPesoPorPagina = 3100) => {
  const entradas = [
    ...principios.map((texto) => ({ tipo: 'PRINCIPIOS', texto })),
    ...valores.map((texto) => ({ tipo: 'VALORES', texto })),
  ].filter((entrada) => String(entrada.texto || '').trim())

  if (!entradas.length) return [[]]

  const paginas = []
  let actual = []
  let pesoActual = 0

  entradas.forEach((entrada) => {
    const peso = String(entrada.texto || '').length + (actual.some((item) => item.tipo === entrada.tipo) ? 80 : 180)

    if (actual.length > 0 && pesoActual + peso > maxPesoPorPagina) {
      paginas.push(actual)
      actual = [entrada]
      pesoActual = peso
      return
    }

    actual.push(entrada)
    pesoActual += peso
  })

  if (actual.length > 0) paginas.push(actual)
  return paginas
}

const paginarPoliticas = (politicas = [], maxAltoPorPagina = 760) => {
  if (!politicas.length) return [[]]

  const entradas = []
  politicas.forEach((politica, index) => {
    const segmentos = dividirTextoPlano(politica.descripcion, 850)
    segmentos.forEach((segmento, segmentoIndex) => {
      entradas.push({
        area: politica.area,
        descripcion: segmento,
        indiceOriginal: index,
        esContinuacion: segmentoIndex > 0,
      })
    })
  })

  const paginas = []
  let actual = []
  let altoActual = 0

  entradas.forEach((politica) => {
    const alto = estimarAltoPolitica(politica)

    if (actual.length > 0 && altoActual + alto > maxAltoPorPagina) {
      paginas.push(actual)
      actual = [politica]
      altoActual = alto
      return
    }

    actual.push(politica)
    altoActual += alto
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

const paginarInventario = (inventario = [], maxFilasPorPagina = 22) => {
  if (!inventario.length) return [[]]

  const paginas = []
  for (let i = 0; i < inventario.length; i += maxFilasPorPagina) {
    paginas.push(inventario.slice(i, i + maxFilasPorPagina))
  }

  return paginas
}

const paginarSubordinadosPuesto = (puesto = {}) => {
  const directos = (puesto.subordinados_directos || []).map((item) => ({ ...item, tipo: 'directo' }))
  const indirectos = (puesto.subordinados_indirectos || []).map((item) => ({ ...item, tipo: 'indirecto' }))
  const filas = [...directos, ...indirectos]

  if (!filas.length) return [[{ tipo: 'directo', num_personas: '—', nombre_puesto: 'N/A' }]]

  const primeraPagina = filas.slice(0, 14)
  const restantes = filas.slice(14)
  const paginas = [primeraPagina]

  for (let i = 0; i < restantes.length; i += 24) {
    paginas.push(restantes.slice(i, i + 24))
  }

  return paginas
}

const crearEntradasFuncionesPuesto = (puesto = {}) => {
  const institucionales = puesto.funciones_institucionales?.length > 0
    ? puesto.funciones_institucionales
    : ['N/A']
  const propias = puesto.funciones_propias?.length > 0
    ? puesto.funciones_propias
    : ['N/A']

  return [
    ...institucionales.flatMap((texto, index) =>
      dividirTextoPlano(texto, 900).map((segmento, parte) => ({
        tipo: 'institucional',
        texto: segmento,
        numero: index + 1,
        parte,
      }))
    ),
    ...propias.flatMap((texto, index) =>
      dividirTextoPlano(texto, 900).map((segmento, parte) => ({
        tipo: 'propia',
        texto: segmento,
        numero: index + 1,
        parte,
      }))
    ),
  ]
}

const calcularPesoFuncion = (entrada = {}, actual = []) =>
  String(entrada.texto || '').length + (actual.some((item) => item.tipo === entrada.tipo) ? 40 : 120)

const paginarEntradasFunciones = (entradas = [], maxPesoPorPagina = 2400) => {
  const paginas = []
  let actual = []
  let pesoActual = 0

  entradas.forEach((entrada) => {
    const peso = calcularPesoFuncion(entrada, actual)

    if (actual.length > 0 && pesoActual + peso > maxPesoPorPagina) {
      paginas.push(actual)
      actual = [entrada]
      pesoActual = peso
      return
    }

    actual.push(entrada)
    pesoActual += peso
  })

  if (actual.length > 0) paginas.push(actual)
  return paginas.length > 0 ? paginas : [[]]
}

const paginarFuncionesPuesto = (puesto = {}, maxPesoPorPagina = 2400) =>
  paginarEntradasFunciones(crearEntradasFuncionesPuesto(puesto), maxPesoPorPagina)

const contarFilasSubordinadosPuesto = (puesto = {}) =>
  (puesto.subordinados_directos || []).length + (puesto.subordinados_indirectos || []).length

const debeMostrarUbicacionEnPrimeraPagina = (puesto = {}) =>
  paginarSubordinadosPuesto(puesto).length === 1 && contarFilasSubordinadosPuesto(puesto) <= 8

const dividirFuncionesObjetivo = (puesto = {}) => {
  const entradas = crearEntradasFuncionesPuesto(puesto)
  const puedeUsarObjetivo = debeMostrarUbicacionEnPrimeraPagina(puesto)

  if (!puedeUsarObjetivo || entradas.length === 0) {
    return { funcionesEnObjetivo: [], paginasFunciones: paginarEntradasFunciones(entradas) }
  }

  const objetivo = String(puesto.objetivo_puesto || '')
  const maxPesoObjetivo = objetivo.length > 700 ? 950 : 1350
  const funcionesEnObjetivo = []
  let pesoActual = 0
  let index = 0

  for (; index < entradas.length; index++) {
    const entrada = entradas[index]
    const peso = calcularPesoFuncion(entrada, funcionesEnObjetivo)
    if (funcionesEnObjetivo.length > 0 && pesoActual + peso > maxPesoObjetivo) break
    funcionesEnObjetivo.push(entrada)
    pesoActual += peso
  }

  const restantes = entradas.slice(index)
  return {
    funcionesEnObjetivo,
    paginasFunciones: restantes.length ? paginarEntradasFunciones(restantes) : [],
  }
}

const contarPaginasPuesto = (puesto = {}) => {
  const paginasSubordinados = paginarSubordinadosPuesto(puesto).length
  const { funcionesEnObjetivo, paginasFunciones } = dividirFuncionesObjetivo(puesto)
  const paginasFuncionesIndependientes = paginasFunciones.length || (funcionesEnObjetivo.length ? 0 : 1)
  const paginasCompetencias = paginarFilasCompetencias(puesto)
  const paginasCompetenciasAdicionales = Math.max(0, paginasCompetencias.length - 1)
  const ultimaPaginaCompetencias = paginasCompetencias[paginasCompetencias.length - 1] || []
  const basePerfil = paginasCompetenciasAdicionales > 0 ? 0 : 10.5
  const limiteCompartido = paginasCompetenciasAdicionales > 0 ? 24 : 15
  const capacidadResponsabilidad = Math.max(0, limiteCompartido - basePerfil - sumarAltoFilasCompetencias(ultimaPaginaCompetencias))
  const integraResponsabilidad = capacidadResponsabilidad >= 2
  const paginasResponsabilidad = paginarEntradasResponsabilidad(
    puesto,
    integraResponsabilidad ? capacidadResponsabilidad : 0
  )
  const paginasResponsabilidadAdicionales = integraResponsabilidad
    ? Math.max(0, paginasResponsabilidad.length - 1)
    : paginasResponsabilidad.length
  const ultimaPaginaResponsabilidad = paginasResponsabilidad[paginasResponsabilidad.length - 1] || []
  const firmaCompartePagina = sumarAltoResponsabilidad(ultimaPaginaResponsabilidad) <= 9

  return paginasSubordinados + paginasFuncionesIndependientes + paginasCompetenciasAdicionales + paginasResponsabilidadAdicionales + (firmaCompartePagina ? 2 : 3)
}

const normalizarTextoInventario = (texto = '') =>
  String(texto)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const limpiarValorPerfil = (valor, fallback = 'N/A') => {
  const texto = String(valor || '').trim()
  if (!texto) return fallback

  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

  if (['incognita', 'unknown', 'undefined', 'null'].includes(normalizado)) return fallback
  return texto
}

const limpiarListaPerfil = (items = [], fallback = 'N/A') => {
  const valores = items
    .map((item) => limpiarValorPerfil(item, ''))
    .filter(Boolean)

  return valores.length ? valores.join(', ') : fallback
}

const obtenerListaPerfil = (items = [], fallback = 'N/A') => {
  const valores = (Array.isArray(items) ? items : String(items || '').split(/\r?\n|,/))
    .map((item) => limpiarValorPerfil(item, ''))
    .filter(Boolean)

  return valores.length ? valores : [fallback]
}

const renderListaPerfil = (items = [], fallback = 'N/A') => {
  const valores = obtenerListaPerfil(items, fallback)
  if (valores.length === 1 && valores[0] === fallback) return fallback

  return (
    <ul className="competencias-lista">
      {valores.map((valor, i) => (
        <li key={i}>{valor}</li>
      ))}
    </ul>
  )
}

const crearFilasCompetencias = (puesto = {}) => [
  { tipo: 'header' },
  {
    tipo: 'habilidad',
    numero: '11.',
    etiqueta: 'Habilidades',
    categoria: 'Directivas:',
    items: puesto.habilidades_directivas,
  },
  {
    tipo: 'habilidad',
    numero: '11.',
    etiqueta: 'Habilidades',
    categoria: 'Técnicas:',
    items: puesto.habilidades_tecnicas,
  },
  {
    tipo: 'habilidad',
    numero: '11.',
    etiqueta: 'Habilidades',
    categoria: 'General:',
    items: puesto.habilidades_generales,
  },
  {
    tipo: 'lista',
    numero: '12.',
    etiqueta: 'Actitudes.',
    items: puesto.actitudes,
  },
  {
    tipo: 'texto',
    numero: '13.',
    etiqueta: 'Horario Laboral.',
    valor: puesto.horario_laboral,
  },
]

const estimarAltoFilaCompetencia = (fila = {}) => {
  if (fila.tipo === 'header') return 1.2
  if (fila.tipo === 'texto') return 1.4

  const items = obtenerListaPerfil(fila.items)
  return 1.5 + (items.length * 0.75)
}

const sumarAltoFilasCompetencias = (filas = []) =>
  filas.reduce((total, fila) => total + estimarAltoFilaCompetencia(fila), 0)

const paginarFilasCompetencias = (puesto = {}, maxPrimeraPagina = 9.5, maxPagina = 24) => {
  const filas = crearFilasCompetencias(puesto)
  const paginas = [[]]
  let paginaActual = 0
  let altoActual = 0

  filas.forEach((fila) => {
    const alto = estimarAltoFilaCompetencia(fila)
    const limite = paginaActual === 0 ? maxPrimeraPagina : maxPagina

    if (paginas[paginaActual].length > 0 && altoActual + alto > limite) {
      paginas.push([])
      paginaActual += 1
      altoActual = 0
    }

    paginas[paginaActual].push(fila)
    altoActual += alto
  })

  const paginasConContenido = paginas.filter((pagina) => pagina.length > 0)
  const ultimaPagina = paginasConContenido[paginasConContenido.length - 1]
  const penultimaPagina = paginasConContenido[paginasConContenido.length - 2]

  if (
    paginasConContenido.length > 1 &&
    ultimaPagina.length === 1 &&
    estimarAltoFilaCompetencia(ultimaPagina[0]) <= 2 &&
    penultimaPagina
  ) {
    penultimaPagina.push(ultimaPagina[0])
    paginasConContenido.pop()
  }

  return paginasConContenido
}

const crearEntradasResponsabilidad = (puesto = {}) => [
  { tipo: 'header', titulo: 'RESPONSABILIDAD' },
  { tipo: 'mobiliario' },
  { tipo: 'informacion', valor: puesto.manejo_informacion, nivel: puesto.nivel_informacion },
  { tipo: 'presupuesto', valor: puesto.manejo_presupuesto },
  { tipo: 'nivelPresupuesto', nivel: puesto.nivel_presupuesto },
  ...(puesto.autoridad?.length > 0
    ? [
        { tipo: 'header', titulo: 'AUTORIDAD:' },
        ...puesto.autoridad.map((valor, i) => ({ tipo: 'item', numero: `${i + 1}.`, valor })),
      ]
    : []),
  ...(puesto.indicador_desempeno?.length > 0
    ? [
        { tipo: 'header', titulo: 'INDICADOR DE DESEMPEÑO PROFESIONAL' },
        ...puesto.indicador_desempeno.map((valor, i) => ({ tipo: 'item', numero: `${i + 1}.`, valor })),
      ]
    : []),
]

const estimarAltoEntradaResponsabilidad = (entrada = {}) => {
  if (entrada.tipo === 'header') return 1.1
  if (entrada.tipo === 'mobiliario') return 2.5
  if (entrada.tipo === 'informacion') return 2.8
  if (entrada.tipo === 'presupuesto') return 1.8
  if (entrada.tipo === 'nivelPresupuesto') return 1.2
  return Math.max(1.2, Math.ceil(String(entrada.valor || '').length / 82) * 1.15)
}

const paginarEntradasResponsabilidad = (puesto = {}, maxPrimeraPagina = 0, maxPagina = 14) => {
  const entradas = crearEntradasResponsabilidad(puesto)
  const paginas = []
  let actual = []
  let altoActual = 0
  let limite = maxPrimeraPagina

  entradas.forEach((entrada) => {
    const alto = estimarAltoEntradaResponsabilidad(entrada)

    if (limite <= 0 || (actual.length > 0 && altoActual + alto > limite)) {
      if (actual.length > 0) paginas.push(actual)
      actual = [entrada]
      altoActual = alto
      limite = maxPagina
      return
    }

    actual.push(entrada)
    altoActual += alto
  })

  if (actual.length > 0) paginas.push(actual)

  for (let i = 1; i < paginas.length; i++) {
    const primeraEntrada = paginas[i][0]
    const paginaAnterior = paginas[i - 1]

    if (
      primeraEntrada?.tipo === 'nivelPresupuesto' &&
      paginaAnterior?.length > 0
    ) {
      paginaAnterior.push(primeraEntrada)
      paginas[i] = paginas[i].slice(1)
    }
  }

  return paginas
    .filter((pagina) => pagina.length > 0)
    .map((pagina, index, todas) => {
      const siguiente = todas[index + 1]
      if (
        siguiente?.length === 1 &&
        estimarAltoEntradaResponsabilidad(siguiente[0]) <= 1.5
      ) {
        return [...pagina, siguiente[0]]
      }
      return pagina
    })
    .filter((pagina, index, todas) => {
      const anterior = todas[index - 1]
      return !(pagina.length === 1 && anterior?.at(-1) === pagina[0])
    })
}

const sumarAltoResponsabilidad = (entradas = []) =>
  entradas.reduce((total, entrada) => total + estimarAltoEntradaResponsabilidad(entrada), 0)

const filtrarInventarioPDF = (inventario = [], dependencia = '') => {
  const dependenciaNormalizada = normalizarTextoInventario(dependencia)

  return inventario.filter((puesto) => {
    const nombreNormalizado = normalizarTextoInventario(puesto?.nombre_puesto)
    return nombreNormalizado && nombreNormalizado !== dependenciaNormalizada
  })
}

const CAMBIOS_POR_PAGINA = 6

const paginarCambios = (cambios = []) => {
  const filas = Array.isArray(cambios) && cambios.length > 0 ? cambios : [null]
  const paginas = []

  for (let i = 0; i < filas.length; i += CAMBIOS_POR_PAGINA) {
    paginas.push(filas.slice(i, i + CAMBIOS_POR_PAGINA))
  }

  return paginas.length ? paginas : [[null]]
}

const crearMapaPaginas = ({
  puestos = [],
  paginasPuestos = null,
  paginasAntecedentes = 1,
  paginaValoresSeparada = false,
  paginasPrincipiosValores = 1,
  paginasPoliticas = 1,
  paginasOrganigramasEspecificos = 1,
  paginasInventario = 1,
  paginasCambios = 1,
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
  const politicas = (valores || principiosValores) + paginasPrincipiosValores
  const marcoConceptual = politicas + paginasPoliticas
  const portadaCapituloII = marcoConceptual + 1
  const organigramaGeneral = portadaCapituloII + 1
  const organigramasEspecificos = organigramaGeneral + 1
  const inventario = organigramasEspecificos + paginasOrganigramasEspecificos
  const primerPuesto = inventario + paginasInventario
  const totalPaginasPuestos = paginasPuestos || puestos.reduce((total, puesto) => total + contarPaginasPuesto(puesto), 0)
  const cambios = primerPuesto + totalPaginasPuestos

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
    total: cambios + Math.max(1, paginasCambios) - 1,
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
function HeaderPagina({ datos, numeroPagina, totalPaginas, esHorizontal = false }) {
  const ajusteDerechoPagina = esHorizontal ? '2cm' : '-56px'

  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse',
      marginBottom: 20
    }}>
      <tbody>
        <tr>
          {/* Logo Municipio — izquierda */}
          <td style={{ width: '42%', padding: '0 0 8px 0', verticalAlign: 'middle', position: 'relative', top: '-24px' }}>
            <img
              src="/LogoMunicipio.png"
              alt="Municipio de Benito Juárez"
              style={{ height: 160, width: 'auto', display: 'block' }}
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
                style={{ height: 110, width: 'auto', display: 'block', flexShrink: 0, marginTop: -8 }}
                crossOrigin="anonymous"
              />

              {/* Todo el metadata incluido PÁGINA — alineado a la izquierda del texto */}
              <div style={{ flex: 1, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12pt', lineHeight: 1.6 }}>
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
                  marginRight: ajusteDerechoPagina,
                  paddingLeft: '112px',
                  paddingRight: esHorizontal ? 0 : '56px',
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
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column' }}>
      <HeaderPagina datos={datos} numeroPagina={2} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginBottom: 35 }}>
        <div style={{ fontSize: '45pt', fontWeight: 'normal', letterSpacing: 2, lineHeight: 1.1 }}>MANUAL DE</div>
        <div style={{ fontSize: '44pt', fontWeight: '900', letterSpacing: 2, lineHeight: 1.1 }}>ORGANIZACIÓN</div>
        <div style={{ fontSize: '24pt', marginTop: 108, letterSpacing: 3, textTransform: 'uppercase' }}>
          {datos.dependencia}
        </div>
      </div>

      {/* Tabla carátula rediseñada */}
      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        border: '3px solid #000', borderRadius: 12, overflow: 'hidden',
        fontFamily: 'Montserrat, Arial, sans-serif', marginTop: 'auto', marginBottom: '1.25cm'
      }}>
        {/* Headers */}
        <thead>
          <tr>
            {['ELABORÓ','REVISÓ','AUTORIZÓ','VALIDÓ'].map((h, i) => (
              <th key={i} style={{
                width: '25%', padding: '16px 10px', textAlign: 'center',
                fontWeight: 800, fontSize: '13pt', color: '#7a1020',
                borderBottom: 'none',
                borderRight: i < 3 ? '3px solid #000' : 'none',
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
                borderRight: i < 3 ? '3px solid #000' : 'none',
                borderBottom: 'none', minHeight: 80
              }}>{nombre || ' '}</td>
            ))}
          </tr>
          {/* Espacio vacío para firma */}
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{
                height: 100,
                borderRight: i < 3 ? '3px solid #000' : 'none',
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
                borderRight: i < 3 ? '3px solid #000' : 'none',
              }}>{cargo || ' '}</td>
            ))}
          </tr>
          {/* Espacio vacío debajo del cargo */}
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{
                height: 80,
                borderRight: i < 3 ? '3px solid #000' : 'none',
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
    { num: '02', label: 'Índice', pag: mapaPaginas.indice, nivel: 1, linea: true },
    { num: '03', label: 'Capítulo I de Generales', pag: mapaPaginas.portadaCapituloI, nivel: 1, linea: true },
    { num: '3.1',  label: 'Introducción', pag: mapaPaginas.introduccion, nivel: 2 },
    { num: '3.2',  label: 'Antecedentes', pag: mapaPaginas.antecedentes, nivel: 2 },
    { num: '3.3',  label: 'Marco Normativo', pag: mapaPaginas.marcoNormativo, nivel: 2 },
    { num: '3.4',  label: 'Atribuciones Institucionales', pag: mapaPaginas.atribuciones, nivel: 2 },
    { num: '3.5',  label: 'Objetivo General', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.6',  label: 'Misión', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.7',  label: 'Visión', pag: mapaPaginas.objetivoMisionVision, nivel: 2 },
    { num: '3.8',  label: 'Principios y Valores Institucionales', pag: mapaPaginas.principiosValores, nivel: 2 },
    { num: '3.9',  label: 'Políticas de Operación', pag: mapaPaginas.politicas, nivel: 2 },
    { num: '3.10', label: 'Marco Conceptual', pag: mapaPaginas.marcoConceptual, nivel: 2 },
    { num: '04', label: 'Capítulo II de Organización', pag: mapaPaginas.portadaCapituloII, nivel: 1, linea: true },
    { num: '4.1',  label: 'Organigrama General', pag: mapaPaginas.organigramaGeneral, nivel: 2 },
    { num: '4.2',  label: 'Organigramas Específicos', pag: mapaPaginas.organigramasEspecificos, nivel: 2 },
    { num: '4.3',  label: 'Inventario de Puestos', pag: mapaPaginas.inventario, nivel: 2 },
    { num: '4.4',  label: 'Descripción de Puestos', pag: mapaPaginas.primerPuesto, nivel: 2 },
    ...(datos.puestos || []).map((p, i) => ({
      num: `4.4.${i + 1}`,
      label: `Descripción de puesto ${p.nombre_puesto || ''}`,
      pag: mapaPaginas.primerPuesto + (datos.puestos || [])
        .slice(0, i)
        .reduce((totalPuesto, puestoPrevio) => totalPuesto + contarPaginasPuesto(puestoPrevio), 0),
      nivel: 2
    })),
    { num: '4.5',  label: 'Sección de Cambios', pag: mapaPaginas.cambios, nivel: 2 },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={3} totalPaginas={total} />

      {/* Título ÍNDICE */}
      <div style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 999, fontSize: '20pt',
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
                  fontWeight: 700, fontSize: '16pt', color: '#888',
                  minWidth: 44, flexShrink: 0
                }}>{item.num}</span>
                <span style={{
                  fontWeight: 700, fontSize: '13pt', color: '#888', flex: 1
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
                  marginLeft: '-40px',
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
          fontWeight: 500, fontSize: '66pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>CAPÍTULO 1</div>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800, fontSize: '48pt',
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
        <div className="pdf-seccion-texto">Es el propósito global que desea alcanzar o que persigue la dependencia, Unidad Administrativa y/o entidad para el cumplimiento de las actividades que por su atribución le corresponde.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MISIÓN</div>
        <div className="pdf-seccion-texto">Es la razón de ser de la Dependencia, Unidad Administrativa y/o entidad Municipal, con la cual todos los servidores públicos que laboran para la Institución deberán identificarse para su cumplimiento. Esta descripción debe ser clara, concreta y específica.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">VISIÓN</div>
        <div className="pdf-seccion-texto">En ella se expone a donde se dirige la Dependencia, Unidad Administrativa y/o entidad Municipal y como se ve a largo plazo; enunciar el escenario en el que se desea posicionar a la dependencia y/o entidad.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PRINCIPIOS Y VALORES INSTITUCIONALES</div>
        <div className="pdf-seccion-texto">Consiste en un referente ético que consolida y guía el pensamiento, las actitudes, prácticas y formas de actuación de los servidores públicos y colaboradores de la Dependencia, Unidad Administrativa y/o entidad Municipal. Representando el Conjunto de normas morales que regulan la conducta de los servidores públicos hacia los servicios que prestan a la ciudadanía y en el desarrollo de sus actividades.</div>
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
        <div className="pdf-seccion-texto">Definiciones propias del puesto, dentro de los cuales se encuentran las funciones genéricas y específicas, acorde al catálogo de puestos aprobado e incluyendo los criterios determinados en los lineamientos y disposiciones en materia de transparencia.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">SECCIÓN DE CAMBIOS</div>
        <div className="pdf-seccion-texto">Se especifica el número de versión de acuerdo a las modificaciones validadas del documento, así como las razones de los cambios y sus fechas.</div>
      </div>

      <div className="pdf-seccion" style={{ marginTop: 24 }}>
        <div className="pdf-seccion-titulo">LENGUAJE INCLUYENTE CON PERSPECTIVA DE GÉNERO.</div>
        <div className="pdf-seccion-texto" style={{ lineHeight: 1.08 }}>En la <em>{datos.dependencia}</em> nos apegarnos a la igualdad social, reforzamos el respeto de género y la NO violencia contra las mujeres.</div>
        <div className="pdf-seccion-texto" style={{ marginTop: 3, lineHeight: 1.08 }}>Por ello, exhortamos para que la información contenida en este manual, sea plasmada a través del LENGUAJE INCLUYENTE, por lo mismo evitamos usar expresiones sutiles sexistas para prescindir de patrones de comportamiento y estereotipos de género.</div>
      </div>

      <div style={{
        marginTop: 14, fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800, fontSize: '9pt', textAlign: 'justify', lineHeight: 1.08
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

      <div className="pdf-cap-titulo" style={{ fontSize: '20pt' }}>3.1 INTRODUCCIÓN</div>

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
          position: 'absolute',
          left: 56,
          right: 56,
          bottom: 72,
          textAlign: 'center',
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
  const bloquesAntecedentes = parrafosAntecedentes.reduce((acum, segmento) => {
    const texto = String(segmento?.texto || '').trim()
    if (!texto) return acum

    if (acum.length === 0 || segmento.nuevoParrafo) {
      acum.push(texto)
      return acum
    }

    acum[acum.length - 1] = `${acum[acum.length - 1]} ${texto}`.trim()
    return acum
  }, [])

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.2 ANTECEDENTES</div>

      {bloquesAntecedentes.length > 0
        ? bloquesAntecedentes.map((parrafo, i) => (
            <div
              key={i}
              className="pdf-intro-texto"
              style={{
                whiteSpace: 'normal',
                wordBreak: 'normal',
                overflowWrap: 'break-word',
              }}
            >
              {parrafo}
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



// ── PÁGINA: 3.10 Marco Conceptual ─────────────────────────────────────────────
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
                lineHeight: 1.22,
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
              <th>Nombre de la Normatividad / Documento</th>
              <th style={{ width: 150 }}>Última Fecha de Publicación</th>
              <th style={{ width: 130 }}>Medio de Publicación</th>
            </tr>
            <tr>
              <td colSpan={4} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td>
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
        const estiloTitulo = i === 0
          ? {
              marginBottom: 12,
            }
          : {
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 800,
              fontSize: '14pt',
              color: '#262626',
              marginBottom: 6,
              marginLeft: '1.5cm',
            }

        return (
          <div key={bloque.titulo} style={{ marginBottom: i === bloques.length - 1 ? 0 : 18 }}>
            {mostrarLineasTitulo && (
              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '2.2px solid #000',
                marginBottom: 6,
                marginLeft: '-56px',
              }} />
            )}

            <div
              className={i === 0 ? 'pdf-cap-titulo' : undefined}
              style={estiloTitulo}
            >
              {bloque.titulo}
            </div>

            {mostrarLineasTitulo && (
              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '2.2px solid #000',
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
function PaginaPrincipiosValores({ datos, total, paginaInicio, entradas = null }) {
  const entradasPagina = entradas || [
    ...(datos.principios || []).map((texto) => ({ tipo: 'PRINCIPIOS', texto })),
    ...(datos.valores || []).map((texto) => ({ tipo: 'VALORES', texto })),
  ]
  const grupos = entradasPagina.reduce((acum, entrada) => {
    if (!acum[entrada.tipo]) acum[entrada.tipo] = []
    acum[entrada.tipo].push(entrada.texto)
    return acum
  }, {})
  const bloques = ['PRINCIPIOS', 'VALORES']
    .filter((titulo) => grupos[titulo]?.length > 0)
    .map((titulo) => ({ titulo, items: grupos[titulo] }))

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.8 PRINCIPIOS Y VALORES INSTITUCIONALES</div>

      {bloques.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          {bloques.map((bloque, i) => (
            <div key={bloque.titulo} style={{ marginBottom: i === bloques.length - 1 ? 0 : 18 }}>
              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '2.2px solid #000',
                marginBottom: 6,
                marginLeft: '-56px',
              }} />

              <div style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: 800,
                fontSize: '14pt',
                color: '#262626',
                marginBottom: 6,
                marginLeft: '2.5cm',
              }}>
                {bloque.titulo}
              </div>

              <div style={{
                width: 'calc(50% + 56px)',
                borderTop: '2.2px solid #000',
                marginBottom: 10,
                marginLeft: '-56px',
              }} />

              {bloque.items.length > 0 ? (
                <div style={{ paddingLeft: '4cm', color: '#262626' }}>
                  {bloque.items.map((item, idx) => (
                    <div
                      key={`${bloque.titulo}-${idx}`}
                      className="pdf-intro-texto"
                      style={{ marginBottom: idx === bloque.items.length - 1 ? 0 : 10 }}
                    >
                      <span style={{ marginRight: 12 }}>•</span>
                      {renderTextoConEncabezadoEnNegritas(item)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-intro-texto" style={{ color: '#262626', paddingLeft: '4cm', marginBottom: 0 }}>
                  No aplica.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="pdf-intro-texto" style={{ color: '#262626' }}>
          No hay informacion de principios o valores registrada.
        </div>
      )}
    </div>
  )
}

// ── PÁGINA: 3.9 Políticas de Operación ───────────────────────────────────────
function PaginaPoliticasOperacion({ datos, total, paginaInicio, politicas = null, indiceBase = 0 }) {
  const politicasPagina = politicas || datos.politicas_operacion || []

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.9 POLÍTICAS DE OPERACIÓN</div>

      {politicasPagina.length > 0 ? (
        politicasPagina.map((pol, i) => (
          <div key={i} style={{ marginBottom: 22, color: '#595959' }}>
            {pol.area ? (
              <>
                {!pol.esContinuacion && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    fontWeight: 800,
                    fontSize: '11pt',
                    lineHeight: 1.08,
                    marginLeft: '0.8cm',
                    marginBottom: 2,
                    color: '#595959',
                    textTransform: 'uppercase',
                  }}>
                    <span style={{ width: 18, flexShrink: 0 }}>
                      {`${String.fromCharCode(65 + (pol.indiceOriginal ?? indiceBase + i))}.`}
                    </span>
                    <span>{pol.area}</span>
                  </div>
                )}
                <div style={{
                  marginBottom: 8,
                  color: '#595959',
                  paddingLeft: '2.35cm',
                  width: '14cm',
                  maxWidth: '14cm',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontWeight: 500,
                  fontSize: '11pt',
                  lineHeight: 1.08,
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textAlignLast: 'left',
                }}>
                  {renderTextoPolitica(pol.descripcion)}
                </div>
              </>
            ) : (
              <div style={{
                marginLeft: '1cm',
                marginBottom: 8,
                color: '#595959',
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
          fontWeight: 500, fontSize: '66pt',
          letterSpacing: 2, lineHeight: 1.1
        }}>CAPÍTULO 2</div>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800, fontSize: '48pt',
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

function OrganigramaArchivo({ src, alt }) {
  const [imagenPdf, setImagenPdf] = useState('')
  const [error, setError] = useState('')
  const esPdf = esPdfOrganigrama(src)

  useEffect(() => {
    let cancelado = false
    setImagenPdf('')
    setError('')

    if (!esPdf || !src) return undefined

    renderizarPdfComoImagen(src)
      .then((dataUrl) => {
        if (!cancelado) setImagenPdf(dataUrl)
      })
      .catch((err) => {
        console.error('Error al cargar PDF de organigrama:', err)
        if (!cancelado) setError('No se pudo cargar el PDF del organigrama.')
      })

    return () => {
      cancelado = true
    }
  }, [src, esPdf])

  if (esPdf && !imagenPdf) {
    return (
      <div
        data-pdf-organigrama={error ? 'error' : 'loading'}
        style={{ color: '#262626', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12pt' }}
      >
        {error || 'Cargando PDF del organigrama...'}
      </div>
    )
  }

  return (
    <img
      src={esPdf ? imagenPdf : src}
      alt={alt}
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
      crossOrigin="anonymous"
    />
  )
}

function PaginaOrganigramaGeneral({ datos, total, paginaInicio }) {
  const src = normalizarRutaOrganigrama(datos.organigrama_general?.ruta_archivo)

  return (
    <div className="pdf-pagina-horizontal" data-page-orientation="landscape">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} esHorizontal />
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
          <OrganigramaArchivo src={src} alt="Organigrama General" />
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

  return (
    <div className="pdf-pagina-horizontal" data-page-orientation="landscape">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} esHorizontal />
      <div className="pdf-cap-titulo">4.2 ORGANIGRAMA ESPECÍFICO</div>

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
          <OrganigramaArchivo src={src} alt={`Organigrama Especifico ${index + 1}`} />
        ) : (
          <div style={{ color: '#262626', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12pt' }}>
            No hay organigramas específicos registrados.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página Inventario de Puestos ──────────────────────────────────────────────
function PaginaInventario({
  datos,
  total,
  paginaInicio,
  inventarioPagina = [],
  inventarioCompleto = [],
  indiceBase = 0,
  mostrarTotal = true,
}) {
  const totalPersonas = inventarioCompleto.reduce(
    (s, p) => s + (parseInt(p.num_personas) || 0), 0
  )
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo pdf-inv-titulo">4.3 INVENTARIO DE PUESTOS</div>
      <table className="pdf-inv-tabla">
        <thead>
          <tr>
            <th style={{ width: 50 }}>NÚM.</th>
            <th>
              <div>PUESTO</div>
              <div>TITULAR DE LA DEPENDENCIA, UNIDAD ADMINISTRATIVA O ENTIDAD MUNICIPAL.</div>
            </th>
            <th className="personas-cargo-header">
              <div>NO. DE</div>
              <div>PERSONAS</div>
              <div>EN EL</div>
              <div>CARGO</div>
            </th>
          </tr>
          <tr>
            <td colSpan={3} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td>
          </tr>
        </thead>
        <tbody>
          {inventarioPagina.map((p, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{indiceBase + i + 1}</td>
              <td>{p.nombre_puesto}</td>
              <td style={{ textAlign: 'center' }}>{p.num_personas}</td>
            </tr>
          ))}
          {mostrarTotal && (
            <tr className="total-row">
              <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', padding: '7px 10px', border: '1px solid #000' }}>TOTAL</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold', border: '1px solid #000' }}>{totalPersonas}</td>
            </tr>
          )}
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
  ]
  const nombrePuestoTitulo = puesto.nombre_puesto?.toUpperCase() || 'PUESTO'
  const prefijoPerfil = nombrePuestoTitulo.startsWith('DIRECCIÓN') ? 'DE LA' : 'DE'
  const jefeInmediatoTexto = puesto.jefe_inmediato || puesto.jefe_firma_cargo || puesto.jefe_firma_nombre || '—'
  const paginasSubordinados = paginarSubordinadosPuesto(puesto)
  const { funcionesEnObjetivo, paginasFunciones } = dividirFuncionesObjetivo(puesto)
  const paginasCompetencias = paginarFilasCompetencias(puesto)
  const paginasCompetenciasAdicionales = paginasCompetencias.slice(1)
  const ultimaPaginaCompetencias = paginasCompetencias[paginasCompetencias.length - 1] || []
  const basePerfilParaResponsabilidad = paginasCompetenciasAdicionales.length > 0 ? 0 : 10.5
  const limiteCompartidoResponsabilidad = paginasCompetenciasAdicionales.length > 0 ? 24 : 15
  const capacidadResponsabilidad = Math.max(
    0,
    limiteCompartidoResponsabilidad - basePerfilParaResponsabilidad - sumarAltoFilasCompetencias(ultimaPaginaCompetencias)
  )
  const integraResponsabilidad = capacidadResponsabilidad >= 2
  const paginasResponsabilidad = paginarEntradasResponsabilidad(
    puesto,
    integraResponsabilidad ? capacidadResponsabilidad : 0
  )
  const responsabilidadEnPaginaActual = integraResponsabilidad ? paginasResponsabilidad[0] : []
  const paginasResponsabilidadAdicionales = integraResponsabilidad
    ? paginasResponsabilidad.slice(1)
    : paginasResponsabilidad
  const ultimaPaginaResponsabilidad = paginasResponsabilidad[paginasResponsabilidad.length - 1] || []
  const firmaCompartePagina = sumarAltoResponsabilidad(ultimaPaginaResponsabilidad) <= 9
  const mostrarUbicacionEnPrimeraPagina = debeMostrarUbicacionEnPrimeraPagina(puesto)
  const totalSubordinados = (puesto.subordinados_directos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0) +
    (puesto.subordinados_indirectos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0)
  const renderNivelResponsabilidad = (nivel) => (
    ['Alta', 'Media', 'Baja', 'Nulo'].map((opcion) => (
      <Fragment key={opcion}>
        <td className="nivel-label">{opcion}</td>
        <td className="nivel-marca">
          {String(nivel || '').toLowerCase() === opcion.toLowerCase() ? 'X' : ''}
        </td>
      </Fragment>
    ))
  )
  const renderTablaResponsabilidad = (entradas = []) => (
    <table className="pdf-responsabilidad-tabla">
      <colgroup>
        <col style={{ width: 52 }} />
        <col />
        <col style={{ width: 54 }} />
        <col />
        <col style={{ width: 54 }} />
        <col />
        <col style={{ width: 54 }} />
        <col />
        <col style={{ width: 54 }} />
      </colgroup>
      <tbody>
        {entradas.map((entrada, i) => {
          if (entrada.tipo === 'header') {
            return (
              <tr key={`resp-${i}`}>
                <td colSpan={9} className="header-gris">{entrada.titulo}</td>
              </tr>
            )
          }

          if (entrada.tipo === 'mobiliario') {
            return (
              <tr key={`resp-${i}`}>
                <td className="num-gris">1.</td>
                <td colSpan={8} className="texto-principal">
                  <strong>Mobiliario y Equipo:</strong><br />
                  Es Responsable de dar el uso para el que están destinados, así como, procurar su conservación y oportuno mantenimiento.
                </td>
              </tr>
            )
          }

          if (entrada.tipo === 'informacion') {
            return (
              <Fragment key={`resp-${i}`}>
                <tr>
                  <td className="num-gris" rowSpan={2}>2.</td>
                  <td colSpan={8} className="texto-principal">
                    Manejo de Información: {limpiarValorPerfil(entrada.valor)}
                  </td>
                </tr>
                <tr>
                  {renderNivelResponsabilidad(entrada.nivel)}
                </tr>
              </Fragment>
            )
          }

          if (entrada.tipo === 'presupuesto') {
            return (
              <tr key={`resp-${i}`}>
                <td className="num-gris">3.</td>
                <td colSpan={8} className="texto-principal">
                  Manejo de Presupuesto: {limpiarValorPerfil(entrada.valor)}
                </td>
              </tr>
            )
          }

          if (entrada.tipo === 'nivelPresupuesto') {
            return (
              <tr key={`resp-${i}`}>
                <td className="num-gris">4.</td>
                {renderNivelResponsabilidad(entrada.nivel)}
              </tr>
            )
          }

          return (
            <tr key={`resp-${i}`}>
              <td className="num-gris">{entrada.numero}</td>
              <td colSpan={8} className="item-texto">{entrada.valor}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
  const renderBloqueFirmas = () => (
    <>
      <div className="pdf-compromiso">
        Me comprometo a desempeñar con ética, profesionalismo y responsabilidad las funciones del cargo público que represento, incorporando la perspectiva de género y un enfoque basado en los Derechos Humanos en beneficio de la ciudadanía benitojuarense. Con mis compañeras, compañeros y el personal a mi cargo, promuevo el trabajo en equipo a partir del respeto y el buen trato. Asimismo, me comprometo a cuidar y hacer un uso responsable de los bienes patrimoniales, conforme a lo establecido por las leyes y reglamentos vigentes. Buen trato; cuido y hago uso benéfico a los bienes patrimoniales apegándome a las disposiciones que establezcan las leyes y reglamentos aplicables.
      </div>

      <table className="pdf-firma-tabla">
        <tbody>
          <tr>
            <td className="header-gris">SERVIDOR PÚBLICO OCUPANTE DEL PUESTO</td>
            <td className="header-gris">JEFE INMEDIATO</td>
          </tr>
          <tr>
            <td><div className="pdf-firma-espacio" /></td>
            <td><div className="pdf-firma-espacio" /></td>
          </tr>
          <tr>
            <td className="pdf-firma-titulo">FIRMA</td>
            <td className="pdf-firma-titulo">FIRMA</td>
          </tr>
          <tr>
            <td className="pdf-firma-datos">
              <strong>Nombre y Cargo:</strong> {puesto.ocupante_nombre || ' '}<br />
              {puesto.ocupante_cargo || ' '}
            </td>
            <td className="pdf-firma-datos">
              <strong>Nombre y Cargo:</strong> {puesto.jefe_firma_nombre || ' '}<br />
              {puesto.jefe_firma_cargo || ' '}
            </td>
          </tr>
          <tr>
            <td className="pdf-firma-fecha">
              <strong>Fecha:</strong> {fmtFechaLarga(puesto.ocupante_fecha)}
            </td>
            <td className="pdf-firma-fecha">
              <strong>Fecha:</strong> {fmtFechaLarga(puesto.jefe_firma_fecha)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
  const renderSubordinadosTabla = (filas, mostrarEncabezados = true, mostrarTotal = false) => {
    let seccionActual = ''

    return (
      <table className="pdf-subordinados-tabla">
        <colgroup>
          <col style={{ width: 150 }} />
          <col />
        </colgroup>
        <tbody>
          {filas.map((s, i) => {
            const mostrarSeccion = s.tipo !== seccionActual
            seccionActual = s.tipo
            return (
              <>
                {mostrarEncabezados && mostrarSeccion && (
                  <tr key={`sec-${s.tipo}-${i}`}>
                    <td colSpan={2} className="header-gris">
                      {s.tipo === 'indirecto' ? 'SUBORDINADOS INDIRECTOS' : 'SUBORDINADOS DIRECTOS'}
                    </td>
                  </tr>
                )}
                {mostrarEncabezados && mostrarSeccion && (
                  <tr key={`head-${s.tipo}-${i}`}>
                    <td className="label-cell sub-num-cell">NÚMERO DE<br />PERSONAS</td>
                    <td className="label-cell">NOMBRE DEL PUESTO</td>
                  </tr>
                )}
                <tr key={`row-${i}`}>
                  <td className="sub-num-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{s.num_personas}</td>
                  <td className="sub-nombre-cell">{s.nombre_puesto}</td>
                </tr>
              </>
            )
          })}
          {mostrarTotal && (
            <tr>
              <td className="sub-num-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{totalSubordinados}</td>
              <td className="label-cell" style={{ background: '#7F7F7F', color: 'white', fontWeight: 'bold', textAlign: 'left' }}>TOTAL</td>
            </tr>
          )}
        </tbody>
      </table>
    )
  }
  const renderFuncionesTabla = (entradas, mostrarEncabezadoPrincipal = true, tipoPrevio = '') => {
    let seccionActual = tipoPrevio

    return (
      <table className="pdf-funciones-tabla">
        <colgroup>
          <col style={{ width: 145 }} />
          <col />
        </colgroup>
        <tbody>
          {mostrarEncabezadoPrincipal && (
            <tr>
              <td colSpan={2} className="header-gris">DESCRIPCIÓN ANALÍTICA DE FUNCIONES</td>
            </tr>
          )}
          {entradas.map((entrada, i) => {
            const mostrarSeccion = entrada.tipo !== seccionActual
            seccionActual = entrada.tipo

            return (
              <>
                {mostrarSeccion && (
                  <tr key={`func-sec-${entrada.tipo}-${i}`}>
                    <td colSpan={2} className="subheader">
                      {entrada.tipo === 'institucional' ? 'FUNCIONES INSTITUCIONALES' : 'FUNCIONES PROPIAS DEL PUESTO'}
                    </td>
                  </tr>
                )}
                <tr key={`func-row-${i}`}>
                  <td className="num-cell">{entrada.parte === 0 ? entrada.numero : ''}</td>
                  <td className="texto-cell">{entrada.texto}</td>
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    )
  }
  const renderFilasCompetencias = (filas = []) => {
    const indicesHabilidades = filas
      .map((fila, i) => fila.tipo === 'habilidad' ? i : -1)
      .filter((i) => i >= 0)
    const primerIndiceHabilidad = indicesHabilidades[0]
    const totalHabilidadesPagina = indicesHabilidades.length

    return filas.map((fila, i) => {
      if (fila.tipo === 'header') {
        return (
          <tr key={`competencia-${i}`}>
            <td colSpan={10} className="competencias-header">
              Competencias Laborales
            </td>
          </tr>
        )
      }

      if (fila.tipo === 'habilidad') {
        return (
          <tr key={`competencia-${i}`}>
            {i === primerIndiceHabilidad && (
              <>
                <td className="num-gris" rowSpan={totalHabilidadesPagina}>11.</td>
                <td colSpan={2} className="competencias-label" rowSpan={totalHabilidadesPagina}>Habilidades</td>
              </>
            )}
            <td colSpan={7} className="competencias-contenido">
              <div className="competencias-categoria">{fila.categoria}</div>
              {renderListaPerfil(fila.items)}
            </td>
          </tr>
        )
      }

      if (fila.tipo === 'lista') {
        return (
          <tr key={`competencia-${i}`}>
            <td className="num-gris">{fila.numero}</td>
            <td colSpan={2} className="competencias-label">{fila.etiqueta}</td>
            <td colSpan={7} className="competencias-contenido">
              {renderListaPerfil(fila.items)}
            </td>
          </tr>
        )
      }

      return (
        <tr key={`competencia-${i}`}>
          <td className="num-gris">{fila.numero}</td>
          <td colSpan={2} className="competencias-label">{fila.etiqueta}</td>
          <td colSpan={7} className="competencias-contenido">{limpiarValorPerfil(fila.valor)}</td>
        </tr>
      )
    })
  }
  const renderUbicacionOrganigrama = () => (
    <table className="pdf-info-puesto-tabla" style={{ marginTop: 14, marginBottom: 14 }}>
      <tbody>
        <tr>
          <td colSpan={4} className="header-gris">UBICACIÓN EN EL ORGANIGRAMA</td>
        </tr>
        <tr>
          <td colSpan={4} style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '9pt' }}>
              <div style={{ border: '1px solid #000', padding: '6px 20px', minWidth: 180, textAlign: 'center', background: '#f0f0f0', fontWeight: 'bold' }}>
                {jefeInmediatoTexto}
              </div>
              <div style={{ width: 1, height: 20, background: '#000' }} />
              <div style={{ border: '2px solid #7F7F7F', padding: '6px 20px', minWidth: 180, textAlign: 'center', background: '#fff', fontWeight: 'bold', color: '#7F7F7F' }}>
                {puesto.nombre_puesto || '—'}
              </div>
              {((puesto.subordinados_directos?.length > 0)) && (
                <>
                  <div style={{ width: 1, height: 20, background: '#000' }} />
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {puesto.subordinados_directos.map((s, i) => (
                      <div key={i} style={{ border: '1px solid #000', padding: '4px 12px', textAlign: 'center', background: '#fafafa', fontSize: '8pt' }}>
                        {s.nombre_puesto}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )

  return (
    <>
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-puesto-header">
        4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
      </div>

      {/* Tabla info general */}
      <table className="pdf-info-puesto-tabla">
        <colgroup>
          <col style={{ width: 58 }} />
          <col style={{ width: 215 }} />
          <col />
          <col style={{ width: 1 }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="header-gris">INFORMACIÓN GENERAL DEL PUESTO</td>
          </tr>
          <tr>
            <td className="puesto-num-cell" rowSpan={2}>
              4.4.{index + 1}
            </td>
            <td className="label-cell">NOMBRE DEL PUESTO</td>
            <td colSpan={2}>{puesto.nombre_puesto}</td>
          </tr>
          <tr>
            <td className="label-cell">JEFE INMEDIATO</td>
            <td colSpan={2}>{jefeInmediatoTexto}</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ padding: 0, border: 0 }}>
              {renderSubordinadosTabla(paginasSubordinados[0], true, paginasSubordinados.length === 1)}
            </td>
          </tr>
        </tbody>
      </table>
      {mostrarUbicacionEnPrimeraPagina && renderUbicacionOrganigrama()}
    </div>

      {paginasSubordinados.slice(1).map((filas, pageIndex) => (
        <div className="pdf-pagina" key={`puesto-subordinados-${index}-${pageIndex}`}>
          <HeaderPagina datos={datos} numeroPagina={paginaInicio + pageIndex + 1} totalPaginas={total} />
          {renderSubordinadosTabla(filas, false, pageIndex === paginasSubordinados.length - 2)}
        </div>
      ))}

    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio + paginasSubordinados.length} totalPaginas={total} />
      <div className="pdf-puesto-header">
        4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
      </div>

      {/* Objetivo */}
      <div style={{
        border: '1px solid #000',
        padding: '0 0px 0px',
        marginBottom: 14,
        fontFamily: 'Montserrat, Arial, sans-serif',
        color: '#000',
      }}>
        <div style={{
          background: '#7F7F7F',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '10pt',
          textTransform: 'uppercase',
          padding: '4px 8px 3px',
          marginBottom: 4,
          lineHeight: 1.05,
          borderBottom: '1px solid #000',
        }}>
          <div>OBJETIVO GENERAL DEL PUESTO</div>
          <div style={{
            fontStyle: 'normal',
            fontSize: '8.5pt',
            textTransform: 'none',
            lineHeight: 1.05,
          }}>
            (Anote brevemente el objetivo o razón por la cual existe)
          </div>
        </div>
        <div style={{
          fontSize: '10.5pt',
          lineHeight: 1.42,
          textAlign: 'justify',
          textJustify: 'inter-word',
          textAlignLast: 'left',
          padding: '2px 8px 0 8px',
        }}>
          {puesto.objetivo_puesto || '—'}
        </div>
      </div>

      {!mostrarUbicacionEnPrimeraPagina && renderUbicacionOrganigrama()}
      {funcionesEnObjetivo.length > 0 && renderFuncionesTabla(funcionesEnObjetivo, true)}

    </div>

    {paginasFunciones.map((entradas, pageIndex) => (
      <div className="pdf-pagina" key={`puesto-funciones-${index}-${pageIndex}`}>
        <HeaderPagina datos={datos} numeroPagina={paginaInicio + paginasSubordinados.length + pageIndex + 1} totalPaginas={total} />
        <div className="pdf-puesto-header">
          4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
        </div>
        {renderFuncionesTabla(
          entradas,
          pageIndex === 0 && funcionesEnObjetivo.length === 0,
          pageIndex > 0
            ? paginasFunciones[pageIndex - 1]?.at(-1)?.tipo
            : funcionesEnObjetivo.at(-1)?.tipo || ''
        )}
      </div>
    ))}

    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio + paginasSubordinados.length + paginasFunciones.length + 1} totalPaginas={total} />
      <div className="pdf-puesto-header">
        4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
      </div>

      {/* Perfil */}
      <table className="pdf-perfil-tabla">
        <colgroup>
          <col style={{ width: 52 }} />
          <col style={{ width: 112 }} />
          <col style={{ width: 34 }} />
          <col style={{ width: 46 }} />
          <col style={{ width: 126 }} />
          <col style={{ width: 34 }} />
          <col style={{ width: 46 }} />
          <col style={{ width: 158 }} />
          <col style={{ width: 34 }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={10} className="header-gris">PERFIL DEL PUESTO</td>
          </tr>
          <tr>
            <td colSpan={3} className="label-bold">ESCOLARIDAD:</td>
            <td colSpan={7} className="perfil-descripcion">
              Marque con una (X) el último grado de estudios requerido para desarrollar el puesto
            </td>
          </tr>
          <tr>
            <td className="num-gris">1.</td>
            <td className="perfil-opcion">Primaria</td>
            <td className="perfil-marca">{puesto.escolaridad === '1' ? 'X' : '-'}</td>
            <td className="num-gris">2.</td>
            <td className="perfil-opcion">Secundaria</td>
            <td className="perfil-marca">{puesto.escolaridad === '2' ? 'X' : '-'}</td>
            <td className="num-gris">3.</td>
            <td className="perfil-opcion">Preparatoria o<br />Técnica</td>
            <td className="perfil-marca">{puesto.escolaridad === '3' ? 'X' : '-'}</td>
            <td />
          </tr>
          <tr>
            <td className="num-gris">4.</td>
            <td className="perfil-opcion">Carrera Profesional<br />no terminada<br />(2 años)</td>
            <td className="perfil-marca">{puesto.escolaridad === '4' ? 'X' : '-'}</td>
            <td className="num-gris">5.</td>
            <td className="perfil-opcion">Carrera profesional<br />terminada</td>
            <td className="perfil-marca">{puesto.escolaridad === '5' ? 'X' : '-'}</td>
            <td className="num-gris">6.</td>
            <td className="perfil-opcion">Postgrado</td>
            <td className="perfil-marca">{puesto.escolaridad === '6' ? 'X' : '-'}</td>
            <td />
          </tr>
          <tr>
            <td className="num-gris">7.</td>
            <td colSpan={2} className="label-bold">Licenciatura o carreras afines.</td>
            <td colSpan={7} className="perfil-descripcion">{limpiarValorPerfil(puesto.carreras_afines)}</td>
          </tr>
          <tr>
            <td className="num-gris">8.</td>
            <td colSpan={2} className="label-bold">Área de especialidad requerida (Conocimiento Técnico).</td>
            <td colSpan={7} className="perfil-descripcion">{limpiarValorPerfil(puesto.especialidad)}</td>
          </tr>
          {/* Conocimiento específico */}
          <tr>
            <td className="num-gris" rowSpan={3}>9</td>
            <td colSpan={2} className="label-bold" rowSpan={3}>Conocimiento Específico.</td>
            <td colSpan={3} className="label-bold">Idioma o Lengua:</td>
            <td colSpan={4} className="perfil-descripcion">{limpiarListaPerfil(puesto.idiomas, 'Español.')}</td>
          </tr>
          <tr>
            <td colSpan={3} className="label-bold">Manejo de Programas Informáticos:</td>
            <td colSpan={4} className="perfil-descripcion">{limpiarListaPerfil(puesto.programas_informaticos)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="label-bold">Manejo de Equipo Especializado y/o Herramientas</td>
            <td colSpan={4} className="perfil-descripcion">{limpiarListaPerfil(puesto.equipo_herramientas)}</td>
          </tr>
          <tr>
            <td className="num-gris">10.</td>
            <td colSpan={2} className="label-bold">Experiencia:</td>
            <td colSpan={7} className="perfil-descripcion">{limpiarValorPerfil(puesto.experiencia)}</td>
          </tr>
          {renderFilasCompetencias(paginasCompetencias[0])}
        </tbody>
      </table>
      {paginasCompetenciasAdicionales.length === 0 && responsabilidadEnPaginaActual.length > 0 && (
        <>
          {renderTablaResponsabilidad(responsabilidadEnPaginaActual)}
          {firmaCompartePagina && paginasResponsabilidadAdicionales.length === 0 && renderBloqueFirmas()}
        </>
      )}
    </div>

    {paginasCompetenciasAdicionales.map((filasCompetencias, pageIndex) => (
      <div className="pdf-pagina" key={`puesto-competencias-${index}-${pageIndex}`}>
        <HeaderPagina
          datos={datos}
          numeroPagina={paginaInicio + paginasSubordinados.length + paginasFunciones.length + 2 + pageIndex}
          totalPaginas={total}
        />
        <div className="pdf-puesto-header">
          4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
        </div>

        <table className="pdf-perfil-tabla">
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: 112 }} />
            <col style={{ width: 34 }} />
            <col style={{ width: 46 }} />
            <col style={{ width: 126 }} />
            <col style={{ width: 34 }} />
            <col style={{ width: 46 }} />
            <col style={{ width: 158 }} />
            <col style={{ width: 34 }} />
            <col />
          </colgroup>
          <tbody>
            {renderFilasCompetencias(filasCompetencias)}
          </tbody>
        </table>
        {pageIndex === paginasCompetenciasAdicionales.length - 1 && responsabilidadEnPaginaActual.length > 0 && (
          <>
            {renderTablaResponsabilidad(responsabilidadEnPaginaActual)}
            {firmaCompartePagina && paginasResponsabilidadAdicionales.length === 0 && renderBloqueFirmas()}
          </>
        )}
      </div>
    ))}

    {paginasResponsabilidadAdicionales.map((entradasResponsabilidad, pageIndex) => (
      <div className="pdf-pagina" key={`puesto-responsabilidad-${index}-${pageIndex}`}>
        <HeaderPagina
          datos={datos}
          numeroPagina={paginaInicio + paginasSubordinados.length + paginasFunciones.length + paginasCompetenciasAdicionales.length + 2 + pageIndex}
          totalPaginas={total}
        />
        <div className="pdf-puesto-header">
          4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
        </div>
        {renderTablaResponsabilidad(entradasResponsabilidad)}
        {firmaCompartePagina && pageIndex === paginasResponsabilidadAdicionales.length - 1 && renderBloqueFirmas()}
      </div>
    ))}

    {!firmaCompartePagina && (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio + paginasSubordinados.length + paginasFunciones.length + paginasCompetenciasAdicionales.length + paginasResponsabilidadAdicionales.length + 2} totalPaginas={total} />
      <div className="pdf-puesto-header">
        4.4.{index + 1} DESCRIPCIÓN Y PERFIL {prefijoPerfil} {nombrePuestoTitulo}
      </div>
      {renderBloqueFirmas()}
    </div>
    )}
    </>
  )
}

// ── Página Sección de Cambios ─────────────────────────────────────────────────
function PaginaCambios({ datos, total, paginaInicio, cambiosPagina = [] }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo" style={{ marginBottom: 0 }}>4.5 SECCIÓN DE CAMBIOS</div>
      <table className="pdf-cambios-tabla">
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '50%' }} />
          <col style={{ width: '21%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>REVISIÓN ANTERIOR</th>
            <th>REVISIÓN ACTUAL</th>
            <th>RAZÓN DE LA ÚLTIMA MODIFICACIÓN</th>
            <th>FECHA DE ACTUALIZACIÓN</th>
          </tr>
        </thead>
        <tbody>
          {cambiosPagina.map((c, i) => (
            c ? (
              <tr key={i}>
                <td>{c.revision_anterior}</td>
                <td>{c.revision_actual}</td>
                <td>{c.razon}</td>
                <td>{fmtFecha(c.fecha)}</td>
              </tr>
            ) : (
              <tr key={i}>
                <td>—</td><td>—</td><td>NO APLICA</td><td>—</td>
              </tr>
            )
          ))}
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
  const segmentosAntecedentes = dividirTextoEnSegmentos(datos.antecedentes, 2400)
  const paginasAntecedentes = paginarSegmentos(segmentosAntecedentes, 2800)
  const paginasPrincipiosValores = paginarPrincipiosValores(datos.principios || [], datos.valores || [])
  const paginasPoliticas = paginarPoliticas(datos.politicas_operacion || [])
  const inventarioPDF = filtrarInventarioPDF(datos.inventario_puestos || [], datos.dependencia)
  const paginasInventario = paginarInventario(inventarioPDF)
  const paginasCambios = paginarCambios(datos.cambios || [])
  const paginasPorPuesto = puestos.map((puesto) => contarPaginasPuesto(puesto))
  const organigramasEspecificos = datos.organigramas_especificos?.length > 0
    ? datos.organigramas_especificos
    : [null]
  const totalPaginasAntecedentes = paginasAntecedentes.length || 1
  const totalPaginasPrincipiosValores = paginasPrincipiosValores.length || 1
  const totalPaginasPoliticas = paginasPoliticas.length || 1
  const totalPaginasInventario = paginasInventario.length || 1
  const mapaPaginas = crearMapaPaginas({
    puestos,
    paginasAntecedentes: totalPaginasAntecedentes,
    paginaValoresSeparada: false,
    paginasPrincipiosValores: totalPaginasPrincipiosValores,
    paginasPoliticas: totalPaginasPoliticas,
    paginasOrganigramasEspecificos: organigramasEspecificos.length,
    paginasInventario: totalPaginasInventario,
    paginasCambios: paginasCambios.length,
    paginasPuestos: paginasPorPuesto.reduce((total, paginas) => total + paginas, 0),
  })
  const totalPaginas = mapaPaginas.total

  const generarPDF = async () => {
    setGenerando(true)
    setProgreso('Preparando documento...')
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
      await esperarOrganigramasPdf(docRef.current)
      const paginas = docRef.current.querySelectorAll('.pdf-pagina, .pdf-pagina-horizontal')
      let paginasPdfAgregadas = 0

      for (let i = 0; i < paginas.length; i++) {
        setProgreso(`Procesando página ${i + 1} de ${paginas.length}...`)
        const pagina = paginas[i]
        await esperarImagenes(pagina)
        const orientation = pagina.dataset.pageOrientation === 'landscape' ? 'landscape' : 'portrait'
        const altoCartaCss = pagina.clientHeight
        const altoContenidoCss = Math.max(pagina.scrollHeight, altoCartaCss)
        const requiereCorte = altoContenidoCss > altoCartaCss + 2
        const estiloPrevio = {
          height: pagina.style.height,
          minHeight: pagina.style.minHeight,
          overflow: pagina.style.overflow,
        }

        if (requiereCorte) {
          pagina.style.height = 'auto'
          pagina.style.minHeight = `${altoCartaCss}px`
          pagina.style.overflow = 'visible'
        }

        const canvas = await html2canvas(pagina, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })

        if (requiereCorte) {
          pagina.style.height = estiloPrevio.height
          pagina.style.minHeight = estiloPrevio.minHeight
          pagina.style.overflow = estiloPrevio.overflow
        }

        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()
        const altoCorteCanvas = Math.round(altoCartaCss * (canvas.width / pagina.clientWidth))
        const totalCortes = Math.max(1, Math.ceil(canvas.height / altoCorteCanvas))

        for (let corte = 0; corte < totalCortes; corte++) {
          const y = corte * altoCorteCanvas
          const altoCorte = Math.min(altoCorteCanvas, canvas.height - y)
          const canvasCorte = document.createElement('canvas')
          canvasCorte.width = canvas.width
          canvasCorte.height = altoCorte
          const ctx = canvasCorte.getContext('2d')
          ctx.drawImage(canvas, 0, y, canvas.width, altoCorte, 0, 0, canvas.width, altoCorte)

          const imgData = canvasCorte.toDataURL('image/jpeg', 0.95)
          if (paginasPdfAgregadas > 0) pdf.addPage('letter', orientation)
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
          paginasPdfAgregadas += 1
        }
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
        {paginasPrincipiosValores.map((entradasPagina, i) => (
          <PaginaPrincipiosValores
            key={`principios-valores-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.principiosValores + i}
            entradas={entradasPagina}
          />
        ))}
        {paginasPoliticas.map((politicasPagina, i) => (
          <PaginaPoliticasOperacion
            key={`politicas-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.politicas + i}
            politicas={politicasPagina}
            indiceBase={paginasPoliticas.slice(0, i).reduce((acum, pagina) => acum + pagina.length, 0)}
          />
        ))}
        <PaginaMarcoConceptual datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.marcoConceptual} />
        <PaginaPortadaCapituloII datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.portadaCapituloII} />
        <PaginaOrganigramaGeneral datos={datos} total={totalPaginas} paginaInicio={mapaPaginas.organigramaGeneral} />
        {organigramasEspecificos.map((organigrama, i) => (
          <PaginaOrganigramaEspecifico
            key={`organigrama-especifico-${i}`}
            datos={datos}
            organigrama={organigrama}
            index={i}
            total={totalPaginas}
            paginaInicio={mapaPaginas.organigramasEspecificos + i}
          />
        ))}
        {paginasInventario.map((inventarioPagina, i) => (
          <PaginaInventario
            key={`inventario-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.inventario + i}
            inventarioPagina={inventarioPagina}
            inventarioCompleto={inventarioPDF}
            indiceBase={paginasInventario.slice(0, i).reduce((acum, pagina) => acum + pagina.length, 0)}
            mostrarTotal={i === paginasInventario.length - 1}
          />
        ))}
        {puestos.map((puesto, i) => (
          <PaginaPuesto
            key={i}
            datos={datos}
            puesto={puesto}
            index={i}
            total={totalPaginas}
            paginaInicio={mapaPaginas.primerPuesto + paginasPorPuesto.slice(0, i).reduce((total, paginas) => total + paginas, 0)}
          />
        ))}
        {paginasCambios.map((cambiosPagina, i) => (
          <PaginaCambios
            key={`cambios-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={mapaPaginas.cambios + i}
            cambiosPagina={cambiosPagina}
          />
        ))}
      </div>
      )}
    </div>
  )
}
