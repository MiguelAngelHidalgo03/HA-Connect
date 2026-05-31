import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { BellRing, Building2, Clock3, Mail, RefreshCw, Save, Settings2, ShieldCheck } from 'lucide-react'

import { ActionButton, Pill, SectionCard } from '@/components/ui'
import { demoRoleProfiles, roleCapabilityHighlights, rolePermissions } from '@/features/auth/permissions'
import type { ModuleId, PermissionSet, Role, SessionUser } from '@/types/domain'

type UiPreferences = {
  startModule: ModuleId
  homeFocusModule: ModuleId
  showRoleGuide: boolean
  sidebarCollapsed: boolean
}

const startModuleOptions: Array<{ value: ModuleId; label: string }> = [
  { value: 'inicio', label: 'Inicio' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'alertas', label: 'Alertas' },
  { value: 'empleados', label: 'Empleados' },
  { value: 'activos', label: 'Inventario' },
]

const homeFocusOptions: Array<{ value: ModuleId; label: string }> = [
  { value: 'alertas', label: 'Alertas' },
  { value: 'empleados', label: 'Empleados' },
  { value: 'activos', label: 'Inventario' },
  { value: 'asignaciones', label: 'Asignaciones' },
  { value: 'stock', label: 'Stock' },
]

const integrations = [
  { id: 'erp', name: 'ERP de compras', status: 'Conectado', detail: 'Sincronización nocturna a las 02:30.' },
  { id: 'mail', name: 'Correo corporativo', status: 'Activo', detail: 'Resumen diario enviado a supervisión a las 07:30.' },
  { id: 'print', name: 'Impresión y albaranes', status: 'Preparado', detail: 'Cola de impresión configurada para oficina y almacén.' },
  { id: 'excel', name: 'Plantillas Excel', status: 'Disponible', detail: 'Exportaciones compatibles para RRHH y compras.' },
]

function toneForStatus(status: string) {
  switch (status) {
    case 'Conectado':
    case 'Activo':
      return 'success'
    case 'Preparado':
      return 'info'
    default:
      return 'neutral'
  }
}

