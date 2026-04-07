export default function Paso1DatosGenerales({ datos, actualizar }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'administrador'

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Datos Generales del Manual</h3>
      <p className="paso-sub">Información básica de identificación del manual</p>

      <div className="campo-grupo">
        <label>Dependencia / Unidad Administrativa</label>
        <input
          type="text"
          placeholder="Ej. Dirección de Administración"
          value={datos.dependencia}
          onChange={e => actualizar({ dependencia: e.target.value })}
        />
      </div>

      <div className="campo-grupo">
        <label>Código del Manual</label>
        <input
          type="text"
          placeholder="Ej. P-001-2026"
          value={datos.codigo}
          onChange={e => actualizar({ codigo: e.target.value })}
          disabled={!esAdmin}
          style={!esAdmin ? { background: '#f5f0f1', color: '#a78a8f', cursor: 'not-allowed' } : {}}
        />
        {!esAdmin && (
          <p style={{ fontSize: '.7rem', color: '#b06070', marginTop: '4px' }}>
            Este campo solo puede ser editado por el administrador.
          </p>
        )}
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Fecha de Elaboración</label>
          <input
            type="date"
            value={datos.fecha_elaboracion || ''}
            onChange={e => actualizar({ fecha_elaboracion: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label>Versión</label>
          <input
            type="text"
            placeholder="Ej. 01"
            value={datos.version || ''}
            onChange={e => actualizar({ version: e.target.value })}
            disabled={!esAdmin}
            style={!esAdmin ? { background: '#f5f0f1', color: '#a78a8f', cursor: 'not-allowed' } : {}}
          />
          {!esAdmin && (
            <p style={{ fontSize: '.7rem', color: '#b06070', marginTop: '4px' }}>
              Este campo solo puede ser editado por el administrador.
            </p>
          )}
        </div>
      </div>

      <div className="campo-grupo">
        <label>Nombre del Titular de la Dependencia</label>
        <input
          type="text"
          placeholder="Nombre completo del titular"
          value={datos.titular || ''}
          onChange={e => actualizar({ titular: e.target.value })}
        />
      </div>

      <div className="campo-grupo">
        <label>Cargo del Titular</label>
        <input
          type="text"
          placeholder="Ej. Director General"
          value={datos.cargo_titular || ''}
          onChange={e => actualizar({ cargo_titular: e.target.value })}
        />
      </div>
    </div>
  )
}