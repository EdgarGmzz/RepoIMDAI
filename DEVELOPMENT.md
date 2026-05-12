# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

**IMDAI Manuales Digitales** — Aplicación web para gestionar manuales organizacionales y de procedimientos del Instituto Municipal de Desarrollo Administrativo e Innovación (IMDAI) en Benito Juárez, Quintana Roo, México.

## Comandos de Desarrollo

### Backend (puerto 3000)
```bash
cd backend
npm install
npm run dev      # Desarrollo con hot reload (nodemon)
npm start        # Producción
```

### Frontend (puerto 5173)
```bash
cd frontend
npm install
npm run dev      # Desarrollo con HMR
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # ESLint
```

### Base de datos
```bash
psql -U postgres -d imdai_manuales -f database/imdai_schema.sql
```

Utilidad para hashear contraseñas: `node backend/hashPassword.js`

## Arquitectura

### Stack
- **Backend:** Node.js + Express.js, PostgreSQL, JWT + bcryptjs
- **Frontend:** React 19 + Vite, React Router v7, Axios
- **Diagramas:** @xyflow/react (organigramas y flujos)

### Autenticación y Autorización
Autenticación basada en JWT con dos roles:
- `administrador` — acceso completo a todos los manuales
- `sujeto_obligado` — acceso limitado a sus propios manuales

Flujo: login → JWT emitido (expira en 8h) → guardado en localStorage → header `Authorization: Bearer <token>` en llamadas API → middleware `verificarToken` en rutas protegidas → componente `RutaProtegida` protege rutas del frontend.

### Tipos de Manuales y Estados
Dos tipos de manuales:
1. **Organizacion** — estructura organizacional, puestos y roles
2. **Procedimientos** — procesos y procedimientos operativos

Máquina de estados: `borrador` → `en_revision` → `observaciones` | `autorizado` → `validado`

### Estructura Frontend
- `src/pages/` — Páginas principales: `Login`, `Dashboard` (admin), `MisManuales` (usuario)
- `src/components/WizardManual.jsx` — Formulario de 5 pasos para crear manuales de procedimientos
- `src/components/WizardOrganizacion.jsx` — Formulario de 5 pasos para crear manuales organizacionales
- `src/components/VisorManual.jsx` — Visor/vista previa de manuales (solo lectura)
- `src/components/pasos/` — Componentes de cada paso para `WizardManual`
- `src/components/org-pasos/` — Componentes de cada paso para `WizardOrganizacion`
- Guards de rutas y renderizado por rol viven en `App.jsx`

### Estructura Backend
- `src/index.js` — Servidor Express, configuración de middleware y montaje de rutas
- `src/config/db.js` — Pool de conexiones PostgreSQL
- `src/controllers/` — `auth.controller.js` (login), `manuales.controller.js` (CRUD)
- `src/middlewares/auth.middleware.js` — Verificación de JWT
- `src/routes/` — `auth.routes.js` (`/auth`), `manuales.routes.js` (`/manuales`)

### Endpoints Principales
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Autenticación |
| GET | `/manuales` | Listar (filtrado por rol) |
| GET | `/manuales/:id` | Obtener manual |
| POST | `/manuales` | Crear manual |
| PUT | `/manuales/:id` | Actualizar manual |
| PATCH | `/manuales/:id/estado` | Cambiar estado |
| DELETE | `/manuales` | Eliminación masiva |

### Esquema de Base de Datos
Entidades principales en `database/imdai_schema.sql`:
- `usuarios`, `roles` — gestión de usuarios
- `manuales` — metadatos y estado del manual
- `secciones_manual`, `marco_normativo`, `marco_conceptual`, `politicas_operacion` — secciones de contenido
- `puestos`, `descripcion_puesto`, `funciones_puesto`, `competencias_puesto` — datos de estructura organizacional
- `procedimientos`, `pasos_procedimiento`, `diagramas_flujo` — datos de procedimientos
- `observaciones`, `historial_versiones` — auditoría

### Variables de Entorno (backend/.env)
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET
PORT=3000
```
