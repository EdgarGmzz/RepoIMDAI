import { useEffect, useState } from 'react'
import axios from 'axios'
import GeneradorPDFManual from './GeneradorPDFManual'
import GeneradorPDFProcedimientos from './GeneradorPDFProcedimientos'
import DiagramaFlujo from './DiagramaFlujo'

// ── Helpers de UI ────────────────────────────────────────────────────────────

function Seccion({ numero, titulo, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '14px', paddingBottom: '10px',
        borderBottom: '1.5px solid #fdf0f2'
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          color: 'white', borderRadius: '6px',
          padding: '3px 9px', fontSize: '.68rem', fontWeight: '700', letterSpacing: '.5px'
        }}>
          {numero}
        </span>
        <h4 style={{ fontSize: '.88rem', fontWeight: '700', color: '#1a0a0f', margin: 0 }}>
          {titulo}
        </h4>
      </div>
      {children}
    </div>
  )
}

function Campo({ label, valor, multilinea = false }) {
  if (!valor) return null
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        fontSize: '.65rem', fontWeight: '700', letterSpacing: '1px',
        textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '.84rem', color: '#2d1520', lineHeight: '1.6',
        padding: multilinea ? '10px 14px' : '0',
        background: multilinea ? '#fdf8f9' : 'transparent',
        borderRadius: multilinea ? '8px' : '0',
        whiteSpace: 'pre-wrap'
      }}>
        {valor || <span style={{ color: '#c9a0a8', fontStyle: 'italic' }}>Sin información</span>}
      </div>
    </div>
  )
}

function CampoGrid({ campos }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
      {campos.map(({ label, valor }, i) => (
        <Campo key={i} label={label} valor={valor} />
      ))}
    </div>
  )
}

function ListaItems({ items = [], campo }) {
  if (!items.length) return <p style={{ fontSize: '.8rem', color: '#c9a0a8', fontStyle: 'italic' }}>Sin registros</p>
  return (
    <ul style={{ margin: 0, paddingLeft: '20px' }}>
      {items.map((it, i) => (
        <li key={i} style={{ fontSize: '.84rem', color: '#2d1520', marginBottom: '4px', lineHeight: '1.5' }}>
          {campo ? it[campo] : it}
        </li>
      ))}
    </ul>
  )
}

