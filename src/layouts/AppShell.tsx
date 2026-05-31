import { useState } from 'react'
import type { ReactNode } from 'react'
import { BellRing, ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, Settings2, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { ActionButton, Pill } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/data/mockData'
import type { AppNotification, ModuleId, SessionUser } from '@/types/domain'

export interface AppShellModule {
  id: ModuleId
  label: string
  icon: LucideIcon
}

export function AppShell({
  session,
  modules,
  activeModuleId,
  activeModuleTitle,
  activeModuleHelper,
  notifications,
  statusLabel,
  sidebarCollapsed,
  workspaceLoading,
  workspaceError,
  onNavigate,
  onToggleSidebar,
  onLogout,
  children,
}: {
  session: SessionUser
  modules: AppShellModule[]
  activeModuleId: ModuleId
  activeModuleTitle: string
  activeModuleHelper: string
  notifications: AppNotification[]
  statusLabel: string
  sidebarCollapsed: boolean
  workspaceLoading: boolean
  workspaceError: string | null
  onNavigate: (moduleId: ModuleId) => void
  onToggleSidebar: () => void
  onLogout: () => void
  children: ReactNode
}) {
  const initials = session.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => notification.unread).length

  const openModuleFromShell = (moduleId: ModuleId) => {
    setIsNotificationsOpen(false)
    setIsProfileMenuOpen(false)
    setIsMobileNavOpen(false)
    onNavigate(moduleId)
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="relative flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMobileNavOpen((current) => !current)
                setIsNotificationsOpen(false)
                setIsProfileMenuOpen(false)
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1e3a5f] lg:hidden"
              aria-label="Abrir menú"
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f] text-sm font-bold text-white">
              HA
            </div>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1e3a5f] lg:flex"
              aria-label={sidebarCollapsed ? 'Expandir lateral' : 'Colapsar lateral'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[13px] font-medium text-[#64748b]">Hermanos Alcaraz</p>
              <h1 className="text-[24px] font-bold text-[#1e3a5f]">HA Connect</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((current) => !current)
                  setIsProfileMenuOpen(false)
                  setIsMobileNavOpen(false)
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1e3a5f] transition hover:border-[#1e3a5f]"
                aria-label="Notificaciones"
              >
                <BellRing className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              </button>

              {isNotificationsOpen ? (
                <div className="fixed left-4 right-4 top-24 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[min(26rem,calc(100vw-2rem))]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-semibold text-slate-900">Notificaciones</p>
                      <p className="text-[13px] text-slate-500">Avisos simulados con el mismo tono que tendría producción.</p>
                    </div>
                    <Pill label={`${notifications.length} avisos`} tone={unreadCount > 0 ? 'warning' : 'neutral'} />
                  </div>
                  <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openModuleFromShell(notification.moduleId)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-[#1e3a5f] hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[15px] font-semibold text-slate-900">{notification.title}</p>
                                {notification.unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> : null}
                              </div>
                              <p className="mt-2 text-[14px] leading-6 text-slate-600">{notification.description}</p>
                            </div>
                            <Pill label={notification.unread ? 'Nuevo' : 'Visto'} tone={notification.tone} />
                          </div>
                          <p className="mt-3 text-[12px] font-medium text-slate-500">{formatDateTime(notification.createdAt)}</p>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-[14px] text-slate-600">
                        No hay avisos pendientes.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => openModuleFromShell('alertas')}>
                      Ver alertas
                    </ActionButton>
                    <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => openModuleFromShell('ajustes')}>
                      Ajustes de avisos
                    </ActionButton>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen((current) => !current)
                  setIsNotificationsOpen(false)
                  setIsMobileNavOpen(false)
                }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[15px] font-semibold text-slate-900">{session.name}</p>
                  <p className="text-[13px] text-[#64748b]">{session.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#64748b]" />
              </button>

              {isProfileMenuOpen ? (
                <div className="fixed right-4 top-24 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] sm:absolute sm:right-0 sm:top-14 sm:w-64">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[15px] font-semibold text-slate-900">{session.name}</p>
                    <p className="mt-1 text-[13px] text-slate-600">{session.email}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => openModuleFromShell('ajustes')}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a5f]"
                    >
                      <Settings2 className="h-4 w-4" />
                      Abrir ajustes
                    </button>
                    <button
                      type="button"
                      onClick={() => openModuleFromShell('alertas')}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a5f]"
                    >
                      <BellRing className="h-4 w-4" />
                      Revisar alertas
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a5f]"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : null}
              </div>
          </div>
        </div>
      </header>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 top-20 z-30 bg-slate-950/35 lg:hidden" onClick={() => setIsMobileNavOpen(false)}>
          <div
            className="h-full w-[min(21rem,92vw)] overflow-y-auto bg-[#1e3a5f] px-4 py-5 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-[13px] font-medium text-white/80">Sesión activa</p>
              <p className="mt-3 text-[16px] font-semibold text-white">{session.name}</p>
              <p className="mt-1 text-[13px] text-white/70">{session.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill label={session.role} />
                <Pill label={statusLabel} tone="info" />
              </div>
            </div>

            <nav className="mt-5 space-y-2">
              {modules.map((module) => {
                const isActive = module.id === activeModuleId

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => openModuleFromShell(module.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-[15px] font-medium transition',
                      isActive ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10',
                    )}
                  >
                    <module.icon className="h-5 w-5 shrink-0" />
                    <span>{module.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-5 flex flex-col gap-3">
              <ActionButton className="w-full" tone="secondary" onClick={() => openModuleFromShell('ajustes')}>
                <Settings2 className="mr-2 h-4 w-4" />
                Abrir ajustes
              </ActionButton>
              <ActionButton className="w-full" tone="secondary" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      <aside className={cn(
        'fixed bottom-0 left-0 top-20 hidden overflow-y-auto bg-[#1e3a5f] py-5 text-white transition-[width,padding] duration-200 lg:block',
        sidebarCollapsed ? 'w-[88px] px-3' : 'w-[240px] px-4',
      )}>
        <nav className="space-y-2">
          {modules.map((module) => {
            const isActive = module.id === activeModuleId

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onNavigate(module.id)}
                className={cn(
                  'flex w-full items-center rounded-lg py-3.5 text-left text-[15px] font-medium transition',
                  sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white hover:bg-white/10',
                )}
              >
                <module.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed ? <span>{module.label}</span> : null}
              </button>
            )
          })}
        </nav>

        {sidebarCollapsed ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white/10 px-2 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
              {initials}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-[13px] font-medium text-white/80">Sesión activa</p>
            <p className="mt-3 text-[16px] font-semibold text-white">{session.name}</p>
            <p className="mt-1 text-[13px] text-white/70">{session.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill label={session.role} />
              <Pill label={statusLabel} tone="info" />
            </div>
            <div className="mt-5">
              <ActionButton tone="secondary" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </ActionButton>
            </div>
          </div>
        )}
      </aside>

      <div className={cn('pt-20 transition-[padding] duration-200', sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[240px]')}>
        <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-[#64748b]">Módulo activo</p>
            <h2 className="text-[24px] font-bold text-[#1e3a5f]">{activeModuleTitle}</h2>
            <p className="text-[14px] text-[#64748b]">{activeModuleHelper}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill label={session.role} />
            <Pill label={statusLabel} tone="info" />
            <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => setIsMobileNavOpen(true)}>
              <Menu className="mr-2 h-4 w-4" />
              Abrir menú
            </ActionButton>
          </div>
        </div>

        <main id="app-shell-scroll-root" className="px-4 py-5 lg:px-6 lg:py-6">
          <section className="mb-6 hidden items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white px-4 py-4 lg:flex lg:px-6 lg:py-5">
            <div>
              <p className="text-[13px] font-medium text-[#64748b]">Módulo activo</p>
              <h2 className="mt-2 text-[28px] font-bold text-[#1e3a5f]">{activeModuleTitle}</h2>
              <p className="mt-2 max-w-3xl text-[15px] text-[#64748b]">{activeModuleHelper}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill label={session.role} />
              <Pill label={statusLabel} tone="info" />
            </div>
          </section>

          {workspaceError ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-800">
              {workspaceError}
            </div>
          ) : null}
          {workspaceLoading ? (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-[#64748b]">
              Actualizando la información de la plataforma.
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  )
}