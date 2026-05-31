import { getInitialKanbanTasks, getWorkspaceData, resetWorkspaceData, setWorkspaceData } from '@/data/mockData'
import { supabase } from '@/lib/supabase'
import type {
  Asset,
  AssetCategory,
  AssetStatus,
  Assignment,
  AuditEvent,
  Employee,
  EmployeeStatus,
  KanbanTask,
  KanbanTaskStatus,
  MaintenanceRecord,
  MaintenanceType,
  ModuleId,
  RenewalItem,
  RenewalStatus,
  RenewalType,
  Role,
  SessionUser,
  StockItem,
  WorkspaceData,
} from '@/types/domain'

interface MutationContext {
  mode: SessionUser['mode']
  fallbackRole: Role
}

export interface CreateEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  startDate: string
}

export interface CreateAssetInput {
  code: string
  name: string
  category: AssetCategory
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  cost: number
  location: string
  observations: string
  warrantyEnd?: string
  nextRenewal?: string
  endOfLife?: string
}

export interface CreateAssignmentInput {
  assetId: string
  employeeId: string
  deliveredAt: string
  notes: string
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {
  status: EmployeeStatus
}

export type UpdateAssetInput = CreateAssetInput

export interface ReturnAssignmentInput {
  assignmentId: string
  returnedAt: string
}

export interface CreateKanbanTaskInput {
  title: string
  description: string
  owner: string
  moduleId: ModuleId
  status: KanbanTaskStatus
}

export interface UpdateKanbanTaskInput extends CreateKanbanTaskInput {}

interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  department: string | null
}

interface EmployeeRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department: string
  position: string
  start_date: string
  status: string
}

interface AssetRow {
  id: string
  internal_code: string
  name: string
  category: string
  brand: string | null
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  purchase_cost: number | string | null
  status: string
  location: string | null
  notes: string | null
  assigned_employee_id: string | null
  warranty_end_date: string | null
  renewal_date: string | null
  end_of_life_date: string | null
}

interface AssignmentRow {
  id: string
  asset_id: string
  employee_id: string
  assigned_by: string | null
  delivered_at: string
  returned_at: string | null
  notes: string | null
  created_at: string
}

interface StockItemRow {
  id: string
  name: string
  category: string
  location: string | null
  available_quantity: number
  minimum_quantity: number
  unit: string
  last_restock_at: string | null
}

interface MaintenanceRecordRow {
  id: string
  asset_id: string
  maintenance_type: string
  maintenance_date: string
  cost: number | string
  description: string
  technician: string
  next_due_date: string | null
}

interface RenewalRow {
  id: string
  asset_id: string
  renewal_type: string
  due_date: string
  status: string
  notes: string | null
}

interface KanbanTaskRow {
  id: string
  title: string
  description: string | null
  owner_name: string
  module_id: string
  status: string
  order_index: number
}

interface AuditPayload {
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}

interface AuditEventRow {
  id: number | string
  entity_type: string
  entity_id: string | null
  action: string
  actor_name: string | null
  payload: AuditPayload | null
  created_at: string
}

function normalizeText(value: string | null | undefined, fallback = '') {
  return value?.trim() || fallback
}

function normalizeDate(value: string | null | undefined, fallback = new Date().toISOString()) {
  return value ?? fallback
}

function normalizeNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function toRole(value: string | null | undefined, fallback: Role = 'Empleado'): Role {
  switch (value) {
    case 'Administrador':
    case 'Responsable IT':
    case 'Supervisor':
    case 'Empleado':
      return value
    default:
      return fallback
  }
}

function toAssetCategory(value: string | null | undefined): AssetCategory {
  switch (value) {
    case 'Informática':
    case 'Vehículos':
    case 'EPIs':
    case 'Herramientas':
    case 'Ropa':
    case 'Software':
      return value
    default:
      return 'Otros'
  }
}

function toAssetStatus(value: string | null | undefined): AssetStatus {
  switch (value) {
    case 'Disponible':
    case 'Asignado':
    case 'En mantenimiento':
    case 'Averiado':
    case 'Retirado':
      return value
    default:
      return 'Disponible'
  }
}

function toEmployeeStatus(value: string | null | undefined): EmployeeStatus {
  switch (value) {
    case 'Activo':
    case 'Vacaciones':
    case 'Baja':
      return value
    default:
      return 'Activo'
  }
}

function toMaintenanceType(value: string | null | undefined): MaintenanceType {
  switch (value) {
    case 'Avería':
    case 'Revisión':
    case 'ITV':
    case 'Cambio de batería':
    case 'Sustitución':
      return value
    default:
      return 'Revisión'
  }
}

function toRenewalType(value: string | null | undefined): RenewalType {
  switch (value) {
    case 'Garantía':
    case 'Renovación':
    case 'Fin de vida útil':
      return value
    default:
      return 'Renovación'
  }
}

function toRenewalStatus(value: string | null | undefined): RenewalStatus {
  switch (value) {
    case 'Pendiente':
    case 'Planificada':
    case 'Ejecutada':
      return value
    default:
      return 'Pendiente'
  }
}

function toKanbanTaskStatus(value: string | null | undefined): KanbanTaskStatus {
  switch (value) {
    case 'todo':
    case 'doing':
    case 'done':
      return value
    default:
      return 'todo'
  }
}

function toModuleId(value: string | null | undefined): ModuleId {
  switch (value) {
    case 'inicio':
    case 'dashboard':
    case 'alertas':
    case 'empleados':
    case 'activos':
    case 'asignaciones':
    case 'stock':
    case 'mantenimiento':
    case 'renovaciones':
    case 'historial':
    case 'busqueda':
    case 'exportaciones':
    case 'ajustes':
      return value
    default:
      return 'alertas'
  }
}

