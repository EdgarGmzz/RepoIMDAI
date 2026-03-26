export default function OrgPaso3Organizacion({ datos, actualizar }) {

  // ── Organigramas específicos ───────────────────────────────────────────────
  const agregarOrgEspecifico = () =>
    actualizar({ organigramas_especificos: [...datos.organigramas_especificos, { nombre: '', archivo: null }] })
  const actualizarOrgEsp = (i, campo, val) => {
    const o = [...datos.organigramas_especificos]; o[i] = { ...o[i], [campo]: val }
    actualizar({ organigramas_especificos: o })
  }
  const eliminarOrgEsp = (i) =>
    actualizar({ organigramas_especificos: datos.organigramas_especificos.filter((_, idx) => idx !== i) })

  // ── Inventario de Puestos ──────────────────────────────────────────────────
  const agregarPuesto = () =>
    actualizar({ inventario_puestos: [...datos.inventario_puestos, { nombre_puesto: '', num_personas: '' }] })
  const actualizarPuesto = (i, campo, val) => {
    const p = [...datos.inventario_puestos]; p[i] = { ...p[i], [campo]: val }
    actualizar({ inventario_puestos: p })
  }
  const eliminarPuesto = (i) =>
    actualizar({ inventario_puestos: datos.inventario_puestos.filter((_, idx) => idx !== i) })

  const uploadStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '28px', border: '2px dashed #fecdd3', borderRadius: '12px',
    cursor: 'pointer', background: '#fdf8f9', transition: 'all .2s', textAlign: 'center'
  }

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Capítulo II — Organización</h3>
      <p className="paso-sub">Estructura orgánica e inventario de puestos de la dependencia</p>

      {/* 4.1 Organigrama General */}
      <div className="campo-grupo">
        <label>4.1 Organigrama General</label>
        <p style={{ fontSize: '.75rem', color: '#a78a8f', marginBottom: '10px', marginTop: '-4px' }}>
          Representación gráfica de la estructura orgánica general, validada por la ley o reglamento correspondiente.
        </p>
        <div
          style={uploadStyle}
          onClick={() => document.getElementById('org-general-upload').click()}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.background = '#fff5f6' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.background = '#fdf8f9' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="1.5">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          {datos.organigrama_general ? (
            <>
              <p style={{ color: '#059669', fontWeight: '600', marginTop: '8px' }}>
                ✓ {datos.organigrama_general instanceof File
                  ? datos.organigrama_general.name
                  : 'Organigrama guardado'}
              </p>
              <p style={{ color: '#a78a8f', fontSize: '.72rem', marginTop: '2px' }}>Clic para reemplazar</p>
            </>
          ) : (
            <>
              <p style={{ color: '#7a3a4a', fontWeight: '600', marginTop: '8px' }}>Haz clic para cargar el organigrama general</p>
              <p style={{ color: '#a78a8f', fontSize: '.73rem', marginTop: '4px' }}>PNG, JPG, PDF — Máx. 10 MB</p>
            </>
          )}
          <input
            id="org-general-upload"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            style={{ display: 'none' }}
            onChange={e => actualizar({ organigrama_general: e.target.files[0] || null })}
          />
        </div>
      </div>

      {/* 4.2 Organigramas Específicos */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>4.2 Organigramas Específicos</label>
          <button className="btn-agregar" onClick={agregarOrgEspecifico}>+ Agregar</button>
        </div>
        <p style={{ fontSize: '.75rem', color: '#a78a8f', marginBottom: '10px', marginTop: '-4px' }}>
          Representación gráfica de cada área en particular. Agrega uno por cada unidad de tu estructura.
        </p>
        {datos.organigramas_especificos.length === 0 && (
          <p className="campo-vacio">Sin organigramas específicos. Haz clic en + Agregar.</p>
        )}
        {datos.organigramas_especificos.map((org, i) => (
          <div key={i} style={{
            padding: '14px', background: '#fdf8f9',
            borderRadius: '10px', border: '1.5px solid #f5e8ea', marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <span className="item-num">{i + 1}</span>
              <input
                placeholder="Nombre del área u organigrama específico"
                value={org.nombre}
                onChange={e => actualizarOrgEsp(i, 'nombre', e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '7px', fontFamily: 'Poppins, sans-serif', fontSize: '.82rem',
                  outline: 'none', background: 'white'
                }}
              />
              <button className="btn-eliminar" onClick={() => eliminarOrgEsp(i)}>✕</button>
            </div>
            <div
              style={{ ...uploadStyle, padding: '16px' }}
              onClick={() => document.getElementById(`org-esp-${i}`).click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.background = '#fff5f6' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.background = '#fdf8f9' }}
            >
              {org.archivo ? (
                <p style={{ color: '#059669', fontWeight: '600', fontSize: '.8rem' }}>
                  ✓ {org.archivo instanceof File ? org.archivo.name : 'Organigrama guardado'}
                </p>
              ) : org.ruta_archivo ? (
                <>
                  <p style={{ color: '#059669', fontWeight: '600', fontSize: '.8rem' }}>✓ Organigrama guardado</p>
                  <p style={{ color: '#a78a8f', fontSize: '.72rem', marginTop: '2px' }}>Clic para reemplazar</p>
                </>
              ) : (
                <p style={{ color: '#a78a8f', fontSize: '.75rem' }}>Clic para cargar archivo (PNG, JPG, PDF)</p>
              )}
              <input
                id={`org-esp-${i}`}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                style={{ display: 'none' }}
                onChange={e => actualizarOrgEsp(i, 'archivo', e.target.files[0] || null)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 4.3 Inventario de Puestos */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>4.3 Inventario de Puestos</label>
          <button className="btn-agregar" onClick={agregarPuesto}>+ Agregar Puesto</button>
        </div>
        <p style={{ fontSize: '.75rem', color: '#a78a8f', marginBottom: '10px', marginTop: '-4px' }}>
          Lista los puestos en orden jerárquico de la estructura orgánica. El número de personas en el cargo es editable.
        </p>

        {datos.inventario_puestos.length === 0 && (
          <p className="campo-vacio">Sin puestos agregados. Los puestos deben ir en orden jerárquico.</p>
        )}

        {datos.inventario_puestos.length > 0 && (
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Núm.</th>
                <th>Nombre del Puesto / Cargo</th>
                <th style={{ width: '150px' }}>No. de Personas</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {datos.inventario_puestos.map((p, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center', fontWeight: '600', color: '#e11d48' }}>{i + 1}</td>
                  <td>
                    <input
                      placeholder="Nombre del puesto o cargo"
                      value={p.nombre_puesto}
                      onChange={e => actualizarPuesto(i, 'nombre_puesto', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      placeholder="##"
                      value={p.num_personas}
                      onChange={e => actualizarPuesto(i, 'num_personas', e.target.value)}
                      style={{ textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <button className="btn-eliminar" onClick={() => eliminarPuesto(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
