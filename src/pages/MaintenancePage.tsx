import { CalendarClock, ShieldAlert, Wrench } from 'lucide-react'

import { ActionButton, DataTable, MetricCard, Pill, SectionCard, type TableColumn } from '@/components/ui'
import {
  demoMaintenanceRecords,
  daysUntil,
  formatCurrency,
  formatDate,
  getAssetById,
  getMaintenanceUpcoming,
} from '@/data/mockData'
import type { MaintenanceRecord, PermissionSet } from '@/types/domain'

export function MaintenancePage({ permissions }: { permissions: PermissionSet }) {
  const totalCost = demoMaintenanceRecords.reduce((sum, record) => sum + record.cost, 0)
  const upcomingChecks = getMaintenanceUpcoming(120)

  const columns: Array<TableColumn<MaintenanceRecord>> = [
    {
      id: 'asset',
      header: 'Activo',
      render: (record) => getAssetById(record.assetId)?.name ?? record.assetId,
    },
    {
      id: 'type',
      header: 'Tipo',
      render: (record) => <Pill label={record.type} tone={record.type === 'Avería' ? 'danger' : 'info'} />,
    },
    {
      id: 'date',
      header: 'Fecha',
      render: (record) => formatDate(record.date),
    },
    {
      id: 'cost',
      header: 'Coste',
      render: (record) => formatCurrency(record.cost),
    },
    {
      id: 'technician',
      header: 'Técnico',
      render: (record) => record.technician,
    },
    {
      id: 'next',
      header: 'Siguiente revisión',
      render: (record) => (record.nextDue ? formatDate(record.nextDue) : 'No aplica'),
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Intervenciones"
          value={demoMaintenanceRecords.length}
          helper="Histórico preventivo y correctivo consolidado."
          icon={<Wrench className="h-5 w-5" />}
        />
        <MetricCard
          label="Coste acumulado"
          value={formatCurrency(totalCost)}
          helper="Inversión total registrada en mantenimientos."
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <MetricCard
          label="Próximas revisiones"
          value={upcomingChecks.length}
          helper="Hitos con vencimiento en los próximos 120 días."
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Operaciones técnicas"
          title="Mantenimiento preventivo y correctivo"
          description="Averías, revisiones, ITV, baterías y sustituciones registradas con coste y técnico responsable."
          actions={
            <ActionButton tone="secondary" disabled={!permissions.canManageMaintenance}>
              Registrar intervención
            </ActionButton>
          }
        >
          <DataTable columns={columns} rows={demoMaintenanceRecords} />
        </SectionCard>

        <SectionCard
          eyebrow="Planificación"
          title="Revisiones próximas"
          description="Ventana priorizada para evitar paradas operativas y sanciones documentales."
        >
          <div className="space-y-4">
            {upcomingChecks.map((record) => (
              <div key={record.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{getAssetById(record.assetId)?.name ?? record.assetId}</p>
                  <Pill label={`${daysUntil(record.nextDue ?? record.date)} días`} tone="warning" />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {record.type} prevista para el {formatDate(record.nextDue ?? record.date)} con {record.technician}.
                </p>
              </div>
            ))}
            {upcomingChecks.length === 0 ? (
              <p className="text-sm text-slate-500">No hay revisiones próximas en la ventana configurada.</p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
