export default function OrgPaso5Revision({ datos, actualizar }) {

  const resumenItem = (label, val) => (
    <div style={{
      padding: '12px 16px', background: '#fdf8f9',
      borderRadius: '9px', border: '1px solid #f5e8ea'
    }}>
      <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#c9a0a8', fontWeight: '600', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '.84rem', fontWeight: '600', color: '#1a0a0f' }}>{val || '—'}</div>
    </div>
  )

  const badge = (count, label, color) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px', borderRadius: '10px',
      background: color + '15', border: `1.5px solid ${color}40`
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: '700', color }}>{count}</div>
      <div style={{ fontSize: '.7rem', color: '#7a3a4a', textAlign: 'center', marginTop: '2px' }}>{label}</div>
    </div>
  )

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Revisión Final</h3>
      <p className="paso-sub">Verifica la información antes de guardar. El manual quedará en estado Borrador.</p>

      {/* Resumen de datos generales */}
      <div style={{
        marginBottom: '20px', padding: '16px 18px',
        background: 'white', borderRadius: '12px',
        border: '1.5px solid rgba(225,29,72,.08)',
        boxShadow: '0 2px 10px rgba(190,18,60,.04)'
      }}>
        <div style={{ fontSize: '.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#be123c', marginBottom: '14px' }}>
          📋 Datos Generales
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {resumenItem('Código del Manual', datos.codigo)}
          {resumenItem('Dependencia', datos.dependencia)}
          {resumenItem('Versión', datos.version)}
          {resumenItem('Fecha de Elaboración', datos.fecha_elaboracion)}
          {resumenItem('Elaboró', datos.elaboro_nombre ? `${datos.elaboro_nombre} — ${datos.elaboro_cargo}` : '')}
          {resumenItem('Autorizó', datos.autorizo_nombre ? `${datos.autorizo_nombre} — ${datos.autorizo_cargo}` : '')}
        </div>
      </div>

      {/* Indicadores de contenido */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px'
      }}>
        {badge(datos.marco_normativo.length, 'Normas', '#3b82f6')}
        {badge(datos.principios.length + datos.valores.length, 'Principios y Valores', '#8b5cf6')}
        {badge(datos.politicas_operacion.length, 'Políticas de Operación', '#f59e0b')}
        {badge(datos.inventario_puestos.length, 'Puestos en Inventario', '#10b981')}
        {badge(datos.puestos.length, 'Puestos Descritos', '#e11d48')}
      </div>

      {/* Verificación del organigrama */}
      <div style={{
        marginBottom: '20px', padding: '14px 18px',
        borderRadius: '10px',
        background: datos.organigrama_general ? '#f0fdf4' : '#fff7ed',
        border: `1px solid ${datos.organigrama_general ? '#bbf7d0' : '#fed7aa'}`
      }}>
        <div style={{ fontSize: '.78rem', color: datos.organigrama_general ? '#14532d' : '#9a3412' }}>
          {datos.organigrama_general
            ? `✓ Organigrama general cargado: ${datos.organigrama_general.name}`
            : '⚠️ No se ha cargado el organigrama general. Puedes hacerlo en el Paso 3.'}
        </div>
        {datos.organigramas_especificos.length > 0 && (
          <div style={{ fontSize: '.75rem', color: '#14532d', marginTop: '4px' }}>
            ✓ {datos.organigramas_especificos.length} organigrama(s) específico(s) cargado(s).
          </div>
        )}
      </div>

      {/* 4.5 Último Cambio */}
      <div style={{
        padding: '16px 18px', background: 'white', borderRadius: '12px',
        border: '1.5px solid rgba(225,29,72,.08)', boxShadow: '0 2px 10px rgba(190,18,60,.04)'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#be123c' }}>
            4.5 Último Cambio o Actualización
          </div>
          <div style={{ fontSize: '.73rem', color: '#a78a8f', marginTop: '2px' }}>
            Describe brevemente el cambio más reciente realizado al documento. Este texto aparecerá en el PDF.
          </div>
        </div>
        <textarea
          value={datos.ultimo_cambio || ''}
          onChange={e => actualizar({ ultimo_cambio: e.target.value })}
          rows={4}
          placeholder="Ej. Se actualizaron las funciones del puesto de Director de Administración y se agregó el organigrama específico del área de Recursos Humanos."
          style={{
            width: '100%', padding: '10px 12px',
            border: '1.5px solid #ffe4e6', borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', color: '#1a0a0f',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            lineHeight: '1.5'
          }}
        />
        <p style={{ fontSize: '.7rem', color: '#c9a0a8', marginTop: '6px' }}>
          Opcional para la versión inicial. El historial completo de cambios queda disponible para el IMDAI de manera interna.
        </p>
      </div>

      {/* Nota final */}
      <div style={{
        marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start',
        padding: '14px 16px', background: '#f0fdf4', borderRadius: '10px',
        border: '1px solid #bbf7d0', fontSize: '.78rem', color: '#14532d'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>
          Al guardar, el manual quedará en estado <strong>Borrador</strong>. Podrás continuar editándolo antes de enviarlo a revisión con el IMDAI.
        </span>
      </div>
    </div>
  )
}