function toAuditEntity(value: string): AuditEvent['entity'] {
  switch (value) {
    case 'employees':
    case 'Empleado':
      return 'Empleado'
    case 'asset_assignments':
    case 'Asignación':
      return 'Asignación'
    case 'maintenance_records':
    case 'Mantenimiento':
      return 'Mantenimiento'
    case 'stock_items':
    case 'Stock':
      return 'Stock'
    case 'renewals':
    case 'Renovación':
      return 'Renovación'
    case 'kanban_tasks':
    case 'Kanban':
      return 'Kanban'
    default:
      return 'Activo'
  }
}

function toAuditAction(value: string): AuditEvent['action'] {
  switch (value) {
    case 'Creación':
    case 'Modificación':
    case 'Asignación':
    case 'Devolución':
    case 'Mantenimiento':
    case 'Baja':
    case 'Alerta':
      return value
    default:
      return 'Modificación'
  }
}

function getAuthDisplayName(email: string | undefined, metadata: Record<string, unknown>) {
  const metadataName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined
  if (metadataName?.trim()) {
    return metadataName
  }

  if (email) {
    return email.split('@')[0]
  }

  return 'Usuario corporativo'
}

function getPayloadRecord(payload: AuditPayload | null | undefined) {
  return payload?.after ?? payload?.before ?? null
}

function describeAuditEvent(row: AuditEventRow, entity: AuditEvent['entity'], action: AuditEvent['action']) {
  const record = getPayloadRecord(row.payload)
  const name =
    normalizeText(
      typeof record?.title === 'string'
        ? record.title
        : typeof record?.name === 'string'
          ? record.name
        : typeof record?.internal_code === 'string'
          ? record.internal_code
          : typeof record?.email === 'string'
            ? record.email
            : typeof record?.description === 'string'
              ? record.description
              : null,
      entity.toLowerCase(),
    ) || entity.toLowerCase()

  return `${action} registrada sobre ${entity.toLowerCase()} ${name}.`
}

function mapWorkspaceLoadError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('does not exist') ||
    normalizedMessage.includes('could not find the table') ||
    normalizedMessage.includes('relation')
  ) {
    return 'El acceso funciona, pero la base de datos de HA Connect no está inicializada. Ejecuta `supabase/schema.sql` y después `supabase/post-setup.sql` en el SQL Editor.'
  }

  if (normalizedMessage.includes('permission denied') || normalizedMessage.includes('row-level security')) {
    return 'El usuario ha iniciado sesión, pero no tiene permisos para leer los datos. Revisa las reglas de acceso, el script `supabase/post-setup.sql` y que exista su fila en `profiles`.'
  }

  if (normalizedMessage.includes('stack depth limit exceeded')) {
    return 'La base de datos tiene una recursión en las reglas de acceso de `profiles`. Ejecuta `supabase/fix-profiles-rls.sql` en el SQL Editor de Supabase y vuelve a iniciar sesión.'
  }

  return `No se pudieron cargar los datos de la plataforma: ${message}`
}

function sortEmployees(employees: Employee[]) {
  return [...employees].sort((left, right) => left.fullName.localeCompare(right.fullName, 'es'))
}

function sortAssets(assets: Asset[]) {
  return [...assets].sort((left, right) => left.code.localeCompare(right.code, 'es'))
}

function createLocalAuditEvent(
  entity: AuditEvent['entity'],
  description: string,
  action: AuditEvent['action'] = 'Creación',
): AuditEvent {
  return {
    id: `evt-local-${crypto.randomUUID()}`,
    entity,
    action,
    actor: 'Demo local',
    occurredAt: new Date().toISOString(),
    description,
  }
}

const kanbanStatusOrder: KanbanTaskStatus[] = ['todo', 'doing', 'done']
const kanbanStatusLabels: Record<KanbanTaskStatus, string> = {
  todo: 'Por hacer',
  doing: 'En marcha',
  done: 'Hecho',
}

function normalizeKanbanTasks(tasks: KanbanTask[]) {
  return kanbanStatusOrder.flatMap((status) =>
    [...tasks]
      .filter((task) => task.status === status)
      .sort((left, right) => left.position - right.position || left.title.localeCompare(right.title, 'es'))
      .map((task, index) => ({ ...task, position: index })),
  )
}

function moveKanbanTaskCollection(
  tasks: KanbanTask[],
  taskId: string,
  destinationStatus: KanbanTaskStatus,
  destinationIndex: number,
) {
  const normalizedTasks = normalizeKanbanTasks(tasks)
  const currentTask = normalizedTasks.find((task) => task.id === taskId)

  if (!currentTask) {
    throw new Error('La tarea seleccionada ya no existe en el kanban.')
  }

  const taskBuckets = new Map<KanbanTaskStatus, KanbanTask[]>(
    kanbanStatusOrder.map((status) => [
      status,
      normalizedTasks.filter((task) => task.status === status).map((task) => ({ ...task })),
    ]),
  )

  const sourceBucket = taskBuckets.get(currentTask.status) ?? []
  const sourceIndex = sourceBucket.findIndex((task) => task.id === taskId)
  if (sourceIndex === -1) {
    throw new Error('La tarea seleccionada ya no existe en la columna actual.')
  }

  const [taskToMove] = sourceBucket.splice(sourceIndex, 1)
  const destinationBucket = taskBuckets.get(destinationStatus) ?? []
  const boundedIndex = Math.max(0, Math.min(destinationIndex, destinationBucket.length))
  destinationBucket.splice(boundedIndex, 0, { ...taskToMove, status: destinationStatus })

  return normalizeKanbanTasks(kanbanStatusOrder.flatMap((status) => taskBuckets.get(status) ?? []))
}

function mapKanbanMutationError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('kanban_tasks') &&
    (normalizedMessage.includes('does not exist') ||
      normalizedMessage.includes('could not find the table') ||
      normalizedMessage.includes('relation'))
  ) {
    return 'La base de datos aún no tiene la tabla `kanban_tasks`. Ejecuta el script `supabase/kanban-migration.sql` o actualiza `supabase/schema.sql` en Supabase para activar el kanban persistente.'
  }

  return message
}

