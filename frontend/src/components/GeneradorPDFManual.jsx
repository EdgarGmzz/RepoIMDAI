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
    text-align-last: justify;
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
    background: #7F7F7F;
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
    background: #7F7F7F;
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
    background: #7F7F7F;
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
    background: #7F7F7F;
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
    background: #7F7F7F;
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
    background: #D9D9D9;
    color: #000000;
    padding: 7px 8px;
    text-align: center;
    border: 1px solid #000;
    font-size: 9pt;
    font-weight: bold;
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
  const separador = /\n\s*\n/.test(normalizado) ? /\n\s*\n/ : /\n+/

  return normalizado
    .split(separador)
    .map((bloque) => bloque.trim())
    .filter(Boolean)
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
function PaginaIndice({ datos, total, paginasAntecedentes = 1 }) {
  const orgsEspecificos = datos.organigramas_especificos || []
  const paginaAntecedentes = 8
  const paginaMarcoNormativo = paginaAntecedentes + paginasAntecedentes
  const paginaAtribuciones = paginaMarcoNormativo + 1
  const paginaObjetivoMisionVision = paginaAtribuciones + 1
  const paginaPrincipiosValores = paginaObjetivoMisionVision + 1
  const paginaPoliticas = paginaPrincipiosValores + 1
  const paginaMarcoConceptual = paginaPoliticas + 1
  const paginaPortadaCapII = paginaMarcoConceptual + 1
  const paginaOrgGeneral = paginaPortadaCapII + 1
  const paginaPrimerOrgEspecifico = paginaOrgGeneral + 1
  const paginaInventario = paginaPrimerOrgEspecifico + orgsEspecificos.length
  const paginaPrimerPuesto = paginaInventario + 1
  const paginaCambios = paginaPrimerPuesto + (datos.puestos || []).length

  const items = [
    { num: '01', label: 'Carátula de Autorización', pag: 2, nivel: 1, linea: true },
    { num: '02', label: 'Índice', pag: 3, nivel: 1 },
    { num: '03', label: 'Capítulo I de Generales', pag: 4, nivel: 1 },
    { num: '3.1',  label: 'Introducción', pag: 7, nivel: 2 },
    { num: '3.2',  label: 'Antecedentes', pag: paginaAntecedentes, nivel: 2 },
    { num: '3.3',  label: 'Marco Normativo', pag: paginaMarcoNormativo, nivel: 2 },
    { num: '3.4',  label: 'Atribuciones Institucionales', pag: paginaAtribuciones, nivel: 2 },
    { num: '3.5',  label: 'Objetivo General', pag: paginaObjetivoMisionVision, nivel: 2 },
    { num: '3.6',  label: 'Misión', pag: paginaObjetivoMisionVision, nivel: 2 },
    { num: '3.7',  label: 'Visión', pag: paginaObjetivoMisionVision, nivel: 2 },
    { num: '3.8',  label: 'Principios y Valores Institucionales', pag: paginaPrincipiosValores, nivel: 2 },
    { num: '3.9',  label: 'Políticas de Operación', pag: paginaPoliticas, nivel: 2 },
    { num: '3.10', label: 'Marco Conceptual', pag: paginaMarcoConceptual, nivel: 2 },
    { num: '04', label: 'Capítulo II de Organización', pag: paginaPortadaCapII, nivel: 1 },
    { num: '4.1',  label: 'Organigrama General', pag: paginaOrgGeneral, nivel: 2 },
    ...(orgsEspecificos.length > 0
      ? orgsEspecificos.map((org, i) => ({
          num: `4.2${orgsEspecificos.length > 1 ? `.${i + 1}` : ''}`,
          label: `Organigrama Específico${org.tipo ? ` — ${org.tipo}` : ''}`,
          pag: paginaPrimerOrgEspecifico + i, nivel: 2
        }))
      : [{ num: '4.2', label: 'Organigramas Específicos', pag: paginaPrimerOrgEspecifico, nivel: 2 }]
    ),
    { num: '4.3',  label: 'Inventario de Puestos', pag: paginaInventario, nivel: 2 },
    { num: '4.4',  label: 'Descripción de Puestos', pag: paginaPrimerPuesto, nivel: 2 },
    ...(datos.puestos || []).map((p, i) => ({
      num: `4.4.${i + 1}`, label: `Descripción de puesto ${p.nombre_puesto || ''}`, pag: paginaPrimerPuesto + i, nivel: 2
    })),
    { num: '4.5',  label: 'Sección de Cambios', pag: paginaCambios, nivel: 2 },
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
            >{parrafo}</div>
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
                ...(!esContinuacion && i === 0 ? { textIndent: '1.5em' } : {}),
                ...(parrafo.nuevoParrafo ? { marginTop: 14 } : {}),
              }}
            >
              {parrafo.texto}
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

