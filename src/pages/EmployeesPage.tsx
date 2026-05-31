import { useState } from 'react'
import type { FormEvent } from 'react'
import { BriefcaseBusiness, Phone, UserPlus } from 'lucide-react'

import { ActionButton, DataTable, Pill, SectionCard, Timeline, type TableColumn } from '@/components/ui'
import {
  formatDate,
  formatDateTime,
  getAssignedAssetsForEmployee,
  getAssignmentsForEmployee,
} from '@/data/mockData'
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '@/lib/workspace'
import type {
  Employee,
  EmployeeStatus,
  PermissionSet,
  Role,
  SessionUser,
} from '@/types/domain'

const defaultEmployeeForm: CreateEmployeeInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  startDate: new Date().toISOString().slice(0, 10),
}

const employeeStatusOptions: EmployeeStatus[] = ['Activo', 'Vacaciones', 'Baja']

function buildEmployeeUpdateForm(employee: Employee): UpdateEmployeeInput {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone === 'Sin teléfono' ? '' : employee.phone,
    department: employee.department,
    position: employee.position,
    startDate: employee.startDate,
    status: employee.status,
  }
}

export function EmployeesPage({
  employees,
  permissions,
  workspaceMode,
  currentRole,
}: {
  employees: Employee[]
  permissions: PermissionSet
  workspaceMode: SessionUser['mode']
  currentRole: Role
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id ?? '')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [isSavingEmployee, setIsSavingEmployee] = useState(false)
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false)
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false)
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeInput>(defaultEmployeeForm)
  const [editEmployeeForm, setEditEmployeeForm] = useState<UpdateEmployeeInput | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const selectedEmployee =
    employees.find((employee) => employee.id === selectedEmployeeId) ?? employees[0]

  if (!selectedEmployee) {
    return null
  }

  const currentAssets = getAssignedAssetsForEmployee(selectedEmployee.id)
  const assignmentHistory = getAssignmentsForEmployee(selectedEmployee.id)
  const activeEmployees = employees.filter((employee) => employee.status === 'Activo').length
  const employeesWithAssets = employees.filter((employee) => getAssignedAssetsForEmployee(employee.id).length > 0).length
  const departments = new Set(employees.map((employee) => employee.department)).size

  const columns: Array<TableColumn<Employee>> = [
    {
      id: 'employee',
      header: 'Empleado',
      render: (employee) => (
        <button
          type="button"
          onClick={() => {
            setSelectedEmployeeId(employee.id)
            setIsEditFormOpen(false)
            setIsDeleteConfirmationOpen(false)
          }}
          className="text-left"
        >
          <span className="font-semibold text-slate-900">{employee.fullName}</span>
          <span className="mt-1 block text-xs text-slate-500">{employee.email}</span>
        </button>
      ),
    },
    {
      id: 'department',
      header: 'Departamento',
      render: (employee) => employee.department,
    },
    {
      id: 'position',
      header: 'Cargo',
      render: (employee) => employee.position,
    },
    {
      id: 'status',
      header: 'Estado',
      render: (employee) => <Pill label={employee.status} />,
    },
    {
      id: 'assets',
      header: 'Activos asignados',
      render: (employee) => getAssignedAssetsForEmployee(employee.id).length,
    },
  ]

  const handleCreateEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingEmployee(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const createdEmployee = await createEmployee(employeeForm, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedEmployeeId(createdEmployee.id)
      setEmployeeForm(defaultEmployeeForm)
      setIsCreateFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Empleado creado correctamente en la plataforma.'
          : 'Empleado creado en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo crear el empleado.')
    } finally {
      setIsSavingEmployee(false)
    }
  }

  const openEditEmployeeForm = () => {
    setEditEmployeeForm(buildEmployeeUpdateForm(selectedEmployee))
    setIsEditFormOpen(true)
    setIsCreateFormOpen(false)
    setIsDeleteConfirmationOpen(false)
    setFeedbackError(null)
    setFeedbackMessage(null)
  }

  const handleUpdateEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editEmployeeForm) {
      return
    }

    setIsUpdatingEmployee(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const updatedEmployee = await updateEmployee(selectedEmployee.id, editEmployeeForm, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedEmployeeId(updatedEmployee.id)
      setIsEditFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Empleado actualizado correctamente en la plataforma.'
          : 'Empleado actualizado en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo actualizar el empleado.')
    } finally {
      setIsUpdatingEmployee(false)
    }
  }

  const handleDeleteEmployee = async () => {
    setIsDeletingEmployee(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const nextEmployeeId =
        employees.find((employee) => employee.id !== selectedEmployee.id)?.id ?? ''

      await deleteEmployee(selectedEmployee.id, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedEmployeeId(nextEmployeeId)
      setIsDeleteConfirmationOpen(false)
      setIsEditFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Empleado eliminado correctamente de la plataforma.'
          : 'Empleado eliminado de la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo eliminar el empleado.')
    } finally {
      setIsDeletingEmployee(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <SectionCard
        eyebrow="Directorio"
        title="Empleados y activos asignados"
        description="Vista operativa para RRHH, IT y supervisión con histórico de entregas y devolución de equipos."
        actions={
          <ActionButton
            tone="secondary"
            disabled={!permissions.canManageEmployees}
            onClick={() => {
              setIsCreateFormOpen((currentValue) => !currentValue)
              setIsEditFormOpen(false)
              setIsDeleteConfirmationOpen(false)
              setFeedbackError(null)
              setFeedbackMessage(null)
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isCreateFormOpen ? 'Ocultar formulario' : 'Nuevo empleado'}
          </ActionButton>
        }
      >
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-500">Plantilla visible</p>
            <p className="mt-2 text-[28px] font-bold text-slate-900">{employees.length}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-500">Empleados activos</p>
            <p className="mt-2 text-[28px] font-bold text-slate-900">{activeEmployees}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-500">Con activos asignados</p>
            <p className="mt-2 text-[28px] font-bold text-slate-900">{employeesWithAssets}</p>
            <p className="mt-1 text-xs text-slate-500">{departments} departamentos representados</p>
          </div>
        </div>

        {feedbackMessage ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedbackMessage}
          </div>
        ) : null}
        {feedbackError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {feedbackError}
          </div>
        ) : null}
        {isCreateFormOpen ? (
          <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2" onSubmit={handleCreateEmployee}>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Nombre</span>
              <input
                value={employeeForm.firstName}
                onChange={(event) => setEmployeeForm({ ...employeeForm, firstName: event.target.value })}
                placeholder="Laura"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Apellidos</span>
              <input
                value={employeeForm.lastName}
                onChange={(event) => setEmployeeForm({ ...employeeForm, lastName: event.target.value })}
                placeholder="Casas"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })}
                placeholder="nombre@empresa.com"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Teléfono</span>
              <input
                value={employeeForm.phone}
                onChange={(event) => setEmployeeForm({ ...employeeForm, phone: event.target.value })}
                placeholder="+34 600 000 000"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Departamento</span>
              <input
                value={employeeForm.department}
                onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })}
                placeholder="IT"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Cargo</span>
              <input
                value={employeeForm.position}
                onChange={(event) => setEmployeeForm({ ...employeeForm, position: event.target.value })}
                placeholder="Responsable de infraestructura"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Fecha de alta</span>
              <input
                type="date"
                value={employeeForm.startDate}
                onChange={(event) => setEmployeeForm({ ...employeeForm, startDate: event.target.value })}
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <ActionButton type="submit" disabled={isSavingEmployee}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isSavingEmployee ? 'Guardando...' : 'Crear empleado'}
              </ActionButton>
              <ActionButton
                tone="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false)
                  setEmployeeForm(defaultEmployeeForm)
                  setFeedbackError(null)
                }}
              >
                Cancelar
              </ActionButton>
            </div>
          </form>
        ) : null}
        <div className="space-y-3 md:hidden">
          {employees.map((employee) => {
            const assignedAssets = getAssignedAssetsForEmployee(employee.id).length
            const isSelected = employee.id === selectedEmployeeId

            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => {
                  setSelectedEmployeeId(employee.id)
                  setIsEditFormOpen(false)
                  setIsDeleteConfirmationOpen(false)
                }}
                className={isSelected
                  ? 'w-full rounded-[22px] border border-[#1e3a5f] bg-[#1e3a5f] p-4 text-left text-white'
                  : 'w-full rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left text-slate-900'}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{employee.fullName}</p>
                    <p className={isSelected ? 'mt-1 text-sm text-slate-200' : 'mt-1 text-sm text-slate-500'}>{employee.position}</p>
                  </div>
                  <Pill label={employee.status} tone={isSelected ? 'info' : 'neutral'} />
                </div>
                <p className={isSelected ? 'mt-3 text-sm text-slate-200' : 'mt-3 text-sm text-slate-600'}>{employee.department} · {assignedAssets} activos asignados</p>
              </button>
            )
          })}
        </div>
        <div className="hidden md:block">
          <DataTable columns={columns} rows={employees} />
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          eyebrow="Ficha"
          title={selectedEmployee.fullName}
          description={`${selectedEmployee.position} · ${selectedEmployee.department}`}
          actions={
            permissions.canManageEmployees ? (
              <>
                <ActionButton tone="secondary" onClick={openEditEmployeeForm}>
                  Editar
                </ActionButton>
                {isDeleteConfirmationOpen ? (
                  <>
                    <ActionButton tone="secondary" onClick={handleDeleteEmployee} disabled={isDeletingEmployee}>
                      {isDeletingEmployee ? 'Eliminando...' : 'Confirmar borrado'}
                    </ActionButton>
                    <ActionButton tone="ghost" onClick={() => setIsDeleteConfirmationOpen(false)}>
                      Cancelar borrado
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton
                    tone="ghost"
                    onClick={() => {
                      setIsDeleteConfirmationOpen(true)
                      setIsEditFormOpen(false)
                      setFeedbackError(null)
                      setFeedbackMessage(null)
                    }}
                  >
                    Borrar
                  </ActionButton>
                )}
              </>
            ) : null
          }
        >
          {isEditFormOpen && editEmployeeForm ? (
            <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2" onSubmit={handleUpdateEmployee}>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Nombre</span>
                <input
                  value={editEmployeeForm.firstName}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, firstName: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Apellidos</span>
                <input
                  value={editEmployeeForm.lastName}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, lastName: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Email</span>
                <input
                  type="email"
                  value={editEmployeeForm.email}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, email: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Teléfono</span>
                <input
                  value={editEmployeeForm.phone}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, phone: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Departamento</span>
                <input
                  value={editEmployeeForm.department}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, department: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Cargo</span>
                <input
                  value={editEmployeeForm.position}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, position: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Fecha de alta</span>
                <input
                  type="date"
                  value={editEmployeeForm.startDate}
                  onChange={(event) =>
                    setEditEmployeeForm({ ...editEmployeeForm, startDate: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Estado</span>
                <select
                  value={editEmployeeForm.status}
                  onChange={(event) =>
                    setEditEmployeeForm({
                      ...editEmployeeForm,
                      status: event.target.value as EmployeeStatus,
                    })
                  }
                >
                  {employeeStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <ActionButton type="submit" disabled={isUpdatingEmployee}>
                  {isUpdatingEmployee ? 'Guardando...' : 'Guardar cambios'}
                </ActionButton>
                <ActionButton tone="ghost" onClick={() => setIsEditFormOpen(false)}>
                  Cancelar edición
                </ActionButton>
              </div>
            </form>
          ) : null}
          <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Contacto</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{selectedEmployee.email}</p>
                </div>
                <Pill label={selectedEmployee.status} />
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
                  <span>Alta: {formatDate(selectedEmployee.startDate)}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Departamento</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedEmployee.department}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-semibold text-slate-900">Activos actuales</p>
              <div className="mt-4 space-y-3">
                {currentAssets.length > 0 ? (
                  currentAssets.map((asset) => (
                    <div key={asset.id} className="rounded-2xl border border-white bg-white p-3">
                      <p className="font-medium text-slate-900">{asset.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {asset.code} · {asset.location}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No tiene activos asignados en este momento.</p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Trazabilidad"
          title="Historial de asignaciones"
          description="Registro de entregas y devoluciones vinculadas a la persona seleccionada."
        >
          <Timeline
            items={assignmentHistory.map((assignment) => ({
              id: assignment.id,
              title: assignment.notes,
              description: assignment.returnedAt
                ? `Devuelto el ${formatDateTime(assignment.returnedAt)}.`
                : `Entregado el ${formatDateTime(assignment.deliveredAt)} y aún activo.`,
              meta: formatDateTime(assignment.assignedAt),
            }))}
          />
        </SectionCard>
      </div>
    </div>
  )
}
