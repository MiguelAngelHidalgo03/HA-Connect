import { useEffect, useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRightLeft,
  BellRing,
  Boxes,
  Download,
  History,
  House,
  KeyRound,
  LayoutDashboard,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { ActionButton, Pill } from '@/components/ui'
import {
  companyProfile,
  getAppNotifications,
  getCriticalAlertCount,
  getDashboardSummary,
  getMaintenanceUpcoming,
  resetWorkspaceData,
  getWorkspaceSnapshot,
  subscribeWorkspaceData,
} from '@/data/mockData'
import { demoRoleProfiles, hasModuleAccess, roleCapabilityHighlights, rolePermissions } from '@/features/auth/permissions'
import { cn } from '@/lib/cn'
import { AppShell } from '@/layouts/AppShell'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { syncSupabaseWorkspace } from '@/lib/workspace'
import { AlertsPage } from '@/pages/AlertsPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AssignmentsPage } from '@/pages/AssignmentsPage'
import { AuditPage } from '@/pages/AuditPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { ExportsPage } from '@/pages/ExportsPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { RenewalsPage } from '@/pages/RenewalsPage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StockPage } from '@/pages/StockPage'
import type { ModuleId, Role, SessionUser } from '@/types/domain'

const sessionStorageKey = 'ha-connect.session'
const uiPreferencesStorageKey = 'ha-connect.preferences'

type UiPreferences = {
  startModule: ModuleId
  homeFocusModule: ModuleId
  showRoleGuide: boolean
  sidebarCollapsed: boolean
}

const defaultUiPreferences: UiPreferences = {
  startModule: 'inicio',
  homeFocusModule: 'alertas',
  showRoleGuide: true,
  sidebarCollapsed: false,
}

const knownDisplayNames: Record<string, string> = {
  'miguelahidalgo03@gmail.com': 'Miguel A. Hidalgo',
  'miguelahidalgo03@googlemail.com': 'Miguel A. Hidalgo',
}

function getDefaultLoginEmail() {
  return isSupabaseConfigured ? '' : demoRoleProfiles.Administrador.email
}

function prettifyEmailName(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const knownName = knownDisplayNames[normalizedEmail]
  if (knownName) {
    return knownName
  }

  return normalizedEmail
    .split('@')[0]
    .replace(/\d+/g, '')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || normalizedEmail
}

function getRoleFromMetadata(value: unknown, fallback: Role): Role {
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

function buildSupabaseSessionUser(
  email: string,
  metadata: Record<string, unknown> | undefined,
  fallbackRole: Role,
): SessionUser {
  const metadataName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''

  return {
    name: metadataName || prettifyEmailName(email),
    email,
    role: getRoleFromMetadata(metadata?.role, fallbackRole),
    mode: 'supabase',
  }
}

function readStoredUiPreferences(): UiPreferences {
  if (typeof window === 'undefined') {
    return defaultUiPreferences
  }

  const savedPreferences = window.localStorage.getItem(uiPreferencesStorageKey)
  if (!savedPreferences) {
    return defaultUiPreferences
  }

  try {
    return { ...defaultUiPreferences, ...(JSON.parse(savedPreferences) as Partial<UiPreferences>) }
  } catch {
    window.localStorage.removeItem(uiPreferencesStorageKey)
    return defaultUiPreferences
  }
}

function resolvePreferredModule(role: Role, preferredModule: ModuleId) {
  return hasModuleAccess(role, preferredModule) ? preferredModule : 'inicio'
}

function mapSupabaseAuthError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Comprueba que estás usando el usuario correcto.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Ese usuario existe, pero su email no está confirmado. Márcalo como confirmado en el panel de autenticación.'
  }

  if (normalizedMessage.includes('signup is disabled')) {
    return 'El acceso por email está deshabilitado en la configuración de autenticación.'
  }

  return message
}

function readStoredSession(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const savedSession = window.localStorage.getItem(sessionStorageKey)
  if (!savedSession) {
    return null
  }

  try {
    return JSON.parse(savedSession) as SessionUser
  } catch {
    window.localStorage.removeItem(sessionStorageKey)
    return null
  }
}

const initialSession = readStoredSession()
const initialRole: Role = initialSession?.role ?? 'Administrador'
const initialEmail = initialSession?.email ?? getDefaultLoginEmail()
const initialUiPreferences = readStoredUiPreferences()