function serializeKanbanTasks(tasks: KanbanTask[]) {
  return normalizeKanbanTasks(tasks).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    owner_name: task.owner,
    module_id: task.moduleId,
    status: task.status,
    order_index: task.position,
  }))
}

async function persistSupabaseKanbanTasks(tasks: KanbanTask[]) {
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const normalizedTasks = serializeKanbanTasks(tasks)
  if (normalizedTasks.length === 0) {
    return
  }

  const { error } = await supabase.from('kanban_tasks').upsert(normalizedTasks, { onConflict: 'id' })

  if (error) {
    throw new Error(mapKanbanMutationError(error.message))
  }
}

function sortAssignments(assignments: Assignment[]) {
  return [...assignments].sort((left, right) => right.assignedAt.localeCompare(left.assignedAt))
}

function ensureEmployeeEmailIsUnique(
  employees: Employee[],
  email: string,
  currentEmployeeId?: string,
) {
  const normalizedEmail = email.toLowerCase()

  return !employees.some(
    (employee) =>
      employee.id !== currentEmployeeId && employee.email.toLowerCase() === normalizedEmail,
  )
}

function ensureAssetCodeIsUnique(assets: Asset[], code: string, currentAssetId?: string) {
  const normalizedCode = code.toUpperCase()

  return !assets.some(
    (asset) => asset.id !== currentAssetId && asset.code.toUpperCase() === normalizedCode,
  )
}

function ensureAssetSerialIsUnique(
  assets: Asset[],
  serialNumber: string,
  currentAssetId?: string,
) {
  if (serialNumber === 'Sin serie') {
    return true
  }

  return !assets.some(
    (asset) => asset.id !== currentAssetId && asset.serialNumber === serialNumber,
  )
}

async function getCurrentActorId() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw new Error(error.message)
  }

  return data.user?.id ?? null
}

function buildWorkspaceData(payload: {
  profiles: ProfileRow[]
  employees: EmployeeRow[]
  assets: AssetRow[]
  assignments: AssignmentRow[]
  stockItems: StockItemRow[]
  maintenanceRecords: MaintenanceRecordRow[]
  renewals: RenewalRow[]
  kanbanTasks: KanbanTaskRow[]
  auditEvents: AuditEventRow[]
  currentProfile: ProfileRow | null
}): WorkspaceData {
  const profileMap = new Map(payload.profiles.map((profile) => [profile.id, profile]))

  const employees: Employee[] = payload.employees.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: normalizeText(row.phone, 'Sin teléfono'),
    department: row.department,
    position: row.position,
    startDate: row.start_date,
    status: toEmployeeStatus(row.status),
  }))

  const assets: Asset[] = payload.assets.map((row) => ({
    id: row.id,
    code: row.internal_code,
    name: row.name,
    category: toAssetCategory(row.category),
    brand: normalizeText(row.brand, 'Sin marca'),
    model: normalizeText(row.model, 'Sin modelo'),
    serialNumber: normalizeText(row.serial_number, 'Sin serie'),
    purchaseDate: normalizeDate(row.purchase_date),
    cost: normalizeNumber(row.purchase_cost),
    status: toAssetStatus(row.status),
    location: normalizeText(row.location, 'Sin ubicación'),
    observations: normalizeText(row.notes, 'Sin observaciones registradas.'),
    assignedEmployeeId: row.assigned_employee_id ?? undefined,
    warrantyEnd: row.warranty_end_date ?? undefined,
    nextRenewal: row.renewal_date ?? undefined,
    endOfLife: row.end_of_life_date ?? undefined,
  }))

  const assignments: Assignment[] = payload.assignments.map((row) => {
    const assignedByProfile = row.assigned_by ? profileMap.get(row.assigned_by) : null
    const isCurrentProfile = row.assigned_by && row.assigned_by === payload.currentProfile?.id

    return {
      id: row.id,
      assetId: row.asset_id,
      employeeId: row.employee_id,
      assignedAt: row.created_at,
      deliveredAt: row.delivered_at,
      returnedAt: row.returned_at,
      assignedBy: normalizeText(
        assignedByProfile?.full_name,
        isCurrentProfile ? normalizeText(payload.currentProfile?.full_name, 'Usuario corporativo') : 'Usuario corporativo',
      ),
      assignedByRole: toRole(assignedByProfile?.role, toRole(payload.currentProfile?.role, 'Empleado')),
      notes: normalizeText(row.notes, 'Entrega sin observaciones.'),
    }
  })

  const stockItems: StockItem[] = payload.stockItems.map((row) => ({
    id: row.id,
    name: row.name,
    category: toAssetCategory(row.category),
    available: row.available_quantity,
    minimum: row.minimum_quantity,
    location: normalizeText(row.location, 'Sin ubicación'),
    unit: normalizeText(row.unit, 'uds'),
    lastRestock: normalizeDate(row.last_restock_at),
  }))

  const maintenanceRecords: MaintenanceRecord[] = payload.maintenanceRecords.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    type: toMaintenanceType(row.maintenance_type),
    date: row.maintenance_date,
    cost: normalizeNumber(row.cost),
    description: row.description,
    technician: row.technician,
    nextDue: row.next_due_date ?? undefined,
  }))

  const renewals: RenewalItem[] = payload.renewals.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    type: toRenewalType(row.renewal_type),
    dueDate: row.due_date,
    status: toRenewalStatus(row.status),
    notes: normalizeText(row.notes, 'Sin notas'),
  }))

  const kanbanTasks: KanbanTask[] = normalizeKanbanTasks(
    payload.kanbanTasks.map((row) => ({
      id: row.id,
      title: row.title,
      description: normalizeText(row.description, 'Sin descripción operativa.'),
      owner: normalizeText(row.owner_name, 'Sin responsable'),
      moduleId: toModuleId(row.module_id),
      status: toKanbanTaskStatus(row.status),
      position: typeof row.order_index === 'number' ? row.order_index : 0,
    })),
  )

  const auditEvents: AuditEvent[] = payload.auditEvents.map((row) => {
    const entity = toAuditEntity(row.entity_type)
    const action = toAuditAction(row.action)

    return {
      id: String(row.id),
      entity,
      action,
      actor: normalizeText(row.actor_name, 'Sistema'),
      occurredAt: row.created_at,
      description: describeAuditEvent(row, entity, action),
    }
  })

  return {
    employees,
    assets,
    assignments,
    stockItems,
    maintenanceRecords,
    renewals,
    kanbanTasks,
    auditEvents,
  }
}

