import { useState } from 'react'
import { FileSpreadsheet, FileText, Printer, ShieldCheck, Sparkles } from 'lucide-react'

import { ActionButton, Pill, SectionCard } from '@/components/ui'
import {
  demoAssets,
  demoEmployees,
  formatCurrency,
  formatDate,
  formatDateTime,
  getAuditEvents,
  getEmployeeById,
} from '@/data/mockData'
import { exportAsCsv, exportAsExcel, exportAsPdf } from '@/lib/export'
import type { PermissionSet } from '@/types/domain'

const roadmap = [
  'Tickets y SLA',
  'GLPI',
  'Microsoft 365',
  'Google Workspace',
  'OCR de facturas',
  'OCR de albaranes',
  'Firma digital',
  'Chat IA',
  'Alertas inteligentes',
]

export function ExportsPage({ permissions }: { permissions: PermissionSet }) {
  const [message, setMessage] = useState<string | null>(null)

  const assetRows = demoAssets.map((asset) => ({
    Código: asset.code,
    Nombre: asset.name,
    Categoría: asset.category,
    Estado: asset.status,
    Empleado: getEmployeeById(asset.assignedEmployeeId)?.fullName ?? 'Sin asignar',
    Ubicación: asset.location,
    Coste: formatCurrency(asset.cost),
    Compra: formatDate(asset.purchaseDate),
  }))

  const employeeRows = demoEmployees.map((employee) => ({
    Nombre: employee.fullName,
    Email: employee.email,
    Departamento: employee.department,
    Cargo: employee.position,
    Estado: employee.status,
    Alta: formatDate(employee.startDate),
  }))

  const auditRows = getAuditEvents().map((event) => ({
    Entidad: event.entity,
    Acción: event.action,
    Actor: event.actor,
    Fecha: formatDateTime(event.occurredAt),
    Descripción: event.description,
  }))

  const handlePdfExport = () => {
    const exported = exportAsPdf('HA Connect - Historial auditado', auditRows)
    setMessage(exported ? 'PDF lanzado a impresión correctamente.' : 'El navegador bloqueó la ventana del PDF.')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <SectionCard
        eyebrow="Salidas de información"
        title="Exportaciones corporativas"
        description="Salidas rápidas para auditoría, reporting, compras, finanzas y revisión operativa."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            disabled={!permissions.canExport}
            onClick={() => exportAsCsv('ha-connect-activos', assetRows)}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-6 w-6 text-slate-950" />
            <h3 className="mt-4 font-heading text-xl text-slate-950">CSV</h3>
            <p className="mt-2 text-sm text-slate-600">Exporta inventario y listas tabulares para BI o importadores.</p>
          </button>
          <button
            type="button"
            disabled={!permissions.canExport}
            onClick={() => exportAsExcel('ha-connect-empleados', employeeRows)}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet className="h-6 w-6 text-slate-950" />
            <h3 className="mt-4 font-heading text-xl text-slate-950">Excel compatible</h3>
            <p className="mt-2 text-sm text-slate-600">Genera hojas compatibles para RRHH, compras o dirección financiera.</p>
          </button>
          <button
            type="button"
            disabled={!permissions.canExport}
            onClick={handlePdfExport}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="h-6 w-6 text-slate-950" />
            <h3 className="mt-4 font-heading text-xl text-slate-950">PDF</h3>
            <p className="mt-2 text-sm text-slate-600">Salida imprimible para auditoría, comités y validaciones de dirección.</p>
          </button>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-slate-950" />
          <span>
            {permissions.canExport
              ? 'Tu rol puede exportar información desde este módulo.'
              : 'Tu rol no tiene permisos de exportación en esta versión.'}
          </span>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          eyebrow="Próximas mejoras"
          title="Hoja de ruta conectable"
          description="La aplicación queda lista para sumar automatizaciones y conectores de ecosistema."
        >
          <div className="flex flex-wrap gap-3">
            {roadmap.map((item) => (
              <Pill key={item} label={item} tone="info" />
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-slate-950" />
              <p className="font-semibold text-slate-900">Arquitectura orientada a ampliaciones</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Los módulos están separados por dominio, permisos y capa de datos para crecer hacia tickets, OCR, IA y automatizaciones sin rehacer la interfaz principal.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Base operativa"
          title="Datos y trazabilidad preparados"
          description="La aplicación ya deja definido el circuito de acceso, control de roles, auditoría y sincronización entre asignaciones y activos."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>1. Acceso de usuarios y roles para diferenciar qué puede hacer cada perfil.</p>
            <p>2. Inventario, asignaciones, stock, renovaciones y mantenimiento con relaciones listas.</p>
            <p>3. Auditoría automática para saber quién hizo cada cambio y cuándo.</p>
          </div>
          <div className="mt-5">
            <ActionButton tone="secondary" disabled={!permissions.canExport} onClick={() => exportAsCsv('ha-connect-auditoria', auditRows)}>
              Exportar auditoría en CSV
            </ActionButton>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