const moduleDefinitions: Array<{
  id: ModuleId
  label: string
  icon: LucideIcon
  helper: string
}> = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: House,
    helper: 'Portada limpia con el estado general del día, accesos directos y contexto de presentación.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    helper: 'Kanban de tareas.',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: BellRing,
    helper: 'Avisos urgentes, stock bajo y próximos mantenimientos en una sola vista.',
  },
  {
    id: 'empleados',
    label: 'Empleados',
    icon: Users,
    helper: 'Directorio operativo con activos asignados, estado y trazabilidad por persona.',
  },
  {
    id: 'activos',
    label: 'Inventario',
    icon: Boxes,
    helper: 'Inventario centralizado para TI, vehículos, herramientas, EPIs, ropa y software.',
  },
  {
    id: 'asignaciones',
    label: 'Asignaciones',
    icon: ArrowRightLeft,
    helper: 'Registro controlado de entregas, devoluciones y responsables de cada movimiento.',
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: Warehouse,
    helper: 'Seguimiento de consumibles, mínimos y alertas de reposición.',
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    icon: Wrench,
    helper: 'Averías, revisiones, ITV y planificación técnica para evitar paradas.',
  },
  {
    id: 'renovaciones',
    label: 'Renovaciones',
    icon: BellRing,
    helper: 'Control de garantías, suscripciones y fin de vida útil con alertas preventivas.',
  },
  {
    id: 'historial',
    label: 'Historial',
    icon: History,
    helper: 'Auditoría consolidada de todos los eventos críticos del sistema.',
  },
  {
    id: 'busqueda',
    label: 'Buscar',
    icon: Search,
    helper: 'Filtrado cruzado por categoría, empleado, departamento, estado y fechas.',
  },
  {
    id: 'exportaciones',
    label: 'Exportaciones',
    icon: Download,
    helper: 'Salidas a CSV, Excel compatible y PDF para reporting y auditoría.',
  },
  {
    id: 'ajustes',
    label: 'Ajustes',
    icon: Settings2,
    helper: 'Preferencias, avisos, conexiones y configuración operativa simulada.',
  },
]