export async function syncSupabaseWorkspace(fallbackRole: Role): Promise<{
  sessionUser: SessionUser
  warning: string | null
}> {
  if (!supabase) {
    throw new Error('Supabase no está configurado en este entorno.')
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    throw new Error(authError.message)
  }

  const authUser = authData.user
  if (!authUser?.id || !authUser.email) {
    throw new Error('No hay una sesión autenticada en Supabase.')
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, department')
    .eq('id', authUser.id)
    .maybeSingle<ProfileRow>()

  if (currentProfileError) {
    throw new Error(`No se pudo leer el perfil del usuario: ${currentProfileError.message}`)
  }

  const [profilesResult, employeesResult, assetsResult, assignmentsResult, stockItemsResult, maintenanceResult, renewalsResult, kanbanResult, auditResult] =
    await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role, department').returns<ProfileRow[]>(),
      supabase.from('employees').select('*').order('last_name', { ascending: true }).returns<EmployeeRow[]>(),
      supabase.from('assets').select('*').order('internal_code', { ascending: true }).returns<AssetRow[]>(),
      supabase
        .from('asset_assignments')
        .select('*')
        .order('delivered_at', { ascending: false })
        .returns<AssignmentRow[]>(),
      supabase.from('stock_items').select('*').order('name', { ascending: true }).returns<StockItemRow[]>(),
      supabase
        .from('maintenance_records')
        .select('*')
        .order('maintenance_date', { ascending: false })
        .returns<MaintenanceRecordRow[]>(),
      supabase.from('renewals').select('*').order('due_date', { ascending: true }).returns<RenewalRow[]>(),
      supabase
        .from('kanban_tasks')
        .select('*')
        .order('status', { ascending: true })
        .order('order_index', { ascending: true })
        .returns<KanbanTaskRow[]>(),
      supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
        .returns<AuditEventRow[]>(),
    ])

  const criticalError = [
    employeesResult.error,
    assetsResult.error,
    assignmentsResult.error,
    stockItemsResult.error,
    maintenanceResult.error,
    renewalsResult.error,
  ].find(Boolean)

  if (criticalError) {
    resetWorkspaceData()
    throw new Error(mapWorkspaceLoadError(criticalError.message))
  }

  const workspaceData = buildWorkspaceData({
    profiles: profilesResult.data ?? [],
    employees: employeesResult.data ?? [],
    assets: assetsResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
    stockItems: stockItemsResult.data ?? [],
    maintenanceRecords: maintenanceResult.data ?? [],
    renewals: renewalsResult.data ?? [],
    kanbanTasks:
      kanbanResult.data ??
      getInitialKanbanTasks().map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        owner_name: task.owner,
        module_id: task.moduleId,
        status: task.status,
        order_index: task.position,
      })),
    auditEvents: auditResult.data ?? [],
    currentProfile: currentProfile ?? null,
  })

  setWorkspaceData(workspaceData)

  const sessionUser: SessionUser = {
    name: normalizeText(currentProfile?.full_name, getAuthDisplayName(authUser.email, authUser.user_metadata)),
    email: normalizeText(currentProfile?.email, authUser.email),
    role: toRole(currentProfile?.role, fallbackRole),
    mode: 'supabase',
  }

  const warnings = [
    currentProfile ? null : 'No existe fila en profiles para este usuario; se usa el rol seleccionado como fallback.',
    profilesResult.error ? `No se pudo leer la lista completa de perfiles: ${profilesResult.error.message}` : null,
    kanbanResult.error ? mapKanbanMutationError(kanbanResult.error.message) : null,
    auditResult.error ? `No se pudo leer auditoría: ${auditResult.error.message}` : null,
  ].filter(Boolean)

  return {
    sessionUser,
    warning: warnings.length > 0 ? warnings.join(' ') : null,
  }
}

