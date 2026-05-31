import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  BellRing,
  Boxes,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/ui'
import {
  companyProfile,
  demoEmployees,
  formatDateTime,
  getAppNotifications,
  getCriticalAlertCount,
  getDashboardSummary,
  getMaintenanceUpcoming,
  getStockAlerts,
} from '@/data/mockData'
import { moduleLabels, roleCapabilityHighlights } from '@/features/auth/permissions'
import type { ModuleId, PermissionSet, Role } from '@/types/domain'

type QuickAccess = {
  id: string
  title: string
  description: string
  cta: string
  moduleId: ModuleId
  icon: LucideIcon
}

type HomeWidgetId = 'metrics' | 'quickAccess' | 'notifications' | 'profile' | 'operations' | 'campaign'

const homeWidgetStorageKey = 'ha-connect.home-widgets'
const defaultHomeWidgets: HomeWidgetId[] = ['metrics', 'quickAccess', 'notifications', 'profile']

const homeWidgetCatalog: Array<{ id: HomeWidgetId; title: string; description: string }> = [
  {
    id: 'metrics',
    title: 'Indicadores rápidos',
    description: 'Totales operativos visibles al entrar.',
  },
  {
    id: 'quickAccess',
    title: 'Accesos directos',
    description: 'Atajos a las áreas principales de trabajo.',
  },
  {
    id: 'notifications',
    title: 'Qué revisar hoy',
    description: 'Avisos recientes y seguimiento diario.',
  },
  {
    id: 'profile',
    title: 'Perfil o contexto',
    description: 'Rol activo o contexto general de la empresa.',
  },
  {
    id: 'operations',
    title: 'Centros y sectores',
    description: 'Ubicaciones activas y áreas de actividad.',
  },
  {
    id: 'campaign',
    title: 'Campaña y recursos',
    description: 'Resumen compacto de campaña, flota y almacenes.',
  },
]

function normalizeHomeWidgets(value: unknown): HomeWidgetId[] {
  if (!Array.isArray(value)) {
    return defaultHomeWidgets
  }

  const validIds = new Set(homeWidgetCatalog.map((widget) => widget.id))
  const normalized = value.filter(
    (widgetId): widgetId is HomeWidgetId => typeof widgetId === 'string' && validIds.has(widgetId as HomeWidgetId),
  )
  const unique = normalized.filter((widgetId, index) => normalized.indexOf(widgetId) === index)

  return unique.length > 0 ? unique : defaultHomeWidgets
}

function readStoredHomeWidgets(): HomeWidgetId[] {
  if (typeof window === 'undefined') {
    return defaultHomeWidgets
  }

  const storedWidgets = window.localStorage.getItem(homeWidgetStorageKey)
  if (!storedWidgets) {
    return defaultHomeWidgets
  }

  try {
    return normalizeHomeWidgets(JSON.parse(storedWidgets))
  } catch {
    window.localStorage.removeItem(homeWidgetStorageKey)
    return defaultHomeWidgets
  }
}

function moveHomeWidget(widgets: HomeWidgetId[], fromIndex: number, toIndex: number) {
  const nextWidgets = [...widgets]
  const [movedWidget] = nextWidgets.splice(fromIndex, 1)
  nextWidgets.splice(toIndex, 0, movedWidget)
  return nextWidgets
}