export default function App() {
  const workspace = useSyncExternalStore(
    subscribeWorkspaceData,
    getWorkspaceSnapshot,
    getWorkspaceSnapshot,
  )
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<SessionUser | null>(initialSession)
  const [activeModule, setActiveModule] = useState<ModuleId>(resolvePreferredModule(initialRole, initialUiPreferences.startModule))
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [workspaceSource, setWorkspaceSource] = useState<'demo' | 'supabase'>(
    initialSession?.mode ?? 'demo',
  )
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(initialUiPreferences)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)
  const sessionMode = session?.mode
  const sessionRole = session?.role
  const sessionEmail = session?.email

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(session))
      return
    }

    window.localStorage.removeItem(sessionStorageKey)
  }, [session])

  useEffect(() => {
    window.localStorage.setItem(uiPreferencesStorageKey, JSON.stringify(uiPreferences))
  }, [uiPreferences])

  useEffect(() => {
    let isCancelled = false

    async function loadWorkspace() {
      if (!session || sessionMode !== 'supabase' || !supabase) {
        resetWorkspaceData()
        if (!isCancelled) {
          setWorkspaceSource('demo')
          setWorkspaceLoading(false)
          setWorkspaceError(null)
        }
        return
      }

      if (!isCancelled) {
        setWorkspaceLoading(true)
        setWorkspaceError(null)
      }

      try {
        const { sessionUser, warning } = await syncSupabaseWorkspace(sessionRole ?? 'Empleado')
        if (isCancelled) {
          return
        }

        setSession((currentSession) => {
          if (!currentSession || currentSession.mode !== 'supabase') {
            return currentSession
          }

          if (
            currentSession.name === sessionUser.name &&
            currentSession.email === sessionUser.email &&
            currentSession.role === sessionUser.role
          ) {
            return currentSession
          }

          return sessionUser
        })
        setWorkspaceSource('supabase')
        setWorkspaceError(warning)
      } catch (error) {
        if (isCancelled) {
          return
        }

        resetWorkspaceData()
        setWorkspaceSource('demo')
        setWorkspaceError(error instanceof Error ? error.message : 'No se pudo cargar la plataforma.')
      } finally {
        if (!isCancelled) {
          setWorkspaceLoading(false)
        }
      }
    }

    void loadWorkspace()

    return () => {
      isCancelled = true
    }
  }, [session, sessionEmail, sessionMode, sessionRole])

  const currentRole = session?.role ?? selectedRole
  const permissions = rolePermissions[currentRole]
  const supabaseBadge = !isSupabaseConfigured
    ? 'Demo guiada'
    : workspaceLoading
      ? 'Sincronizando datos'
      : workspaceSource === 'supabase'
        ? 'Datos en vivo'
        : 'Acceso listo'
  const criticalAlerts = getCriticalAlertCount()
  const appNotifications = getAppNotifications()
  const dashboardSummary = getDashboardSummary()
  const upcomingMaintenance = getMaintenanceUpcoming(60).length
  const selectedRoleHighlights = roleCapabilityHighlights[selectedRole].canDo.slice(0, 2)

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role)
    setEmail(demoRoleProfiles[role].email)
    setAuthError(null)
  }

  const switchDemoRole = (role: Role) => {
    const profile = demoRoleProfiles[role]
    setSelectedRole(role)
    setEmail(profile.email)
    setSession({
      name: profile.name,
      email: profile.email,
      role,
      mode: 'demo',
    })
    setWorkspaceSource('demo')
    setActiveModule(resolvePreferredModule(role, uiPreferences.startModule))
    setWorkspaceError(null)
    setAuthError(null)
  }

  const enterDemoWorkspace = () => {
    resetWorkspaceData()
    const profile = demoRoleProfiles[selectedRole]
    setSession({
      name: profile.name,
      email: profile.email,
      role: selectedRole,
      mode: 'demo',
    })
    setWorkspaceSource('demo')
    setActiveModule(resolvePreferredModule(selectedRole, uiPreferences.startModule))
    setAuthError(null)
    setWorkspaceError(null)
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setAuthError('Introduce el email real del usuario que has creado en el panel de usuarios.')
      return
    }

    if (password.trim().length < 6) {
      setAuthError('Usa una contraseña de al menos 6 caracteres para continuar.')
      return
    }

    setIsSigningIn(true)
    setAuthError(null)

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (error) {
          setAuthError(mapSupabaseAuthError(error.message))
          return
        }

        const signedUser = data.user
        if (!signedUser?.email) {
          setAuthError('La plataforma inició la sesión, pero no devolvió un email de usuario válido.')
          return
        }

        const resolvedRole = getRoleFromMetadata(signedUser.user_metadata?.role, selectedRole)
        setSession(buildSupabaseSessionUser(signedUser.email, signedUser.user_metadata, selectedRole))
        setWorkspaceSource('supabase')
        setActiveModule(resolvePreferredModule(resolvedRole, uiPreferences.startModule))
        setWorkspaceError(null)
        return
      }

      enterDemoWorkspace()
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleLogout = () => {
    if (session?.mode === 'supabase' && supabase) {
      void supabase.auth.signOut()
    }

    resetWorkspaceData()
    setSession(null)
    setWorkspaceSource('demo')
    setWorkspaceError(null)
    setActiveModule(resolvePreferredModule('Administrador', uiPreferences.startModule))
    setSelectedRole('Administrador')
    setEmail(demoRoleProfiles.Administrador.email)
    setPassword('')
  }

  const handleNavigate = (moduleId: ModuleId) => {
    setActiveModule(moduleId)

    if (typeof window === 'undefined') {
      return
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.documentElement.scrollTo({ top: 0, behavior: 'auto' })
      document.body.scrollTo({ top: 0, behavior: 'auto' })
      document.getElementById('app-shell-scroll-root')?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(30,58,95,0.18),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef4f8_100%)] px-4 py-5 lg:px-6 lg:py-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f] text-sm font-bold text-white">HA</div>
              <div>
                <p className="text-[13px] font-medium text-[#64748b]">{companyProfile.shortName}</p>
                <h1 className="text-[24px] font-bold text-[#1e3a5f]">HA Connect</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill label="Lorca" tone="info" />
              <Pill label={supabaseBadge} tone={isSupabaseConfigured ? 'success' : 'info'} />
            </div>
          </header>

          <div className="grid min-h-[calc(100vh-7.5rem)] gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <section className="relative overflow-hidden rounded-[32px] bg-[#1e3a5f] p-6 text-white shadow-[0_40px_100px_-50px_rgba(30,58,95,0.95)] sm:p-8 lg:p-10">
              <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                    Dashboard de activos
                  </span>
                  <h2 className="mt-5 max-w-xl text-[38px] font-bold leading-tight sm:text-[46px]">
                    Acceso simple para la operativa de Lorca
                  </h2>
                  <p className="mt-4 max-w-xl text-[16px] leading-7 text-slate-200">
                    Entra al dashboard para controlar flota, almacenes, personal, mantenimientos y avisos de Hermanos Alcaraz de Lorca.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Activos</p>
                    <p className="mt-2 text-[30px] font-bold">{dashboardSummary.totalAssets}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Alertas</p>
                    <p className="mt-2 text-[30px] font-bold">{criticalAlerts}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Mantenimiento</p>
                    <p className="mt-2 text-[30px] font-bold">{upcomingMaintenance}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Rutas / dia</p>
                    <p className="mt-2 text-[30px] font-bold">{companyProfile.dailyRoutes}</p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-white/15 bg-white/10 p-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">Hoy</p>
                    <p className="mt-2 text-xl font-semibold">{companyProfile.currentCampaign}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {companyProfile.activeSites.map((site) => (
                        <span
                          key={site}
                          className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                        >
                          {site}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:content-start">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/60">Almacenes</p>
                      <p className="mt-1 text-2xl font-semibold">{companyProfile.activeWarehouses}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/60">Sectores</p>
                      <p className="mt-1 text-sm leading-6 text-white/80">{companyProfile.sectors.join(' · ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] sm:p-8">
              <div className="flex h-full flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#1e3a5f] p-3 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Acceso</p>
                      <h2 className="mt-1 text-[30px] font-bold text-[#1e3a5f]">Iniciar sesion</h2>
                    </div>
                  </div>
                  <Pill label={isSupabaseConfigured ? 'Acceso real' : 'Demo'} tone={isSupabaseConfigured ? 'success' : 'info'} />
                </div>

                <p className="text-sm leading-7 text-slate-600">
                  {isSupabaseConfigured
                    ? 'Usa tu email corporativo para entrar al dashboard.'
                    : 'Prueba la demo con uno de los perfiles de trabajo.'}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(demoRoleProfiles) as Role[]).map((role) => {
                    const profile = demoRoleProfiles[role]
                    const isActive = role === selectedRole

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelection(role)}
                        className={cn(
                          'rounded-2xl border p-4 text-left transition',
                          isActive
                            ? 'border-[#1e3a5f] bg-[#eef4fb] shadow-[0_26px_50px_-38px_rgba(30,58,95,0.85)]'
                            : 'border-slate-200 bg-slate-50 hover:border-[#1e3a5f]',
                        )}
                      >
                        <p className="font-semibold text-slate-900">{role}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{profile.name}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{roleCapabilityHighlights[role].landing}</p>
                      </button>
                    )
                  })}
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={isSupabaseConfigured ? 'tu.usuario@hmnosalcaraz.com' : 'nombre@hmnosalcaraz.com'}
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Introduce tu contraseña"
                  />
                </label>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">Perfil activo</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedRole} · {demoRoleProfiles[selectedRole].name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRoleHighlights.map((capability) => (
                      <Pill key={capability} label={capability} tone="info" />
                    ))}
                  </div>
                  {isSupabaseConfigured ? (
                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      Si el usuario tiene rol sincronizado en Supabase, ese rol se aplica al entrar.
                    </p>
                  ) : null}
                </div>
                {authError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {authError}
                  </div>
                ) : null}
                {workspaceError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {workspaceError}
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ActionButton className="w-full sm:w-auto" type="submit" disabled={isSigningIn}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {isSigningIn
                      ? 'Accediendo...'
                      : isSupabaseConfigured
                        ? 'Iniciar sesión'
                        : 'Iniciar sesión'}
                  </ActionButton>
                  <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={enterDemoWorkspace}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Entrar en demo
                  </ActionButton>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-slate-900">Listo para trabajar</p>
                    <p className="mt-1 text-[14px] leading-6 text-slate-600">
                      Inicio, dashboard y trazabilidad preparados para una presentación clara y profesional.
                    </p>
                  </div>
                  <Pill label={supabaseBadge} tone={isSupabaseConfigured ? 'success' : 'info'} />
                </div>
              </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  const accessibleModules = moduleDefinitions.filter((module) => hasModuleAccess(session.role, module.id))
  const resolvedActiveModule = hasModuleAccess(session.role, activeModule)
    ? activeModule
    : (accessibleModules[0]?.id ?? 'inicio')
  const activeModuleMeta =
    moduleDefinitions.find((module) => module.id === resolvedActiveModule) ?? moduleDefinitions[0]

  let moduleContent = (
    <HomePage
      permissions={permissions}
      currentRole={session.role}
      sessionName={session.name}
      companyName={companyProfile.shortName}
      homeFocusModule={uiPreferences.homeFocusModule}
      showRoleGuide={uiPreferences.showRoleGuide}
      onNavigate={handleNavigate}
    />
  )

  switch (resolvedActiveModule) {
    case 'inicio':
      moduleContent = (
        <HomePage
          permissions={permissions}
          currentRole={session.role}
          sessionName={session.name}
          companyName={companyProfile.shortName}
          homeFocusModule={uiPreferences.homeFocusModule}
          showRoleGuide={uiPreferences.showRoleGuide}
          onNavigate={handleNavigate}
        />
      )
      break
    case 'dashboard':
      moduleContent = (
        <DashboardPage
          permissions={permissions}
          currentRole={session.role}
          workspaceMode={session.mode}
          sessionName={session.name}
          companyName={companyProfile.shortName}
          kanbanTasks={workspace.kanbanTasks}
          onNavigate={handleNavigate}
        />
      )
      break
    case 'alertas':
      moduleContent = <AlertsPage onNavigate={handleNavigate} />
      break
    case 'empleados':
      moduleContent = (
        <EmployeesPage
          employees={workspace.employees}
          permissions={permissions}
          workspaceMode={session.mode}
          currentRole={session.role}
        />
      )
      break
    case 'activos':
      moduleContent = (
        <AssetsPage
          assets={workspace.assets}
          permissions={permissions}
          workspaceMode={session.mode}
          currentRole={session.role}
        />
      )
      break
    case 'asignaciones':
      moduleContent = (
        <AssignmentsPage
          permissions={permissions}
          assets={workspace.assets}
          employees={workspace.employees}
          workspaceMode={session.mode}
          currentRole={session.role}
        />
      )
      break
    case 'stock':
      moduleContent = <StockPage permissions={permissions} />
      break
    case 'mantenimiento':
      moduleContent = <MaintenancePage permissions={permissions} />
      break
    case 'renovaciones':
      moduleContent = <RenewalsPage permissions={permissions} />
      break
    case 'historial':
      moduleContent = <AuditPage permissions={permissions} />
      break
    case 'busqueda':
      moduleContent = <SearchPage />
      break
    case 'exportaciones':
      moduleContent = <ExportsPage permissions={permissions} />
      break
    case 'ajustes':
      moduleContent = (
        <SettingsPage
          session={session}
          permissions={permissions}
          sessionMode={session.mode}
          statusLabel={supabaseBadge}
          preferences={uiPreferences}
          onUpdatePreferences={setUiPreferences}
          onSwitchDemoRole={switchDemoRole}
          onNavigate={handleNavigate}
        />
      )
      break
  }

  return (
    <AppShell
      session={session}
      modules={accessibleModules}
      activeModuleId={resolvedActiveModule}
      activeModuleTitle={activeModuleMeta.label}
      activeModuleHelper={activeModuleMeta.helper}
      notifications={appNotifications}
      statusLabel={supabaseBadge}
      sidebarCollapsed={uiPreferences.sidebarCollapsed}
      workspaceLoading={workspaceLoading}
      workspaceError={workspaceError}
      onNavigate={handleNavigate}
      onToggleSidebar={() =>
        setUiPreferences((currentValue) => ({
          ...currentValue,
          sidebarCollapsed: !currentValue.sidebarCollapsed,
        }))
      }
      onLogout={handleLogout}
    >
      {moduleContent}
    </AppShell>
  )
}
