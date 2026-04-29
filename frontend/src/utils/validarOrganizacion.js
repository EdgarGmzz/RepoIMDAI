export const validarOrganizacion = (datos) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'administrador'
  const errores = []

  // ── Paso 1: Datos Generales ────────────────────────────────────────────────
  if (!datos.dependencia?.trim())    errores.push('Dependencia / Unidad Administrativa')
  if (!datos.fecha_elaboracion)      errores.push('Fecha de Elaboración')
  if (!datos.elaboro_nombre?.trim()) errores.push('Elaboró — Nombre')
  if (!datos.elaboro_cargo?.trim())  errores.push('Elaboró — Cargo')
  if (esAdmin && !datos.codigo?.trim()) errores.push('Código del Manual')

  // ── Paso 2: Capítulo I ─────────────────────────────────────────────────────
  if (!datos.introduccion?.trim())     errores.push('Introducción (Capítulo I)')
  if (!datos.antecedentes?.trim())     errores.push('Antecedentes (Capítulo I)')
  if (!datos.atribuciones?.trim())     errores.push('Atribuciones Institucionales')
  if (!datos.objetivo_general?.trim()) errores.push('Objetivo General')
  if (!datos.mision?.trim())           errores.push('Misión')
  if (!datos.vision?.trim())           errores.push('Visión')

  // ── Paso 3: Inventario de puestos ─────────────────────────────────────────
  if (datos.inventario_puestos.length === 0) {
    errores.push('Debe agregar al menos un puesto en el Inventario de Puestos')
  } else {
    datos.inventario_puestos.forEach((p, i) => {
      if (!p.nombre_puesto?.trim()) errores.push(`Nombre del puesto ${i + 1} (Inventario)`)
    })
  }

  // ── Paso 4: Descripción de puestos ────────────────────────────────────────
  datos.puestos.forEach((p, i) => {
    const label = p.nombre_puesto?.trim() ? `"${p.nombre_puesto}"` : `#${i + 1}`
    const tieneJefeInmediato = !!(p.jefe_inmediato?.trim() || p.jefe_firma_cargo?.trim())
    if (!p.nombre_puesto?.trim())   errores.push(`Nombre del puesto ${label}`)
    if (!tieneJefeInmediato)        errores.push(`Jefe inmediato del puesto ${label}`)
    if (!p.objetivo_puesto?.trim()) errores.push(`Objetivo del puesto ${label}`)
    const tieneFunciones = (p.funciones_institucionales?.length > 0 || p.funciones_propias?.length > 0)
    if (!tieneFunciones) errores.push(`Funciones del puesto ${label} (debe tener al menos una)`)
  })

  return errores
}
