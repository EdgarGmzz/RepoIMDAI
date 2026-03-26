import { useState } from 'react'

// ── Puesto vacío por defecto ───────────────────────────────────────────────
const nuevoPuesto = (nombre = '') => ({
  nombre_puesto: nombre,
  jefe_inmediato: '',
  objetivo_puesto: '',
  // Subordinados
  subordinados_directos: [],    // [{ num_personas, nombre_puesto }]
  subordinados_indirectos: [],  // [{ num_personas, nombre_puesto }]
  // Funciones
  funciones_institucionales: [],  // ['...']
  funciones_propias: [],          // ['...']
  // Perfil
  escolaridad: '',               // código '1'-'6'
  carreras_afines: '',           // 7. Licenciatura o carreras afines
  especialidad: '',              // 8. Área de especialidad requerida
  idiomas: [],                   // ['...']
  programas_informaticos: [],    // ['...']
  equipo_herramientas: [],       // ['...']
  experiencia: '',
  // Competencias laborales
  habilidades_directivas: [],    // ['...']
  habilidades_tecnicas: [],      // ['...']
  habilidades_generales: [],     // ['...']
  actitudes: [],                 // ['...']
  horario_laboral: '',
  // Responsabilidad
  manejo_informacion: '',
  nivel_informacion: '',         // 'alta'|'media'|'baja'|'nulo'
  manejo_presupuesto: '',
  nivel_presupuesto: '',
  // Autoridad e indicador
  autoridad: [],                 // ['...']
  indicador_desempeno: [],       // ['...']
  // Firma
  ocupante_nombre: '',
  ocupante_cargo: '',
  ocupante_fecha: '',
  jefe_firma_nombre: '',
  jefe_firma_cargo: '',
  jefe_firma_fecha: '',
})

const ESCOLARIDAD_OPTS = [
  { val: '1', label: '1. Primaria' },
  { val: '2', label: '2. Secundaria' },
  { val: '3', label: '3. Preparatoria o Técnica' },
  { val: '4', label: '4. Carrera Profesional no terminada (2 años)' },
  { val: '5', label: '5. Carrera profesional terminada' },
  { val: '6', label: '6. Postgrado' },
]

// ── Helper: lista dinámica simple ──────────────────────────────────────────
function ListaSimple({ items, onChange, placeholder }) {
  const add    = ()     => onChange([...items, ''])
  const remove = (i)   => onChange(items.filter((_, idx) => idx !== i))
  const update = (i,v) => { const n=[...items]; n[i]=v; onChange(n) }
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className="item-fila">
          <span className="item-num">{i + 1}</span>
          <input placeholder={placeholder} value={it} onChange={e => update(i, e.target.value)} />
          <button className="btn-eliminar" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="btn-agregar" onClick={add} style={{ marginTop: '6px' }}>+ Agregar</button>
    </div>
  )
}

// ── Helper: lista pares num/puesto (subordinados) ──────────────────────────
function ListaPares({ items, onChange }) {
  const add    = ()             => onChange([...items, { num_personas: '', nombre_puesto: '' }])
  const remove = (i)           => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, campo, v) => { const n=[...items]; n[i]={...n[i],[campo]:v}; onChange(n) }
  const total  = items.reduce((s, x) => s + (parseInt(x.num_personas) || 0), 0)

  return (
    <div>
      {items.length > 0 && (
        <table className="inv-table" style={{ marginBottom: '8px' }}>
          <thead>
            <tr>
              <th style={{ width: '120px' }}>No. Personas</th>
              <th>Nombre del Puesto</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>
                  <input type="number" min="1" placeholder="##"
                    value={it.num_personas}
                    onChange={e => update(i, 'num_personas', e.target.value)}
                    style={{ textAlign: 'center' }} />
                </td>
                <td>
                  <input placeholder="Nombre del puesto subordinado"
                    value={it.nombre_puesto}
                    onChange={e => update(i, 'nombre_puesto', e.target.value)} />
                </td>
                <td><button className="btn-eliminar" onClick={() => remove(i)}>✕</button></td>
              </tr>
            ))}
            <tr>
              <td style={{ textAlign: 'center', fontWeight: '700', color: '#e11d48' }}>{total}</td>
              <td style={{ fontWeight: '600', color: '#7a3a4a' }}>TOTAL</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      )}
      <button className="btn-agregar" onClick={add}>+ Agregar fila</button>
    </div>
  )
}