function TablaSimple({ columnas, filas }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
      <thead>
        <tr>
          {columnas.map((col, i) => (
            <th key={i} style={{
              padding: '8px 12px', textAlign: 'left',
              fontSize: '.65rem', fontWeight: '700', letterSpacing: '1px',
              textTransform: 'uppercase', color: '#b06070', background: '#fdf5f6'
            }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((cel, j) => (
              <td key={j} style={{
                padding: '8px 12px', borderBottom: '1px solid #faf0f2',
                color: '#2d1520', lineHeight: '1.4'
              }}>{cel || '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Banner de estado ──────────────────────────────────────────────────────────
function BannerEstado({ estado }) {
  const conf = {
    borrador:      { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b', label: 'Borrador — En edición por el sujeto obligado' },
    en_revision:   { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', dot: '#3b82f6', label: 'En Revisión — Pendiente de validación IMDAI' },
    observaciones: { bg: '#fff7ed', border: '#fed7aa', color: '#9a3412', dot: '#f97316', label: 'Con Observaciones — Requiere correcciones' },
    validado:      { bg: '#f0fdf4', border: '#bbf7d0', color: '#14532d', dot: '#22c55e', label: 'Validado por IMDAI' },
    autorizado:    { bg: '#f0fdf4', border: '#bbf7d0', color: '#14532d', dot: '#059669', label: 'Autorizado' },
  }
  const c = conf[estado] || conf.borrador
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px', borderRadius: '8px',
      background: c.bg, border: `1px solid ${c.border}`,
      marginBottom: '20px'
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: c.dot, flexShrink: 0,
        boxShadow: `0 0 0 3px ${c.dot}30`
      }} />
      <span style={{ fontSize: '.78rem', fontWeight: '600', color: c.color }}>{c.label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '.68rem', color: c.color, opacity: .7, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.5px' }}>
        Solo lectura
      </span>
    </div>
  )
}

// ── Contenido del visor según tipo ──────────────────────────────────────────

function VisorOrganizacion({ datos }) {
  const d = datos || {}
  return (
    <div>
      {/* Datos Generales */}
      <Seccion numero="01" titulo="Datos Generales">
        <CampoGrid campos={[
          { label: 'Código del Manual', valor: d.codigo },
          { label: 'Dependencia', valor: d.dependencia },
          { label: 'Versión', valor: d.version },
          { label: 'Fecha de Elaboración', valor: d.fecha_elaboracion },
          { label: 'Elaboró', valor: d.elaboro_nombre ? `${d.elaboro_nombre} — ${d.elaboro_cargo}` : null },
          { label: 'Revisó', valor: d.reviso_nombre ? `${d.reviso_nombre} — ${d.reviso_cargo}` : null },
          { label: 'Autorizó', valor: d.autorizo_nombre ? `${d.autorizo_nombre} — ${d.autorizo_cargo}` : null },
          { label: 'Validó (IMDAI)', valor: d.valido_nombre ? `${d.valido_nombre} — ${d.valido_cargo}` : null },
        ]} />
      </Seccion>

      {/* Capítulo I */}
      <Seccion numero="3.1" titulo="Introducción">
        <Campo valor={d.introduccion} multilinea />
        <CampoGrid campos={[
          { label: 'Superior Jerárquico', valor: d.superior_nombre },
          { label: 'Cargo', valor: d.superior_cargo },
        ]} />
      </Seccion>

      <Seccion numero="3.2" titulo="Antecedentes">
        <Campo valor={d.antecedentes} multilinea />
      </Seccion>

      {d.marco_normativo?.length > 0 && (
        <Seccion numero="3.3" titulo="Marco Normativo">
          <TablaSimple
            columnas={['#', 'Normatividad / Documento', 'Fecha Publicación', 'Medio']}
            filas={d.marco_normativo.map((n, i) => [i + 1, n.nombre, n.fecha, n.medio])}
          />
        </Seccion>
      )}

      <Seccion numero="3.4" titulo="Atribuciones Institucionales">
        <Campo valor={d.atribuciones} multilinea />
      </Seccion>

      <Seccion numero="3.5 – 3.7" titulo="Objetivo, Misión y Visión">
        <Campo label="Objetivo General" valor={d.objetivo_general} multilinea />
        <Campo label="Misión" valor={d.mision} multilinea />
        <Campo label="Visión" valor={d.vision} multilinea />
      </Seccion>

      {(d.principios?.length > 0 || d.valores?.length > 0) && (
        <Seccion numero="3.8" titulo="Principios y Valores Institucionales">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '8px' }}>Principios</div>
              <ListaItems items={d.principios || []} />
            </div>
            <div>
              <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '8px' }}>Valores</div>
              <ListaItems items={d.valores || []} />
            </div>
          </div>
        </Seccion>
      )}

      {d.politicas_operacion?.length > 0 && (
        <Seccion numero="3.9" titulo="Políticas de Operación">
          {d.politicas_operacion.map((pol, i) => (
            <div key={i} style={{
              marginBottom: '12px', padding: '12px 16px',
              background: '#fdf8f9', borderRadius: '8px',
              borderLeft: '3px solid #fecdd3'
            }}>
              <div style={{ fontSize: '.75rem', fontWeight: '700', color: '#be123c', marginBottom: '4px' }}>
                {String.fromCharCode(65 + i)}. {pol.area || 'Sin nombre'}
              </div>
              <div style={{ fontSize: '.82rem', color: '#2d1520', lineHeight: '1.6' }}>{pol.descripcion}</div>
            </div>
          ))}
        </Seccion>
      )}

      {d.marco_conceptual?.length > 0 && (
        <Seccion numero="3.10" titulo="Marco Conceptual">
          <TablaSimple
            columnas={['Término', 'Definición']}
            filas={d.marco_conceptual.map(c => [c.termino, c.definicion])}
          />
        </Seccion>
      )}

      {/* Capítulo II */}
      {d.inventario_puestos?.length > 0 && (
        <Seccion numero="4.3" titulo="Inventario de Puestos">
          <TablaSimple
            columnas={['#', 'Puesto / Cargo', 'No. Personas']}
            filas={d.inventario_puestos.map((p, i) => [i + 1, p.nombre_puesto, p.num_personas])}
          />
        </Seccion>
      )}

      {d.puestos?.length > 0 && (
        <Seccion numero="4.4" titulo="Descripción de Puestos">
          {d.puestos.map((p, i) => (
            <div key={i} style={{
              border: '1.5px solid #f0dde0', borderRadius: '10px',
              marginBottom: '16px', overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px', background: 'linear-gradient(135deg, #fff5f6, #fdf0f2)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{
                  background: '#e11d48', color: 'white', borderRadius: '6px',
                  padding: '2px 8px', fontSize: '.7rem', fontWeight: '700'
                }}>4.4.{i + 1}</span>
                <span style={{ fontWeight: '700', color: '#1a0a0f', fontSize: '.88rem' }}>{p.nombre_puesto || `Puesto ${i + 1}`}</span>
                {p.jefe_inmediato && (
                  <span style={{ fontSize: '.72rem', color: '#a78a8f', marginLeft: '4px' }}>
                    Reporta a: {p.jefe_inmediato}
                  </span>
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <Campo label="Objetivo del Puesto" valor={p.objetivo_puesto} multilinea />
                {p.funciones_propias?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '6px' }}>Funciones Propias</div>
                    <ListaItems items={p.funciones_propias} />
                  </div>
                )}
                {p.escolaridad && (
                  <Campo label="Escolaridad Requerida" valor={p.escolaridad} />
                )}
                {p.experiencia && (
                  <Campo label="Experiencia" valor={p.experiencia} multilinea />
                )}
              </div>
            </div>
          ))}
        </Seccion>
      )}

      {d.cambios?.length > 0 && (
        <Seccion numero="4.5" titulo="Sección de Cambios">
          <TablaSimple
            columnas={['Rev. Anterior', 'Rev. Actual', 'Razón de Modificación', 'Fecha']}
            filas={d.cambios.map(c => [c.revision_anterior, c.revision_actual, c.razon, c.fecha])}
          />
        </Seccion>
      )}
    </div>
  )
}

function VisorProcedimientos({ datos }) {
  const d = datos || {}
  const [diagramaIdx, setDiagramaIdx] = useState(null)

  return (
    <div>
      <Seccion numero="01" titulo="Datos Generales">
        <CampoGrid campos={[
          { label: 'Código', valor: d.codigo },
          { label: 'Dependencia', valor: d.dependencia },
          { label: 'Versión', valor: d.version },
          { label: 'Fecha de Elaboración', valor: d.fecha_elaboracion },
          { label: 'Titular', valor: d.titular },
          { label: 'Cargo', valor: d.cargo_titular },
        ]} />
      </Seccion>

      <Seccion numero="3.1" titulo="Introducción">
        <Campo valor={d.introduccion} multilinea />
      </Seccion>

      <Seccion numero="3.2" titulo="Antecedentes">
        <Campo valor={d.antecedentes} multilinea />
      </Seccion>

      {d.marco_normativo?.length > 0 && (
        <Seccion numero="3.3" titulo="Marco Normativo">
          <TablaSimple
            columnas={['#', 'Normatividad', 'Fecha', 'Medio']}
            filas={d.marco_normativo.map((n, i) => [i + 1, n.nombre, n.fecha, n.medio])}
          />
        </Seccion>
      )}

      <Seccion numero="3.4 – 3.7" titulo="Atribuciones, Objetivo, Misión y Visión">
        <Campo label="Atribuciones" valor={d.atribuciones} multilinea />
        <Campo label="Objetivo General" valor={d.objetivo_general} multilinea />
        <Campo label="Misión" valor={d.mision} multilinea />
        <Campo label="Visión" valor={d.vision} multilinea />
      </Seccion>

      {d.marco_conceptual?.length > 0 && (
        <Seccion numero="3.10" titulo="Marco Conceptual">
          <TablaSimple
            columnas={['Término', 'Definición']}
            filas={d.marco_conceptual.map(c => [c.termino, c.definicion])}
          />
        </Seccion>
      )}

      {d.procedimientos?.length > 0 && (
        <Seccion numero="04" titulo="Procedimientos">
          {d.procedimientos.map((p, i) => (
            <div key={i} style={{ border: '1.5px solid #e0e7ef', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ background: '#2563eb', color: 'white', borderRadius: '6px', padding: '2px 8px', fontSize: '.7rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {p.codigo || `P-${i + 1}`}
                </span>
                <span style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '.88rem' }}>
                  {p.nombre || `Procedimiento ${i + 1}`}
                </span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                {(p.elaboro_nombre || p.reviso_nombre || p.autorizo_nombre || p.valido_nombre) && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '8px' }}>
                      Caratula de Autorizaciones
                    </div>
                    <CampoGrid campos={[
                      { label: 'Elaboró', valor: p.elaboro_nombre },
                      { label: 'Revisó', valor: p.reviso_nombre },
                      { label: 'Autorizó', valor: p.autorizo_nombre },
                      { label: 'Validó', valor: p.valido_nombre },
                    ]} />
                  </div>
                )}
                <Campo label="Objetivo" valor={p.objetivo} multilinea />
                <Campo label="Alcance" valor={p.alcance} multilinea />
                <Campo label="Responsabilidades" valor={p.responsabilidades} multilinea />
                <Campo label="Definiciones" valor={p.definiciones} multilinea />
                {p.actividades?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '8px' }}>
                      Actividades ({p.actividades.length} pasos)
                    </div>
                    <TablaSimple
                      columnas={['Paso', 'Responsable', 'Descripción']}
                      filas={p.actividades.map((a, j) => [j + 1, a.responsable, a.descripcion])}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 4px' }}>
                      <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8' }}>
                        Diagrama de Flujo
                      </div>
                      <button
                        onClick={() => setDiagramaIdx(i)}
                        style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 6, padding: '4px 10px', fontSize: '.75rem', fontWeight: '600', color: '#0369a1', cursor: 'pointer' }}
                      >
                        ⛶ Ver completo
                      </button>
                    </div>
                    <DiagramaFlujo actividades={p.actividades} />
                  </div>
                )}
              </div>
                  <Campo label="6. Referencia del Documento" valor={p.referencias} multilinea />
                  <Campo label="7. Registros" valor={p.registros} multilinea />
            </div>
          ))}
        </Seccion>
      )}

      {/* Modal fullscreen diagrama */}
      {diagramaIdx !== null && d.procedimientos?.[diagramaIdx] && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex' }}>
          <div style={{ background: '#fff', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontWeight: '700', fontSize: '.95rem', color: '#1e293b' }}>
                Diagrama de Flujo — {d.procedimientos[diagramaIdx].nombre || `Procedimiento ${diagramaIdx + 1}`}
              </span>
              <button
                onClick={() => setDiagramaIdx(null)}
                style={{ background: '#e11d48', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: '700' }}
              >
                ✕ Cerrar
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#fafafa', display: 'flex', justifyContent: 'center' }}>
              <div><DiagramaFlujo actividades={d.procedimientos[diagramaIdx].actividades} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VisorManual({ manual, onCerrar, onActualizado }) {
  const [datosExtra, setDatosExtra] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [verPDF, setVerPDF] = useState(false)
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'administrador'

  const [editCodigo, setEditCodigo]   = useState('')
  const [editVersion, setEditVersion] = useState('')
  const [guardando, setGuardando]     = useState(false)
  const [guardado, setGuardado]       = useState(false)

  useEffect(() => {
    const fetchDetalle = async () => {
      setCargando(true)
      try {
        const res = await axios.get(`http://localhost:3000/manuales/${manual.id_manual}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDatosExtra(res.data)
        setEditCodigo(res.data.codigo || '')
        setEditVersion(res.data.version ? String(res.data.version).padStart(2, '0') : '01')
      } catch {
        setDatosExtra(manual)
        setEditCodigo(manual.codigo || '')
        setEditVersion(manual.version ? String(manual.version).padStart(2, '0') : '01')
      } finally {
        setCargando(false)
      }
    }
    fetchDetalle()
  }, [manual.id_manual])

  const guardarCodigo = async () => {
    if (!editCodigo.trim() || guardando) return
    setGuardando(true)
    try {
      await axios.patch(
        `http://localhost:3000/manuales/${manual.id_manual}/codigo`,
        { codigo: editCodigo.trim(), version: editVersion },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
      if (onActualizado) onActualizado()
    } catch {
      alert('Error al guardar el código')
    } finally {
      setGuardando(false)
    }
  }

  const datos = datosExtra || manual
  const esOrg = manual.tipo_manual === 'organizacion'

  return (
    <>
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,10,15,.6)',
      backdropFilter: 'blur(6px)',
      zIndex: 400,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '18px',
        width: '92%', maxWidth: '860px', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 80px rgba(26,10,15,.3)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid #faf0f2',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'white', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: esOrg
                ? 'linear-gradient(135deg, #fdf2f3, #fce7f3)'
                : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {esOrg ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              )}
            </div>
            <div>
              {esAdmin && manual.estado === 'en_revision' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      value={editCodigo}
                      onChange={e => setEditCodigo(e.target.value)}
                      placeholder="Código del manual"
                      style={{
                        padding: '5px 10px', border: '1.5px solid #fecdd3', borderRadius: '7px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '.88rem', fontWeight: '700',
                        color: '#1a0a0f', outline: 'none', width: '200px'
                      }}
                      onFocus={e => e.target.style.borderColor = '#e11d48'}
                      onBlur={e => e.target.style.borderColor = '#fecdd3'}
                    />
                    <input
                      value={editVersion}
                      onChange={e => setEditVersion(e.target.value)}
                      placeholder="Versión"
                      style={{
                        padding: '5px 10px', border: '1.5px solid #fecdd3', borderRadius: '7px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '.88rem', fontWeight: '700',
                        color: '#1a0a0f', outline: 'none', width: '80px'
                      }}
                      onFocus={e => e.target.style.borderColor = '#e11d48'}
                      onBlur={e => e.target.style.borderColor = '#fecdd3'}
                    />
                    <button
                      onClick={guardarCodigo}
                      disabled={!editCodigo.trim() || guardando}
                      style={{
                        padding: '5px 14px', borderRadius: '7px', border: 'none',
                        background: guardado ? '#059669' : '#e11d48',
                        color: 'white', fontFamily: 'Poppins, sans-serif',
                        fontSize: '.75rem', fontWeight: '600', cursor: 'pointer',
                        transition: 'background .3s'
                      }}
                    >
                      {guardado ? '✓ Guardado' : guardando ? '...' : 'Guardar'}
                    </button>
                  </div>
                  <div style={{ fontSize: '.74rem', color: '#b06070' }}>
                    {esOrg ? 'Manual de Organización' : 'Manual de Procedimientos'} · {manual.dependencia}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1a0a0f', letterSpacing: '-.2px' }}>
                    {manual.codigo || 'Sin código'} — {esOrg ? 'Manual de Organización' : 'Manual de Procedimientos'}
                  </div>
                  <div style={{ fontSize: '.74rem', color: '#b06070', marginTop: '2px' }}>
                    {manual.dependencia} · Creado por {manual.creado_por_nombre}
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onCerrar}
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1.5px solid #fecdd3', background: 'white',
              color: '#b06070', cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s', flexShrink: 0
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#fb7185' }}
            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fecdd3' }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <BannerEstado estado={manual.estado} />

          {cargando ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '60px', gap: '14px'
            }}>
              <div style={{
                width: '36px', height: '36px', border: '3px solid #fecdd3',
                borderTopColor: '#e11d48', borderRadius: '50%',
                animation: 'spin .8s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ color: '#b06070', fontSize: '.82rem' }}>Cargando avances del manual...</p>
            </div>
          ) : esOrg ? (
            <VisorOrganizacion datos={datos} />
          ) : (
            <VisorProcedimientos datos={datos} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 28px', borderTop: '1px solid #faf0f2',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fdf8f9', flexShrink: 0
        }}>
          <span style={{ fontSize: '.73rem', color: '#c9a0a8' }}>
            Vista de solo lectura — Administrador IMDAI
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!cargando && (
              <button
                onClick={() => setVerPDF(true)}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  border: esOrg ? '1.5px solid #e11d48' : '1.5px solid #4a1455',
                  background: esOrg ? '#e11d48' : '#4a1455',
                  color: 'white', fontFamily: 'Poppins, sans-serif',
                  fontSize: '.78rem', fontWeight: '600', cursor: 'pointer',
                  transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
                onMouseOver={e => e.currentTarget.style.background = esOrg ? '#be123c' : '#3a0f42'}
                onMouseOut={e => e.currentTarget.style.background = esOrg ? '#e11d48' : '#4a1455'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Generar PDF
              </button>
            )}
            <button
              onClick={onCerrar}
              style={{
                padding: '8px 20px', borderRadius: '8px',
                border: '1.5px solid #fecdd3', background: 'white',
                color: '#7a3a4a', fontFamily: 'Poppins, sans-serif',
                fontSize: '.78rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all .2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#fff1f2'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>

    {/* Generador de PDF — organización usa GeneradorPDFManual; procedimientos usa el layout institucional */}
    {verPDF && (
      esOrg ? (
        <GeneradorPDFManual
          datos={datos}
          onCerrar={() => setVerPDF(false)}
        />
      ) : (
        <GeneradorPDFProcedimientos
          datos={datos}
          onCerrar={() => setVerPDF(false)}
        />
      )
    )}
  </>
  )
}