export default function Paso5Revision({ datos }) {
  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Revisión Final</h3>
      <p className="paso-sub">Verifica que toda la información esté correcta antes de guardar</p>

      <div className="revision-seccion">
        <h4>Datos Generales</h4>
        <div className="revision-fila">
          <span>Dependencia:</span>
          <strong>{datos.dependencia || 'Sin definir'}</strong>
        </div>
        <div className="revision-fila">
          <span>Código:</span>
          <strong>{datos.codigo || 'Sin definir'}</strong>
        </div>
        <div className="revision-fila">
          <span>Versión:</span>
          <strong>{datos.version || 'Sin definir'}</strong>
        </div>
        <div className="revision-fila">
          <span>Titular:</span>
          <strong>{datos.titular || 'Sin definir'}</strong>
        </div>
      </div>

      <div className="revision-seccion">
        <h4>Capítulo I</h4>
        <div className="revision-fila">
          <span>Introducción:</span>
          <strong>{datos.introduccion ? 'Completada' : 'Pendiente'}</strong>
        </div>
        <div className="revision-fila">
          <span>Antecedentes:</span>
          <strong>{datos.antecedentes ? 'Completado' : 'Pendiente'}</strong>
        </div>
        <div className="revision-fila">
          <span>Marco Normativo:</span>
          <strong>{datos.marco_normativo.length > 0 ? `${datos.marco_normativo.length} norma(s) agregada(s)` : 'Pendiente'}</strong>
        </div>
        <div className="revision-fila">
          <span>Misión:</span>
          <strong>{datos.mision ? 'Completada' : 'Pendiente'}</strong>
        </div>
        <div className="revision-fila">
          <span>Visión:</span>
          <strong>{datos.vision ? 'Completada' : 'Pendiente'}</strong>
        </div>
        <div className="revision-fila">
          <span>Marco Conceptual:</span>
          <strong>{datos.marco_conceptual.length > 0 ? `${datos.marco_conceptual.length} concepto(s) agregado(s)` : 'Pendiente'}</strong>
        </div>
      </div>

      <div className="revision-seccion">
        <h4>Procedimientos</h4>
        {datos.procedimientos.length === 0 ? (
          <p className="campo-vacio">No hay procedimientos agregados</p>
        ) : (
          datos.procedimientos.map((p, i) => (
            <div key={i} className="revision-fila">
              <span>{p.codigo || `Procedimiento ${i + 1}`}:</span>
              <strong>{p.nombre || 'Sin nombre'}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  )
}