export default function Paso2CapituloI({ datos, actualizar }) {
  const agregarNorma = () => {
    actualizar({
      marco_normativo: [...datos.marco_normativo, { nombre: '', fecha: '', medio: '' }]
    })
  }

  const actualizarNorma = (index, campo, valor) => {
    const nuevas = [...datos.marco_normativo]
    nuevas[index][campo] = valor
    actualizar({ marco_normativo: nuevas })
  }

  const eliminarNorma = (index) => {
    actualizar({ marco_normativo: datos.marco_normativo.filter((_, i) => i !== index) })
  }

  const agregarPrincipio = () => actualizar({ principios: [...(datos.principios || []), ''] })
  const actualizarPrincipio = (index, valor) => {
    const nuevos = [...(datos.principios || [])]
    nuevos[index] = valor
    actualizar({ principios: nuevos })
  }
  const eliminarPrincipio = (index) => actualizar({ principios: (datos.principios || []).filter((_, i) => i !== index) })

  const agregarValor = () => actualizar({ valores: [...(datos.valores || []), ''] })
  const actualizarValor = (index, valor) => {
    const nuevos = [...(datos.valores || [])]
    nuevos[index] = valor
    actualizar({ valores: nuevos })
  }
  const eliminarValor = (index) => actualizar({ valores: (datos.valores || []).filter((_, i) => i !== index) })

  const agregarPolitica = () => actualizar({ politicas_operacion: [...(datos.politicas_operacion || []), { area: '', descripcion: '' }] })
  const actualizarPolitica = (index, campo, valor) => {
    const nuevas = [...(datos.politicas_operacion || [])]
    nuevas[index] = { ...nuevas[index], [campo]: valor }
    actualizar({ politicas_operacion: nuevas })
  }
  const eliminarPolitica = (index) => actualizar({ politicas_operacion: (datos.politicas_operacion || []).filter((_, i) => i !== index) })

  const agregarConcepto = () => {
    actualizar({
      marco_conceptual: [...datos.marco_conceptual, { termino: '', definicion: '' }]
    })
  }

  const actualizarConcepto = (index, campo, valor) => {
    const nuevos = [...datos.marco_conceptual]
    nuevos[index][campo] = valor
    actualizar({ marco_conceptual: nuevos })
  }

  const eliminarConcepto = (index) => {
    actualizar({ marco_conceptual: datos.marco_conceptual.filter((_, i) => i !== index) })
  }

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Capítulo I — Generales</h3>
      <p className="paso-sub">Información general e institucional de la dependencia</p>

      {/* Introducción */}
      <div className="campo-grupo">
        <label>3.1 Introducción</label>
        <textarea
          placeholder="Describe brevemente el contenido del manual, su utilidad y propósito general..."
          value={datos.introduccion}
          onChange={e => actualizar({ introduccion: e.target.value })}
          rows={4}
        />
      </div>

      {/* Antecedentes */}
      <div className="campo-grupo">
        <label>3.2 Antecedentes</label>
        <textarea
          placeholder="Describe el origen y evolución histórica de la institución..."
          value={datos.antecedentes}
          onChange={e => actualizar({ antecedentes: e.target.value })}
          rows={4}
        />
      </div>

      {/* Marco Normativo */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>3.3 Marco Normativo</label>
          <button className="btn-agregar" onClick={agregarNorma}>+ Agregar</button>
        </div>
        {datos.marco_normativo.length === 0 && (
          <p className="campo-vacio">No hay normativas agregadas. Haz clic en + Agregar.</p>
        )}
        {datos.marco_normativo.map((norma, i) => (
          <div key={i} className="item-fila">
            <span className="item-num">{i + 1}</span>
            <input
              placeholder="Nombre de la normatividad"
              value={norma.nombre}
              onChange={e => actualizarNorma(i, 'nombre', e.target.value)}
            />
            <input
              type="date"
              value={norma.fecha}
              onChange={e => actualizarNorma(i, 'fecha', e.target.value)}
            />
            <input
              placeholder="Medio de publicación"
              value={norma.medio}
              onChange={e => actualizarNorma(i, 'medio', e.target.value)}
            />
            <button className="btn-eliminar" onClick={() => eliminarNorma(i)}>✕</button>
          </div>
        ))}
      </div>

      {/* Atribuciones */}
      <div className="campo-grupo">
        <label>3.4 Atribuciones Institucionales</label>
        <textarea
          placeholder="Indica las facultades conferidas a la dependencia por su normatividad..."
          value={datos.atribuciones}
          onChange={e => actualizar({ atribuciones: e.target.value })}
          rows={4}
        />
      </div>

      {/* Objetivo General */}
      <div className="campo-grupo">
        <label>3.5 Objetivo General</label>
        <textarea
          placeholder="Indica el objetivo general de tu dependencia..."
          value={datos.objetivo_general}
          onChange={e => actualizar({ objetivo_general: e.target.value })}
          rows={3}
        />
      </div>

      {/* Misión */}
      <div className="campo-grupo">
        <label>3.6 Misión</label>
        <textarea
          placeholder="Indica la misión de tu dependencia..."
          value={datos.mision}
          onChange={e => actualizar({ mision: e.target.value })}
          rows={3}
        />
      </div>

      {/* Visión */}
      <div className="campo-grupo">
        <label>3.7 Visión</label>
        <textarea
          placeholder="Indica la visión de tu dependencia..."
          value={datos.vision}
          onChange={e => actualizar({ vision: e.target.value })}
          rows={3}
        />
      </div>

      {/* Principios y Valores Institucionales */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>3.8 Principios y Valores Institucionales</label>
        </div>

        <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: '#555' }}>Principios</p>
        {(datos.principios || []).length === 0 && (
          <p className="campo-vacio">No hay principios agregados. Haz clic en + Agregar.</p>
        )}
        {(datos.principios || []).map((p, i) => (
          <div key={i} className="item-fila">
            <span className="item-num">{i + 1}</span>
            <input
              placeholder="Describe el principio institucional..."
              value={p}
              onChange={e => actualizarPrincipio(i, e.target.value)}
            />
            <button className="btn-eliminar" onClick={() => eliminarPrincipio(i)}>✕</button>
          </div>
        ))}
        <button className="btn-agregar" style={{ marginTop: 6 }} onClick={agregarPrincipio}>+ Agregar principio</button>

        <p style={{ margin: '12px 0 8px', fontSize: '0.85rem', color: '#555' }}>Valores</p>
        {(datos.valores || []).length === 0 && (
          <p className="campo-vacio">No hay valores agregados. Haz clic en + Agregar.</p>
        )}
        {(datos.valores || []).map((v, i) => (
          <div key={i} className="item-fila">
            <span className="item-num">{i + 1}</span>
            <input
              placeholder="Describe el valor institucional..."
              value={v}
              onChange={e => actualizarValor(i, e.target.value)}
            />
            <button className="btn-eliminar" onClick={() => eliminarValor(i)}>✕</button>
          </div>
        ))}
        <button className="btn-agregar" style={{ marginTop: 6 }} onClick={agregarValor}>+ Agregar valor</button>
      </div>

      {/* Políticas de Operación */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>3.9 Políticas de Operación</label>
          <button className="btn-agregar" onClick={agregarPolitica}>+ Agregar</button>
        </div>
        {(datos.politicas_operacion || []).length === 0 && (
          <p className="campo-vacio">No hay políticas agregadas. Haz clic en + Agregar.</p>
        )}
        {(datos.politicas_operacion || []).map((pol, i) => (
          <div key={i} className="item-fila">
            <span className="item-num">{i + 1}</span>
            <input
              placeholder="Área"
              value={pol.area}
              onChange={e => actualizarPolitica(i, 'area', e.target.value)}
              style={{ flex: '0 0 180px' }}
            />
            <input
              placeholder="Descripción de la política"
              value={pol.descripcion}
              onChange={e => actualizarPolitica(i, 'descripcion', e.target.value)}
            />
            <button className="btn-eliminar" onClick={() => eliminarPolitica(i)}>✕</button>
          </div>
        ))}
      </div>

      {/* Marco Conceptual */}
      <div className="campo-grupo">
        <div className="campo-header">
          <label>3.10 Marco Conceptual</label>
          <button className="btn-agregar" onClick={agregarConcepto}>+ Agregar</button>
        </div>
        {datos.marco_conceptual.length === 0 && (
          <p className="campo-vacio">No hay conceptos agregados. Haz clic en + Agregar.</p>
        )}
        {datos.marco_conceptual.map((c, i) => (
          <div key={i} className="item-fila">
            <input
              placeholder="Término"
              value={c.termino}
              onChange={e => actualizarConcepto(i, 'termino', e.target.value)}
              style={{ flex: '0 0 200px' }}
            />
            <input
              placeholder="Definición"
              value={c.definicion}
              onChange={e => actualizarConcepto(i, 'definicion', e.target.value)}
            />
            <button className="btn-eliminar" onClick={() => eliminarConcepto(i)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}