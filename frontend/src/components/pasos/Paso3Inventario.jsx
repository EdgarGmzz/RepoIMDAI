export default function Paso3Inventario({ datos, actualizar }) {
  const agregarProcedimiento = () => {
    actualizar({
      procedimientos: [...datos.procedimientos, {
        codigo: '',
        version: '00',
        nombre: '',
        fecha_emision: '',
        objetivo: '',
        alcance: '',
        responsabilidades: '',
        definiciones: '',
        actividades: [],
        referencias: '',
        registros: '',
        diagrama: null
      }]
    })
  }

  const actualizarProcedimiento = (index, campo, valor) => {
    const nuevos = [...datos.procedimientos]
    nuevos[index][campo] = valor
    actualizar({ procedimientos: nuevos })
  }

  const eliminarProcedimiento = (index) => {
    actualizar({ procedimientos: datos.procedimientos.filter((_, i) => i !== index) })
  }

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Inventario de Procedimientos</h3>
      <p className="paso-sub">Lista todos los procedimientos que conforman este manual</p>

      <div className="campo-grupo">
        <div className="campo-header">
          <label>4.1 Procedimientos Administrativos</label>
          <button className="btn-agregar" onClick={agregarProcedimiento}>+ Agregar Procedimiento</button>
        </div>

        {datos.procedimientos.length === 0 && (
          <p className="campo-vacio">No hay procedimientos agregados. Haz clic en + Agregar Procedimiento.</p>
        )}

        {datos.procedimientos.length > 0 && (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Versión</th>
                <th>Nombre del Procedimiento</th>
                <th>Fecha Última Emisión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {datos.procedimientos.map((p, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="P-XXX-XXXX-XX"
                      value={p.codigo}
                      onChange={e => actualizarProcedimiento(i, 'codigo', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="00"
                      value={p.version}
                      onChange={e => actualizarProcedimiento(i, 'version', e.target.value)}
                      style={{ width: '60px' }}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Nombre del procedimiento"
                      value={p.nombre}
                      onChange={e => actualizarProcedimiento(i, 'nombre', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={p.fecha_emision}
                      onChange={e => actualizarProcedimiento(i, 'fecha_emision', e.target.value)}
                    />
                  </td>
                  <td>
                    <button className="btn-eliminar" onClick={() => eliminarProcedimiento(i)}>✕</button>
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