import type { ModuleId, PermissionSet, Role } from '@/types/domain'

export const roleCapabilityHighlights: Record<
  Role,
  {
    summary: string
    landing: string
    canDo: string[]
    restrictions: string[]
  }
> = {
  Administrador: {
    summary: 'Dirige la plataforma completa, seguridad, catálogo, auditoría y ajustes corporativos.',
    landing: 'Visión global de la empresa, flota, personal, alertas y decisiones de dirección.',
    canDo: [
      'Gestionar empleados, activos, asignaciones y configuración general',
      'Ver auditoría completa y exportar información corporativa',
      'Cambiar políticas, módulos de inicio y experiencia de uso',
    ],
    restrictions: ['No tiene restricciones funcionales dentro de la plataforma.'],
  },
  'Responsable IT': {
    summary: 'Controla inventario TI, licencias, mantenimiento y renovaciones operativas.',
    landing: 'Prioriza herramientas, dispositivos, conectividad y continuidad operativa.',
    canDo: [
      'Alta, edición y seguimiento de activos e incidencias técnicas',
      'Asignar equipos, revisar mantenimiento y gestionar renovaciones',
      'Exportar listados y consultar historial operativo',
    ],
    restrictions: ['No administra el modelo de autorización ni la seguridad avanzada.'],
  },
  Supervisor: {
    summary: 'Coordina la operativa diaria de rutas, almacenes, entregas y seguimiento de recursos.',
    landing: 'Se centra en movimientos, disponibilidad y avisos del turno o la región.',
    canDo: [
      'Gestionar asignaciones, devoluciones, stock y alertas operativas',
      'Consultar empleados e inventario para tomar decisiones rápidas',
      'Exportar partes de trabajo y seguimiento diario',
    ],
    restrictions: ['No puede editar toda la plantilla ni acceder al historial completo.'],
  },
  Empleado: {
    summary: 'Consulta sus recursos, estado de asignaciones y búsqueda operativa básica.',
    landing: 'Accede a una vista sencilla para consultar lo que tiene asignado y qué debe revisar.',
    canDo: [
      'Consultar su entorno, empleados visibles y activos relacionados',
      'Buscar material o referencias disponibles',
      'Entrar en ajustes personales de experiencia',
    ],
    restrictions: ['No puede crear empleados, asignar recursos ni exportar información.'],
  },
}

export const moduleOrder: ModuleId[] = [
  'inicio',
  'dashboard',
  'alertas',
  'empleados',
  'activos',
  'asignaciones',
  'stock',
  'mantenimiento',
  'renovaciones',
  'historial',
  'busqueda',
  'exportaciones',
  'ajustes',
]

export const moduleLabels: Record<ModuleId, string> = {
  inicio: 'Inicio',
  dashboard: 'Dashboard',
  alertas: 'Alertas',
  empleados: 'Empleados',
  activos: 'Inventario',
  asignaciones: 'Asignaciones',
  stock: 'Stock',
  mantenimiento: 'Mantenimiento',
  renovaciones: 'Renovaciones',
  historial: 'Historial',
  busqueda: 'Buscar',
  exportaciones: 'Exportaciones',
  ajustes: 'Ajustes',
}

export const demoRoleProfiles: Record<Role, { name: string; email: string; description: string }> = {
  Administrador: {
    name: 'Miguel A. Hidalgo',
    email: 'miguelahidalgo03@gmail.com',
    description: 'Dirección general de HA Connect para Hmnos Alcaraz, con control global y visión corporativa.',
  },
  'Responsable IT': {
    name: 'Laura Casas',
    email: 'laura.casas@hmnosalcaraz.com',
    description: 'Inventario TI, licencias, mantenimiento, movilidad y continuidad operativa.',
  },
  Supervisor: {
    name: 'Diego Martín',
    email: 'diego.martin@hmnosalcaraz.com',
    description: 'Operativa diaria de rutas, asignaciones, stock y seguimiento de recursos de campo.',
  },
  Empleado: {
    name: 'Inés Romero',
    email: 'ines.romero@hmnosalcaraz.com',
    description: 'Consulta de activos propios, avisos personales y trazabilidad básica.',
  },
}

export const rolePermissions: Record<Role, PermissionSet> = {
  Administrador: {
    allowedModules: moduleOrder,
    canManageEmployees: true,
    canAssignAssets: true,
    canManageStock: true,
    canManageMaintenance: true,
    canManageRenewals: true,
    canViewAudit: true,
    canExport: true,
    canAdministerAuth: true,
  },
  'Responsable IT': {
    allowedModules: moduleOrder,
    canManageEmployees: true,
    canAssignAssets: true,
    canManageStock: true,
    canManageMaintenance: true,
    canManageRenewals: true,
    canViewAudit: true,
    canExport: true,
    canAdministerAuth: false,
  },
  Supervisor: {
    allowedModules: [
      'inicio',
      'dashboard',
      'alertas',
      'empleados',
      'activos',
      'asignaciones',
      'stock',
      'mantenimiento',
      'renovaciones',
      'busqueda',
      'exportaciones',
      'ajustes',
    ],
    canManageEmployees: false,
    canAssignAssets: true,
    canManageStock: true,
    canManageMaintenance: true,
    canManageRenewals: true,
    canViewAudit: false,
    canExport: true,
    canAdministerAuth: false,
  },
  Empleado: {
    allowedModules: ['inicio', 'dashboard', 'empleados', 'activos', 'asignaciones', 'busqueda', 'ajustes'],
    canManageEmployees: false,
    canAssignAssets: false,
    canManageStock: false,
    canManageMaintenance: false,
    canManageRenewals: false,
    canViewAudit: false,
    canExport: false,
    canAdministerAuth: false,
  },
}

export function hasModuleAccess(role: Role, moduleId: ModuleId) {
  return rolePermissions[role].allowedModules.includes(moduleId)
}
