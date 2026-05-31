export type Role = 'Administrador' | 'Responsable IT' | 'Supervisor' | 'Empleado'

export type ModuleId =
  | 'inicio'
  | 'dashboard'
  | 'alertas'
  | 'empleados'
  | 'activos'
  | 'asignaciones'
  | 'stock'
  | 'mantenimiento'
  | 'renovaciones'
  | 'historial'
  | 'busqueda'
  | 'exportaciones'
  | 'ajustes'

export type AssetCategory =
  | 'Informática'
  | 'Vehículos'
  | 'EPIs'
  | 'Herramientas'
  | 'Ropa'
  | 'Software'
  | 'Otros'

export type AssetStatus =
  | 'Disponible'
  | 'Asignado'
  | 'En mantenimiento'
  | 'Averiado'
  | 'Retirado'

export type EmployeeStatus = 'Activo' | 'Vacaciones' | 'Baja'

export type MaintenanceType =
  | 'Avería'
  | 'Revisión'
  | 'ITV'
  | 'Cambio de batería'
  | 'Sustitución'

export type RenewalType = 'Garantía' | 'Renovación' | 'Fin de vida útil'
export type RenewalStatus = 'Pendiente' | 'Planificada' | 'Ejecutada'
export type KanbanTaskStatus = 'todo' | 'doing' | 'done'

export interface SessionUser {
  name: string
  email: string
  role: Role
  mode: 'demo' | 'supabase'
}

export interface PermissionSet {
  allowedModules: ModuleId[]
  canManageEmployees: boolean
  canAssignAssets: boolean
  canManageStock: boolean
  canManageMaintenance: boolean
  canManageRenewals: boolean
  canViewAudit: boolean
  canExport: boolean
  canAdministerAuth: boolean
}

export interface AppNotification {
  id: string
  title: string
  description: string
  createdAt: string
  moduleId: ModuleId
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  unread: boolean
}

export interface KanbanTask {
  id: string
  title: string
  description: string
  owner: string
  moduleId: ModuleId
  status: KanbanTaskStatus
  position: number
}

export interface KanbanColumn {
  id: KanbanTaskStatus
  title: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  tasks: KanbanTask[]
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  department: string
  position: string
  startDate: string
  status: EmployeeStatus
}

export interface Asset {
  id: string
  code: string
  name: string
  category: AssetCategory
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  cost: number
  status: AssetStatus
  location: string
  observations: string
  assignedEmployeeId?: string
  warrantyEnd?: string
  nextRenewal?: string
  endOfLife?: string
}

export interface Assignment {
  id: string
  assetId: string
  employeeId: string
  assignedAt: string
  deliveredAt: string
  returnedAt?: string | null
  assignedBy: string
  assignedByRole: Role
  notes: string
}

export interface StockItem {
  id: string
  name: string
  category: AssetCategory
  available: number
  minimum: number
  location: string
  unit: string
  lastRestock: string
}

export interface MaintenanceRecord {
  id: string
  assetId: string
  type: MaintenanceType
  date: string
  cost: number
  description: string
  technician: string
  nextDue?: string
}

export interface RenewalItem {
  id: string
  assetId: string
  type: RenewalType
  dueDate: string
  status: RenewalStatus
  notes: string
}

export interface AuditEvent {
  id: string
  entity: 'Activo' | 'Empleado' | 'Asignación' | 'Mantenimiento' | 'Stock' | 'Renovación' | 'Kanban'
  action: 'Creación' | 'Modificación' | 'Asignación' | 'Devolución' | 'Mantenimiento' | 'Baja' | 'Alerta'
  actor: string
  occurredAt: string
  description: string
}

export interface WorkspaceData {
  employees: Employee[]
  assets: Asset[]
  assignments: Assignment[]
  stockItems: StockItem[]
  maintenanceRecords: MaintenanceRecord[]
  renewals: RenewalItem[]
  kanbanTasks: KanbanTask[]
  auditEvents: AuditEvent[]
}

export interface ChartDatum {
  label: string
  value: number
  color: string
}

export interface FilterState {
  query: string
  category: AssetCategory | 'Todos'
  employeeId: string | 'Todos'
  department: string | 'Todos'
  status: AssetStatus | 'Todos'
  dateFrom: string
  dateTo: string
}
