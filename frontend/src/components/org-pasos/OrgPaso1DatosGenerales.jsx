export default function OrgPaso1DatosGenerales({ datos, actualizar }) {
  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Datos Generales del Manual</h3>
      <p className="paso-sub">Información de identificación, portada y carátula de autorizaciones</p>

      {/* Identificación */}
      <div className="campo-grupo">
        <label>Dependencia / Unidad Administrativa <span style={{ color: '#e11d48' }}>*</span></label>
        <input
          type="text"
          placeholder="Ej. Dirección de Administración"
          value={datos.dependencia}
          onChange={e => actualizar({ dependencia: e.target.value })}
        />
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Código del Manual <span style={{ color: '#e11d48' }}>*</span></label>
          <input
            type="text"
            placeholder="Ej. MO-ADM-2026-001"
            value={datos.codigo}
            onChange={e => actualizar({ codigo: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Versión</label>
          <input
            type="text"
            placeholder="Ej. 01"
            value={datos.version}
            onChange={e => actualizar({ version: e.target.value })}
          />
        </div>
      </div>

      <div className="campo-grupo">
        <label>Fecha de Elaboración</label>
        <input
          type="date"
          value={datos.fecha_elaboracion}
          onChange={e => actualizar({ fecha_elaboracion: e.target.value })}
        />
      </div>

      {/* Carátula de Autorizaciones */}
      <div style={{
        marginTop: '28px',
        padding: '16px 20px',
        background: '#fdf5f6',
        borderRadius: '10px',
        borderLeft: '3px solid #e11d48',
        marginBottom: '16px'
      }}>
        <p style={{ fontSize: '.72rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#be123c', marginBottom: '4px' }}>
          Carátula de Autorizaciones
        </p>
        <p style={{ fontSize: '.75rem', color: '#7a3a4a' }}>
          Servidor público que elabora, revisa, autoriza y valida el manual.
        </p>
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Elaboró — Nombre</label>
          <input
            type="text"
            placeholder="Titular de la dependencia o unidad administrativa"
            value={datos.elaboro_nombre}
            onChange={e => actualizar({ elaboro_nombre: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Elaboró — Cargo</label>
          <input
            type="text"
            placeholder="Cargo de la dependencia o unidad administrativa"
            value={datos.elaboro_cargo}
            onChange={e => actualizar({ elaboro_cargo: e.target.value })}
          />
        </div>
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Revisó — Nombre</label>
          <input
            type="text"
            placeholder="Titular de la dirección o área"
            value={datos.reviso_nombre}
            onChange={e => actualizar({ reviso_nombre: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Revisó — Cargo</label>
          <input
            type="text"
            placeholder="Cargo del revisor"
            value={datos.reviso_cargo}
            onChange={e => actualizar({ reviso_cargo: e.target.value })}
          />
        </div>
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Autorizó — Nombre</label>
          <input
            type="text"
            placeholder="Titular de la dependencia"
            value={datos.autorizo_nombre}
            onChange={e => actualizar({ autorizo_nombre: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Autorizó — Cargo</label>
          <input
            type="text"
            placeholder="Cargo del autorizante"
            value={datos.autorizo_cargo}
            onChange={e => actualizar({ autorizo_cargo: e.target.value })}
          />
        </div>
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Validó — Nombre (Titular IMDAI)</label>
          <input
            type="text"
            placeholder="Nombre del Titular del IMDAI"
            value={datos.valido_nombre}
            onChange={e => actualizar({ valido_nombre: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Validó — Cargo</label>
          <input
            type="text"
            placeholder="Director del IMDAI"
            value={datos.valido_cargo}
            onChange={e => actualizar({ valido_cargo: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
