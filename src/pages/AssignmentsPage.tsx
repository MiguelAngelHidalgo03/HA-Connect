import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRightLeft, ClipboardCheck } from 'lucide-react'

import { ActionButton, DataTable, Pill, SectionCard, Timeline, type TableColumn } from '@/components/ui'
import {
  demoAssignments,
  formatDateTime,
  getActiveAssignments,
  getAssetById,
  getEmployeeById,
} from '@/data/mockData'
import {
  createAssignment,
  returnAssignment,
  type CreateAssignmentInput,
} from '@/lib/workspace'
import type { Asset, Assignment, Employee, PermissionSet, Role, SessionUser } from '@/types/domain'

function getDefaultDeliveredAt() {
  const now = new Date()
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localNow.toISOString().slice(0, 16)
}

const defaultAssignmentForm: CreateAssignmentInput = {
  assetId: '',
  employeeId: '',
  deliveredAt: getDefaultDeliveredAt(),
  notes: '',
}

export function AssignmentsPage({
  permissions,
  assets,
  employees,
  workspaceMode,
  currentRole,
}: {
  permissions: PermissionSet
  assets: Asset[]
  employees: Employee[]
  workspaceMode: SessionUser['mode']
  currentRole: Role
}) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isSavingAssignment, setIsSavingAssignment] = useState(false)
  const [isReturningAssignmentId, setIsReturningAssignmentId] = useState<string | null>(null)
  const [assignmentForm, setAssignmentForm] = useState<CreateAssignmentInput>(defaultAssignmentForm)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const activeAssignments = getActiveAssignments()
  const timelineItems = [...demoAssignments]
    .sort((left, right) => right.assignedAt.localeCompare(left.assignedAt))
    .slice(0, 8)
  const availableAssets = useMemo(
    () => assets.filter((asset) => asset.status === 'Disponible'),
    [assets],
  )

  const handleReturnAssignment = async (assignmentId: string) => {
    setIsReturningAssignmentId(assignmentId)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      await returnAssignment(
        {
          assignmentId,
          returnedAt: new Date().toISOString(),
        },
        {
          mode: workspaceMode,
          fallbackRole: currentRole,
        },
      )

      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Devolución registrada correctamente en la plataforma.'
          : 'Devolución registrada en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo registrar la devolución.')
    } finally {
      setIsReturningAssignmentId(null)
    }
  }

  const columns: Array<TableColumn<Assignment>> = [
    {
      id: 'asset',
      header: 'Activo',
      render: (assignment) => getAssetById(assignment.assetId)?.name ?? 'Activo no encontrado',
    },
    {
      id: 'employee',
      header: 'Empleado',
      render: (assignment) => getEmployeeById(assignment.employeeId)?.fullName ?? 'Empleado no encontrado',
    },
    {
      id: 'delivery',
      header: 'Entrega',
      render: (assignment) => formatDateTime(assignment.deliveredAt),
    },
    {
      id: 'assignedBy',
      header: 'Registró',
      render: (assignment) => (
        <div className="space-y-2">
          <p className="font-medium text-slate-900">{assignment.assignedBy}</p>
          <Pill label={assignment.assignedByRole} />
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      render: (assignment) => (
        <Pill label={assignment.returnedAt ? 'Devuelto' : 'Asignado'} tone={assignment.returnedAt ? 'neutral' : 'info'} />
      ),
    },
    {
      id: 'actions',
      header: 'Acción',
      render: (assignment) => (
        <ActionButton
          tone="ghost"
          disabled={!permissions.canAssignAssets || isReturningAssignmentId === assignment.id}
          onClick={() => void handleReturnAssignment(assignment.id)}
        >
          {isReturningAssignmentId === assignment.id ? 'Devolviendo...' : 'Devolver'}
        </ActionButton>
      ),
    },
  ]

  const handleCreateAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingAssignment(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      await createAssignment(assignmentForm, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setAssignmentForm(defaultAssignmentForm)
      setIsCreateFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Asignación creada correctamente en la plataforma.'
          : 'Asignación creada en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo registrar la asignación.')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard
        eyebrow="Operativa diaria"
        title="Asignación y devolución de activos"
        description="Registro íntegro de quién asignó cada activo, cuándo se entregó y cuándo fue devuelto."
        actions={
          <ActionButton
            tone="secondary"
            disabled={!permissions.canAssignAssets}
            onClick={() => {
              setIsCreateFormOpen((currentValue) => !currentValue)
              setFeedbackError(null)
              setFeedbackMessage(null)
            }}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {isCreateFormOpen ? 'Ocultar formulario' : 'Nueva asignación'}
          </ActionButton>
        }
      >
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
          <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5" onSubmit={handleCreateAssignment}>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Activo disponible</span>
              <select
                value={assignmentForm.assetId}
                onChange={(event) => setAssignmentForm({ ...assignmentForm, assetId: event.target.value })}
              >
                <option value="">Selecciona un activo</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.code} · {asset.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Empleado</span>
              <select
                value={assignmentForm.employeeId}
                onChange={(event) => setAssignmentForm({ ...assignmentForm, employeeId: event.target.value })}
              >
                <option value="">Selecciona un empleado</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} · {employee.department}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Fecha y hora de entrega</span>
              <input
                type="datetime-local"
                value={assignmentForm.deliveredAt}
                onChange={(event) =>
                  setAssignmentForm({ ...assignmentForm, deliveredAt: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Observaciones</span>
              <textarea
                rows={3}
                value={assignmentForm.notes}
                onChange={(event) => setAssignmentForm({ ...assignmentForm, notes: event.target.value })}
                placeholder="Entrega inicial con revisión visual del equipo."
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <ActionButton type="submit" disabled={isSavingAssignment}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {isSavingAssignment ? 'Guardando...' : 'Crear asignación'}
              </ActionButton>
              <ActionButton
                tone="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false)
                  setAssignmentForm(defaultAssignmentForm)
                  setFeedbackError(null)
                }}
              >
                Cancelar
              </ActionButton>
            </div>
          </form>
        ) : null}
        <DataTable columns={columns} rows={activeAssignments} emptyMessage="No hay asignaciones activas." />
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          eyebrow="Checklist"
          title="Flujo recomendado"
          description="Proceso estándar para asegurar trazabilidad, firma y devolución controlada."
        >
          <div className="grid gap-3">
            {[
              'Validar disponibilidad y estado del activo.',
              'Registrar responsable, fecha de entrega y observaciones.',
              'Adjuntar firma digital o aceptación en la siguiente iteración.',
              'Cerrar devolución con revisión del estado final.',
            ].map((step) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700">
                <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-900" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Historial"
          title="Trazabilidad reciente"
          description="Secuencia de asignaciones y devoluciones registradas en la plataforma."
        >
          <Timeline
            items={timelineItems.map((assignment) => ({
              id: assignment.id,
              title: `${getAssetById(assignment.assetId)?.code ?? assignment.assetId} · ${getEmployeeById(assignment.employeeId)?.fullName ?? assignment.employeeId}`,
              description: assignment.returnedAt
                ? `Devuelto el ${formatDateTime(assignment.returnedAt)}.`
                : `Asignación activa desde ${formatDateTime(assignment.deliveredAt)}.`,
              meta: `${assignment.assignedBy} · ${assignment.assignedByRole}`,
            }))}
          />
        </SectionCard>
      </div>
    </div>
  )
}
