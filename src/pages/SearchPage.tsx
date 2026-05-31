import { useState } from 'react'
import { Search } from 'lucide-react'

import { ActionButton, DataTable, Pill, SectionCard, type TableColumn } from '@/components/ui'
import {
  categoryOptions,
  departments,
  demoEmployees,
  filterAssets,
  formatCurrency,
  formatDate,
  getEmployeeById,
  statusOptions,
} from '@/data/mockData'
import type { Asset, FilterState } from '@/types/domain'

const defaultFilters: FilterState = {
  query: '',
  category: 'Todos',
  employeeId: 'Todos',
  department: 'Todos',
  status: 'Todos',
  dateFrom: '',
  dateTo: '',
}

export function SearchPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const results = filterAssets(filters)

  const columns: Array<TableColumn<Asset>> = [
    {
      id: 'asset',
      header: 'Activo',
      render: (asset) => (
        <div>
          <p className="font-semibold text-slate-900">{asset.name}</p>
          <p className="mt-1 text-xs text-slate-500">{asset.code}</p>
        </div>
      ),
    },
    {
      id: 'employee',
      header: 'Empleado',
      render: (asset) => getEmployeeById(asset.assignedEmployeeId)?.fullName ?? 'Sin asignar',
    },
    {
      id: 'department',
      header: 'Departamento',
      render: (asset) => getEmployeeById(asset.assignedEmployeeId)?.department ?? 'No aplica',
    },
    {
      id: 'status',
      header: 'Estado',
      render: (asset) => <Pill label={asset.status} />,
    },
    {
      id: 'purchaseDate',
      header: 'Compra',
      render: (asset) => formatDate(asset.purchaseDate),
    },
    {
      id: 'cost',
      header: 'Coste',
      render: (asset) => formatCurrency(asset.cost),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Búsqueda"
        title="Búsqueda avanzada"
        description="Cruza categoría, empleado, departamento, estado y rango de fechas para localizar activos concretos en segundos."
        actions={
          <ActionButton tone="secondary" onClick={() => setFilters(defaultFilters)}>
            Limpiar filtros
          </ActionButton>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-3">
            <span>Consulta libre</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-11"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                placeholder="Código, activo, serie, ubicación, empleado..."
              />
            </div>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Categoría</span>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value as FilterState['category'] })
              }
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Empleado</span>
            <select
              value={filters.employeeId}
              onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}
            >
              <option value="Todos">Todos</option>
              {demoEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Departamento</span>
            <select
              value={filters.department}
              onChange={(event) => setFilters({ ...filters, department: event.target.value })}
            >
              <option value="Todos">Todos</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Estado</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value as FilterState['status'] })
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Fecha desde</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Fecha hasta</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Resultados"
        title={`${results.length} activos encontrados`}
        description="La consulta se actualiza al instante con filtros compuestos sobre el inventario completo."
      >
        <DataTable columns={columns} rows={results} emptyMessage="No hay coincidencias con los filtros actuales." />
      </SectionCard>
    </div>
  )
}
