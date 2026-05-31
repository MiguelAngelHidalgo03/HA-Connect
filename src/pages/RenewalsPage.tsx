import { BellRing, CalendarClock, ShieldCheck } from 'lucide-react'

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/ui'
import { daysUntil, demoRenewals, formatDate, getAssetById } from '@/data/mockData'
import type { PermissionSet } from '@/types/domain'

export function RenewalsPage({ permissions }: { permissions: PermissionSet }) {
  const sortedRenewals = [...demoRenewals].sort((left, right) => left.dueDate.localeCompare(right.dueDate))
  const urgentRenewals = sortedRenewals.filter((renewal) => daysUntil(renewal.dueDate) <= 45)
  const plannedRenewals = sortedRenewals.filter((renewal) => renewal.status === 'Planificada')

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Renovaciones abiertas"
          value={sortedRenewals.length}
          helper="Garantías, suscripciones y fin de vida útil bajo seguimiento."
          icon={<BellRing className="h-5 w-5" />}
        />
        <MetricCard
          label="Urgentes"
          value={urgentRenewals.length}
          helper="Eventos que vencen en los próximos 45 días."
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <MetricCard
          label="Planificadas"
          value={plannedRenewals.length}
          helper="Hitos ya calendarizados por el equipo de operaciones."
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        eyebrow="Alertas automáticas"
        title="Garantías, renovaciones y fin de vida útil"
        description="Panel concentrado para tomar decisiones antes de que se rompa la continuidad operativa o contractual."
        actions={
          <ActionButton tone="secondary" disabled={!permissions.canManageRenewals}>
            Configurar alertas
          </ActionButton>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {sortedRenewals.map((renewal) => {
            const asset = getAssetById(renewal.assetId)
            const remainingDays = daysUntil(renewal.dueDate)

            return (
              <article key={renewal.id} className="rounded-[24px] border border-slate-200 bg-slate-50/85 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Pill label={renewal.type} tone={remainingDays <= 45 ? 'warning' : 'info'} />
                  <Pill label={renewal.status} />
                </div>
                <h3 className="mt-4 font-heading text-xl text-slate-950">{asset?.name ?? renewal.assetId}</h3>
                <p className="mt-2 text-sm text-slate-600">{renewal.notes}</p>
                <div className="mt-5 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <span>Vencimiento</span>
                    <span className="font-medium text-slate-950">{formatDate(renewal.dueDate)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Horizonte</span>
                    <span className="font-medium text-slate-950">{remainingDays} días</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
