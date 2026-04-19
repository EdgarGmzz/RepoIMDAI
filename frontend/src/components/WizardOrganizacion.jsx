import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import OrgPaso1DatosGenerales from './org-pasos/OrgPaso1DatosGenerales'
import OrgPaso2CapituloI from './org-pasos/OrgPaso2CapituloI'
import OrgPaso3Organizacion from './org-pasos/OrgPaso3Organizacion'
import OrgPaso4Puestos from './org-pasos/OrgPaso4Puestos'
import OrgPaso5Revision from './org-pasos/OrgPaso5Revision'
import { validarOrganizacion } from '../utils/validarOrganizacion'

const pasos = [
  { numero: 1, titulo: 'Datos Generales' },
  { numero: 2, titulo: 'Cap. I — Generales' },
  { numero: 3, titulo: 'Cap. II — Organización' },
  { numero: 4, titulo: 'Descripción Puestos' },
  { numero: 5, titulo: 'Revisión' },
]

const datosVacios = {
  dependencia: '',
  codigo: '',
  fecha_elaboracion: '',
  version: '01',
  elaboro_nombre: '',
  elaboro_cargo: '',
  reviso_nombre: '',
  reviso_cargo: '',
  autorizo_nombre: '',
  autorizo_cargo: '',
  valido_nombre: '',
  valido_cargo: '',
  introduccion: '',
  superior_nombre: '',
  superior_cargo: '',
  antecedentes: '',
  marco_normativo: [],
  atribuciones: '',
  objetivo_general: '',
  mision: '',
  vision: '',
  principios: [],
  valores: [],
  politicas_operacion: [],
  marco_conceptual: [],
  organigrama_general: null,
  organigramas_especificos: [],
  inventario_puestos: [],
  puestos: [],
  cambios: [],
}

const puestoVacio = () => ({
  nombre_puesto: '', jefe_inmediato: '', objetivo_puesto: '',
  subordinados_directos: [], subordinados_indirectos: [],
  funciones_institucionales: [], funciones_propias: [],
  escolaridad: '', carreras_afines: '', especialidad: '',
  idiomas: [], programas_informaticos: [], equipo_herramientas: [],
  experiencia: '',
  habilidades_directivas: [], habilidades_tecnicas: [], habilidades_generales: [],
  actitudes: [], horario_laboral: '',
  manejo_informacion: '', nivel_informacion: '',
  manejo_presupuesto: '', nivel_presupuesto: '',
  autoridad: [], indicador_desempeno: [],
  ocupante_nombre: '', ocupante_cargo: '', ocupante_fecha: '',
  jefe_firma_nombre: '', jefe_firma_cargo: '', jefe_firma_fecha: '',
})


// Convierte cualquier valor de fecha a string YYYY-MM-DD para inputs type="date"
const toDateStr = (val) => {
  if (!val) return ''
  if (typeof val === 'string') return val.split('T')[0]
  if (val instanceof Date) return val.toISOString().split('T')[0]
  return ''
}

