// components/GeneradorPDFProcedimientos.jsx
// PDF del Manual de Procedimientos — estética IDÉNTICA al Manual de Organización
// (mismos estilos, tipografía Montserrat, carátula de firmas, tablas, header, etc.)
// Pero conservando las SECCIONES y TÍTULOS propios de Procedimientos.
import { useRef, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS (copiados del Manual de Organización, sin cambios estéticos)
// ═══════════════════════════════════════════════════════════════════════════
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

  /* ── Capítulo heading ── */
  .pdf-cap-titulo {
    font-size: 18pt;
    font-weight: 800;
    font-family: 'Montserrat', Arial, sans-serif;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  /* ── Sección de texto ── */
  .pdf-seccion { margin-bottom: 6px; }
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
    line-height: 1.4;
    text-align: justify;
    text-justify: inter-word;
    text-align-last: left;
    width: 100%;
    margin-bottom: 14px;
  }

  /* ── Tablas ── */
  .pdf-norma-tabla {
    width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt;
    table-layout: fixed;
  }
  .pdf-norma-tabla th {
    background: #ffffff; color: #808080; padding: 6px 8px; text-align: left;
    border: 1px solid #000; font-weight: bold;
    word-wrap: break-word; overflow-wrap: break-word;
  }
  .pdf-norma-tabla td {
    border: 1px solid #000; padding: 5px 8px; vertical-align: top;
    word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;
  }

  .pdf-lista { margin: 6px 0 6px 16px; }
  .pdf-lista li { font-size: 10pt; line-height: 1.6; margin-bottom: 2px; }

  .pdf-inv-tabla {
    width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt;
    table-layout: fixed;
  }
  .pdf-inv-tabla th {
    background: #ffffff; color: #808080; padding: 7px 10px; text-align: center;
    border: 1px solid #000; font-size: 9pt; font-weight: bold;
    text-transform: uppercase; letter-spacing: .5px;
    word-wrap: break-word; overflow-wrap: break-word;
  }
  .pdf-inv-tabla td {
    border: 1px solid #000; padding: 5px 10px; vertical-align: middle;
    word-wrap: break-word; overflow-wrap: break-word;
  }
  .pdf-inv-tabla .area-row td {
    background: #7F7F7F; color: white; font-weight: bold;
    text-align: center; text-transform: uppercase; letter-spacing: .5px;
  }

  /* ── Encabezado de procedimiento (recuadro superior) ── */
  .pdf-proc-encabezado {
    width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;
  }
  .pdf-proc-encabezado td {
    border: 1px solid #000; padding: 8px 10px; vertical-align: middle;
  }
  .pdf-proc-encabezado .header-gris {
    background: #7F7F7F; color: white; text-align: center;
    font-weight: bold; font-size: 9pt; text-transform: uppercase;
    letter-spacing: .5px; padding: 7px; border: 1px solid #000;
  }

  /* ── Bloque de sección del procedimiento (1.0 OBJETIVO, etc.) ── */
  .pdf-proc-bloque { margin-bottom: 12px; }
  .pdf-proc-bloque-titulo {
    font-size: 10.5pt; font-weight: 800; text-transform: uppercase;
    color: #444; border-bottom: 2.5px solid #000; padding-bottom: 2px;
    margin-bottom: 5px; font-family: 'Montserrat', Arial, sans-serif;
  }
  .pdf-proc-bloque-texto {
    font-size: 10pt; font-weight: 500; line-height: 1.5;
    text-align: justify; padding-left: 14px;
  }

  /* ── Tabla de actividades ── */
  .pdf-act-tabla {
    width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt;
    table-layout: fixed;
  }
  .pdf-act-tabla th {
    background: #7F7F7F; color: white; padding: 7px 8px; text-align: center;
    border: 1px solid #000; font-weight: bold; font-size: 9pt;
    text-transform: uppercase; letter-spacing: .5px;
    word-wrap: break-word; overflow-wrap: break-word;
  }
  .pdf-act-tabla td {
    border: 1px solid #000; padding: 6px 8px; vertical-align: top;
    font-size: 9.5pt;
    word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;
  }

  /* ── Tabla de cambios ── */
  .pdf-cambios-tabla {
    width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt;
  }
  .pdf-cambios-tabla th {
    background: #D9D9D9; color: #000; padding: 7px 8px; text-align: center;
    border: 1px solid #000; font-size: 9pt; font-weight: bold;
    text-transform: uppercase;
  }
  .pdf-cambios-tabla td {
    border: 1px solid #000; padding: 5px 8px; text-align: center;
  }
`

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════
const fmtFecha = (str) => {
  if (!str) return '—'
  const s = String(str).trim()
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  const meses = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                  Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' }
  const partes = s.match(/(\w{3})\s+(\w{3})\s+(\d{2})\s+(\d{4})/)
  if (partes) {
    const mes = meses[partes[2]] || '01'
    return `${partes[3]}/${mes}/${partes[4]}`
  }
  return s
}

const extraerParrafos = (texto) => {
  if (!texto) return []
  const normalizado = String(texto).replace(/\r\n/g, '\n')
  if (/\n\s*\n/.test(normalizado)) {
    return normalizado.split(/\n\s*\n/).map(b => b.replace(/\n+/g, ' ').trim()).filter(Boolean)
  }
  return normalizado.split(/\n/).map(l => l.trim()).filter(Boolean)
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTADOR: datos del backend → shape del template
// ═══════════════════════════════════════════════════════════════════════════
function adaptarDatos(datos) {
  const d = datos || {}
  const procedimientos = (d.procedimientos || []).map(p => {
    const respText = (p.responsabilidades || '').trim()
    const responsabilidades = respText
      ? respText.split(/\n+/).filter(Boolean)
      : []
    const actividades = (p.actividades || [])
      .filter(a => a.tipo !== 'fin' || a.descripcion || a.responsable)
      .map(a => ({ responsable: a.responsable || '', descripcion: a.descripcion || '' }))
    return {
      codigo: p.codigo || '',
      nombre: p.nombre || '',
      version: p.version || '01',
      fecha_emision: p.fecha_emision || d.fecha_elaboracion || '',
      objetivo: p.objetivo || '',
      alcance: p.alcance || '',
      responsabilidades,
      definiciones: p.definiciones || '',
      actividades,
      referencias: p.referencias || '',
      registros: p.registros || '',
      elaboro_nombre: p.elaboro_nombre || d.elaboro_nombre || '',
      elaboro_cargo: d.elaboro_cargo || '',
      reviso_nombre: p.reviso_nombre || d.reviso_nombre || '',
      reviso_cargo: d.reviso_cargo || '',
      autorizo_nombre: p.autorizo_nombre || d.autorizo_nombre || '',
      autorizo_cargo: d.autorizo_cargo || '',
      valido_nombre: p.valido_nombre || d.valido_nombre || '',
      valido_cargo: d.valido_cargo || '',
    }
  })

  return {
    codigo: d.codigo || '',
    version: d.version || '01',
    fecha_elaboracion: d.fecha_elaboracion || '',
    fecha_emision: d.fecha_emision || d.fecha_elaboracion || '',
    dependencia: d.dependencia || '',

    elaboro_nombre: d.elaboro_nombre || '',
    elaboro_cargo: d.elaboro_cargo || '',
    reviso_nombre: d.reviso_nombre || '',
    reviso_cargo: d.reviso_cargo || '',
    autorizo_nombre: d.autorizo_nombre || '',
    autorizo_cargo: d.autorizo_cargo || '',
    valido_nombre: d.valido_nombre || '',
    valido_cargo: d.valido_cargo || '',

    introduccion: d.introduccion || '',
    superior_nombre: d.superior_nombre || d.titular || '',
    superior_cargo: d.superior_cargo || d.cargo_titular || '',
    antecedentes: d.antecedentes || '',
    marco_normativo: d.marco_normativo || [],
    atribuciones: d.atribuciones || '',
    objetivo_general: d.objetivo_general || '',
    mision: d.mision || '',
    vision: d.vision || '',
    principios: d.principios || [],
    valores: d.valores || [],
    politicas_operacion: d.politicas_operacion || [],
    marco_conceptual: d.marco_conceptual || [],
    procedimientos,
    cambios: d.cambios || [],
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER DE PÁGINA (idéntico al de organización)
// ═══════════════════════════════════════════════════════════════════════════
function HeaderPagina({ datos, numeroPagina, totalPaginas }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
      <tbody>
        <tr>
          <td style={{ width: '42%', padding: '0 0 8px 0', verticalAlign: 'middle' }}>
            <img src="/LogoMunicipio.png" alt="Municipio de Benito Juárez"
              style={{ height: 100, width: 'auto', display: 'block' }} crossOrigin="anonymous" />
          </td>
          <td style={{ width: '58%', padding: '0 0 8px 12px', verticalAlign: 'top' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <img src="/LogoIMDAI.png" alt="IMDAI"
                style={{ height: 110, width: 'auto', display: 'block', flexShrink: 0, marginTop: 2 }}
                crossOrigin="anonymous" />
              <div style={{ flex: 1, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '11pt', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 800 }}>CÓDIGO:</span> {datos.codigo || '—'}<br />
                <span style={{ fontWeight: 800 }}>FECHA</span><br />
                <span style={{ fontWeight: 800 }}>DE EMISIÓN:</span> {fmtFecha(datos.fecha_elaboracion || datos.fecha_emision)}<br />
                <span style={{ fontWeight: 800 }}>VERSIÓN:</span> {datos.version || '01'}
                <div style={{
                  borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000',
                  paddingTop: 3, paddingBottom: 3, marginTop: 4,
                  marginLeft: '-112px', paddingLeft: '112px',
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

// ═══════════════════════════════════════════════════════════════════════════
// MAPA DE PÁGINAS (cálculo dinámico)
// ═══════════════════════════════════════════════════════════════════════════
function crearMapa(D) {
  const portada = 1
  const caratula = 2
  const indice = 3
  const portadaCapI = 4
  const capI_1 = 5
  const capI_2 = 6
  const introduccion = 7
  const antecedentes = 8
  const marcoNormativo = 9
  const atribuciones = 10
  const objMisVis = 11
  const principiosValores = 12
  const politicas = 13
  const marcoConceptual = 14
  const portadaCapII = 15
  const inventario = 16
  const primerProc = 17
  const procs = D.procedimientos.length || 1
  const cambios = primerProc + procs * 4  // cada proc = 4 páginas
  return {
    portada, caratula, indice, portadaCapI,
    capI_1, capI_2, introduccion, antecedentes, marcoNormativo,
    atribuciones, objMisVis, principiosValores, politicas, marcoConceptual,
    portadaCapII, inventario, primerProc, cambios,
    total: cambios,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PÁGINAS
// ═══════════════════════════════════════════════════════════════════════════

// ── Portada ──
function PaginaPortada({ datos, total }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={1} totalPaginas={total} />
      <div className="pdf-portada-titulo">
        <h1>MANUAL DE<br/><strong>PROCEDIMIENTOS</strong></h1>
      </div>
      <div className="pdf-portada-dep">{datos.dependencia || ''}</div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <img src="/LogoPortada.png" alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous" />
      </div>
    </div>
  )
}

// ── Carátula de firmas (idéntica a organización) ──
function PaginaCaratula({ datos, total }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={2} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: '24pt', fontWeight: 'normal', letterSpacing: 2 }}>MANUAL DE</div>
        <div style={{ fontSize: '30pt', fontWeight: 900, letterSpacing: 2 }}>PROCEDIMIENTOS</div>
        <div style={{ fontSize: '14pt', marginTop: 16, letterSpacing: 3, textTransform: 'uppercase' }}>
          {datos.dependencia || ''}
        </div>
      </div>

      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        border: '3px solid #000', borderRadius: 12, overflow: 'hidden',
        fontFamily: 'Montserrat, Arial, sans-serif', marginTop: 20
      }}>
        <thead>
          <tr>
            {['ELABORÓ','REVISÓ','AUTORIZÓ','VALIDÓ'].map((h, i) => (
              <th key={i} style={{
                width: '25%', padding: '16px 10px', textAlign: 'center',
                fontWeight: 800, fontSize: '13pt', color: '#7a1020',
                borderBottom: 'none', borderRight: 'none', background: 'white'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[datos.elaboro_nombre, datos.reviso_nombre, datos.autorizo_nombre, datos.valido_nombre].map((nombre, i) => (
              <td key={i} style={{
                padding: '20px 14px', textAlign: 'center', verticalAlign: 'top',
                fontStyle: 'italic', fontWeight: 500, fontSize: '10.5pt',
                borderRight: 'none', borderBottom: 'none', minHeight: 80
              }}>{nombre || ' '}</td>
            ))}
          </tr>
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{ height: 100, borderRight: 'none', borderBottom: 'none' }}></td>
            ))}
          </tr>
          <tr>
            {[datos.elaboro_cargo, datos.reviso_cargo, datos.autorizo_cargo, datos.valido_cargo].map((cargo, i) => (
              <td key={i} style={{
                padding: '16px 14px', textAlign: 'center', verticalAlign: 'middle',
                fontWeight: 500, fontSize: '10.5pt', borderRight: 'none',
              }}>{cargo || ' '}</td>
            ))}
          </tr>
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{ height: 80, borderRight: 'none' }}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Índice ──
function PaginaIndice({ datos, total, mapa }) {
  const items = [
    { num: '01', label: 'Carátula de Autorización', pag: mapa.caratula, nivel: 1, linea: true },
    { num: '02', label: 'Índice', pag: mapa.indice, nivel: 1 },
    { num: '03', label: 'Capítulo I de Generales', pag: mapa.portadaCapI, nivel: 1 },
    { num: '3.1',  label: 'Introducción', pag: mapa.introduccion, nivel: 2 },
    { num: '3.2',  label: 'Antecedentes', pag: mapa.antecedentes, nivel: 2 },
    { num: '3.3',  label: 'Marco Normativo', pag: mapa.marcoNormativo, nivel: 2 },
    { num: '3.4',  label: 'Atribuciones Institucionales', pag: mapa.atribuciones, nivel: 2 },
    { num: '3.5',  label: 'Objetivo General', pag: mapa.objMisVis, nivel: 2 },
    { num: '3.6',  label: 'Misión', pag: mapa.objMisVis, nivel: 2 },
    { num: '3.7',  label: 'Visión', pag: mapa.objMisVis, nivel: 2 },
    { num: '3.8',  label: 'Principios y Valores Institucionales', pag: mapa.principiosValores, nivel: 2 },
    { num: '3.9',  label: 'Políticas de Operación', pag: mapa.politicas, nivel: 2 },
    { num: '3.10', label: 'Marco Conceptual', pag: mapa.marcoConceptual, nivel: 2 },
    { num: '04', label: 'Capítulo II de Procedimientos', pag: mapa.portadaCapII, nivel: 1 },
    { num: '4.1',  label: 'Inventario de Procedimientos', pag: mapa.inventario, nivel: 2 },
    { num: '4.2',  label: 'Descripción de Procedimientos', pag: mapa.primerProc, nivel: 2 },
    ...(datos.procedimientos || []).map((p, i) => ({
      num: `4.2.${i + 1}`, label: p.nombre || `Procedimiento ${i + 1}`,
      pag: mapa.primerProc + i * 4, nivel: 2
    })),
    { num: '4.5',  label: 'Sección de Cambios', pag: mapa.cambios, nivel: 2 },
  ]

  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={3} totalPaginas={total} />
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
                <span style={{ fontWeight: 800, fontSize: '20pt', color: '#888', minWidth: 44, flexShrink: 0 }}>{item.num}</span>
                <span style={{ fontWeight: 800, fontSize: '13pt', color: '#888', flex: 1 }}>{item.label}</span>
                <span style={{ fontWeight: 500, fontSize: '11pt', color: '#000', minWidth: 80 }}>{item.pag}</span>
              </div>
              {item.linea && (
                <div style={{ height: 3, background: '#aaa', marginTop: 6, marginBottom: 4, marginRight: 70 }} />
              )}
            </>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'baseline',
              gap: 16, paddingLeft: 15, marginBottom: 1,
              fontFamily: 'Montserrat, Arial, sans-serif',
            }}>
              <span style={{ fontWeight: 500, fontSize: '10pt', color: '#000', minWidth: 36, flexShrink: 0 }}>{item.num}</span>
              <span style={{ fontWeight: 500, fontSize: '10pt', color: '#000', flex: 1 }}>{item.label}</span>
              <span style={{ fontWeight: 500, fontSize: '10pt', color: '#000', minWidth: 80 }}>{item.pag}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Portada Capítulo I ──
function PaginaPortadaCapI({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 400, fontSize: '42pt', letterSpacing: 2, lineHeight: 1.1
        }}>CAPÍTULO 1</div>
        <div style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800, fontSize: '42pt', letterSpacing: 2, lineHeight: 1.1
        }}>DE GENERALES</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <img src="/LogoPortada.png" alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous" />
      </div>
    </div>
  )
}

// ── Capítulo I parte 1 (definiciones de secciones) ──
function PaginaCapI_1({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">03. CAPÍTULO I DE GENERALES</div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PORTADA</div>
        <div className="pdf-seccion-texto">Anotar el nombre del Municipio de Benito Juárez, el Escudo del Municipio fecha de Elaboración, así como los datos de Identificación del Manual, como son; Nombre del Instituto Municipal de Desarrollo Administrativo e Innovación.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">CARÁTULA DE AUTORIZACIONES</div>
        <div className="pdf-seccion-texto">Hoja en la que se recaban las firmas en el documento, correspondientes a quien:</div>
        <div className="pdf-seccion-texto">· ELABORA: Servidor o servidora pública que él o la titular de la Oficina de la Presidencia Municipal designe como enlace Responsable.</div>
        <div className="pdf-seccion-texto">· REVISA: Titulares de direcciones Generales o Dirección de Área o titulares de las unidades administrativas que dependan directamente de la o del servidor público que autoriza.</div>
        <div className="pdf-seccion-texto">· AUTORIZA: Los/las titulares de las dependencias y Unidades administrativas que se refieren los artículos 22, 23 y 24 del reglamento orgánico de la Administración Pública Centralizada de Benito Juárez, Quintana Roo.</div>
        <div className="pdf-seccion-texto">· VALIDACIÓN: Firma correspondiente únicamente al Titular del Instituto Municipal de Desarrollo Administrativo e Innovación del Municipio de Benito Juárez.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">INTRODUCCIÓN</div>
        <div className="pdf-seccion-texto">Sección inicial que describe brevemente el contenido del Manual de Procedimientos, expone su utilidad y el propósito general que pretende cumplir a través del mismo.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ANTECEDENTES</div>
        <div className="pdf-seccion-texto">Apartado en el que se relata la información del origen y evolución de la {datos.dependencia || 'Dependencia'}.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MARCO NORMATIVO</div>
        <div className="pdf-seccion-texto">Hace referencia a la normatividad en la cual se sustentan las funciones y actividades que se realizan. Respetando la pirámide Jurídica.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">ATRIBUCIONES INSTITUCIONALES</div>
        <div className="pdf-seccion-texto">Indican las facultades que le corresponden a la {datos.dependencia || 'Dependencia'} de conformidad a lo señalado en la normativa aplicable. Asimismo, señala las funciones que deben realizar las y los servidores públicos asignados a la {datos.dependencia || 'Dependencia'}.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">OBJETIVO</div>
        <div className="pdf-seccion-texto">Es el propósito global que desea alcanzar o que persigue la {datos.dependencia || 'Dependencia'} para el cumplimiento de las actividades que por su atribución le corresponde.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MISIÓN</div>
        <div className="pdf-seccion-texto">Es la razón de ser de la {datos.dependencia || 'Dependencia'}, con la cual todas las y los servidores públicos que laboran para la Institución deberán identificarse para su cumplimiento. Esta descripción debe ser clara, concreta y específica.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">VISIÓN</div>
        <div className="pdf-seccion-texto">En ella se expone a dónde se dirige la {datos.dependencia || 'Dependencia'} y cómo se ve a largo plazo; enunciar el escenario en el que se desea posicionar la entidad.</div>
      </div>
    </div>
  )
}

// ── Capítulo I parte 2 ──
function PaginaCapI_2({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">03. CAPÍTULO I DE GENERALES</div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PRINCIPIOS Y VALORES INSTITUCIONALES</div>
        <div className="pdf-seccion-texto">Consiste en un referente ético que consolida y guía el pensamiento, las actitudes, prácticas y formas de actuación de las y los servidores públicos y colaboradores del Instituto Municipal de Desarrollo Administrativo e Innovación.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">POLÍTICAS DE OPERACIÓN</div>
        <div className="pdf-seccion-texto">Son guías generales de acción que definen los límites y parámetros necesarios para ejecutar los procesos y actividades en cumplimiento de la función, planes, programas y proyectos previamente definidos por la organización.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">MARCO CONCEPTUAL</div>
        <div className="pdf-seccion-texto">Son conceptos que se utilizan dentro del documento, con su descripción específica para ampliar la definición correspondiente que permita al lector una mejor comprensión del manual.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">INVENTARIO DE PROCEDIMIENTOS</div>
        <div className="pdf-seccion-texto">De acuerdo al orden jerárquico de la estructura orgánica se enlistan los procedimientos por dirección o departamento, agregando: el código del procedimiento, la versión, el nombre y la fecha de la última emisión.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">PROCEDIMIENTOS</div>
        <div className="pdf-seccion-texto">Cada procedimiento incluye: Objetivo, Alcance, Responsabilidades, Definiciones, Descripción de actividades, Referencias del documento, Registros, Historial del documento y Diagrama de flujo.</div>
      </div>

      <div className="pdf-seccion">
        <div className="pdf-seccion-titulo">SECCIÓN DE CAMBIOS</div>
        <div className="pdf-seccion-texto">Se especifica el número de versión del documento de acuerdo a las modificaciones y/o actualizaciones realizadas al mismo.</div>
      </div>

      <div className="pdf-seccion" style={{ marginTop: 24 }}>
        <div className="pdf-seccion-titulo">LENGUAJE INCLUYENTE CON PERSPECTIVA DE GÉNERO.</div>
        <div className="pdf-seccion-texto" style={{ lineHeight: 1.2 }}>
          En la {datos.dependencia || 'Dependencia'} nos apegamos a la igualdad social, reforzamos el respeto de género y la NO violencia contra las mujeres.
        </div>
        <div className="pdf-seccion-texto" style={{ marginTop: 3, lineHeight: 1.2 }}>
          Por ello, exhortamos para que la información contenida en este manual, sea plasmada a través del LENGUAJE INCLUYENTE.
        </div>
      </div>

      <div style={{
        marginTop: 14, fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 800, fontSize: '9pt', textAlign: 'justify', lineHeight: 1.5
      }}>
        ESTE DOCUMENTO DEBERÁ SER CONOCIDO POR TODO EL PERSONAL QUE LABORA EN LA {(datos.dependencia || 'DEPENDENCIA').toUpperCase()}, CON LA FINALIDAD DE QUE SE IDENTIFIQUEN LOS PROCEDIMIENTOS QUE AQUÍ SE LLEVAN A CABO.
      </div>
    </div>
  )
}

// ── 3.1 Introducción ──
function PaginaIntroduccion({ datos, total, paginaInicio }) {
  const parrafos = extraerParrafos(datos.introduccion)
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.1 INTRODUCCIÓN</div>
      {parrafos.length > 0
        ? parrafos.map((p, i) => (
            <div key={i} className="pdf-intro-texto" style={i === 0 ? { textIndent: '1.5em' } : undefined}>{p}</div>
          ))
        : <div className="pdf-intro-texto">—</div>
      }
      {(datos.superior_nombre || datos.superior_cargo) && (
        <div style={{ marginTop: 60, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif' }}>
          <div style={{ width: 260, borderBottom: '1.5px solid #000', margin: '0 auto 8px auto' }} />
          <div style={{ fontWeight: 800, fontSize: '10pt', textTransform: 'uppercase' }}>{datos.superior_nombre}</div>
          <div style={{ fontWeight: 800, fontSize: '10pt', textTransform: 'uppercase' }}>{datos.superior_cargo}</div>
        </div>
      )}
    </div>
  )
}

// ── 3.2 Antecedentes ──
function PaginaAntecedentes({ datos, total, paginaInicio }) {
  const parrafos = extraerParrafos(datos.antecedentes)
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.2 ANTECEDENTES</div>
      {parrafos.length > 0
        ? parrafos.map((p, i) => (
            <div key={i} className="pdf-intro-texto" style={i === 0 ? { textIndent: '1.5em' } : { marginTop: 8 }}>{p}</div>
          ))
        : <div className="pdf-intro-texto">—</div>
      }
    </div>
  )
}

// ── 3.3 Marco Normativo ──
function PaginaMarcoNormativo({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.3 MARCO NORMATIVO</div>
      <div className="pdf-intro-texto">
        Hace referencia a la normatividad en la cual se sustentan las funciones y actividades que se realizan. Respetando la pirámide jurídica.
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
            <tr><td colSpan={4} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td></tr>
          </thead>
          <tbody>
            {datos.marco_normativo.map((n, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                <td>{n.nombre}</td>
                <td>{fmtFecha(n.fecha)}</td>
                <td>{n.medio || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="pdf-intro-texto">No hay información de marco normativo registrada.</div>
      )}
    </div>
  )
}

// ── 3.4 Atribuciones ──
function PaginaAtribuciones({ datos, total, paginaInicio }) {
  const parrafos = extraerParrafos(datos.atribuciones)
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.4 ATRIBUCIONES INSTITUCIONALES</div>
      {parrafos.length > 0
        ? parrafos.map((p, i) => (
            <div key={i} className="pdf-intro-texto" style={i === 0 ? { textIndent: '1.5em' } : undefined}>{p}</div>
          ))
        : <div className="pdf-intro-texto">—</div>
      }
    </div>
  )
}

// ── 3.5, 3.6, 3.7 ──
function PaginaObjMisVis({ datos, total, paginaInicio }) {
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
        const mostrarLineas = i > 0
        return (
          <div key={bloque.titulo} style={{ marginBottom: i === bloques.length - 1 ? 0 : 18 }}>
            {mostrarLineas && <div style={{ width: 'calc(50% + 56px)', borderTop: '3px solid #000', marginBottom: 6, marginLeft: '-56px' }} />}
            <div style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 800, fontSize: '14pt', color: '#262626',
              marginBottom: 6, marginLeft: mostrarLineas ? '1.5cm' : 0,
            }}>{bloque.titulo}</div>
            {mostrarLineas && <div style={{ width: 'calc(50% + 56px)', borderTop: '3px solid #000', marginBottom: 6, marginLeft: '-56px' }} />}
            <div style={{ width: '100%', paddingTop: i === 0 ? 2 : 6, paddingLeft: '3cm' }}>
              {parrafos.length > 0
                ? parrafos.map((p, k) => (
                    <div key={k} className="pdf-intro-texto" style={k === 0 ? { textIndent: '1.5em' } : { marginTop: 6 }}>{p}</div>
                  ))
                : <div className="pdf-intro-texto">—</div>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 3.8 Principios y Valores ──
function PaginaPrincipiosValores({ datos, total, paginaInicio }) {
  const principios = (datos.principios || []).filter(Boolean)
  const valores = (datos.valores || []).filter(Boolean)
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.8 PRINCIPIOS Y VALORES INSTITUCIONALES</div>

      <div className="pdf-seccion" style={{ marginTop: 12 }}>
        <div className="pdf-seccion-titulo" style={{ fontSize: '11pt' }}>PRINCIPIOS</div>
        <ul className="pdf-lista">
          {principios.length > 0 ? principios.map((p, i) => <li key={i}>{p}</li>) : <li>—</li>}
        </ul>
      </div>

      <div className="pdf-seccion" style={{ marginTop: 18 }}>
        <div className="pdf-seccion-titulo" style={{ fontSize: '11pt' }}>VALORES</div>
        <ul className="pdf-lista">
          {valores.length > 0 ? valores.map((v, i) => <li key={i}>{v}</li>) : <li>—</li>}
        </ul>
      </div>
    </div>
  )
}

// ── 3.9 Políticas de Operación ──
function PaginaPoliticas({ datos, total, paginaInicio }) {
  const pols = datos.politicas_operacion || []
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.9 POLÍTICAS DE OPERACIÓN</div>
      {pols.length > 0 ? pols.map((p, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: 800, fontSize: '10.5pt', textTransform: 'uppercase',
            color: '#444', borderBottom: '2.5px solid #000', paddingBottom: 2, marginBottom: 5,
          }}>{String.fromCharCode(65 + i)}. {p.area}</div>
          <div className="pdf-intro-texto" style={{ paddingLeft: 20 }}>{p.descripcion}</div>
        </div>
      )) : <div className="pdf-intro-texto">No hay políticas registradas.</div>}
    </div>
  )
}

// ── 3.10 Marco Conceptual ──
function PaginaMarcoConceptual({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">3.10 MARCO CONCEPTUAL</div>
      <div className="pdf-intro-texto" style={{ marginBottom: 12 }}>
        Son conceptos que se utilizan dentro del documento, con su descripción específica para ampliar la definición correspondiente.
      </div>
      {datos.marco_conceptual?.length > 0 ? (
        <table className="pdf-norma-tabla" style={{ marginTop: 8 }}>
          <thead>
            <tr><th style={{ width: '30%' }}>TÉRMINO</th><th>DEFINICIÓN</th></tr>
            <tr><td colSpan={2} style={{ background: '#7F7F7F', height: 8, padding: 0, border: '1px solid #000' }}></td></tr>
          </thead>
          <tbody>
            {datos.marco_conceptual.map((c, i) => (
              <tr key={i}><td style={{ fontWeight: 'bold' }}>{c.termino}</td><td>{c.definicion}</td></tr>
            ))}
          </tbody>
        </table>
      ) : <div className="pdf-intro-texto">No hay términos registrados.</div>}
    </div>
  )
}

// ── Portada Capítulo II ──
function PaginaPortadaCapII({ datos, total, paginaInicio }) {
  return (
    <div className="pdf-pagina" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 400, fontSize: '42pt', letterSpacing: 2, lineHeight: 1.1 }}>CAPÍTULO 2</div>
        <div style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: '42pt', letterSpacing: 2, lineHeight: 1.1 }}>DE PROCEDIMIENTOS</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <img src="/LogoPortada.png" alt="Logo Portada"
          style={{ width: 'auto', maxWidth: '85%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous" />
      </div>
    </div>
  )
}

// ── 4.1 Inventario de Procedimientos ──
function PaginaInventario({ datos, total, paginaInicio }) {
  const procs = datos.procedimientos || []
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.1 INVENTARIO DE PROCEDIMIENTOS</div>
      <div className="pdf-intro-texto" style={{ marginBottom: 10 }}>
        Listado de los procedimientos que corresponden a la {datos.dependencia || 'Dependencia'}.
      </div>
      <table className="pdf-inv-tabla">
        <thead>
          <tr>
            <th style={{ width: '18%' }}>CÓDIGO</th>
            <th style={{ width: '10%' }}>VERSIÓN</th>
            <th>NOMBRE DEL PROCEDIMIENTO</th>
            <th style={{ width: '20%' }}>FECHA DE LA ÚLTIMA EMISIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr className="area-row">
            <td colSpan={4}>{(datos.dependencia || 'DEPENDENCIA').toUpperCase()}</td>
          </tr>
          {procs.length > 0 ? procs.map((p, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center' }}>{p.codigo || '—'}</td>
              <td style={{ textAlign: 'center' }}>{p.version || '01'}</td>
              <td>{p.nombre || '—'}</td>
              <td style={{ textAlign: 'center' }}>{fmtFecha(p.fecha_emision)}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} style={{ textAlign: 'center', fontStyle: 'italic' }}>Sin procedimientos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Páginas de un procedimiento (4 páginas por procedimiento) ──
function ProcPortada({ datos, proc, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.2 DESCRIPCIÓN DE PROCEDIMIENTO</div>

      {/* Recuadro superior con nombre del procedimiento y datos */}
      <table className="pdf-proc-encabezado">
        <tbody>
          <tr>
            <td className="header-gris" style={{ width: '60%' }}>NOMBRE DEL PROCEDIMIENTO</td>
            <td className="header-gris" style={{ width: '40%' }}>ÁREA / DEPARTAMENTO</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '12pt', padding: '14px 10px' }}>
              {proc.nombre || '—'}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '11pt', fontStyle: 'italic', padding: '14px 10px' }}>
              {datos.dependencia || '—'}
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: '9.5pt' }}>
              <strong>REVISIÓN:</strong> {proc.version || '01'} &nbsp;&nbsp;
              <strong>CÓDIGO:</strong> {proc.codigo || '—'}
            </td>
            <td style={{ fontSize: '9.5pt', textAlign: 'center' }}>
              <strong>EMISIÓN:</strong> {fmtFecha(proc.fecha_emision)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tabla de firmas del procedimiento con la misma estética de la carátula */}
      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        border: '3px solid #000', borderRadius: 12, overflow: 'hidden',
        fontFamily: 'Montserrat, Arial, sans-serif', marginTop: 24
      }}>
        <thead>
          <tr>
            {['ELABORÓ','REVISÓ','AUTORIZÓ','VALIDÓ'].map((h, i) => (
              <th key={i} style={{
                width: '25%', padding: '14px 10px', textAlign: 'center',
                fontWeight: 800, fontSize: '12pt', color: '#7a1020',
                borderBottom: 'none', borderRight: 'none', background: 'white'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[proc.elaboro_nombre, proc.reviso_nombre, proc.autorizo_nombre, proc.valido_nombre].map((nombre, i) => (
              <td key={i} style={{
                padding: '18px 12px', textAlign: 'center', verticalAlign: 'top',
                fontStyle: 'italic', fontWeight: 500, fontSize: '10pt',
                borderRight: 'none', borderBottom: 'none', minHeight: 70
              }}>{nombre || ' '}</td>
            ))}
          </tr>
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{ height: 80, borderRight: 'none', borderBottom: 'none' }}></td>
            ))}
          </tr>
          <tr>
            {[proc.elaboro_cargo, proc.reviso_cargo, proc.autorizo_cargo, proc.valido_cargo].map((cargo, i) => (
              <td key={i} style={{
                padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle',
                fontWeight: 500, fontSize: '10pt', borderRight: 'none',
              }}>{cargo || ' '}</td>
            ))}
          </tr>
          <tr>
            {[null, null, null, null].map((_, i) => (
              <td key={i} style={{ height: 60, borderRight: 'none' }}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ProcInfo({ datos, proc, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.2 DESCRIPCIÓN DE PROCEDIMIENTO</div>

      {/* Mini-encabezado del procedimiento */}
      <table className="pdf-proc-encabezado" style={{ marginBottom: 14 }}>
        <tbody>
          <tr>
            <td className="header-gris" style={{ width: '60%' }}>{(proc.nombre || '—').toUpperCase()}</td>
            <td className="header-gris" style={{ width: '40%' }}>{(datos.dependencia || '—').toUpperCase()}</td>
          </tr>
          <tr>
            <td style={{ fontSize: '9.5pt' }}>
              <strong>CÓDIGO:</strong> {proc.codigo || '—'} &nbsp;&nbsp;
              <strong>REVISIÓN:</strong> {proc.version || '01'}
            </td>
            <td style={{ fontSize: '9.5pt', textAlign: 'center' }}>
              <strong>EMISIÓN:</strong> {fmtFecha(proc.fecha_emision)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">1.0 OBJETIVO</div>
        <div className="pdf-proc-bloque-texto">{proc.objetivo || '—'}</div>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">2.0 ALCANCE</div>
        <div className="pdf-proc-bloque-texto">{proc.alcance || '—'}</div>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">3.0 RESPONSABILIDADES</div>
        <div className="pdf-proc-bloque-texto">
          {proc.responsabilidades?.length > 0
            ? proc.responsabilidades.map((r, i) => (
                <div key={i} style={{ marginBottom: 4 }}><strong>3.{i + 1}</strong> {r}</div>
              ))
            : '—'}
        </div>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">4.0 DEFINICIONES</div>
        <div className="pdf-proc-bloque-texto">{proc.definiciones || '—'}</div>
      </div>
    </div>
  )
}

function ProcActividades({ datos, proc, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.2 DESCRIPCIÓN DE PROCEDIMIENTO</div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">5.0 DESCRIPCIÓN DE ACTIVIDADES</div>
        <table className="pdf-act-tabla">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>PASO</th>
              <th style={{ width: '25%' }}>RESPONSABLE</th>
              <th>DESCRIPCIÓN DE LA ACTIVIDAD</th>
            </tr>
          </thead>
          <tbody>
            {proc.actividades?.length > 0 ? proc.actividades.map((a, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                <td>{a.responsable || '—'}</td>
                <td style={{ textAlign: 'justify' }}>{a.descripcion || '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{ textAlign: 'center', fontStyle: 'italic' }}>Sin actividades registradas.</td></tr>
            )}
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{(proc.actividades?.length || 0) + 1}</td>
              <td>Fin de Procedimiento</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">6.0 REFERENCIAS DEL DOCUMENTO</div>
        <div className="pdf-proc-bloque-texto">{proc.referencias || '—'}</div>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">7.0 REGISTROS</div>
        <div className="pdf-proc-bloque-texto">{proc.registros || '—'}</div>
      </div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">8.0 HISTORIAL DEL DOCUMENTO</div>
        <table className="pdf-cambios-tabla" style={{ marginTop: 4 }}>
          <thead>
            <tr>
              <th>REVISIÓN ANTERIOR</th>
              <th>REVISIÓN ACTUAL</th>
              <th>RAZÓN DE LA ÚLTIMA MODIFICACIÓN</th>
              <th>FECHA DE ACTUALIZACIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>N/A</td>
              <td>{proc.version || 'Original'}</td>
              <td style={{ textAlign: 'left', padding: '5px 10px' }}>Emisión inicial</td>
              <td>{fmtFecha(proc.fecha_emision)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProcDiagrama({ datos, proc, total, paginaInicio }) {
  return (
    <div className="pdf-pagina">
      <HeaderPagina datos={datos} numeroPagina={paginaInicio} totalPaginas={total} />
      <div className="pdf-cap-titulo">4.2 DESCRIPCIÓN DE PROCEDIMIENTO</div>

      <div className="pdf-proc-bloque">
        <div className="pdf-proc-bloque-titulo">9.0 DIAGRAMA DE FLUJO</div>
        <div style={{
          border: '1px solid #000', padding: 10, marginTop: 8,
          minHeight: 620, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            background: '#7F7F7F', color: 'white', padding: '8px 12px',
            fontWeight: 'bold', fontSize: '10pt', textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10,
          }}>
            DIAGRAMA DE FLUJO — {(proc.nombre || 'PROCEDIMIENTO').toUpperCase()}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '9.5pt', padding: '5px 0',
            borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc',
            marginBottom: 12,
          }}>
            <span><strong>CÓDIGO:</strong> {proc.codigo || '—'}</span>
            <span><strong>EMISIÓN:</strong> {fmtFecha(proc.fecha_emision)}</span>
            <span><strong>REVISIÓN:</strong> {proc.version || '01'}</span>
          </div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', fontSize: '10pt', textAlign: 'center', fontStyle: 'italic',
          }}>
            (Diagrama de flujo del procedimiento — consultar en el visor interactivo del manual)
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sección de Cambios (última página) ──
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
            <tr><td>—</td><td>Original</td><td style={{ textAlign: 'left', padding: '5px 10px' }}>Emisión inicial</td><td>{fmtFecha(datos.fecha_elaboracion)}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function GeneradorPDFProcedimientos({ datos, onCerrar }) {
  const docRef = useRef(null)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState('')
  const [fuenteLista, setFuenteLista] = useState(false)

  // Datos adaptados (memoriza en cada render pero es barato)
  const D = adaptarDatos(datos)

  // Cargar Montserrat
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap'
    document.head.appendChild(link)
    link.onload = () => document.fonts.ready.then(() => setFuenteLista(true))
    document.fonts.ready.then(() => setFuenteLista(true))
    return () => { try { document.head.removeChild(link) } catch { /* ignore */ } }
  }, [])

  const mapa = crearMapa(D)
  const totalPaginas = mapa.total
  const procedimientos = D.procedimientos.length > 0
    ? D.procedimientos
    : [{ nombre: '(Sin procedimientos)', codigo: '—', version: '01', fecha_emision: '',
         objetivo: '', alcance: '', responsabilidades: [], definiciones: '', actividades: [],
         referencias: '', registros: '' }]

  const generarPDF = async () => {
    setGenerando(true)
    setProgreso('Preparando documento...')

    // ── Busca la MEJOR línea de corte: escanea hacia arriba desde targetY
    //    dentro de una ventana y elige la franja blanca más ancha encontrada
    //    (bordes de sección > espacios entre párrafos > espacios entre líneas).
    //    Si no hay nada razonable, regresa targetY (corte duro).
    const esFilaBlanca = (ctx, ancho, y) => {
      let pixeles
      try {
        pixeles = ctx.getImageData(0, y, ancho, 1).data
      } catch {
        return null  // canvas manchado por CORS
      }
      // Muestreo cada 4 px (step 16 bytes). Umbral tolerante (≥235).
      for (let x = 0; x < pixeles.length; x += 16) {
        const r = pixeles[x], g = pixeles[x + 1], b = pixeles[x + 2]
        if (r < 235 || g < 235 || b < 235) return false
      }
      return true
    }

    const encontrarCorteSeguro = (ctx, ancho, targetY, maxBuscarArriba) => {
      const limiteArriba = Math.max(0, targetY - maxBuscarArriba)
      // Detectar todas las rachas blancas en la ventana
      let rachaIni = -1
      let mejor = null    // { y: centro_racha, len: longitud }
      for (let y = targetY; y >= limiteArriba; y--) {
        const blanca = esFilaBlanca(ctx, ancho, y)
        if (blanca === null) return targetY
        if (blanca) {
          if (rachaIni === -1) rachaIni = y
        }
        if (!blanca || y === limiteArriba) {
          if (rachaIni !== -1) {
            const fin = blanca ? y : y + 1
            const len = rachaIni - fin + 1
            if (len >= 3) {
              // Score: privilegia rachas largas pero penaliza distancia
              const centro = Math.floor((rachaIni + fin) / 2)
              const distancia = targetY - centro
              const score = len * 4 - distancia * 0.15
              if (mejor === null || score > mejor.score) {
                mejor = { y: centro, score, len }
              }
            }
            rachaIni = -1
          }
        }
      }
      return mejor ? mejor.y : targetY
    }

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
      const paginas = docRef.current.querySelectorAll('.pdf-pagina, .pdf-pagina-horizontal')
      let agregarNueva = false

      for (let i = 0; i < paginas.length; i++) {
        setProgreso(`Procesando página ${i + 1} de ${paginas.length}...`)
        const orientation = paginas[i].dataset.pageOrientation === 'landscape' ? 'landscape' : 'portrait'

        const canvas = await html2canvas(paginas[i], {
          scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
        })
        const imgW = canvas.width
        const imgH = canvas.height
        const ctxFuente = canvas.getContext('2d')

        // Proporción altura/ancho de carta (portrait 11/8.5, landscape 8.5/11)
        const ratioPag = orientation === 'landscape' ? (8.5 / 11) : (11 / 8.5)
        const slicePxH = Math.floor(imgW * ratioPag)
        // Ventana de búsqueda más amplia (25 % de la página) para no cortar tablas
        const maxAjuste = Math.floor(slicePxH * 0.25)

        let renderizado = 0
        while (renderizado < imgH) {
          let sliceH = Math.min(slicePxH, imgH - renderizado)

          // Si aún queda contenido después de esta rebanada, buscar corte seguro
          if (renderizado + sliceH < imgH) {
            const corteSeguro = encontrarCorteSeguro(
              ctxFuente, imgW, renderizado + sliceH, maxAjuste
            )
            const nuevaAltura = corteSeguro - renderizado
            // Aceptamos el ajuste si deja al menos 55 % de la página con contenido
            if (nuevaAltura > slicePxH * 0.55) sliceH = nuevaAltura
          }

          // Sub-canvas con la rebanada actual
          const sub = document.createElement('canvas')
          sub.width = imgW
          sub.height = sliceH
          sub.getContext('2d').drawImage(
            canvas, 0, renderizado, imgW, sliceH, 0, 0, imgW, sliceH
          )

          if (agregarNueva) pdf.addPage('letter', orientation)
          agregarNueva = true

          const pageW = pdf.internal.pageSize.getWidth()
          const imgHPt = (sliceH / imgW) * pageW
          pdf.addImage(sub.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, imgHPt)

          renderizado += sliceH
        }
      }
      setProgreso('Guardando archivo...')
      const nombreArchivo = `Manual_Procedimientos_${(D.dependencia || 'dependencia').replace(/\s+/g, '_')}_${D.codigo || 'v1'}.pdf`
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
            padding: '10px 24px', background: '#7a1020', color: 'white',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.9rem',
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

      <style>{estilos}</style>

      {!fuenteLista ? (
        <div style={{ color: '#fff', fontSize: '1rem', marginTop: 40 }}>Cargando tipografía...</div>
      ) : (
        <div ref={docRef} className="pdf-doc">
          <PaginaPortada datos={D} total={totalPaginas} />
          <PaginaCaratula datos={D} total={totalPaginas} />
          <PaginaIndice datos={D} total={totalPaginas} mapa={mapa} />
          <PaginaPortadaCapI datos={D} total={totalPaginas} paginaInicio={mapa.portadaCapI} />
          <PaginaCapI_1 datos={D} total={totalPaginas} paginaInicio={mapa.capI_1} />
          <PaginaCapI_2 datos={D} total={totalPaginas} paginaInicio={mapa.capI_2} />
          <PaginaIntroduccion datos={D} total={totalPaginas} paginaInicio={mapa.introduccion} />
          <PaginaAntecedentes datos={D} total={totalPaginas} paginaInicio={mapa.antecedentes} />
          <PaginaMarcoNormativo datos={D} total={totalPaginas} paginaInicio={mapa.marcoNormativo} />
          <PaginaAtribuciones datos={D} total={totalPaginas} paginaInicio={mapa.atribuciones} />
          <PaginaObjMisVis datos={D} total={totalPaginas} paginaInicio={mapa.objMisVis} />
          <PaginaPrincipiosValores datos={D} total={totalPaginas} paginaInicio={mapa.principiosValores} />
          <PaginaPoliticas datos={D} total={totalPaginas} paginaInicio={mapa.politicas} />
          <PaginaMarcoConceptual datos={D} total={totalPaginas} paginaInicio={mapa.marcoConceptual} />
          <PaginaPortadaCapII datos={D} total={totalPaginas} paginaInicio={mapa.portadaCapII} />
          <PaginaInventario datos={D} total={totalPaginas} paginaInicio={mapa.inventario} />
          {procedimientos.map((proc, i) => (
            <div key={proc.codigo || i} style={{ display: 'contents' }}>
              <ProcPortada       datos={D} proc={proc} total={totalPaginas} paginaInicio={mapa.primerProc + i * 4}     />
              <ProcInfo          datos={D} proc={proc} total={totalPaginas} paginaInicio={mapa.primerProc + i * 4 + 1} />
              <ProcActividades   datos={D} proc={proc} total={totalPaginas} paginaInicio={mapa.primerProc + i * 4 + 2} />
              <ProcDiagrama      datos={D} proc={proc} total={totalPaginas} paginaInicio={mapa.primerProc + i * 4 + 3} />
            </div>
          ))}
          <PaginaCambios datos={D} total={totalPaginas} paginaInicio={mapa.cambios} />
        </div>
      )}
    </div>
  )
}
