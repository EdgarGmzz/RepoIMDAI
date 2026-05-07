export default function Paso5Revision({ datos, actualizar }) {
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

      {/* Último cambio */}
      <div style={{
        marginTop: '20px', padding: '16px 18px', background: 'white', borderRadius: '12px',
        border: '1.5px solid #e0e7ef', boxShadow: '0 2px 8px rgba(0,0,0,.04)'
      }}>
        <div style={{ fontSize: '.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#2563eb', marginBottom: '6px' }}>
          Último Cambio o Actualización
        </div>
        <div style={{ fontSize: '.73rem', color: '#a78a8f', marginBottom: '10px' }}>
          Describe brevemente el cambio más reciente realizado al documento. Este texto aparecerá en el PDF.
        </div>
        <textarea
          value={datos.ultimo_cambio || ''}
          onChange={e => actualizar?.({ ultimo_cambio: e.target.value })}
          rows={4}
          placeholder="Ej. Se actualizó el procedimiento de contratación y se agregó el diagrama de flujo del área de adquisiciones."
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid #bfdbfe', borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', color: '#1a0a0f',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '1.5'
          }}
        />
        <p style={{ fontSize: '.7rem', color: '#93c5fd', marginTop: '6px' }}>
          Opcional para la versión inicial. El historial queda disponible para el IMDAI de manera interna.
        </p>
      </div>
    </div>
  )
}