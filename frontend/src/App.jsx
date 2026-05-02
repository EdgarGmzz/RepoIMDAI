import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MisManuales from './pages/MisManuales'
import VistaDiagrama from './pages/VistaDiagrama'

// ── Guarda de ruta por rol ────────────────────────────────────────────────────
function RutaProtegida({ children, rolRequerido }) {
  const token   = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  if (!token) return <Navigate to="/login" replace />
  if (rolRequerido && usuario.rol !== rolRequerido) {
    // Redirigir a la vista correcta según su rol real
    return <Navigate to={usuario.rol === 'administrador' ? '/dashboard' : '/mis-manuales'} replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raíz → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login — público */}
        <Route path="/login" element={<Login />} />

        {/* Visor de diagrama — público (apuntado por el QR del PDF) */}
        <Route path="/diagrama/:manualId/:procIdx" element={<VistaDiagrama />} />

        {/* Dashboard — solo administrador */}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida rolRequerido="administrador">
              <Dashboard />
            </RutaProtegida>
          }
        />

        {/* Mis Manuales — solo sujeto_obligado */}
        <Route
          path="/mis-manuales"
          element={
            <RutaProtegida rolRequerido="sujeto_obligado">
              <MisManuales />
            </RutaProtegida>
          }
        />

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
