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