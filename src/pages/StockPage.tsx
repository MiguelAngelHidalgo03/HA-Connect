import { Boxes, ShoppingCart, TriangleAlert } from 'lucide-react'

import { ActionButton, DataTable, Pill, SectionCard, type TableColumn } from '@/components/ui'
import { demoStockItems, formatDate, getStockAlerts } from '@/data/mockData'
import type { PermissionSet, StockItem } from '@/types/domain'

export function StockPage({ permissions }: { permissions: PermissionSet }) {
  const lowStockItems = getStockAlerts()
  const totalUnits = demoStockItems.reduce((sum, item) => sum + item.available, 0)

  const columns: Array<TableColumn<StockItem>> = [
    {
      id: 'item',
      header: 'Artículo',
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="mt-1 text-xs text-slate-500">{item.category}</p>
        </div>
      ),
    },
    {
      id: 'stock',
      header: 'Disponible / mínimo',
      render: (item) => {
        const width = Math.min((item.available / Math.max(item.minimum * 1.5, 1)) * 100, 100)
        return (
          <div className="space-y-2">
            <p className="font-medium text-slate-900">
              {item.available} {item.unit} / {item.minimum} {item.unit}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: item.available <= item.minimum ? '#dc2626' : '#0f766e',
                }}
              />
            </div>
          </div>
        )
      },
    },
    {
      id: 'location',
      header: 'Ubicación',
      render: (item) => item.location,
    },
    {
      id: 'restock',
      header: 'Última reposición',
      render: (item) => formatDate(item.lastRestock),
    },
    {
      id: 'alert',
      header: 'Estado',
      render: (item) => (
        <Pill
          label={item.available <= item.minimum ? 'Reposición' : 'Cobertura OK'}
          tone={item.available <= item.minimum ? 'danger' : 'success'}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Referencias</p>
            <Boxes className="h-5 w-5 text-slate-950" />
          </div>
          <p className="mt-4 font-heading text-3xl text-slate-950">{demoStockItems.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Stock comprometido</p>
            <TriangleAlert className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 font-heading text-3xl text-slate-950">{lowStockItems.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Unidades disponibles</p>
            <ShoppingCart className="h-5 w-5 text-slate-950" />
          </div>
          <p className="mt-4 font-heading text-3xl text-slate-950">{totalUnits}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Reposición"
          title="Control de stock y alertas"
          description="Cobertura mínima para EPIs, periféricos, ropa técnica y consumibles asociados a la operativa."
          actions={
            <ActionButton tone="secondary" disabled={!permissions.canManageStock}>
              Generar pedido
            </ActionButton>
          }
        >
          <DataTable columns={columns} rows={demoStockItems} />
        </SectionCard>

        <SectionCard
          eyebrow="Alertas"
          title="Artículos bajo mínimo"
          description="Prioridades de compra para evitar roturas de stock en operativa diaria."
        >
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-rose-200 bg-rose-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <Pill label="Crítico" tone="danger" />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {item.available} {item.unit} disponibles en {item.location}. Umbral mínimo: {item.minimum} {item.unit}.
                </p>
              </div>
            ))}
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500">No hay referencias por debajo del umbral mínimo.</p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
