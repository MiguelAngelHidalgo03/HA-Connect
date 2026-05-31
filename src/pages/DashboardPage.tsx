import { useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ListTodo,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/ui'
import { buildKanbanBoard } from '@/data/mockData'
import { moduleLabels } from '@/features/auth/permissions'
import {
  createKanbanTask,
  deleteKanbanTask,
  moveKanbanTask,
  updateKanbanTask,
} from '@/lib/workspace'
import type {
  KanbanTask,
  KanbanTaskStatus,
  ModuleId,
  PermissionSet,
  Role,
  SessionUser,
} from '@/types/domain'

type KanbanTaskForm = {
  title: string
  description: string
  owner: string
  moduleId: ModuleId
  status: KanbanTaskStatus
}

type DraggedKanbanTask = {
  id: string
  status: KanbanTaskStatus
  index: number
}

type KanbanDropTarget = {
  status: KanbanTaskStatus
  index: number
}

const kanbanModuleOptions: ModuleId[] = [
  'alertas',
  'empleados',
  'activos',
  'asignaciones',
  'stock',
  'mantenimiento',
  'renovaciones',
  'busqueda',
  'exportaciones',
]

function createEmptyKanbanForm(ownerName: string, status: KanbanTaskStatus = 'todo'): KanbanTaskForm {
  return {
    title: '',
    description: '',
    owner: ownerName,
    moduleId: 'alertas',
    status,
  }
}

export function DashboardPage({
  permissions,
  currentRole,
  workspaceMode,
  sessionName,
  kanbanTasks,
  onNavigate,
}: {
  permissions: PermissionSet
  currentRole: Role
  workspaceMode: SessionUser['mode']
  sessionName: string
  companyName: string
  kanbanTasks: KanbanTask[]
  onNavigate: (moduleId: ModuleId) => void
}) {
  const greetingName = sessionName.split(' ').filter(Boolean)[0] ?? sessionName
  const kanbanBoard = buildKanbanBoard(kanbanTasks)
  const totalTasks = kanbanTasks.length
  const todoTasks = kanbanTasks.filter((task) => task.status === 'todo').length
  const doingTasks = kanbanTasks.filter((task) => task.status === 'doing').length
  const doneTasks = kanbanTasks.filter((task) => task.status === 'done').length
  const canEditKanban = currentRole !== 'Empleado'

  const [kanbanForm, setKanbanForm] = useState<KanbanTaskForm>(() => createEmptyKanbanForm(sessionName))
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [kanbanError, setKanbanError] = useState<string | null>(null)
  const [kanbanMessage, setKanbanMessage] = useState<string | null>(null)
  const [isSubmittingKanban, setIsSubmittingKanban] = useState(false)
  const [pendingKanbanTaskId, setPendingKanbanTaskId] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<DraggedKanbanTask | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<KanbanDropTarget | null>(null)

  const resetKanbanComposer = (status: KanbanTaskStatus = 'todo') => {
    setEditingTaskId(null)
    setKanbanForm(createEmptyKanbanForm(sessionName, status))
    setKanbanError(null)
  }

  const handleKanbanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setKanbanError(null)
    setKanbanMessage(null)
    setIsSubmittingKanban(true)

    try {
      if (editingTaskId) {
        await updateKanbanTask(editingTaskId, kanbanForm, {
          mode: workspaceMode,
          fallbackRole: currentRole,
        })
        setKanbanMessage('La tarea del dashboard se ha actualizado correctamente.')
      } else {
        await createKanbanTask(kanbanForm, {
          mode: workspaceMode,
          fallbackRole: currentRole,
        })
        setKanbanMessage('La nueva tarea se ha añadido al dashboard.')
      }

      resetKanbanComposer(kanbanForm.status)
    } catch (error) {
      setKanbanError(error instanceof Error ? error.message : 'No se pudo guardar la tarea.')
    } finally {
      setIsSubmittingKanban(false)
    }
  }

  const handleEditTask = (task: KanbanTask) => {
    setEditingTaskId(task.id)
    setKanbanForm({
      title: task.title,
      description: task.description,
      owner: task.owner,
      moduleId: task.moduleId,
      status: task.status,
    })
    setKanbanError(null)
    setKanbanMessage(null)
  }

  const handleMoveTask = async (
    taskId: string,
    destinationStatus: KanbanTaskStatus,
    destinationIndex: number,
  ) => {
    setKanbanError(null)
    setKanbanMessage(null)
    setPendingKanbanTaskId(taskId)

    try {
      await moveKanbanTask(taskId, destinationStatus, destinationIndex, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })
    } catch (error) {
      setKanbanError(error instanceof Error ? error.message : 'No se pudo mover la tarea.')
    } finally {
      setPendingKanbanTaskId(null)
    }
  }

  const getDropIndex = (destinationStatus: KanbanTaskStatus, destinationIndex: number) => {
    if (!draggedTask) {
      return destinationIndex
    }

    if (draggedTask.status === destinationStatus && draggedTask.index < destinationIndex) {
      return destinationIndex - 1
    }

    return destinationIndex
  }

  const clearDragState = () => {
    setDraggedTask(null)
    setDragOverTarget(null)
  }

  const handleTaskDragStart = (
    event: DragEvent<HTMLElement>,
    task: KanbanTask,
    taskIndex: number,
  ) => {
    if (!canEditKanban || pendingKanbanTaskId) {
      event.preventDefault()
      return
    }

    setDraggedTask({ id: task.id, status: task.status, index: taskIndex })
    setDragOverTarget({ status: task.status, index: taskIndex })
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
  }

  const handleTaskDragEnd = () => {
    clearDragState()
  }

  const handleDropZoneDragOver = (
    event: DragEvent<HTMLElement>,
    status: KanbanTaskStatus,
    index: number,
  ) => {
    if (!draggedTask) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (dragOverTarget?.status !== status || dragOverTarget.index !== index) {
      setDragOverTarget({ status, index })
    }
  }

  const handleDropZoneDrop = async (
    event: DragEvent<HTMLElement>,
    status: KanbanTaskStatus,
    index: number,
  ) => {
    event.preventDefault()

    if (!draggedTask) {
      return
    }

    const resolvedIndex = getDropIndex(status, index)
    const isSameSpot = draggedTask.status === status && draggedTask.index === resolvedIndex

    clearDragState()

    if (isSameSpot) {
      return
    }

    await handleMoveTask(draggedTask.id, status, resolvedIndex)
  }

  const renderDropZone = (status: KanbanTaskStatus, index: number) => {
    if (!canEditKanban || !draggedTask) {
      return null
    }

    const isActive = dragOverTarget?.status === status && dragOverTarget.index === index

    return (
      <div
        onDragOver={(event) => handleDropZoneDragOver(event, status, index)}
        onDrop={(event) => void handleDropZoneDrop(event, status, index)}
        className={
          isActive
            ? 'h-3 rounded-full border border-dashed border-[#1e3a5f]/40 bg-[#1e3a5f]/10'
            : 'h-3 rounded-full border border-dashed border-transparent'
        }
      />
    )
  }

  const handleDeleteTask = async (taskId: string) => {
    const currentTask = kanbanTasks.find((task) => task.id === taskId)
    if (!currentTask) {
      return
    }

    if (typeof window !== 'undefined' && !window.confirm(`¿Eliminar la tarea "${currentTask.title}"?`)) {
      return
    }

    setKanbanError(null)
    setKanbanMessage(null)
    setPendingKanbanTaskId(taskId)

    try {
      await deleteKanbanTask(taskId, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      if (editingTaskId === taskId) {
        resetKanbanComposer()
      }

      setKanbanMessage('La tarea se ha eliminado correctamente.')
    } catch (error) {
      setKanbanError(error instanceof Error ? error.message : 'No se pudo eliminar la tarea.')
    } finally {
      setPendingKanbanTaskId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <h2 className="text-[28px] font-bold text-[#1e3a5f] sm:text-[32px]">Kanban</h2>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ActionButton className="w-full sm:w-auto" onClick={() => onNavigate('inicio')}>
            Volver a Inicio
          </ActionButton>
          <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => onNavigate('alertas')}>
            Abrir alertas
          </ActionButton>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill label={`Sesión de ${greetingName}`} tone="info" />
          <Pill label={canEditKanban ? 'Edición habilitada' : 'Solo lectura'} tone={canEditKanban ? 'success' : 'neutral'} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tareas totales"
          value={totalTasks}
          helper="Visión global del trabajo que está dentro del tablero hoy."
          icon={<LayoutDashboard className="h-5 w-5" />}
        />
        <MetricCard
          label="Por hacer"
          value={todoTasks}
          helper="Pendientes que todavía no han arrancado en la operativa diaria."
          icon={<ListTodo className="h-5 w-5" />}
        />
        <MetricCard
          label="En marcha"
          value={doingTasks}
          helper="Tareas activas que están en movimiento o en seguimiento."
          icon={<LoaderCircle className="h-5 w-5" />}
        />
        <MetricCard
          label="Hechas"
          value={doneTasks}
          helper="Acciones ya cerradas y listas para enseñar en la presentación."
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        eyebrow="Kanban"
        title="Tablero de trabajo"
        description="Crea tareas, cambia su responsable, arrástralas entre columnas y conserva la misma estructura cuando trabajes con Supabase."
      >
        {canEditKanban ? (
          <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 lg:grid-cols-2" onSubmit={handleKanbanSubmit}>
            <div className="flex items-start justify-between gap-3 lg:col-span-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {editingTaskId ? 'Editar tarea del dashboard' : 'Nueva tarea del dashboard'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Usa este formulario para alta rápida y arrastra las tarjetas entre columnas para recolocarlas durante la reunión o el seguimiento diario.
                </p>
              </div>
              <Pill label={editingTaskId ? 'Edición' : 'Nueva'} tone={editingTaskId ? 'info' : 'success'} />
            </div>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Título</span>
              <input
                type="text"
                value={kanbanForm.title}
                onChange={(event) => setKanbanForm({ ...kanbanForm, title: event.target.value })}
                placeholder="Ejemplo: Revisar entrega de tablets en Lorca"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Responsable</span>
              <input
                type="text"
                value={kanbanForm.owner}
                onChange={(event) => setKanbanForm({ ...kanbanForm, owner: event.target.value })}
                placeholder="Nombre de la persona responsable"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Módulo relacionado</span>
              <select
                value={kanbanForm.moduleId}
                onChange={(event) => setKanbanForm({ ...kanbanForm, moduleId: event.target.value as ModuleId })}
              >
                {kanbanModuleOptions.map((moduleId) => (
                  <option key={moduleId} value={moduleId}>
                    {moduleLabels[moduleId]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Estado</span>
              <select
                value={kanbanForm.status}
                onChange={(event) => setKanbanForm({ ...kanbanForm, status: event.target.value as KanbanTaskStatus })}
              >
                <option value="todo">Por hacer</option>
                <option value="doing">En marcha</option>
                <option value="done">Hecho</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
              <span>Descripción</span>
              <textarea
                value={kanbanForm.description}
                onChange={(event) => setKanbanForm({ ...kanbanForm, description: event.target.value })}
                placeholder="Describe el objetivo o el contexto de la tarea."
              />
            </label>

            {kanbanError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:col-span-2">
                {kanbanError}
              </div>
            ) : null}

            {kanbanMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 lg:col-span-2">
                {kanbanMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-2">
              <ActionButton className="w-full sm:w-auto" type="submit" disabled={isSubmittingKanban}>
                <Plus className="mr-2 h-4 w-4" />
                {isSubmittingKanban ? 'Guardando...' : editingTaskId ? 'Guardar cambios' : 'Añadir tarea'}
              </ActionButton>
              <ActionButton className="w-full sm:w-auto" type="button" tone="secondary" onClick={() => resetKanbanComposer()}>
                Cancelar
              </ActionButton>
            </div>
          </form>
        ) : (
          <div className="mb-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            Este perfil puede consultar el tablero y abrir los módulos relacionados, pero no editar el dashboard.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          {kanbanBoard.map((column, columnIndex) => (
            <div key={column.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[18px] font-semibold text-slate-900">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <Pill label={`${column.tasks.length} tareas`} tone={column.tone} />
                  {canEditKanban ? (
                    <button
                      type="button"
                      onClick={() => resetKanbanComposer(column.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
                      title="Crear tarea en esta columna"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {renderDropZone(column.id, 0)}
                {column.tasks.map((task, taskIndex) => (
                  <div key={task.id} className="space-y-3">
                    <article
                      draggable={canEditKanban && pendingKanbanTaskId !== task.id}
                      onDragStart={(event) => handleTaskDragStart(event, task, taskIndex)}
                      onDragEnd={handleTaskDragEnd}
                      className={
                        draggedTask?.id === task.id
                          ? 'cursor-grabbing rounded-xl border border-[#1e3a5f] bg-white p-4 opacity-60 shadow-[0_20px_40px_-30px_rgba(30,58,95,0.75)]'
                          : 'cursor-grab rounded-xl border border-slate-200 bg-white p-4'
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">
                            {moduleLabels[task.moduleId]}
                          </p>
                        </div>
                        <Pill label={column.title} tone={column.tone} />
                      </div>

                      <p className="mt-2 text-[14px] leading-6 text-slate-600">{task.description}</p>
                      <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">{task.owner}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <ActionButton
                          tone="ghost"
                          onClick={() => onNavigate(task.moduleId)}
                          disabled={!permissions.allowedModules.includes(task.moduleId)}
                        >
                          Abrir módulo
                        </ActionButton>
                        {canEditKanban ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditTask(task)}
                              disabled={pendingKanbanTaskId === task.id}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={pendingKanbanTaskId === task.id}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Borrar
                            </button>
                          </>
                        ) : null}
                      </div>

                      {canEditKanban ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleMoveTask(task.id, kanbanBoard[columnIndex - 1].id, kanbanBoard[columnIndex - 1].tasks.length)}
                            disabled={columnIndex === 0 || pendingKanbanTaskId === task.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Mover a la columna anterior"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleMoveTask(task.id, column.id, taskIndex - 1)}
                            disabled={taskIndex === 0 || pendingKanbanTaskId === task.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Subir dentro de la columna"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleMoveTask(task.id, column.id, taskIndex + 1)}
                            disabled={taskIndex === column.tasks.length - 1 || pendingKanbanTaskId === task.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Bajar dentro de la columna"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleMoveTask(task.id, kanbanBoard[columnIndex + 1].id, kanbanBoard[columnIndex + 1].tasks.length)}
                            disabled={columnIndex === kanbanBoard.length - 1 || pendingKanbanTaskId === task.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Mover a la columna siguiente"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </article>
                    {renderDropZone(column.id, taskIndex + 1)}
                  </div>
                ))}

                {column.tasks.length === 0 ? (
                  <div
                    onDragOver={(event) => handleDropZoneDragOver(event, column.id, 0)}
                    onDrop={(event) => void handleDropZoneDrop(event, column.id, 0)}
                    className={
                      dragOverTarget?.status === column.id && dragOverTarget.index === 0
                        ? 'rounded-xl border border-dashed border-[#1e3a5f]/40 bg-[#1e3a5f]/5 px-4 py-5 text-sm text-slate-600'
                        : 'rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-sm text-slate-500'
                    }
                  >
                    {draggedTask ? 'Suelta aquí la tarea para colocarla en esta columna.' : 'No hay tareas en esta columna ahora mismo.'}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}