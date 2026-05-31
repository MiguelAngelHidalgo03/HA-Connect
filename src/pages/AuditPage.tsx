import { DataTable, Pill, SectionCard, Timeline, type TableColumn } from '@/components/ui'
import { formatDateTime, getAuditEvents } from '@/data/mockData'
import type { AuditEvent, PermissionSet } from '@/types/domain'

function actionTone(action: AuditEvent['action']) {
  switch (action) {
    case 'Creación':
      return 'success'
    case 'Asignación':
      return 'info'
    case 'Mantenimiento':
      return 'warning'
    case 'Baja':
      return 'danger'
    case 'Alerta':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function AuditPage({ permissions }: { permissions: PermissionSet }) {
  const auditEvents = getAuditEvents()

  if (!permissions.canViewAudit) {
    return (
      <SectionCard
        eyebrow="Acceso restringido"
        title="Historial auditado"
        description="Este módulo queda reservado a administración y responsables con gobierno de dato."
      >
        <p className="text-sm text-slate-600">
          La arquitectura ya contempla trazabilidad total, pero la visualización detallada está protegida por rol.
        </p>
      </SectionCard>
    )
  }

  const columns: Array<TableColumn<AuditEvent>> = [
    {
      id: 'entity',
      header: 'Entidad',
      render: (event) => event.entity,
    },
    {
      id: 'action',
      header: 'Acción',
      render: (event) => <Pill label={event.action} tone={actionTone(event.action)} />,
    },
    {
      id: 'actor',
      header: 'Actor',
      render: (event) => event.actor,
    },
    {
      id: 'description',
      header: 'Descripción',
      render: (event) => event.description,
    },
    {
      id: 'occurredAt',
      header: 'Fecha',
      render: (event) => formatDateTime(event.occurredAt),
    },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SectionCard
        eyebrow="Control interno"
        title="Registro de auditoría"
        description="Trazabilidad completa de creación, modificación, asignación, mantenimiento, alertas y bajas."
      >
        <DataTable columns={columns} rows={auditEvents} />
      </SectionCard>

      <SectionCard
        eyebrow="Secuencia"
        title="Línea temporal"
        description="Resumen ejecutivo de los eventos más recientes en la plataforma."
      >
        <Timeline
          items={auditEvents.slice(0, 8).map((event) => ({
            id: event.id,
            title: `${event.entity} · ${event.action}`,
            description: event.description,
            meta: formatDateTime(event.occurredAt),
          }))}
        />
      </SectionCard>
    </div>
  )
}
