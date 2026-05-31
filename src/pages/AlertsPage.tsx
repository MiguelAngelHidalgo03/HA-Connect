import { AlertTriangle, BellRing, Boxes, Wrench } from 'lucide-react'

import { ActionButton, Pill, SectionCard, Timeline } from '@/components/ui'
import {
  formatDate,
  formatDateTime,
  getAssetById,
  getAuditEvents,
  getMaintenanceUpcoming,
  getStockAlerts,
  getUpcomingRenewals,
} from '@/data/mockData'
import type { ModuleId } from '@/types/domain'

type AlertTone = 'urgent' | 'attention' | 'info'

function alertClasses(tone: AlertTone) {
  switch (tone) {
    case 'urgent':
      return 'border-l-4 border-l-rose-500 bg-rose-50'
    case 'attention':
      return 'border-l-4 border-l-[#f59e0b] bg-amber-50'
    default:
      return 'border-l-4 border-l-[#64748b] bg-slate-50'
  }
}

export function AlertsPage({
  onNavigate,
}: {
  onNavigate: (moduleId: ModuleId) => void
}) {
  const urgentRenewals = getUpcomingRenewals(45)
  const stockAlerts = getStockAlerts()
  const maintenanceAlerts = getMaintenanceUpcoming(60)
  const totalAlerts = urgentRenewals.length + stockAlerts.length + maintenanceAlerts.length

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Alertas"
        title="Alertas pendientes"
        description="Resumen claro de lo que necesita atención inmediata para que ningún recurso quede sin control."
        actions={<Pill label={`${totalAlerts} alertas`} tone={totalAlerts > 0 ? 'warning' : 'success'} />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {urgentRenewals.slice(0, 4).map((renewal) => {
            const asset = getAssetById(renewal.assetId)
            return (
              <article key={renewal.id} className={`rounded-xl px-4 py-4 ${alertClasses('urgent')}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-rose-600" />
                    <p className="text-[16px] font-semibold text-slate-900">Renovación urgente</p>
                  </div>
                  <Pill label="Urgente" tone="danger" />
                </div>
                <p className="mt-3 text-[15px] text-slate-700">
                  {asset?.name ?? 'Activo sin identificar'} vence el {formatDate(renewal.dueDate)}.
                </p>
                <div className="mt-4">
                  <ActionButton tone="secondary" onClick={() => onNavigate('renovaciones')}>
                    Ver detalles
                  </ActionButton>
                </div>
              </article>
            )
          })}

          {stockAlerts.slice(0, 4).map((item) => (
            <article key={item.id} className={`rounded-xl px-4 py-4 ${alertClasses('attention')}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Boxes className="h-5 w-5 text-[#f59e0b]" />
                  <p className="text-[16px] font-semibold text-slate-900">Stock bajo mínimo</p>
                </div>
                <Pill label="Atención" tone="warning" />
              </div>
              <p className="mt-3 text-[15px] text-slate-700">
                {item.name} tiene {item.available} disponibles y el mínimo es {item.minimum}.
              </p>
              <div className="mt-4">
                <ActionButton tone="secondary" onClick={() => onNavigate('stock')}>
                  Ver detalles
                </ActionButton>
              </div>
            </article>
          ))}

          {maintenanceAlerts.slice(0, 4).map((record) => {
            const asset = getAssetById(record.assetId)
            return (
              <article key={record.id} className={`rounded-xl px-4 py-4 ${alertClasses('info')}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-[#64748b]" />
                    <p className="text-[16px] font-semibold text-slate-900">Mantenimiento próximo</p>
                  </div>
                  <Pill label="Info" tone="neutral" />
                </div>
                <p className="mt-3 text-[15px] text-slate-700">
                  {asset?.name ?? 'Activo sin identificar'} requiere revisión el {formatDate(record.nextDue ?? record.date)}.
                </p>
                <div className="mt-4">
                  <ActionButton tone="secondary" onClick={() => onNavigate('mantenimiento')}>
                    Ver detalles
                  </ActionButton>
                </div>
              </article>
            )
          })}

          {totalAlerts === 0 ? (
            <article className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-[15px] text-slate-600 lg:col-span-3">
              No hay alertas pendientes ahora mismo.
            </article>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Estado general"
          title="Resumen de atención"
          description="Vista rápida para supervisión, oficina y responsables de área."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] text-[#64748b]">Urgentes</p>
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <p className="mt-3 text-[32px] font-bold text-[#1e3a5f]">{urgentRenewals.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] text-[#64748b]">Atención</p>
                <Boxes className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <p className="mt-3 text-[32px] font-bold text-[#1e3a5f]">{stockAlerts.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] text-[#64748b]">Informativas</p>
                <Wrench className="h-5 w-5 text-[#64748b]" />
              </div>
              <p className="mt-3 text-[32px] font-bold text-[#1e3a5f]">{maintenanceAlerts.length}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Actividad reciente"
          title="Últimos avisos y movimientos"
          description="Qué ha pasado recientemente para poder actuar rápido."
        >
          <Timeline
            items={getAuditEvents(6).map((event) => ({
              id: event.id,
              title: `${event.entity} · ${event.action}`,
              description: event.description,
              meta: formatDateTime(event.occurredAt),
            }))}
          />
        </SectionCard>
      </div>
    </div>
  )
}