export function SettingsPage({
  session,
  permissions,
  sessionMode,
  statusLabel,
  preferences,
  onUpdatePreferences,
  onSwitchDemoRole,
  onNavigate,
}: {
  session: SessionUser
  permissions: PermissionSet
  sessionMode: SessionUser['mode']
  statusLabel: string
  preferences: UiPreferences
  onUpdatePreferences: Dispatch<SetStateAction<UiPreferences>>
  onSwitchDemoRole: (role: Role) => void
  onNavigate: (moduleId: ModuleId) => void
}) {
  const [emailSummary, setEmailSummary] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = () => {
    const time = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())

    setMessage(`Ajustes guardados a las ${time}. El inicio queda en ${startModuleOptions.find((item) => item.value === preferences.startModule)?.label?.toLowerCase()} y el panel principal prioriza ${homeFocusOptions.find((item) => item.value === preferences.homeFocusModule)?.label?.toLowerCase()}.`)
  }

  const handleReset = () => {
    onUpdatePreferences((currentValue) => ({
      ...currentValue,
      startModule: 'inicio',
      homeFocusModule: 'alertas',
      showRoleGuide: true,
      sidebarCollapsed: false,
    }))
    setEmailSummary(true)
    setCriticalAlerts(true)
    setMessage('Se han restaurado los ajustes simulados recomendados para la operativa diaria.')
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Ajustes"
        title="Configuración general"
        description="Información ficticia pero realista para simular cómo quedaría la plataforma configurada en producción."
        actions={<Pill label={statusLabel} tone="info" />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Módulo inicial</p>
                <p className="text-[14px] text-slate-600">Pantalla de entrada recomendada para tu sesión.</p>
              </div>
            </div>
            <select
              className="mt-4"
              value={preferences.startModule}
              onChange={(event) =>
                onUpdatePreferences((currentValue) => ({
                  ...currentValue,
                  startModule: event.target.value as ModuleId,
                }))
              }
            >
              {startModuleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Foco de la portada</p>
                <p className="text-[14px] text-slate-600">Decide qué bloque debe destacarse primero al entrar.</p>
              </div>
            </div>
            <select
              className="mt-4"
              value={preferences.homeFocusModule}
              onChange={(event) =>
                onUpdatePreferences((currentValue) => ({
                  ...currentValue,
                  homeFocusModule: event.target.value as ModuleId,
                }))
              }
            >
              {homeFocusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Alertas críticas</p>
                <p className="text-[14px] text-slate-600">Aviso inmediato para renovaciones, stock y mantenimiento.</p>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-3 text-[15px] text-slate-700">
              <input type="checkbox" checked={criticalAlerts} onChange={(event) => setCriticalAlerts(event.target.checked)} />
              <span>Mostrar campana y resumen prioritario en cabecera</span>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Resumen diario</p>
                <p className="text-[14px] text-slate-600">Envío automático con incidencias a primera hora.</p>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-3 text-[15px] text-slate-700">
              <input type="checkbox" checked={emailSummary} onChange={(event) => setEmailSummary(event.target.checked)} />
              <span>Enviar correo a las 07:30 con incidencias abiertas</span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-[15px] text-slate-700">
            <span className="font-semibold text-slate-900">Mostrar guía de roles</span>
            <span className="mt-2 block text-[14px] text-slate-600">Explica permisos y diferencias entre perfiles dentro del inicio.</span>
            <input
              className="mt-4"
              type="checkbox"
              checked={preferences.showRoleGuide}
              onChange={(event) =>
                onUpdatePreferences((currentValue) => ({
                  ...currentValue,
                  showRoleGuide: event.target.checked,
                }))
              }
            />
          </label>
          <label className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-[15px] text-slate-700">
            <span className="font-semibold text-slate-900">Lateral compacto</span>
            <span className="mt-2 block text-[14px] text-slate-600">Reduce el menú izquierdo para ganar espacio en escritorio.</span>
            <input
              className="mt-4"
              type="checkbox"
              checked={preferences.sidebarCollapsed}
              onChange={(event) =>
                onUpdatePreferences((currentValue) => ({
                  ...currentValue,
                  sidebarCollapsed: event.target.checked,
                }))
              }
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ActionButton className="w-full sm:w-auto" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </ActionButton>
          <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Restaurar ajustes
          </ActionButton>
          <ActionButton className="w-full sm:w-auto" tone="secondary" onClick={() => onNavigate('alertas')}>
            Abrir alertas
          </ActionButton>
        </div>
        {message ? <p className="mt-4 text-[15px] text-slate-600">{message}</p> : null}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Perfil"
          title="Sesión y permisos"
          description="Datos visibles para el usuario, con el mismo tono operativo que tendría una instalación real."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[14px] text-slate-500">Usuario</p>
              <p className="mt-2 text-[20px] font-semibold text-slate-900">{session.name}</p>
              <p className="mt-1 text-[14px] text-slate-600">{session.email}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[14px] text-slate-500">Rol activo</p>
              <p className="mt-2 text-[20px] font-semibold text-slate-900">{session.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill label={permissions.canExport ? 'Exportación activa' : 'Exportación limitada'} tone={permissions.canExport ? 'success' : 'neutral'} />
                <Pill label={permissions.canViewAudit ? 'Auditoría visible' : 'Auditoría restringida'} tone={permissions.canViewAudit ? 'info' : 'neutral'} />
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#1e3a5f]" />
              <p className="text-[15px] font-semibold text-slate-900">Política simulada de sesión</p>
            </div>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              Cierre automático tras 8 horas de inactividad, renovación de credenciales cada 90 días y bloqueo blando tras 5 intentos erróneos.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Integraciones"
          title="Servicios conectados"
          description="Estados simulados que ayudan a visualizar cómo quedaría el panel con sistemas corporativos ya enlazados."
        >
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#1e3a5f]" />
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{integration.name}</p>
                      <p className="text-[14px] text-slate-600">{integration.detail}</p>
                    </div>
                  </div>
                  <Pill label={integration.status} tone={toneForStatus(integration.status)} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Roles"
        title="Laboratorio de perfiles"
        description="Comprueba qué puede hacer cada tipo de usuario y cambia entre ellos cuando estés en demo."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {(Object.keys(demoRoleProfiles) as Role[]).map((role) => {
            const canUseRole = sessionMode === 'demo'

            return (
              <article key={role} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[18px] font-semibold text-slate-900">{role}</p>
                    <p className="mt-1 text-[14px] text-slate-600">{demoRoleProfiles[role].name}</p>
                  </div>
                  <Pill label={session.role === role ? 'Rol activo' : 'Disponible'} tone={session.role === role ? 'info' : 'neutral'} />
                </div>
                <p className="mt-3 text-[14px] leading-6 text-slate-600">{roleCapabilityHighlights[role].summary}</p>
                <div className="mt-4 space-y-2 text-[14px] text-slate-700">
                  {roleCapabilityHighlights[role].canDo.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-[14px] text-slate-500">
                  {roleCapabilityHighlights[role].restrictions.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {rolePermissions[role].allowedModules.slice(0, 5).map((moduleId) => (
                    <Pill key={moduleId} label={moduleId} tone="info" />
                  ))}
                </div>
                <div className="mt-5">
                  <ActionButton
                    className="w-full sm:w-auto"
                    tone="secondary"
                    disabled={!canUseRole || session.role === role}
                    onClick={() => onSwitchDemoRole(role)}
                  >
                    {canUseRole ? 'Entrar como este rol' : 'Solo disponible en demo'}
                  </ActionButton>
                </div>
              </article>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Seguridad"
        title="Controles recomendados"
        description="Resumen operativo para entender qué políticas están activas en la plataforma corporativa."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <ShieldCheck className="h-5 w-5 text-[#1e3a5f]" />
            <p className="mt-4 text-[18px] font-semibold text-slate-900">MFA recomendado</p>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">Activación progresiva para responsables de área y administración.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <Mail className="h-5 w-5 text-[#1e3a5f]" />
            <p className="mt-4 text-[18px] font-semibold text-slate-900">Avisos diarios</p>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">Resumen de incidencias, entregas pendientes y renovaciones próximas.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <Building2 className="h-5 w-5 text-[#1e3a5f]" />
            <p className="mt-4 text-[18px] font-semibold text-slate-900">Centros operativos</p>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">Oficina central, almacén principal y base de flota ya definidos en catálogo.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}