function QuickAccessCard({
  action,
  canAccess,
  onNavigate,
}: {
  action: QuickAccess
  canAccess: boolean
  onNavigate: (moduleId: ModuleId) => void
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl bg-slate-950 p-3 text-white">
          <action.icon className="h-5 w-5" />
        </div>
        <Pill label={canAccess ? 'Disponible' : 'Restringido'} tone={canAccess ? 'success' : 'neutral'} />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{action.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
      <div className="mt-5">
        <ActionButton
          className="w-full sm:w-auto"
          tone={canAccess ? 'primary' : 'ghost'}
          disabled={!canAccess}
          onClick={() => onNavigate(action.moduleId)}
        >
          {action.cta}
        </ActionButton>
      </div>
    </article>
  )
}

export function HomePage({
  permissions,
  currentRole,
  sessionName,
  companyName,
  homeFocusModule,
  showRoleGuide,
  onNavigate,
}: {
  permissions: PermissionSet
  currentRole: Role
  sessionName: string
  companyName: string
  homeFocusModule: ModuleId
  showRoleGuide: boolean
  onNavigate: (moduleId: ModuleId) => void
}) {
  const summary = getDashboardSummary()
  const criticalAlerts = getCriticalAlertCount()
  const stockAlerts = getStockAlerts().length
  const upcomingMaintenance = getMaintenanceUpcoming(60).length
  const activeEmployees = demoEmployees.filter((employee) => employee.status === 'Activo').length
  const greetingName = sessionName.split(' ').filter(Boolean)[0] ?? sessionName
  const greetingDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const notifications = getAppNotifications(4)
  const roleGuide = roleCapabilityHighlights[currentRole]
  const [isEditingWidgets, setIsEditingWidgets] = useState(false)
  const [homeWidgets, setHomeWidgets] = useState<HomeWidgetId[]>(() => readStoredHomeWidgets())

  const quickAccess: QuickAccess[] = [
    {
      id: 'quick-dashboard',
      title: 'Abrir Dashboard',
      description: 'Entra directamente al tablero Kanban para organizar tareas, moverlas y cerrar pendientes.',
      cta: 'Ir al dashboard',
      moduleId: 'dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'quick-alerts',
      title: 'Revisar alertas',
      description: 'Consulta vencimientos, stock bajo y avisos operativos sin cambiar de contexto.',
      cta: 'Ver alertas',
      moduleId: 'alertas',
      icon: BellRing,
    },
    {
      id: 'quick-employees',
      title: 'Equipo y responsables',
      description: 'Accede al personal, sus estados y la relación con activos y movimientos.',
      cta: 'Abrir empleados',
      moduleId: 'empleados',
      icon: Users,
    },
    {
      id: 'quick-assets',
      title: 'Inventario central',
      description: 'Consulta equipos, vehículos, EPIs y licencias desde una única vista ordenada.',
      cta: 'Abrir inventario',
      moduleId: 'activos',
      icon: Boxes,
    },
    {
      id: 'quick-assignments',
      title: 'Entregas y devoluciones',
      description: 'Gestiona altas, cambios y devoluciones de material con trazabilidad completa.',
      cta: 'Abrir asignaciones',
      moduleId: 'asignaciones',
      icon: ArrowRightLeft,
    },
    {
      id: 'quick-maintenance',
      title: 'Mantenimiento y stock',
      description: 'Supervisa taller, reposiciones y recursos críticos desde las áreas clave.',
      cta: 'Abrir mantenimiento',
      moduleId: 'mantenimiento',
      icon: Wrench,
    },
  ]

  const focusedAction = quickAccess.find((action) => action.moduleId === homeFocusModule) ?? quickAccess[0]
  const hiddenWidgets = homeWidgetCatalog.filter((widget) => !homeWidgets.includes(widget.id))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(homeWidgetStorageKey, JSON.stringify(homeWidgets))
  }, [homeWidgets])

  const moveWidget = (widgetId: HomeWidgetId, direction: -1 | 1) => {
    setHomeWidgets((currentWidgets) => {
      const currentIndex = currentWidgets.indexOf(widgetId)
      const targetIndex = currentIndex + direction

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= currentWidgets.length) {
        return currentWidgets
      }

      return moveHomeWidget(currentWidgets, currentIndex, targetIndex)
    })
  }

  const addWidget = (widgetId: HomeWidgetId) => {
    setHomeWidgets((currentWidgets) =>
      currentWidgets.includes(widgetId) ? currentWidgets : [...currentWidgets, widgetId],
    )
  }

  const removeWidget = (widgetId: HomeWidgetId) => {
    setHomeWidgets((currentWidgets) =>
      currentWidgets.length <= 1 ? currentWidgets : currentWidgets.filter((currentId) => currentId !== widgetId),
    )
  }

  const renderWidgetToolbar = (widgetId: HomeWidgetId, index: number) => {
    if (!isEditingWidgets) {
      return null
    }

    const widgetMeta = homeWidgetCatalog.find((widget) => widget.id === widgetId)
    if (!widgetMeta) {
      return null
    }

    return (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{widgetMeta.title}</p>
          <p className="mt-1 text-sm text-slate-600">{widgetMeta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => moveWidget(widgetId, -1)}
            disabled={index === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
            Subir
          </button>
          <button
            type="button"
            onClick={() => moveWidget(widgetId, 1)}
            disabled={index === homeWidgets.length - 1}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
            Bajar
          </button>
          <button
            type="button"
            onClick={() => removeWidget(widgetId)}
            disabled={homeWidgets.length <= 1}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        </div>
      </div>
    )
  }

  const renderWidgetContent = (widgetId: HomeWidgetId) => {
    switch (widgetId) {
      case 'metrics':
        return (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Equipo activo"
              value={activeEmployees}
              helper="Personas disponibles para la operativa diaria en este momento."
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Activos asignados"
              value={summary.assignedAssets}
              helper="Equipos y materiales ya entregados y en uso por la plantilla."
              icon={<Boxes className="h-5 w-5" />}
            />
            <MetricCard
              label="Alertas abiertas"
              value={criticalAlerts}
              helper="Avisos que conviene revisar antes de cerrar la jornada."
              icon={<BellRing className="h-5 w-5" />}
            />
            <MetricCard
              label="Mantenimiento y stock"
              value={upcomingMaintenance + stockAlerts}
              helper="Suma de revisiones próximas y referencias por debajo del mínimo."
              icon={<Warehouse className="h-5 w-5" />}
            />
          </section>
        )
      case 'quickAccess':
        return (
          <SectionCard
            eyebrow="Accesos rápidos"
            title="Entradas directas"
            description="Cada bloque abre el área correspondiente sin mezclar el inicio con el tablero de trabajo."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickAccess.map((action) => (
                <QuickAccessCard
                  key={action.id}
                  action={action}
                  canAccess={permissions.allowedModules.includes(action.moduleId)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </SectionCard>
        )
      case 'notifications':
        return (
          <SectionCard
            eyebrow="Seguimiento"
            title="Qué revisar hoy"
            description="Resumen visual para enseñar qué está pasando sin entrar todavía al detalle operativo."
          >
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onNavigate(notification.moduleId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#1e3a5f] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-2 text-[14px] leading-6 text-slate-600">{notification.description}</p>
                      <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">
                        {moduleLabels[notification.moduleId]} · {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    <Pill label={notification.unread ? 'Nuevo' : 'Visto'} tone={notification.tone} />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        )
      case 'profile':
        return showRoleGuide ? (
          <SectionCard
            eyebrow="Perfil"
            title={`Qué puede hacer ${currentRole}`}
            description="Resumen del alcance del perfil dentro de la plataforma."
            actions={<Pill label={currentRole} />}
          >
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-semibold text-slate-900">Resumen del rol</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{roleGuide.summary}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {roleGuide.canDo.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                <p className="font-semibold">Restricción principal</p>
                <p className="mt-1">{roleGuide.restrictions[0]}</p>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <ActionButton tone="secondary" onClick={() => onNavigate('dashboard')}>
                  Abrir dashboard de trabajo
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            eyebrow="Empresa"
            title={`Contexto de ${companyName}`}
            description="Resumen general cuando prefieres ocultar la guía de roles."
          >
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-semibold text-slate-900">Áreas operativas</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{companyProfile.sectors.join(' · ')}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {companyProfile.activeSites.map((site) => (
                  <Pill key={site} label={site} tone="info" />
                ))}
              </div>
            </div>
          </SectionCard>
        )
      case 'operations':
        return (
          <SectionCard
            eyebrow="Operativa"
            title="Centros y sectores"
            description="Visión compacta de ubicaciones activas y actividad principal."
          >
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-900">Centros activos</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {companyProfile.activeSites.map((site) => (
                    <Pill key={site} label={site} tone="info" />
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-900">Sectores</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{companyProfile.sectors.join(' · ')}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Almacenes</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{companyProfile.activeWarehouses}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Flota activa</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{companyProfile.activeFleet}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Rutas / día</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{companyProfile.dailyRoutes}</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )
      case 'campaign':
        return (
          <SectionCard
            eyebrow="Campaña"
            title={companyProfile.currentCampaign}
            description="Resumen de recursos disponibles para la jornada actual."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Flota activa</p>
                <p className="mt-2 text-[30px] font-bold text-slate-900">{companyProfile.activeFleet}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Almacenes</p>
                <p className="mt-2 text-[30px] font-bold text-slate-900">{companyProfile.activeWarehouses}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Rutas / día</p>
                <p className="mt-2 text-[30px] font-bold text-slate-900">{companyProfile.dailyRoutes}</p>
              </div>
            </div>
          </SectionCard>
        )
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="text-[13px] font-medium capitalize text-[#64748b]">{greetingDate}</p>
        <h2 className="mt-2 text-[28px] font-bold text-[#1e3a5f] sm:text-[32px]">Buenos días, {greetingName}</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          Una portada limpia para presentar el estado general de la empresa, abrir cada área con rapidez y mantener una lectura clara desde el primer vistazo.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ActionButton className="w-full sm:w-auto" onClick={() => onNavigate(focusedAction.moduleId)}>
            {focusedAction.cta}
          </ActionButton>
          <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => onNavigate('dashboard')}>
            Abrir dashboard
          </ActionButton>
          <ActionButton
            className="w-full sm:w-auto"
            tone={isEditingWidgets ? 'primary' : 'secondary'}
            onClick={() => setIsEditingWidgets((currentValue) => !currentValue)}
          >
            {isEditingWidgets ? 'Terminar edición' : 'Personalizar widgets'}
          </ActionButton>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill label={companyProfile.currentCampaign} tone="warning" />
          <Pill label={`Flota activa ${companyProfile.activeFleet}`} tone="neutral" />
          <Pill label={`Plantilla estimada ${companyProfile.employeeCount}`} tone="info" />
          {isEditingWidgets ? <Pill label="Edición de widgets" tone="info" /> : null}
        </div>
      </section>

      {isEditingWidgets ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#64748b]">Personalizar inicio</p>
              <h2 className="mt-2 text-[24px] font-bold text-[#1e3a5f] sm:text-[28px]">Mover y añadir widgets</h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                Reordena las secciones visibles y añade las que quieras dejar fijas en la portada.
              </p>
            </div>
            <Pill label={`${homeWidgets.length} widgets visibles`} tone="info" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {hiddenWidgets.length > 0 ? (
              hiddenWidgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => addWidget(widget.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-[#1e3a5f] hover:bg-white hover:text-[#1e3a5f]"
                >
                  <Plus className="h-4 w-4" />
                  {widget.title}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-600">Ya tienes todos los widgets disponibles visibles en Inicio.</p>
            )}
          </div>
        </section>
      ) : null}

      {homeWidgets.map((widgetId, index) => (
        <div key={widgetId} className="space-y-3">
          {renderWidgetToolbar(widgetId, index)}
          {renderWidgetContent(widgetId)}
        </div>
      ))}
    </div>
  )
}