// ── Componente tarjeta de puesto ────────────────────────────────────────────
function TarjetaPuesto({ puesto, index, onChange, puestosDisponibles }) {
  const [seccion, setSeccion] = useState('info')
  const upd = (campo, val) => onChange({ ...puesto, [campo]: val })

  const secciones = [
    { id: 'info',          label: 'Info General' },
    { id: 'organigrama',   label: 'Organigrama' },
    { id: 'funciones',     label: 'Funciones' },
    { id: 'perfil',        label: 'Perfil' },
    { id: 'competencias',  label: 'Competencias' },
    { id: 'responsabilidad', label: 'Responsabilidad' },
    { id: 'autoridad',     label: 'Autoridad' },
  ]

  const inlineInput = (placeholder, value, onChange, type='text', extra={}) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '8px 12px', border: '1.5px solid #ffe4e6',
        borderRadius: '7px', fontFamily: 'Poppins, sans-serif',
        fontSize: '.82rem', outline: 'none', background: 'white', ...extra
      }}
    />
  )

  const inlineTextarea = (placeholder, value, onChange, rows=3) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      style={{
        width: '100%', padding: '8px 12px', border: '1.5px solid #ffe4e6',
        borderRadius: '7px', fontFamily: 'Poppins, sans-serif',
        fontSize: '.82rem', outline: 'none', resize: 'vertical', background: 'white'
      }}
    />
  )

  const renderSeccion = () => {
    switch (seccion) {

      case 'info': return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="campo-grupo">
              <label>Nombre del Puesto</label>
              {inlineInput('Ej. Director de Administración', puesto.nombre_puesto, v => upd('nombre_puesto', v))}
            </div>
            <div className="campo-grupo">
              <label>Jefe Inmediato</label>
              <input
                list={`jefes-${index}`}
                placeholder="Nombre del jefe inmediato..."
                value={puesto.jefe_inmediato}
                onChange={e => upd('jefe_inmediato', e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '7px', fontFamily: 'Poppins, sans-serif',
                  fontSize: '.82rem', outline: 'none', background: 'white'
                }}
              />
              <datalist id={`jefes-${index}`}>
                {puestosDisponibles.filter((_, i) => i !== index).map((p, i) => (
                  <option key={i} value={p.nombre_puesto} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="campo-grupo">
            <label>Objetivo General del Puesto</label>
            {inlineTextarea('Anota brevemente el objetivo o razón por la cual existe el puesto...', puesto.objetivo_puesto, v => upd('objetivo_puesto', v))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
            <div className="campo-grupo">
              <label>Subordinados Directos</label>
              <ListaPares items={puesto.subordinados_directos} onChange={v => upd('subordinados_directos', v)} />
            </div>
            <div className="campo-grupo">
              <label>Subordinados Indirectos</label>
              <ListaPares items={puesto.subordinados_indirectos} onChange={v => upd('subordinados_indirectos', v)} />
            </div>
          </div>
        </div>
      )

      case 'organigrama': return (
        <div>
          <p style={{ fontSize: '.75rem', color: '#7a3a4a', marginBottom: '16px' }}>
            Representación de la ubicación jerárquica del puesto dentro de la estructura organizacional.
          </p>
          {/* Jefe Inmediato */}
          {puesto.jefe_inmediato && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
              <div style={{
                padding: '10px 24px', background: '#f5e8ea', border: '1.5px solid #f0c0c8',
                borderRadius: '8px', fontSize: '.78rem', fontWeight: '600', color: '#5a2030', textAlign: 'center'
              }}>
                {puesto.jefe_inmediato}
              </div>
              <div style={{ width: '2px', height: '20px', background: '#f0c0c8' }} />
            </div>
          )}
          {/* Puesto actual */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #e11d48, #be123c)',
              borderRadius: '8px', fontSize: '.82rem', fontWeight: '700', color: 'white',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(225,29,72,.25)'
            }}>
              {puesto.nombre_puesto || 'Este puesto'}
            </div>
            {puesto.subordinados_directos.length > 0 && (
              <div style={{ width: '2px', height: '20px', background: '#f0c0c8' }} />
            )}
          </div>
          {/* Subordinados directos */}
          {puesto.subordinados_directos.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {puesto.subordinados_directos.map((sub, i) => (
                <div key={i} style={{
                  padding: '8px 18px', background: 'white', border: '1.5px solid #f0c0c8',
                  borderRadius: '8px', fontSize: '.75rem', color: '#5a2030', textAlign: 'center'
                }}>
                  {sub.nombre_puesto || `Subordinado ${i + 1}`}
                  {sub.num_personas && (
                    <div style={{ fontSize: '.68rem', color: '#a78a8f' }}>({sub.num_personas} persona{sub.num_personas > 1 ? 's' : ''})</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!puesto.jefe_inmediato && puesto.subordinados_directos.length === 0 && (
            <p style={{ textAlign: 'center', color: '#a78a8f', fontSize: '.78rem', marginTop: '12px' }}>
              Agrega el jefe inmediato y subordinados en "Info General" para visualizar el organigrama.
            </p>
          )}
        </div>
      )

      case 'funciones': return (
        <div>
          <div className="campo-grupo">
            <label>Funciones Institucionales</label>
            <p style={{ fontSize: '.72rem', color: '#a78a8f', marginBottom: '8px' }}>
              Funciones determinadas por la normativa aplicable.
            </p>
            <ListaSimple
              items={puesto.funciones_institucionales}
              onChange={v => upd('funciones_institucionales', v)}
              placeholder="Función institucional determinada por normativa..."
            />
          </div>
          <div className="campo-grupo" style={{ marginTop: '16px' }}>
            <label>Funciones Propias del Puesto</label>
            <ListaSimple
              items={puesto.funciones_propias}
              onChange={v => upd('funciones_propias', v)}
              placeholder="Función específica del puesto..."
            />
          </div>
        </div>
      )

      case 'perfil': return (
        <div>
          <div className="campo-grupo">
            <label>Escolaridad requerida</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {ESCOLARIDAD_OPTS.map(opt => (
                <label key={opt.val} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                  border: `1.5px solid ${puesto.escolaridad === opt.val ? '#e11d48' : '#f5e8ea'}`,
                  background: puesto.escolaridad === opt.val ? '#fff0f2' : 'white',
                  fontSize: '.75rem', fontWeight: puesto.escolaridad === opt.val ? '600' : '400',
                  color: puesto.escolaridad === opt.val ? '#be123c' : '#5a2030',
                  transition: 'all .15s'
                }}>
                  <input type="radio" name={`esc-${index}`} value={opt.val}
                    checked={puesto.escolaridad === opt.val}
                    onChange={() => upd('escolaridad', opt.val)}
                    style={{ accentColor: '#e11d48' }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div className="campo-grupo">
              <label>7. Licenciatura o carreras afines</label>
              {inlineInput('Ej. Administración Pública, Derecho, Contabilidad...', puesto.carreras_afines, v => upd('carreras_afines', v))}
            </div>
            <div className="campo-grupo">
              <label>8. Área de especialidad requerida (Conocimiento Técnico)</label>
              {inlineInput('Ej. Gestión de proyectos, Normatividad municipal...', puesto.especialidad, v => upd('especialidad', v))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="campo-grupo">
              <label>Idiomas / Lenguas requeridas</label>
              <ListaSimple items={puesto.idiomas} onChange={v => upd('idiomas', v)} placeholder="Ej. Inglés nivel intermedio..." />
            </div>
            <div className="campo-grupo">
              <label>Programas Informáticos</label>
              <ListaSimple items={puesto.programas_informaticos} onChange={v => upd('programas_informaticos', v)} placeholder="Ej. Microsoft Office, SAP..." />
            </div>
            <div className="campo-grupo">
              <label>Equipo / Herramientas Especializadas</label>
              <ListaSimple items={puesto.equipo_herramientas} onChange={v => upd('equipo_herramientas', v)} placeholder="Ej. GPS, equipo topográfico..." />
            </div>
            <div className="campo-grupo">
              <label>Experiencia requerida</label>
              {inlineTextarea('Años y tipo de experiencia requerida...', puesto.experiencia, v => upd('experiencia', v), 3)}
            </div>
          </div>

          <div className="campo-grupo">
            <label>Horario Laboral</label>
            {inlineInput('Ej. Lunes a Viernes de 8:00 a 15:00 horas', puesto.horario_laboral, v => upd('horario_laboral', v))}
          </div>
        </div>
      )

      case 'competencias': return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="campo-grupo">
              <label>Habilidades Directivas</label>
              <ListaSimple items={puesto.habilidades_directivas} onChange={v => upd('habilidades_directivas', v)} placeholder="Habilidad directiva..." />
            </div>
            <div className="campo-grupo">
              <label>Habilidades Técnicas</label>
              <ListaSimple items={puesto.habilidades_tecnicas} onChange={v => upd('habilidades_tecnicas', v)} placeholder="Habilidad técnica..." />
            </div>
            <div className="campo-grupo">
              <label>Habilidades Generales</label>
              <ListaSimple items={puesto.habilidades_generales} onChange={v => upd('habilidades_generales', v)} placeholder="Habilidad general..." />
            </div>
          </div>
          <div className="campo-grupo" style={{ marginTop: '12px' }}>
            <label>Actitudes requeridas</label>
            <ListaSimple items={puesto.actitudes} onChange={v => upd('actitudes', v)} placeholder="Actitud requerida..." />
          </div>
        </div>
      )

      case 'responsabilidad': return (
        <div>
          {/* Mobiliario — por default, solo texto informativo */}
          <div style={{
            padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px',
            border: '1px solid #bbf7d0', marginBottom: '16px', fontSize: '.78rem', color: '#14532d'
          }}>
            <strong>1. Mobiliario y Equipo:</strong> Es responsable de dar el uso para el que están destinados, así como procurar su conservación y oportuno mantenimiento.
          </div>

          <div className="campo-grupo">
            <label>2. Manejo de Información</label>
            {inlineInput('Indica la normatividad que aplica para el manejo de información...', puesto.manejo_informacion, v => upd('manejo_informacion', v))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {['Alta', 'Media', 'Baja', 'Nulo'].map(n => (
                <label key={n} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
                  border: `1.5px solid ${puesto.nivel_informacion === n.toLowerCase() ? '#e11d48' : '#f5e8ea'}`,
                  background: puesto.nivel_informacion === n.toLowerCase() ? '#fff0f2' : 'white',
                  fontSize: '.75rem', fontWeight: '500', color: '#5a2030'
                }}>
                  <input type="radio" name={`info-${index}`} value={n.toLowerCase()}
                    checked={puesto.nivel_informacion === n.toLowerCase()}
                    onChange={() => upd('nivel_informacion', n.toLowerCase())}
                    style={{ accentColor: '#e11d48' }} />
                  {n}
                </label>
              ))}
            </div>
          </div>

          <div className="campo-grupo">
            <label>3. Manejo de Presupuesto</label>
            {inlineInput('Indica la normatividad que aplica para el manejo de presupuesto...', puesto.manejo_presupuesto, v => upd('manejo_presupuesto', v))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {['Alta', 'Media', 'Baja', 'Nulo'].map(n => (
                <label key={n} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
                  border: `1.5px solid ${puesto.nivel_presupuesto === n.toLowerCase() ? '#e11d48' : '#f5e8ea'}`,
                  background: puesto.nivel_presupuesto === n.toLowerCase() ? '#fff0f2' : 'white',
                  fontSize: '.75rem', fontWeight: '500', color: '#5a2030'
                }}>
                  <input type="radio" name={`pres-${index}`} value={n.toLowerCase()}
                    checked={puesto.nivel_presupuesto === n.toLowerCase()}
                    onChange={() => upd('nivel_presupuesto', n.toLowerCase())}
                    style={{ accentColor: '#e11d48' }} />
                  {n}
                </label>
              ))}
            </div>
          </div>
        </div>
      )

      case 'autoridad': return (
        <div>
          <div className="campo-grupo">
            <label>Autoridad del Puesto</label>
            <ListaSimple items={puesto.autoridad} onChange={v => upd('autoridad', v)} placeholder="Autoridad determinada al puesto..." />
          </div>
          <div className="campo-grupo" style={{ marginTop: '16px' }}>
            <label>Indicador de Desempeño Profesional</label>
            <ListaSimple items={puesto.indicador_desempeno} onChange={v => upd('indicador_desempeno', v)} placeholder="Indicador de desempeño del puesto..." />
          </div>
          <div style={{
            marginTop: '16px', padding: '14px 16px', background: '#fdf8f9',
            borderRadius: '10px', border: '1px solid #f5e8ea', fontSize: '.78rem', color: '#5a2030', lineHeight: '1.7'
          }}>
            <strong>Compromiso Ético del Servidor Público:</strong>
            <p style={{ marginTop: '8px', marginBottom: '8px' }}>
              Me comprometo a desempeñar con ética, profesionalismo y responsabilidad las funciones del cargo público que represento, incorporando la perspectiva de género y un enfoque basado en los Derechos Humanos en beneficio de la ciudadanía benitojuarense.
            </p>
            <p style={{ margin: '0' }}>
              Con mis compañeras, compañeros y el personal a mi cargo, promuevo el trabajo en equipo a partir del respeto y el buen trato. Asimismo, me comprometo a cuidar y hacer un uso responsable de los bienes patrimoniales, conforme a lo establecido por las leyes y reglamentos vigentes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div className="campo-grupo">
              <label>Nombre del Ocupante del Puesto</label>
              {inlineInput('Nombre completo del servidor público', puesto.ocupante_nombre, v => upd('ocupante_nombre', v))}
            </div>
            <div className="campo-grupo">
              <label>Cargo del Ocupante del Puesto</label>
              {inlineInput('Cargo que desempeña...', puesto.ocupante_cargo, v => upd('ocupante_cargo', v))}
            </div>
            <div className="campo-grupo">
              <label>Fecha</label>
              <input type="date" value={puesto.ocupante_fecha}
                onChange={e => upd('ocupante_fecha', e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '7px', fontFamily: 'Poppins, sans-serif',
                  fontSize: '.82rem', outline: 'none', background: 'white'
                }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div className="campo-grupo">
              <label>Nombre del Jefe Inmediato</label>
              {inlineInput('Nombre completo del jefe inmediato', puesto.jefe_firma_nombre, v => upd('jefe_firma_nombre', v))}
            </div>
            <div className="campo-grupo">
              <label>Cargo del Jefe Inmediato</label>
              {inlineInput('Cargo que desempeña...', puesto.jefe_firma_cargo, v => upd('jefe_firma_cargo', v))}
            </div>
            <div className="campo-grupo">
              <label>Fecha</label>
              <input type="date" value={puesto.jefe_firma_fecha}
                onChange={e => upd('jefe_firma_fecha', e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '7px', fontFamily: 'Poppins, sans-serif',
                  fontSize: '.82rem', outline: 'none', background: 'white'
                }} />
            </div>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div style={{
      border: '1.5px solid #f0dde0', borderRadius: '12px',
      marginBottom: '16px', overflow: 'hidden'
    }}>
      {/* Header de la tarjeta */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #fff5f6, #fdf0f2)'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: 'linear-gradient(135deg, #f43f5e, #be123c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '.75rem', fontWeight: '700'
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.84rem', fontWeight: '700', color: '#1a0a0f' }}>
            {puesto.nombre_puesto || `Puesto ${index + 1}`}
          </div>
          {puesto.jefe_inmediato && (
            <div style={{ fontSize: '.7rem', color: '#a78a8f' }}>Jefe: {puesto.jefe_inmediato}</div>
          )}
        </div>
        <div style={{ fontSize: '.68rem', color: '#be123c', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          4.4.{index + 1}
        </div>
      </div>

      {/* Tabs de sección */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '1px solid #fdf0f2',
        background: 'white', overflowX: 'auto'
      }}>
        {secciones.map(s => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: '.72rem', fontWeight: '600',
              color: seccion === s.id ? '#e11d48' : '#a78a8f',
              background: 'white', whiteSpace: 'nowrap',
              borderBottom: seccion === s.id ? '2px solid #e11d48' : '2px solid transparent',
              transition: 'all .15s'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Contenido de sección */}
      <div style={{ padding: '18px' }}>
        {renderSeccion()}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OrgPaso4Puestos({ datos, actualizar }) {
  const [puestoActivo, setPuestoActivo] = useState(0)

  // Sincronizar puestos desde el inventario al iniciar
  const puestosDelInventario = datos.inventario_puestos || []

  // Agregar puestos que estén en inventario pero no en puestos aún
  const sincronizarPuestos = () => {
    const puestosActuales = datos.puestos.map(p => p.nombre_puesto)
    const puestosNuevos = puestosDelInventario
      .filter(p => p.nombre_puesto && !puestosActuales.includes(p.nombre_puesto))
      .map(p => nuevoPuesto(p.nombre_puesto))
    if (puestosNuevos.length > 0) {
      actualizar({ puestos: [...datos.puestos, ...puestosNuevos] })
    }
  }

  const agregarPuesto = () => {
    const nuevos = [...datos.puestos, nuevoPuesto()]
    actualizar({ puestos: nuevos })
    setPuestoActivo(nuevos.length - 1)
  }

  const eliminarPuesto = (i) => {
    const nuevos = datos.puestos.filter((_, idx) => idx !== i)
    actualizar({ puestos: nuevos })
    setPuestoActivo(Math.max(0, puestoActivo - 1))
  }

  const actualizarPuesto = (i, val) => {
    const nuevos = [...datos.puestos]; nuevos[i] = val; actualizar({ puestos: nuevos })
  }

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">4.4 Descripción de Puestos</h3>
      <p className="paso-sub">
        Información general, funciones, perfil y responsabilidades de cada puesto.
        {puestosDelInventario.length > 0 && datos.puestos.length === 0 && (
          <button
            onClick={sincronizarPuestos}
            style={{
              marginLeft: '12px', padding: '4px 12px', borderRadius: '6px',
              border: '1.5px solid #e11d48', background: '#fff0f2', color: '#be123c',
              fontFamily: 'Poppins, sans-serif', fontSize: '.72rem', fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ↓ Importar desde inventario
          </button>
        )}
      </p>

      {/* Tabs de puestos */}
      {datos.puestos.length > 0 && (
        <div className="proc-tabs" style={{ marginBottom: '16px' }}>
          {datos.puestos.map((p, i) => (
            <button
              key={i}
              className={`proc-tab ${puestoActivo === i ? 'active' : ''}`}
              onClick={() => setPuestoActivo(i)}
            >
              {p.nombre_puesto || `Puesto ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {datos.puestos.length === 0 ? (
        <p className="campo-vacio" style={{ marginTop: '20px', textAlign: 'center' }}>
          No hay puestos. Agrega uno manualmente o importa desde el inventario del Paso 3.
        </p>
      ) : (
        <TarjetaPuesto
          key={puestoActivo}
          puesto={datos.puestos[puestoActivo]}
          index={puestoActivo}
          onChange={val => actualizarPuesto(puestoActivo, val)}
          puestosDisponibles={datos.puestos}
        />
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button className="btn-agregar" onClick={agregarPuesto}>+ Agregar Puesto</button>
        {datos.puestos.length > 1 && (
          <button
            className="btn-eliminar"
            style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '.75rem', width: 'auto', height: 'auto' }}
            onClick={() => eliminarPuesto(puestoActivo)}
          >
            ✕ Eliminar este puesto
          </button>
        )}
      </div>
    </div>
  )
}