export async function createEmployee(
  input: CreateEmployeeInput,
  context: MutationContext,
): Promise<Employee> {
  const firstName = normalizeText(input.firstName)
  const lastName = normalizeText(input.lastName)
  const email = normalizeText(input.email).toLowerCase()
  const department = normalizeText(input.department)
  const position = normalizeText(input.position)
  const startDate = normalizeText(input.startDate)
  const phone = normalizeText(input.phone, 'Sin teléfono')

  if (!firstName || !lastName || !email || !department || !position || !startDate) {
    throw new Error('Completa nombre, apellidos, email, departamento, cargo y fecha de alta.')
  }

  const workspace = getWorkspaceData()
  if (workspace.employees.some((employee) => employee.email.toLowerCase() === email)) {
    throw new Error('Ya existe un empleado con ese email.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase.from('employees').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone === 'Sin teléfono' ? null : phone,
      department,
      position,
      start_date: startDate,
      status: 'Activo',
      profile_id: null,
    })

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const createdEmployee = getWorkspaceData().employees.find(
      (employee) => employee.email.toLowerCase() === email,
    )

    if (!createdEmployee) {
      throw new Error('El empleado se creó, pero la vista no pudo refrescarse correctamente.')
    }

    return createdEmployee
  }

  const createdEmployee: Employee = {
    id: `emp-${crypto.randomUUID()}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    department,
    position,
    startDate,
    status: 'Activo',
  }

  setWorkspaceData({
    ...workspace,
    employees: sortEmployees([...workspace.employees, createdEmployee]),
    auditEvents: [
      createLocalAuditEvent('Empleado', `Se registró el empleado ${createdEmployee.fullName}.`),
      ...workspace.auditEvents,
    ],
  })

  return createdEmployee
}

export async function createAsset(input: CreateAssetInput, context: MutationContext): Promise<Asset> {
  const code = normalizeText(input.code).toUpperCase()
  const name = normalizeText(input.name)
  const brand = normalizeText(input.brand, 'Sin marca')
  const model = normalizeText(input.model, 'Sin modelo')
  const serialNumber = normalizeText(input.serialNumber, 'Sin serie')
  const purchaseDate = normalizeText(input.purchaseDate)
  const location = normalizeText(input.location)
  const observations = normalizeText(input.observations, 'Alta inicial del inventario.')
  const warrantyEnd = normalizeText(input.warrantyEnd)
  const nextRenewal = normalizeText(input.nextRenewal)
  const endOfLife = normalizeText(input.endOfLife)

  if (!code || !name || !purchaseDate || !location) {
    throw new Error('Completa código, nombre, fecha de compra y ubicación del activo.')
  }

  const workspace = getWorkspaceData()
  if (workspace.assets.some((asset) => asset.code.toUpperCase() === code)) {
    throw new Error('Ya existe un activo con ese código interno.')
  }

  if (serialNumber !== 'Sin serie' && workspace.assets.some((asset) => asset.serialNumber === serialNumber)) {
    throw new Error('Ya existe un activo con ese número de serie.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const actorId = await getCurrentActorId()
    const { error } = await supabase.from('assets').insert({
      internal_code: code,
      name,
      category: input.category,
      brand: brand === 'Sin marca' ? null : brand,
      model: model === 'Sin modelo' ? null : model,
      serial_number: serialNumber === 'Sin serie' ? null : serialNumber,
      purchase_date: purchaseDate,
      purchase_cost: input.cost,
      status: 'Disponible',
      location,
      notes: observations,
      warranty_end_date: warrantyEnd || null,
      renewal_date: nextRenewal || null,
      end_of_life_date: endOfLife || null,
      created_by: actorId,
    })

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const createdAsset = getWorkspaceData().assets.find((asset) => asset.code.toUpperCase() === code)

    if (!createdAsset) {
      throw new Error('El activo se creó, pero la vista no pudo refrescarse correctamente.')
    }

    return createdAsset
  }

  const createdAsset: Asset = {
    id: `ast-${crypto.randomUUID()}`,
    code,
    name,
    category: input.category,
    brand,
    model,
    serialNumber,
    purchaseDate,
    cost: input.cost,
    status: 'Disponible',
    location,
    observations,
    warrantyEnd: warrantyEnd || undefined,
    nextRenewal: nextRenewal || undefined,
    endOfLife: endOfLife || undefined,
  }

  setWorkspaceData({
    ...workspace,
    assets: sortAssets([...workspace.assets, createdAsset]),
    auditEvents: [
      createLocalAuditEvent('Activo', `Se registró el activo ${createdAsset.code} ${createdAsset.name}.`),
      ...workspace.auditEvents,
    ],
  })

  return createdAsset
}

export async function createAssignment(
  input: CreateAssignmentInput,
  context: MutationContext,
): Promise<Assignment> {
  const assetId = normalizeText(input.assetId)
  const employeeId = normalizeText(input.employeeId)
  const deliveredAt = normalizeText(input.deliveredAt, new Date().toISOString())
  const deliveredAtIso = new Date(deliveredAt).toISOString()
  const notes = normalizeText(input.notes, 'Asignación registrada desde AssetFlow.')

  if (!assetId || !employeeId) {
    throw new Error('Selecciona un activo y un empleado para registrar la asignación.')
  }

  const workspace = getWorkspaceData()
  const asset = workspace.assets.find((currentAsset) => currentAsset.id === assetId)
  const employee = workspace.employees.find((currentEmployee) => currentEmployee.id === employeeId)

  if (!asset) {
    throw new Error('El activo seleccionado ya no está disponible en el workspace.')
  }

  if (!employee) {
    throw new Error('El empleado seleccionado ya no está disponible en el workspace.')
  }

  if (asset.status !== 'Disponible') {
    throw new Error('Solo se pueden asignar activos que estén disponibles.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const actorId = await getCurrentActorId()
    const { error } = await supabase.from('asset_assignments').insert({
      asset_id: assetId,
      employee_id: employeeId,
      assigned_by: actorId,
      delivered_at: deliveredAtIso,
      notes,
    })

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const createdAssignment = getWorkspaceData().assignments.find(
      (assignment) =>
        assignment.assetId === assetId &&
        assignment.employeeId === employeeId &&
        assignment.returnedAt == null,
    )

    if (!createdAssignment) {
      throw new Error('La asignación se creó, pero la vista no pudo refrescarse correctamente.')
    }

    return createdAssignment
  }

  const createdAssignment: Assignment = {
    id: `asn-${crypto.randomUUID()}`,
    assetId,
    employeeId,
    assignedAt: deliveredAtIso,
    deliveredAt: deliveredAtIso,
    returnedAt: null,
    assignedBy: 'Demo local',
    assignedByRole: context.fallbackRole,
    notes,
  }

  setWorkspaceData({
    ...workspace,
    assets: workspace.assets.map((currentAsset) =>
      currentAsset.id === assetId
        ? {
            ...currentAsset,
            status: 'Asignado',
            assignedEmployeeId: employeeId,
          }
        : currentAsset,
    ),
    assignments: [createdAssignment, ...workspace.assignments],
    auditEvents: [
      {
        id: `evt-local-${crypto.randomUUID()}`,
        entity: 'Asignación',
        action: 'Asignación',
        actor: 'Demo local',
        occurredAt: deliveredAtIso,
        description: `Se asignó ${asset.code} a ${employee.fullName}.`,
      },
      ...workspace.auditEvents,
    ],
  })

  return createdAssignment
}

export async function returnAssignment(
  input: ReturnAssignmentInput,
  context: MutationContext,
): Promise<Assignment> {
  const assignmentId = normalizeText(input.assignmentId)
  const returnedAt = normalizeText(input.returnedAt, new Date().toISOString())
  const returnedAtIso = new Date(returnedAt).toISOString()
  const workspace = getWorkspaceData()
  const assignment = workspace.assignments.find((currentAssignment) => currentAssignment.id === assignmentId)

  if (!assignment) {
    throw new Error('La asignación seleccionada ya no existe en el workspace.')
  }

  if (assignment.returnedAt) {
    throw new Error('Esta asignación ya estaba devuelta.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase
      .from('asset_assignments')
      .update({ returned_at: returnedAtIso })
      .eq('id', assignmentId)

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const updatedAssignment = getWorkspaceData().assignments.find(
      (currentAssignment) => currentAssignment.id === assignmentId,
    )

    if (!updatedAssignment) {
      throw new Error('La devolución se registró, pero la vista no pudo refrescarse correctamente.')
    }

    return updatedAssignment
  }

  const asset = workspace.assets.find((currentAsset) => currentAsset.id === assignment.assetId)
  const employee = workspace.employees.find(
    (currentEmployee) => currentEmployee.id === assignment.employeeId,
  )

  const updatedAssignment: Assignment = {
    ...assignment,
    returnedAt: returnedAtIso,
  }

  setWorkspaceData({
    ...workspace,
    assets: workspace.assets.map((currentAsset) =>
      currentAsset.id === assignment.assetId
        ? {
            ...currentAsset,
            status: 'Disponible',
            assignedEmployeeId: undefined,
          }
        : currentAsset,
    ),
    assignments: sortAssignments(
      workspace.assignments.map((currentAssignment) =>
        currentAssignment.id === assignmentId ? updatedAssignment : currentAssignment,
      ),
    ),
    auditEvents: [
      {
        id: `evt-local-${crypto.randomUUID()}`,
        entity: 'Asignación',
        action: 'Devolución',
        actor: 'Demo local',
        occurredAt: returnedAtIso,
        description: `Se devolvió ${asset?.code ?? assignment.assetId} de ${employee?.fullName ?? assignment.employeeId}.`,
      },
      ...workspace.auditEvents,
    ],
  })

  return updatedAssignment
}

export async function updateEmployee(
  employeeId: string,
  input: UpdateEmployeeInput,
  context: MutationContext,
): Promise<Employee> {
  const normalizedEmployeeId = normalizeText(employeeId)
  const firstName = normalizeText(input.firstName)
  const lastName = normalizeText(input.lastName)
  const email = normalizeText(input.email).toLowerCase()
  const department = normalizeText(input.department)
  const position = normalizeText(input.position)
  const startDate = normalizeText(input.startDate)
  const phone = normalizeText(input.phone, 'Sin teléfono')
  const workspace = getWorkspaceData()
  const currentEmployee = workspace.employees.find((employee) => employee.id === normalizedEmployeeId)

  if (!currentEmployee) {
    throw new Error('El empleado seleccionado ya no existe en el workspace.')
  }

  if (!firstName || !lastName || !email || !department || !position || !startDate) {
    throw new Error('Completa nombre, apellidos, email, departamento, cargo y fecha de alta.')
  }

  if (!ensureEmployeeEmailIsUnique(workspace.employees, email, normalizedEmployeeId)) {
    throw new Error('Ya existe otro empleado con ese email.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase
      .from('employees')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone === 'Sin teléfono' ? null : phone,
        department,
        position,
        start_date: startDate,
        status: input.status,
      })
      .eq('id', normalizedEmployeeId)

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const updatedEmployee = getWorkspaceData().employees.find(
      (employee) => employee.id === normalizedEmployeeId,
    )

    if (!updatedEmployee) {
      throw new Error('El empleado se actualizó, pero la vista no pudo refrescarse correctamente.')
    }

    return updatedEmployee
  }

  const updatedEmployee: Employee = {
    ...currentEmployee,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    department,
    position,
    startDate,
    status: input.status,
  }

  setWorkspaceData({
    ...workspace,
    employees: sortEmployees(
      workspace.employees.map((employee) =>
        employee.id === normalizedEmployeeId ? updatedEmployee : employee,
      ),
    ),
    auditEvents: [
      createLocalAuditEvent('Empleado', `Se actualizó el empleado ${updatedEmployee.fullName}.`, 'Modificación'),
      ...workspace.auditEvents,
    ],
  })

  return updatedEmployee
}

export async function deleteEmployee(employeeId: string, context: MutationContext): Promise<void> {
  const normalizedEmployeeId = normalizeText(employeeId)
  const workspace = getWorkspaceData()
  const currentEmployee = workspace.employees.find((employee) => employee.id === normalizedEmployeeId)

  if (!currentEmployee) {
    throw new Error('El empleado seleccionado ya no existe en el workspace.')
  }

  const hasAssignedAssets = workspace.assets.some(
    (asset) => asset.assignedEmployeeId === normalizedEmployeeId,
  )
  const hasAssignmentHistory = workspace.assignments.some(
    (assignment) => assignment.employeeId === normalizedEmployeeId,
  )

  if (hasAssignedAssets || hasAssignmentHistory) {
    throw new Error('No se puede borrar un empleado con activos asignados o historial de asignaciones.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase.from('employees').delete().eq('id', normalizedEmployeeId)

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)
    return
  }

  setWorkspaceData({
    ...workspace,
    employees: workspace.employees.filter((employee) => employee.id !== normalizedEmployeeId),
    auditEvents: [
      createLocalAuditEvent('Empleado', `Se eliminó el empleado ${currentEmployee.fullName}.`, 'Baja'),
      ...workspace.auditEvents,
    ],
  })
}

export async function updateAsset(
  assetId: string,
  input: UpdateAssetInput,
  context: MutationContext,
): Promise<Asset> {
  const normalizedAssetId = normalizeText(assetId)
  const code = normalizeText(input.code).toUpperCase()
  const name = normalizeText(input.name)
  const brand = normalizeText(input.brand, 'Sin marca')
  const model = normalizeText(input.model, 'Sin modelo')
  const serialNumber = normalizeText(input.serialNumber, 'Sin serie')
  const purchaseDate = normalizeText(input.purchaseDate)
  const location = normalizeText(input.location)
  const observations = normalizeText(input.observations, 'Activo actualizado desde AssetFlow.')
  const warrantyEnd = normalizeText(input.warrantyEnd)
  const nextRenewal = normalizeText(input.nextRenewal)
  const endOfLife = normalizeText(input.endOfLife)
  const workspace = getWorkspaceData()
  const currentAsset = workspace.assets.find((asset) => asset.id === normalizedAssetId)

  if (!currentAsset) {
    throw new Error('El activo seleccionado ya no existe en el workspace.')
  }

  if (!code || !name || !purchaseDate || !location) {
    throw new Error('Completa código, nombre, fecha de compra y ubicación del activo.')
  }

  if (!ensureAssetCodeIsUnique(workspace.assets, code, normalizedAssetId)) {
    throw new Error('Ya existe otro activo con ese código interno.')
  }

  if (!ensureAssetSerialIsUnique(workspace.assets, serialNumber, normalizedAssetId)) {
    throw new Error('Ya existe otro activo con ese número de serie.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase
      .from('assets')
      .update({
        internal_code: code,
        name,
        category: input.category,
        brand: brand === 'Sin marca' ? null : brand,
        model: model === 'Sin modelo' ? null : model,
        serial_number: serialNumber === 'Sin serie' ? null : serialNumber,
        purchase_date: purchaseDate,
        purchase_cost: input.cost,
        location,
        notes: observations,
        warranty_end_date: warrantyEnd || null,
        renewal_date: nextRenewal || null,
        end_of_life_date: endOfLife || null,
      })
      .eq('id', normalizedAssetId)

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)

    const updatedAsset = getWorkspaceData().assets.find((asset) => asset.id === normalizedAssetId)

    if (!updatedAsset) {
      throw new Error('El activo se actualizó, pero la vista no pudo refrescarse correctamente.')
    }

    return updatedAsset
  }

  const updatedAsset: Asset = {
    ...currentAsset,
    code,
    name,
    category: input.category,
    brand,
    model,
    serialNumber,
    purchaseDate,
    cost: input.cost,
    location,
    observations,
    warrantyEnd: warrantyEnd || undefined,
    nextRenewal: nextRenewal || undefined,
    endOfLife: endOfLife || undefined,
  }

  setWorkspaceData({
    ...workspace,
    assets: sortAssets(
      workspace.assets.map((asset) => (asset.id === normalizedAssetId ? updatedAsset : asset)),
    ),
    auditEvents: [
      createLocalAuditEvent('Activo', `Se actualizó el activo ${updatedAsset.code} ${updatedAsset.name}.`, 'Modificación'),
      ...workspace.auditEvents,
    ],
  })

  return updatedAsset
}

export async function deleteAsset(assetId: string, context: MutationContext): Promise<void> {
  const normalizedAssetId = normalizeText(assetId)
  const workspace = getWorkspaceData()
  const currentAsset = workspace.assets.find((asset) => asset.id === normalizedAssetId)

  if (!currentAsset) {
    throw new Error('El activo seleccionado ya no existe en el workspace.')
  }

  const hasAssignmentHistory = workspace.assignments.some(
    (assignment) => assignment.assetId === normalizedAssetId,
  )
  const hasMaintenanceHistory = workspace.maintenanceRecords.some(
    (record) => record.assetId === normalizedAssetId,
  )
  const hasRenewalHistory = workspace.renewals.some(
    (renewal) => renewal.assetId === normalizedAssetId,
  )

  if (
    currentAsset.status === 'Asignado' ||
    hasAssignmentHistory ||
    hasMaintenanceHistory ||
    hasRenewalHistory
  ) {
    throw new Error('No se puede borrar un activo asignado o con historial asociado.')
  }

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase.from('assets').delete().eq('id', normalizedAssetId)

    if (error) {
      throw new Error(error.message)
    }

    await syncSupabaseWorkspace(context.fallbackRole)
    return
  }

  setWorkspaceData({
    ...workspace,
    assets: workspace.assets.filter((asset) => asset.id !== normalizedAssetId),
    auditEvents: [
      createLocalAuditEvent('Activo', `Se eliminó el activo ${currentAsset.code} ${currentAsset.name}.`, 'Baja'),
      ...workspace.auditEvents,
    ],
  })
}

export async function createKanbanTask(
  input: CreateKanbanTaskInput,
  context: MutationContext,
): Promise<KanbanTask> {
  const title = normalizeText(input.title)
  const description = normalizeText(input.description, 'Sin descripción operativa.')
  const owner = normalizeText(input.owner, 'Sin responsable')
  const status = toKanbanTaskStatus(input.status)
  const moduleId = toModuleId(input.moduleId)
  const workspace = getWorkspaceData()

  if (!title) {
    throw new Error('La tarea del kanban necesita al menos un título.')
  }

  const createdTask: KanbanTask = {
    id: `kanban-${crypto.randomUUID()}`,
    title,
    description,
    owner,
    moduleId,
    status,
    position: workspace.kanbanTasks.filter((task) => task.status === status).length,
  }

  const updatedTasks = normalizeKanbanTasks([...workspace.kanbanTasks, createdTask])

  if (context.mode === 'supabase') {
    await persistSupabaseKanbanTasks(updatedTasks)
    await syncSupabaseWorkspace(context.fallbackRole)

    const refreshedTask = getWorkspaceData().kanbanTasks.find((task) => task.id === createdTask.id)
    if (!refreshedTask) {
      throw new Error('La tarea se guardó, pero el panel no pudo refrescarse correctamente.')
    }

    return refreshedTask
  }

  setWorkspaceData({
    ...workspace,
    kanbanTasks: updatedTasks,
    auditEvents: [
      createLocalAuditEvent('Kanban', `Se creó la tarea ${createdTask.title}.`),
      ...workspace.auditEvents,
    ],
  })

  return createdTask
}

export async function updateKanbanTask(
  taskId: string,
  input: UpdateKanbanTaskInput,
  context: MutationContext,
): Promise<KanbanTask> {
  const normalizedTaskId = normalizeText(taskId)
  const workspace = getWorkspaceData()
  const currentTask = workspace.kanbanTasks.find((task) => task.id === normalizedTaskId)

  if (!currentTask) {
    throw new Error('La tarea seleccionada ya no existe en el kanban.')
  }

  const title = normalizeText(input.title)
  if (!title) {
    throw new Error('La tarea del kanban necesita al menos un título.')
  }

  const nextStatus = toKanbanTaskStatus(input.status)

  const updatedTask: KanbanTask = {
    ...currentTask,
    title,
    description: normalizeText(input.description, 'Sin descripción operativa.'),
    owner: normalizeText(input.owner, 'Sin responsable'),
    moduleId: toModuleId(input.moduleId),
    status: nextStatus,
    position:
      nextStatus === currentTask.status
        ? currentTask.position
        : workspace.kanbanTasks.filter(
            (task) => task.id !== normalizedTaskId && task.status === nextStatus,
          ).length,
  }

  const withoutCurrentTask = workspace.kanbanTasks.filter((task) => task.id !== normalizedTaskId)
  const updatedTasks = normalizeKanbanTasks([...withoutCurrentTask, updatedTask])

  if (context.mode === 'supabase') {
    await persistSupabaseKanbanTasks(updatedTasks)
    await syncSupabaseWorkspace(context.fallbackRole)

    const refreshedTask = getWorkspaceData().kanbanTasks.find((task) => task.id === normalizedTaskId)
    if (!refreshedTask) {
      throw new Error('La tarea se actualizó, pero el panel no pudo refrescarse correctamente.')
    }

    return refreshedTask
  }

  setWorkspaceData({
    ...workspace,
    kanbanTasks: updatedTasks,
    auditEvents: [
      createLocalAuditEvent('Kanban', `Se actualizó la tarea ${updatedTask.title}.`, 'Modificación'),
      ...workspace.auditEvents,
    ],
  })

  return updatedTask
}

export async function moveKanbanTask(
  taskId: string,
  destinationStatus: KanbanTaskStatus,
  destinationIndex: number,
  context: MutationContext,
): Promise<KanbanTask> {
  const normalizedTaskId = normalizeText(taskId)
  const workspace = getWorkspaceData()
  const currentTask = workspace.kanbanTasks.find((task) => task.id === normalizedTaskId)

  if (!currentTask) {
    throw new Error('La tarea seleccionada ya no existe en el kanban.')
  }

  const updatedTasks = moveKanbanTaskCollection(
    workspace.kanbanTasks,
    normalizedTaskId,
    destinationStatus,
    destinationIndex,
  )
  const movedTask = updatedTasks.find((task) => task.id === normalizedTaskId)

  if (!movedTask) {
    throw new Error('No se pudo recalcular la posición de la tarea seleccionada.')
  }

  if (context.mode === 'supabase') {
    await persistSupabaseKanbanTasks(updatedTasks)
    await syncSupabaseWorkspace(context.fallbackRole)

    const refreshedTask = getWorkspaceData().kanbanTasks.find((task) => task.id === normalizedTaskId)
    if (!refreshedTask) {
      throw new Error('La tarea se movió, pero el panel no pudo refrescarse correctamente.')
    }

    return refreshedTask
  }

  setWorkspaceData({
    ...workspace,
    kanbanTasks: updatedTasks,
    auditEvents: [
      createLocalAuditEvent(
        'Kanban',
        `La tarea ${currentTask.title} pasó a ${kanbanStatusLabels[movedTask.status]}.`,
        'Modificación',
      ),
      ...workspace.auditEvents,
    ],
  })

  return movedTask
}

export async function deleteKanbanTask(taskId: string, context: MutationContext): Promise<void> {
  const normalizedTaskId = normalizeText(taskId)
  const workspace = getWorkspaceData()
  const currentTask = workspace.kanbanTasks.find((task) => task.id === normalizedTaskId)

  if (!currentTask) {
    throw new Error('La tarea seleccionada ya no existe en el kanban.')
  }

  const updatedTasks = normalizeKanbanTasks(
    workspace.kanbanTasks.filter((task) => task.id !== normalizedTaskId),
  )

  if (context.mode === 'supabase') {
    if (!supabase) {
      throw new Error('Supabase no está configurado en este entorno.')
    }

    const { error } = await supabase.from('kanban_tasks').delete().eq('id', normalizedTaskId)
    if (error) {
      throw new Error(mapKanbanMutationError(error.message))
    }

    await persistSupabaseKanbanTasks(updatedTasks)
    await syncSupabaseWorkspace(context.fallbackRole)
    return
  }

  setWorkspaceData({
    ...workspace,
    kanbanTasks: updatedTasks,
    auditEvents: [
      createLocalAuditEvent('Kanban', `Se eliminó la tarea ${currentTask.title}.`, 'Baja'),
      ...workspace.auditEvents,
    ],
  })
}
