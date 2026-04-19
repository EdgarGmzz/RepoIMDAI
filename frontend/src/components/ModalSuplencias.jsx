import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ModalSuplencias({ onCerrar }) {
  const token = localStorage.getItem('token')
  const [suplencias, setSuplencias]   = useState([])
  const [usuarios, setUsuarios]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [guardando, setGuardando]     = useState(false)
  const [form, setForm] = useState({ sujeto_obligado: '', suplente: '', motivo: '' })
  const [error, setError]             = useState('')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3000/suplencias',          { headers }),
      axios.get('http://localhost:3000/suplencias/usuarios', { headers }),
    ]).then(([sRes, uRes]) => {
      setSuplencias(sRes.data)
      setUsuarios(uRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const fetchSuplencias = async () => {
    const res = await axios.get('http://localhost:3000/suplencias', { headers })
    setSuplencias(res.data)
  }

  const handleCrear = async () => {
    setError('')
    if (!form.sujeto_obligado || !form.suplente) {
      setError('Debes seleccionar el sujeto obligado y su suplente.')
      return
    }
    if (form.sujeto_obligado === form.suplente) {
      setError('El suplente no puede ser el mismo usuario.')
      return
    }
    setGuardando(true)
    try {
      await axios.post('http://localhost:3000/suplencias', {
        sujeto_obligado: parseInt(form.sujeto_obligado),
        suplente:        parseInt(form.suplente),
        motivo:          form.motivo || null,
      }, { headers })
      setForm({ sujeto_obligado: '', suplente: '', motivo: '' })
      await fetchSuplencias()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la suplencia')
    } finally {
      setGuardando(false)
    }
  }

  const handleDesactivar = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/suplencias/${id}/desactivar`, {}, { headers })
      await fetchSuplencias()
    } catch {
      alert('Error al desactivar la suplencia')
    }
  }

  const activas   = suplencias.filter(s => s.activo)
  const inactivas = suplencias.filter(s => !s.activo)

  const inputSt = {
    width: '100%', height: '36px', padding: '0 12px',
    border: '1.5px solid #ffe4e6', borderRadius: '8px',
    fontFamily: 'Poppins, sans-serif', fontSize: '.8rem',
    color: '#1a0a0f', background: 'white', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div className="modal-overlay open" onClick={onCerrar}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 style={{ marginBottom: '4px' }}>Gestión de Suplencias</h2>
        <p style={{ fontSize: '.8rem', color: '#b06070', marginBottom: '20px' }}>
          Asigna un suplente a un sujeto obligado cuando esté ausente.
          Solo puede haber una suplencia activa por persona a la vez.
        </p>

        {/* ── Formulario nueva suplencia ── */}
        <div style={{
          background: '#fdf2f4', border: '1.5px solid #fecdd3',
          borderRadius: '12px', padding: '18px', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '.72rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#be123c', marginBottom: '14px' }}>
            Nueva suplencia
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '.72rem', fontWeight: '600', color: '#5a3040', display: 'block', marginBottom: '5px' }}>
                Sujeto obligado (ausente)
              </label>
              <select
                style={inputSt}
                value={form.sujeto_obligado}
                onChange={e => setForm(f => ({ ...f, sujeto_obligado: e.target.value }))}
              >
                <option value="">Seleccionar…</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre} — {u.dependencia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '.72rem', fontWeight: '600', color: '#5a3040', display: 'block', marginBottom: '5px' }}>
                Suplente (quien cubrirá)
              </label>
              <select
                style={inputSt}
                value={form.suplente}
                onChange={e => setForm(f => ({ ...f, suplente: e.target.value }))}
              >
                <option value="">Seleccionar…</option>
                {usuarios
                  .filter(u => String(u.id_usuario) !== String(form.sujeto_obligado))
                  .map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} — {u.dependencia}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '.72rem', fontWeight: '600', color: '#5a3040', display: 'block', marginBottom: '5px' }}>
              Motivo (opcional)
            </label>
            <input
              style={inputSt}
              placeholder="Ej: Vacaciones, Permiso médico, Comisión…"
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
            />
          </div>

          {error && (
            <div style={{ fontSize: '.78rem', color: '#be123c', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', padding: '8px 12px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCrear}
            disabled={guardando}
            style={{
              height: '36px', padding: '0 20px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: '.8rem', fontWeight: '600',
              opacity: guardando ? .6 : 1,
            }}
          >
            {guardando ? 'Guardando…' : 'Asignar suplencia'}
          </button>
        </div>

        {/* ── Suplencias activas ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#a78a8f', fontSize: '.83rem' }}>Cargando…</div>
        ) : (
          <>
            <div style={{ fontSize: '.72rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#059669', marginBottom: '10px' }}>
              Suplencias activas ({activas.length})
            </div>
            {activas.length === 0 ? (
              <div style={{ fontSize: '.8rem', color: '#a78a8f', marginBottom: '20px' }}>Sin suplencias activas.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {activas.map(s => (
                  <div key={s.id_suplencia} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '10px',
                    background: '#f0fdf4', border: '1.5px solid #bbf7d0'
                  }}>
                    <div>
                      <div style={{ fontSize: '.82rem', fontWeight: '700', color: '#14532d' }}>
                        {s.sujeto_nombre}
                        <span style={{ fontSize: '.7rem', fontWeight: '400', color: '#6b7280', marginLeft: '6px' }}>
                          ({s.sujeto_dependencia})
                        </span>
                      </div>
                      <div style={{ fontSize: '.75rem', color: '#166534', marginTop: '2px' }}>
                        Cubierto por: <strong>{s.suplente_nombre}</strong>
                        {s.motivo && <span style={{ color: '#6b7280' }}> · {s.motivo}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDesactivar(s.id_suplencia)}
                      style={{
                        height: '30px', padding: '0 14px', borderRadius: '7px',
                        background: 'white', border: '1.5px solid #fca5a5',
                        color: '#dc2626', cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif', fontSize: '.72rem', fontWeight: '600',
                        flexShrink: 0, marginLeft: '12px',
                      }}
                    >
                      Desactivar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Suplencias inactivas ── */}
            {inactivas.length > 0 && (
              <>
                <div style={{ fontSize: '.72rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '10px' }}>
                  Historial ({inactivas.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {inactivas.map(s => (
                    <div key={s.id_suplencia} style={{
                      padding: '10px 14px', borderRadius: '10px',
                      background: '#f9fafb', border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '.78rem', color: '#6b7280' }}>
                        <strong style={{ color: '#374151' }}>{s.sujeto_nombre}</strong>
                        {' '}fue cubierto por{' '}
                        <strong style={{ color: '#374151' }}>{s.suplente_nombre}</strong>
                        {s.motivo && <span> · {s.motivo}</span>}
                        <span style={{ float: 'right', fontSize: '.68rem' }}>{s.fecha_creacion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="modal-cancel" onClick={onCerrar} style={{ margin: 0 }}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
