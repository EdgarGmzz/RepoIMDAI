// pages/VistaDiagrama.jsx
// Visor PÚBLICO del diagrama de flujo. Se abre al escanear el QR del PDF.
// Recibe :manualId/:procIdx por URL, llama al endpoint público sin token,
// y muestra el DiagramaFlujo a tamaño completo con scroll y zoom.
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import DiagramaFlujo from '../components/DiagramaFlujo'

const API_BASE = 'http://localhost:3000'

export default function VistaDiagrama() {
  const { manualId, procIdx } = useParams()
  const [estado, setEstado] = useState('cargando') // cargando | listo | error
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const contenedorRef = useRef(null)

  useEffect(() => {
    let cancelado = false
    setEstado('cargando')
    axios
      .get(`${API_BASE}/public/diagrama/${manualId}/${procIdx}`)
      .then((res) => {
        if (cancelado) return
        setDatos(res.data)
        setEstado('listo')
      })
      .catch((err) => {
        if (cancelado) return
        setError(err.response?.data?.error || err.message || 'No se pudo cargar el diagrama')
        setEstado('error')
      })
    return () => { cancelado = true }
  }, [manualId, procIdx])

  const aumentarZoom = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))
  const reducirZoom  = () => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))
  const reiniciarZoom = () => setZoom(1)
  const imprimir = () => window.print()

  if (estado === 'cargando') {
    return (
      <div style={estilosContenedor}>
        <div style={{ color: '#fff', fontSize: 18 }}>Cargando diagrama...</div>
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div style={estilosContenedor}>
        <div style={{ color: '#fff', textAlign: 'center', maxWidth: 480 }}>
          <h2 style={{ marginBottom: 12 }}>No se pudo cargar el diagrama</h2>
          <p style={{ opacity: 0.85, fontSize: 14 }}>{error}</p>
          <p style={{ opacity: 0.6, fontSize: 13, marginTop: 16 }}>
            Verifica que el servidor esté disponible o vuelve a escanear el QR.
          </p>
        </div>
      </div>
    )
  }

  const proc = datos.procedimiento

  return (
    <div style={{ minHeight: '100vh', background: '#1f2937', display: 'flex', flexDirection: 'column' }}>
      {/* ── Barra superior ── */}
      <div style={{
        background: '#111827', color: '#fff', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #374151', flexWrap: 'wrap', gap: 12,
      }} className="no-print">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Diagrama de flujo
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {proc.nombre || '(Sin nombre)'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            Código: {proc.codigo || '—'} · Versión: {proc.version} · Emisión: {proc.fecha_emision || '—'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reducirZoom}     style={btn}>−</button>
          <button onClick={reiniciarZoom}   style={btn}>{Math.round(zoom * 100)}%</button>
          <button onClick={aumentarZoom}    style={btn}>+</button>
          <button onClick={imprimir}        style={{ ...btn, background: '#2563eb', borderColor: '#2563eb' }}>
            Imprimir
          </button>
        </div>
      </div>

      {/* ── Lienzo con scroll ── */}
      <div
        ref={contenedorRef}
        style={{
          flex: 1, overflow: 'auto', padding: 32,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        }}
      >
        <div style={{
          background: '#fafafa', padding: 16, borderRadius: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          transform: `scale(${zoom})`, transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}>
          {Array.isArray(proc.actividades) && proc.actividades.length > 0 ? (
            <DiagramaFlujo actividades={proc.actividades} />
          ) : (
            <div style={{ padding: 60, color: '#666', fontStyle: 'italic' }}>
              Este procedimiento aún no tiene actividades capturadas.
            </div>
          )}
        </div>
      </div>

      {/* Estilos para impresión: ocultar barra y dejar el SVG limpio */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const estilosContenedor = {
  minHeight: '100vh', background: '#1f2937',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
}

const btn = {
  background: 'transparent', color: '#fff', border: '1px solid #4b5563',
  padding: '6px 14px', borderRadius: 6, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit', minWidth: 44,
}