export default function WizardOrganizacion({ onCancelar, onGuardado, manualEditar = null }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [erroresValidacion, setErroresValidacion] = useState([])
  const token = localStorage.getItem('token')

  const modoEdicion = !!manualEditar
  const [datos, setDatos] = useState(datosVacios)

  useEffect(() => {
    if (!manualEditar) return
    const fetchDetalle = async () => {
      setCargando(true)
      try {
        const res = await axios.get(`http://localhost:3000/manuales/${manualEditar.id_manual}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const d = res.data

        setDatos({
          dependencia:         d.dependencia        || '',
          codigo:              d.codigo             || '',
          // ── Fechas ─────────────────────────────────────────────────────
          fecha_elaboracion:   toDateStr(d.fecha_elaboracion),
          // ── Versión: número a string con padding ────────────────────────
          version:             d.version != null
                                 ? String(d.version).padStart(2, '0')
                                 : '01',
          elaboro_nombre:      d.elaboro_nombre     || '',
          elaboro_cargo:       d.elaboro_cargo      || '',
          reviso_nombre:       d.reviso_nombre      || '',
          reviso_cargo:        d.reviso_cargo       || '',
          autorizo_nombre:     d.autorizo_nombre    || '',
          autorizo_cargo:      d.autorizo_cargo     || '',
          valido_nombre:       d.valido_nombre      || '',
          valido_cargo:        d.valido_cargo       || '',
          introduccion:        d.introduccion       || '',
          superior_nombre:     d.superior_nombre    || '',
          superior_cargo:      d.superior_cargo     || '',
          antecedentes:        d.antecedentes       || '',
          atribuciones:        d.atribuciones       || '',
          objetivo_general:    d.objetivo_general   || '',
          mision:              d.mision             || '',
          vision:              d.vision             || '',
          principios:          d.principios         || [],
          valores:             d.valores            || [],
          politicas_operacion: (d.politicas_operacion || []).map(p => ({
            area:        p.area        || '',
            descripcion: p.descripcion || '',
          })),
          marco_conceptual: (d.marco_conceptual || []).map(c => ({
            termino:    c.termino    || '',
            definicion: c.definicion || '',
          })),
          // ── Marco normativo: normalizar fechas ──────────────────────────
          marco_normativo: (d.marco_normativo || []).map(n => ({
            nombre: n.nombre || '',
            fecha:  toDateStr(n.fecha),
            medio:  n.medio  || '',
          })),
          organigrama_general: d.organigrama_general
            ? { ruta_archivo: d.organigrama_general.ruta_archivo, name: 'Organigrama guardado' }
            : null,
          organigramas_especificos: (d.organigramas_especificos || []).map(o => ({
            nombre:       o.tipo         || '',
            archivo:      null,
            ruta_archivo: o.ruta_archivo || '',
          })),
          // ── Inventario y puestos ─────────────────────────────────────────
          inventario_puestos: (d.inventario_puestos || []).map(p => ({
            nombre_puesto: p.nombre_puesto || '',
            num_personas:  p.num_personas  || '',
          })),
          puestos: (d.puestos || []).map(p => ({
            ...puestoVacio(),
            nombre_puesto:             p.nombre_puesto             || '',
            jefe_inmediato:            p.jefe_inmediato            || '',
            objetivo_puesto:           p.objetivo_puesto           || '',
            subordinados_directos:     p.subordinados_directos     || [],
            subordinados_indirectos:   p.subordinados_indirectos   || [],
            funciones_institucionales: p.funciones_institucionales || [],
            funciones_propias:         p.funciones_propias         || [],
            escolaridad:               p.escolaridad               || '',
            carreras_afines:           p.carreras_afines           || '',
            especialidad:              p.especialidad              || '',
            idiomas:                   p.idiomas                   || [],
            programas_informaticos:    p.programas_informaticos    || [],
            equipo_herramientas:       p.equipo_herramientas       || [],
            experiencia:               p.experiencia               || '',
            habilidades_directivas:    p.habilidades_directivas    || [],
            habilidades_tecnicas:      p.habilidades_tecnicas      || [],
            habilidades_generales:     p.habilidades_generales     || [],
            actitudes:                 p.actitudes                 || [],
            horario_laboral:           p.horario_laboral           || '',
            manejo_informacion:        p.manejo_informacion        || '',
            nivel_informacion:         p.nivel_informacion         || '',
            manejo_presupuesto:        p.manejo_presupuesto        || '',
            nivel_presupuesto:         p.nivel_presupuesto         || '',
            autoridad:                 p.autoridad                 || [],
            indicador_desempeno:       p.indicador_desempeno       || [],
            ocupante_nombre:           p.ocupante_nombre           || '',
            ocupante_cargo:            p.ocupante_cargo            || '',
            ocupante_fecha:            toDateStr(p.ocupante_fecha),
            jefe_firma_nombre:         p.jefe_firma_nombre         || '',
            jefe_firma_cargo:          p.jefe_firma_cargo          || '',
            jefe_firma_fecha:          toDateStr(p.jefe_firma_fecha),
          })),
          // ── Sección de cambios ───────────────────────────────────────────
          cambios: (d.cambios || []).map(c => ({
            revision_anterior: c.revision_anterior || '',
            revision_actual:   c.revision_actual   || '',
            razon:             c.razon             || '',
            fecha:             toDateStr(c.fecha),
          })),
        })
      } catch {
        setError('No se pudo cargar el manual. Intenta de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    fetchDetalle()
  }, [manualEditar])

  const actualizar = (nuevos) => setDatos(prev => ({ ...prev, ...nuevos }))
  const siguiente  = () => setPasoActual(p => Math.min(p + 1, pasos.length))
  const anterior   = () => setPasoActual(p => Math.max(p - 1, 1))

  // Campos pendientes — solo informativo, no bloquea el guardado
  const camposPendientes = useMemo(() => validarOrganizacion(datos), [datos])

  const subirOrganigramas = async (id_manual) => {
    const headers = { Authorization: `Bearer ${token}` }

    if (datos.organigrama_general instanceof File) {
      const fd = new FormData()
      fd.append('archivo', datos.organigrama_general)
      fd.append('tipo', 'general')
      await axios.post(`http://localhost:3000/manuales/${id_manual}/organigrama`, fd, { headers })
    }

    for (const org of datos.organigramas_especificos) {
      if (org.archivo instanceof File) {
        const fd = new FormData()
        fd.append('archivo', org.archivo)
        fd.append('tipo', org.nombre || 'especifico')
        await axios.post(`http://localhost:3000/manuales/${id_manual}/organigrama`, fd, { headers })
      }
    }
  }

  const guardar = async () => {
    setErroresValidacion([])
    setGuardando(true)
    setError('')
    try {
      const payload = { ...datos, tipo_manual: 'organizacion' }
      let id_manual

      if (modoEdicion) {
        await axios.put(
          `http://localhost:3000/manuales/${manualEditar.id_manual}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        id_manual = manualEditar.id_manual
      } else {
        const res = await axios.post('http://localhost:3000/manuales', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        id_manual = res.data.manual.id_manual
      }

      await subirOrganigramas(id_manual)
      onGuardado()
    } catch {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1: return <OrgPaso1DatosGenerales datos={datos} actualizar={actualizar} />
      case 2: return <OrgPaso2CapituloI      datos={datos} actualizar={actualizar} />
      case 3: return <OrgPaso3Organizacion   datos={datos} actualizar={actualizar} />
      case 4: return <OrgPaso4Puestos        datos={datos} actualizar={actualizar} />
      case 5: return <OrgPaso5Revision       datos={datos} actualizar={actualizar} />
      default: return null
    }
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-container" style={{ maxWidth: '920px' }}>

        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">
              {modoEdicion ? 'Editar Manual de Organización' : 'Nuevo Manual de Organización'}
            </h2>
            <p className="wizard-sub">
              {modoEdicion
                ? `Editando: ${manualEditar.codigo || 'Sin código'} — ${manualEditar.dependencia}`
                : 'Municipio de Benito Juárez — IMDAI'}
            </p>
          </div>
          <button className="wizard-close" onClick={onCancelar}>✕</button>
        </div>

        <div className="wizard-steps">
          {pasos.map((p) => (
            <div key={p.numero} className={`wizard-step ${pasoActual === p.numero ? 'active' : ''} ${pasoActual > p.numero ? 'done' : ''}`}>
              <div className="step-circle">
                {pasoActual > p.numero ? '✓' : p.numero}
              </div>
              <span className="step-label">{p.titulo}</span>
            </div>
          ))}
        </div>

        <div className="wizard-body">
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
              <p style={{ color: '#b06070', fontSize: '.82rem' }}>Cargando datos del manual...</p>
            </div>
          ) : renderPaso()}
        </div>

        <div className="wizard-footer">
          <button className="wizard-btn-secondary" onClick={anterior} disabled={pasoActual === 1}>
            Anterior
          </button>
          <span className="wizard-step-count">Paso {pasoActual} de {pasos.length}</span>
          {pasoActual < pasos.length ? (
            <button className="wizard-btn-primary" onClick={siguiente}>
              Siguiente
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', maxWidth: '500px' }}>
              {camposPendientes.length > 0 && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
                  padding: '10px 14px', fontSize: '.76rem', color: '#92400e', textAlign: 'left', width: '100%'
                }}>
                  <p style={{ fontWeight: 700, marginBottom: '6px' }}>
                    Puedes guardar el borrador, pero faltan {camposPendientes.length} campo{camposPendientes.length > 1 ? 's' : ''} para poder enviarlo a revisión:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.7' }}>
                    {camposPendientes.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              {error && <span style={{ fontSize: '.75rem', color: '#e11d48' }}>{error}</span>}
              <button className="wizard-btn-success" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Guardar Borrador'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