// ── PÁGINA: 3.5 / 3.6 / 3.7 Objetivo, Misión y Visión ───────────────────────
function PaginaObjetivoMisionVision({ datos, total, paginaInicio }) {
  const secciones = [
    { num: '3.5', titulo: 'OBJETIVO GENERAL', valor: datos.objetivo_general },
    { num: '3.6', titulo: 'MISIÓN',            valor: datos.mision },
    { num: '3.7', titulo: 'VISIÓN',            valor: datos.vision },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      {secciones.map((sec, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div className="pdf-seccion-titulo" style={{ marginBottom: 6 }}>
            {sec.num} {sec.titulo}
          </div>
          <div className="pdf-intro-texto">
            {sec.valor || '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PÁGINA: 3.10 Marco Conceptual ─────────────────────────────────────────────
function PaginaMarcoConceptual({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.10 MARCO CONCEPTUAL</div>

      <div className="pdf-intro-texto" style={{ marginBottom: 12 }}>
        Son conceptos que se utilizan dentro del documento, con su descripción específica para ampliar la definición correspondiente que permita al lector una mejor comprensión del manual.
      </div>

      {datos.marco_conceptual?.length > 0 ? (
        <table className="pdf-norma-tabla" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>TÉRMINO</th>
              <th>DEFINICIÓN</th>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td>
            </tr>
          </thead>
          <tbody>
            {datos.marco_conceptual.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 'bold' }}>{c.termino}</td>
                <td>{c.definicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="pdf-intro-texto">No hay términos registrados.</div>
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
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.4 ATRIBUCIONES INSTITUCIONALES</div>

      {datos.atribuciones
        ? datos.atribuciones.split('\n').filter(p => p.trim()).map((parrafo, i) => (
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

// ── PÁGINA: 3.8 Principios y Valores Institucionales ─────────────────────────
function PaginaPrincipiosValores({ datos, total, paginaInicio }) {
  const principios = datos.principios || []
  const valores    = datos.valores    || []

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.8 PRINCIPIOS Y VALORES INSTITUCIONALES</div>

      <div className="pdf-intro-texto" style={{ marginBottom: 16 }}>
        Consiste en un referente ético que consolida y guía el pensamiento, las actitudes, prácticas y formas de actuación de los servidores públicos y colaboradores de la Dependencia, Unidad Administrativa y/o entidad Municipal. Representando el Conjunto de normas morales que regulan la conducta de los servidores públicos hacia los servicios que prestan a la ciudadanía y en el desarrollo de sus actividades.
      </div>

      {/* PRINCIPIOS */}
      <div style={{ marginBottom: 16 }}>
        <div className="pdf-seccion-titulo" style={{ marginBottom: 8 }}>PRINCIPIOS</div>
        {principios.length > 0 ? (
          <ul className="pdf-lista">
            {principios.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        ) : (
          <div className="pdf-intro-texto">No aplica.</div>
        )}
      </div>

      {/* VALORES */}
      <div>
        <div className="pdf-seccion-titulo" style={{ marginBottom: 8 }}>VALORES</div>
        {valores.length > 0 ? (
          <ul className="pdf-lista">
            {valores.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        ) : (
          <div className="pdf-intro-texto">No aplica.</div>
        )}
      </div>
    </div>
  )
}

// ── PÁGINA: 3.9 Políticas de Operación ───────────────────────────────────────
function PaginaPoliticasOperacion({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />

      <div className="pdf-cap-titulo">3.9 POLÍTICAS DE OPERACIÓN</div>

      <div className="pdf-intro-texto">
        Son guias generales de accion que definen los limites y parametros necesarios para ejecutar los procesos y actividades en cumplimiento de la funcion institucional.
      </div>

      {datos.politicas_operacion?.length > 0 ? (
        datos.politicas_operacion.map((pol, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            {pol.area && (
              <div style={{ fontWeight: 800, fontSize: '10pt', marginBottom: 4, fontFamily: 'Montserrat, Arial, sans-serif' }}>
                {String.fromCharCode(65 + i)}. {pol.area}
              </div>
            )}
            <div className="pdf-intro-texto" style={{ marginBottom: 8 }}>
              {pol.descripcion}
            </div>
          </div>
        ))
      ) : (
        <div className="pdf-intro-texto">No hay politicas de operacion registradas.</div>
      )}
    </div>
  )
}

// ── PÁGINA: Portada Capítulo II ───────────────────────────────────────────────
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

// ── PÁGINA: 4.1 Organigrama General ──────────────────────────────────────────
function PaginaOrganigramaGeneral({ datos, total, paginaInicio }) {
  const ruta = datos.organigrama_general?.ruta_archivo
  const imgSrc = ruta ? `http://localhost:3000${ruta}` : null
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-seccion-titulo" style={{ marginBottom: 16, fontSize: '13pt' }}>
        4.1 ORGANIGRAMA GENERAL
      </div>
      <div className="pdf-intro-texto" style={{ marginBottom: 16 }}>
        Representa gráfica de la estructura orgánica general de la <em>{datos.dependencia}</em>, debidamente validada por la ley o reglamento que la defina.
      </div>
      {imgSrc ? (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <img
            src={imgSrc}
            alt="Organigrama General"
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <div style={{
          border: '2px dashed #ccc', padding: 40, textAlign: 'center',
          color: '#aaa', marginTop: 20, fontSize: '11pt', fontStyle: 'italic'
        }}>
          Organigrama General — Pendiente de carga
        </div>
      )}
    </div>
  )
}

// ── PÁGINA: 4.2 Organigrama Específico ───────────────────────────────────────
function PaginaOrganigramaEspecifico({ datos, organigrama, index, total, paginaInicio }) {
  const ruta = organigrama?.ruta_archivo
  const imgSrc = ruta ? `http://localhost:3000${ruta}` : null
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-seccion-titulo" style={{ marginBottom: 16, fontSize: '13pt' }}>
        4.2 ORGANIGRAMA ESPECÍFICO — {organigrama.tipo?.toUpperCase() || `${index + 1}`}
      </div>
      <div className="pdf-intro-texto" style={{ marginBottom: 16 }}>
        Representación gráfica de la estructura orgánica del área <em>{organigrama.tipo || ''}</em>, que permite observar las líneas de autoridad y responsabilidad e identifica los canales de comunicación.
      </div>
      {imgSrc ? (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <img
            src={imgSrc}
            alt={`Organigrama ${organigrama.tipo}`}
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <div style={{
          border: '2px dashed #ccc', padding: 40, textAlign: 'center',
          color: '#aaa', marginTop: 20, fontSize: '11pt', fontStyle: 'italic'
        }}>
          Organigrama Específico — Pendiente de carga
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
            <th>PUESTO / TITULAR DE LA DEPENDENCIA O CARGO</th>
            <th style={{ width: 150 }}>NO. DE PERSONAS EN EL CARGO</th>
          </tr>
          <tr>
            <td colSpan={3} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td>
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
            <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold', padding: '7px 10px', border: '1px solid #000' }}>TOTAL</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold', border: '1px solid #000' }}>{totalPersonas}</td>
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
            <td style={{ width: 60, textAlign: 'center', fontWeight: 'bold', background: '#7F7F7F', color: 'white', fontSize: '10pt' }} rowSpan={2}>
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
            <td colSpan={2} style={{ textAlign: 'center', background: '#7F7F7F', color: 'white', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>
              {(puesto.subordinados_directos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0) +
               (puesto.subordinados_indirectos || []).reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0)}
            </td>
            <td colSpan={2} style={{ background: '#7F7F7F', color: 'white', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>TOTAL</td>
          </tr>
        </tbody>
      </table>

      {/* Objetivo */}
      <div className="pdf-objetivo-box">
        <div className="pdf-objetivo-titulo">OBJETIVO GENERAL DEL PUESTO</div>
        <div className="pdf-objetivo-subtitulo">(Anote brevemente el objetivo o razón por la cual existe)</div>
        <div style={{ fontSize: '9.5pt', lineHeight: 1.6 }}>{puesto.objetivo_puesto || '—'}</div>
      </div>

      {/* Ubicación en el organigrama */}
      <table className="pdf-info-puesto-tabla" style={{ marginBottom: 14 }}>
        <tbody>
          <tr>
            <td colSpan={4} className="header-gris">UBICACIÓN EN EL ORGANIGRAMA</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '9pt' }}>
                {/* Jefe Inmediato */}
                <div style={{ border: '1px solid #000', padding: '6px 20px', minWidth: 180, textAlign: 'center', background: '#f0f0f0', fontWeight: 'bold' }}>
                  {puesto.jefe_inmediato || '—'}
                </div>
                {/* Línea vertical */}
                <div style={{ width: 1, height: 20, background: '#000' }} />
                {/* Puesto actual */}
                <div style={{ border: '2px solid #7F7F7F', padding: '6px 20px', minWidth: 180, textAlign: 'center', background: '#fff', fontWeight: 'bold', color: '#7F7F7F' }}>
                  {puesto.nombre_puesto || '—'}
                </div>
                {/* Línea vertical si hay subordinados */}
                {((puesto.subordinados_directos?.length > 0)) && (
                  <>
                    <div style={{ width: 1, height: 20, background: '#000' }} />
                    {/* Subordinados directos */}
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
              <td key={i} style={{ textAlign: 'center', border: '1px solid #000', padding: '4px 6px', fontSize: '8pt', width: `${100/6}%` }}>
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
            <td colSpan={4} className="label-bold">10. Experiencia:</td>
            <td colSpan={6}>{puesto.experiencia || 'N/A'}</td>
          </tr>
          {/* Competencias Laborales — dentro de la misma tabla de Perfil */}
          <tr>
            <td colSpan={10} style={{ background: '#d0d0d0', fontWeight: 'bold', fontSize: '9pt', textTransform: 'uppercase', padding: '5px 10px', border: '1px solid #000', letterSpacing: '.5px' }}>
              Competencias Laborales
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="label-bold" rowSpan={3} style={{ verticalAlign: 'top' }}>11. Habilidades</td>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Directivas:</td>
            <td colSpan={6}>{puesto.habilidades_directivas?.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Técnicas:</td>
            <td colSpan={6}>{puesto.habilidades_tecnicas?.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ fontSize: '9pt', fontWeight: 'bold' }}>Generales:</td>
            <td colSpan={6}>{puesto.habilidades_generales?.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={4} className="label-bold">12. Actitudes:</td>
            <td colSpan={6}>{puesto.actitudes?.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td colSpan={4} className="label-bold">13. Horario Laboral:</td>
            <td colSpan={6}>{puesto.horario_laboral || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Responsabilidad */}
      <table className="pdf-perfil-tabla" style={{ marginTop: 0 }}>
        <tbody>
          <tr>
            <td colSpan={4} className="header-gris">RESPONSABILIDAD</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ padding: '6px 10px', fontSize: '9pt' }}>
              <span className="label-bold" style={{ background: 'none' }}>1. Mobiliario y Equipo:</span>{' '}
              Es Responsable de dar el uso para el que están destinados, así como, procurar su conservación y oportuno mantenimiento.
            </td>
          </tr>
          <tr>
            <td className="label-bold" style={{ width: '30%' }}>2. Manejo de Información</td>
            <td style={{ width: '20%' }}>{puesto.manejo_informacion || 'N/A'}</td>
            <td className="label-bold" style={{ width: '30%' }}>Nivel</td>
            <td style={{ width: '20%' }}>
              {puesto.nivel_informacion
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {['Alta','Media','Baja','Nulo'].map(n => (
                      <span key={n} style={{ fontSize: '8pt' }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, border: '1px solid #000', textAlign: 'center', lineHeight: '10px', marginRight: 2, fontSize: '8pt' }}>
                          {puesto.nivel_informacion?.toLowerCase() === n.toLowerCase() ? 'X' : ''}
                        </span>{n}
                      </span>
                    ))}
                  </span>
                : 'N/A'
              }
            </td>
          </tr>
          <tr>
            <td className="label-bold">3. Manejo de Presupuesto</td>
            <td>{puesto.manejo_presupuesto || 'N/A'}</td>
            <td className="label-bold">Nivel</td>
            <td>
              {puesto.nivel_presupuesto
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {['Alta','Media','Baja','Nulo'].map(n => (
                      <span key={n} style={{ fontSize: '8pt' }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, border: '1px solid #000', textAlign: 'center', lineHeight: '10px', marginRight: 2, fontSize: '8pt' }}>
                          {puesto.nivel_presupuesto?.toLowerCase() === n.toLowerCase() ? 'X' : ''}
                        </span>{n}
                      </span>
                    ))}
                  </span>
                : 'N/A'
              }
            </td>
          </tr>
        </tbody>
      </table>

      {/* Autoridad */}
      {puesto.autoridad?.length > 0 && (
        <table className="pdf-funciones-tabla" style={{ marginTop: 0 }}>
          <tbody>
            <tr>
              <td colSpan={2} className="header-gris">AUTORIDAD</td>
            </tr>
            {puesto.autoridad.map((a, i) => (
              <tr key={i}>
                <td className="num-cell">{i + 1}.</td>
                <td>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Indicadores de desempeño */}
      {puesto.indicador_desempeno?.length > 0 && (
        <table className="pdf-funciones-tabla" style={{ marginTop: 0 }}>
          <tbody>
            <tr>
              <td colSpan={2} className="header-gris">INDICADORES DE DESEMPEÑO</td>
            </tr>
            {puesto.indicador_desempeno.map((ind, i) => (
              <tr key={i}>
                <td className="num-cell">{i + 1}.</td>
                <td>{ind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Compromiso */}
      <div className="pdf-compromiso">
        Me comprometo a desempeñar con ética, profesionalismo y responsabilidad las funciones del cargo público que represento, incorporando la perspectiva de género y un enfoque basado en los Derechos Humanos en beneficio de la ciudadanía benitojuarense. Con mis compañeras, compañeros y el personal a mi cargo, promuevo el trabajo en equipo a partir del respeto y el buen trato. Asimismo, me comprometo a cuidar y hacer un uso responsable de los bienes patrimoniales, conforme a lo establecido por las leyes y reglamentos vigentes.
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
                <strong>Nombre:</strong> {puesto.ocupante_nombre || ' '}
              </div>
              <div style={{ fontSize: '9pt' }}>
                <strong>Cargo:</strong> {puesto.ocupante_cargo || ' '}
              </div>
            </td>
            <td style={{ height: 70, verticalAlign: 'bottom', paddingBottom: 8, textAlign: 'center' }}>
              <div className="pdf-firma-espacio" />
              <div style={{ fontSize: '9pt' }}>
                <strong>Nombre:</strong> {puesto.jefe_firma_nombre || ' '}
              </div>
              <div style={{ fontSize: '9pt' }}>
                <strong>Cargo:</strong> {puesto.jefe_firma_cargo || ' '}
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: '9pt' }}>
              <strong>Fecha:</strong> {fmtFecha(puesto.ocupante_fecha)}
            </td>
            <td style={{ fontSize: '9pt' }}>
              <strong>Fecha:</strong> {fmtFecha(puesto.jefe_firma_fecha)}
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
  const orgsEspecificos = datos.organigramas_especificos || []
  const segmentosAntecedentes = dividirTextoEnSegmentos(datos.antecedentes, 2400)
  const paginasAntecedentes = paginarSegmentos(segmentosAntecedentes, 2800)
  const totalPaginasAntecedentes = paginasAntecedentes.length || 1
  const paginaMarcoNormativo = 8 + totalPaginasAntecedentes
  const paginaAtribuciones = paginaMarcoNormativo + 1
  const paginaObjetivoMisionVision = paginaAtribuciones + 1
  const paginaPrincipiosValores = paginaObjetivoMisionVision + 1
  const paginaPoliticas = paginaPrincipiosValores + 1
  const paginaMarcoConceptual = paginaPoliticas + 1
  // Capítulo II: portada + organigrama general + organigramas específicos
  const paginaPortadaCapII = paginaMarcoConceptual + 1
  const paginaOrgGeneral = paginaPortadaCapII + 1
  const paginaPrimerOrgEspecifico = paginaOrgGeneral + 1
  const paginaInventario = paginaPrimerOrgEspecifico + orgsEspecificos.length
  const paginaPrimerPuesto = paginaInventario + 1
  const paginaCambios = paginaPrimerPuesto + puestos.length
  const totalPaginas = paginaCambios

  const generarPDF = async () => {
    setGenerando(true)
    setProgreso('Preparando documento...')
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
      const paginas = docRef.current.querySelectorAll('.pdf-pagina')

      for (let i = 0; i < paginas.length; i++) {
        setProgreso(`Procesando página ${i + 1} de ${paginas.length}...`)
        const canvas = await html2canvas(paginas[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()

        if (i > 0) pdf.addPage()
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
        <PaginaIndice datos={datos} total={totalPaginas} paginasAntecedentes={totalPaginasAntecedentes} />
        <PaginaPortadaCapituloI datos={datos} total={totalPaginas} paginaInicio={4} />
        <PaginaCapituloI datos={datos} total={totalPaginas} paginaInicio={5} />
        <PaginaCapituloI2 datos={datos} total={totalPaginas} paginaInicio={6} />
        <PaginaIntroduccion datos={datos} total={totalPaginas} paginaInicio={7} />
        {paginasAntecedentes.map((parrafosPagina, i) => (
          <PaginaAntecedentes
            key={`antecedentes-${i}`}
            datos={datos}
            total={totalPaginas}
            paginaInicio={8 + i}
            parrafos={parrafosPagina}
            esContinuacion={i > 0}
          />
        ))}
        <PaginaMarcoNormativo datos={datos} total={totalPaginas} paginaInicio={paginaMarcoNormativo} />
        <PaginaAtribuciones datos={datos} total={totalPaginas} paginaInicio={paginaAtribuciones} />
        <PaginaObjetivoMisionVision datos={datos} total={totalPaginas} paginaInicio={paginaObjetivoMisionVision} />
        <PaginaPrincipiosValores datos={datos} total={totalPaginas} paginaInicio={paginaPrincipiosValores} />
        <PaginaPoliticasOperacion datos={datos} total={totalPaginas} paginaInicio={paginaPoliticas} />
        <PaginaMarcoConceptual datos={datos} total={totalPaginas} paginaInicio={paginaMarcoConceptual} />
        <PaginaPortadaCapituloII datos={datos} total={totalPaginas} paginaInicio={paginaPortadaCapII} />
        <PaginaOrganigramaGeneral datos={datos} total={totalPaginas} paginaInicio={paginaOrgGeneral} />
        {orgsEspecificos.map((org, i) => (
          <PaginaOrganigramaEspecifico
            key={i}
            datos={datos}
            organigrama={org}
            index={i}
            total={totalPaginas}
            paginaInicio={paginaPrimerOrgEspecifico + i}
          />
        ))}
        <PaginaInventario datos={datos} total={totalPaginas} paginaInicio={paginaInventario} />
        {puestos.map((puesto, i) => (
          <PaginaPuesto
            key={i}
            datos={datos}
            puesto={puesto}
            index={i}
            total={totalPaginas}
            paginaInicio={paginaPrimerPuesto + i}
          />
        ))}
        <PaginaCambios datos={datos} total={totalPaginas} paginaInicio={paginaCambios} />
      </div>
      )}
    </div>
  )
}
