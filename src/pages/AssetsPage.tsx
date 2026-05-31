import { useState } from 'react'
import type { FormEvent } from 'react'
import { HardDriveUpload, QrCode, Wrench } from 'lucide-react'

import { ActionButton, DataTable, Pill, SectionCard, Timeline, type TableColumn } from '@/components/ui'
import {
  formatCurrency,
  formatDate,
  getAssignmentsForAsset,
  getEmployeeById,
  getLatestMaintenanceForAsset,
  getMaintenanceForAsset,
  getRenewalsForAsset,
} from '@/data/mockData'
import {
  createAsset,
  deleteAsset,
  updateAsset,
  type CreateAssetInput,
  type UpdateAssetInput,
} from '@/lib/workspace'
import type { Asset, AssetCategory, PermissionSet, Role, SessionUser } from '@/types/domain'

const defaultAssetForm: CreateAssetInput = {
  code: '',
  name: '',
  category: 'Informática',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  cost: 0,
  location: '',
  observations: '',
  warrantyEnd: '',
  nextRenewal: '',
  endOfLife: '',
}

const creatableCategories: AssetCategory[] = [
  'Informática',
  'Vehículos',
  'EPIs',
  'Herramientas',
  'Ropa',
  'Software',
  'Otros',
]

function buildAssetUpdateForm(asset: Asset): UpdateAssetInput {
  return {
    code: asset.code,
    name: asset.name,
    category: asset.category,
    brand: asset.brand === 'Sin marca' ? '' : asset.brand,
    model: asset.model === 'Sin modelo' ? '' : asset.model,
    serialNumber: asset.serialNumber === 'Sin serie' ? '' : asset.serialNumber,
    purchaseDate: asset.purchaseDate,
    cost: asset.cost,
    location: asset.location,
    observations: asset.observations,
    warrantyEnd: asset.warrantyEnd ?? '',
    nextRenewal: asset.nextRenewal ?? '',
    endOfLife: asset.endOfLife ?? '',
  }
}

export function AssetsPage({
  assets,
  permissions,
  workspaceMode,
  currentRole,
}: {
  assets: Asset[]
  permissions: PermissionSet
  workspaceMode: SessionUser['mode']
  currentRole: Role
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? '')
  const [inventorySearch, setInventorySearch] = useState('')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [isSavingAsset, setIsSavingAsset] = useState(false)
  const [isUpdatingAsset, setIsUpdatingAsset] = useState(false)
  const [isDeletingAsset, setIsDeletingAsset] = useState(false)
  const [assetForm, setAssetForm] = useState<CreateAssetInput>(defaultAssetForm)
  const [editAssetForm, setEditAssetForm] = useState<UpdateAssetInput | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const filteredAssets = assets.filter((asset) => {
    const searchValue = [asset.code, asset.name, asset.category, asset.location, asset.brand, asset.model]
      .join(' ')
      .toLowerCase()

    return searchValue.includes(inventorySearch.toLowerCase())
  })

  const selectedAsset = filteredAssets.find((asset) => asset.id === selectedAssetId) ?? assets[0]

  if (!selectedAsset) {
    return null
  }

  const assignee = getEmployeeById(selectedAsset.assignedEmployeeId)
  const assignmentHistory = getAssignmentsForAsset(selectedAsset.id)
  const maintenanceHistory = getMaintenanceForAsset(selectedAsset.id)
  const latestMaintenance = getLatestMaintenanceForAsset(selectedAsset.id)
  const renewals = getRenewalsForAsset(selectedAsset.id)

  const columns: Array<TableColumn<Asset>> = [
    {
      id: 'asset',
      header: 'Activo',
      render: (asset) => (
        <button
          type="button"
          onClick={() => {
            setSelectedAssetId(asset.id)
            setIsEditFormOpen(false)
            setIsDeleteConfirmationOpen(false)
          }}
          className="text-left"
        >
          <span className="font-semibold text-slate-900">{asset.name}</span>
          <span className="mt-1 block text-xs text-slate-500">{asset.code}</span>
        </button>
      ),
    },
    {
      id: 'category',
      header: 'Categoría',
      render: (asset) => asset.category,
    },
    {
      id: 'status',
      header: 'Estado',
      render: (asset) => <Pill label={asset.status} />,
    },
    {
      id: 'location',
      header: 'Ubicación',
      render: (asset) => asset.location,
    },
    {
      id: 'employee',
      header: 'Asignado a',
      render: (asset) => getEmployeeById(asset.assignedEmployeeId)?.fullName ?? 'Sin asignar',
    },
    {
      id: 'cost',
      header: 'Coste',
      render: (asset) => formatCurrency(asset.cost),
    },
  ]

  const handleCreateAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingAsset(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const createdAsset = await createAsset(assetForm, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedAssetId(createdAsset.id)
      setAssetForm(defaultAssetForm)
      setIsCreateFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Activo creado correctamente en la plataforma.'
          : 'Activo creado en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo registrar el activo.')
    } finally {
      setIsSavingAsset(false)
    }
  }

  const openEditAssetForm = () => {
    setEditAssetForm(buildAssetUpdateForm(selectedAsset))
    setIsEditFormOpen(true)
    setIsCreateFormOpen(false)
    setIsDeleteConfirmationOpen(false)
    setFeedbackError(null)
    setFeedbackMessage(null)
  }

  const handleUpdateAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editAssetForm) {
      return
    }

    setIsUpdatingAsset(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const updatedAsset = await updateAsset(selectedAsset.id, editAssetForm, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedAssetId(updatedAsset.id)
      setIsEditFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Activo actualizado correctamente en la plataforma.'
          : 'Activo actualizado en la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo actualizar el activo.')
    } finally {
      setIsUpdatingAsset(false)
    }
  }

  const handleDeleteAsset = async () => {
    setIsDeletingAsset(true)
    setFeedbackError(null)
    setFeedbackMessage(null)

    try {
      const nextAssetId = assets.find((asset) => asset.id !== selectedAsset.id)?.id ?? ''

      await deleteAsset(selectedAsset.id, {
        mode: workspaceMode,
        fallbackRole: currentRole,
      })

      setSelectedAssetId(nextAssetId)
      setIsDeleteConfirmationOpen(false)
      setIsEditFormOpen(false)
      setFeedbackMessage(
        workspaceMode === 'supabase'
          ? 'Activo eliminado correctamente de la plataforma.'
          : 'Activo eliminado de la demo guiada.',
      )
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo eliminar el activo.')
    } finally {
      setIsDeletingAsset(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Inventario"
        title="Catálogo de activos"
        description="Vista única para ordenadores, móviles, vehículos, herramientas, EPIs, ropa técnica, licencias y otros activos corporativos."
        actions={
          <>
            <ActionButton
              tone="secondary"
              disabled={!permissions.canAssignAssets}
              onClick={() => {
                setIsCreateFormOpen((currentValue) => !currentValue)
                setIsEditFormOpen(false)
                setIsDeleteConfirmationOpen(false)
                setFeedbackError(null)
                setFeedbackMessage(null)
              }}
            >
              <HardDriveUpload className="mr-2 h-4 w-4" />
              {isCreateFormOpen ? 'Ocultar formulario' : 'Registrar activo'}
            </ActionButton>
            <ActionButton tone="ghost" disabled={!permissions.canAssignAssets}>
              <QrCode className="mr-2 h-4 w-4" />
              QR y barras
            </ActionButton>
          </>
        }
      >
        {feedbackMessage ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedbackMessage}
          </div>
        ) : null}
        {feedbackError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {feedbackError}
          </div>
        ) : null}
        {isCreateFormOpen ? (
          <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2" onSubmit={handleCreateAsset}>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Código interno</span>
              <input
                value={assetForm.code}
                onChange={(event) => setAssetForm({ ...assetForm, code: event.target.value })}
                placeholder="AFC-IT-016"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Nombre</span>
              <input
                value={assetForm.name}
                onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })}
                placeholder="Portátil corporativo"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Categoría</span>
              <select
                value={assetForm.category}
                onChange={(event) =>
                  setAssetForm({ ...assetForm, category: event.target.value as AssetCategory })
                }
              >
                {creatableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Ubicación</span>
              <input
                value={assetForm.location}
                onChange={(event) => setAssetForm({ ...assetForm, location: event.target.value })}
                placeholder="Madrid HQ"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Marca</span>
              <input
                value={assetForm.brand}
                onChange={(event) => setAssetForm({ ...assetForm, brand: event.target.value })}
                placeholder="Dell"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Modelo</span>
              <input
                value={assetForm.model}
                onChange={(event) => setAssetForm({ ...assetForm, model: event.target.value })}
                placeholder="Latitude 7450"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Número de serie</span>
              <input
                value={assetForm.serialNumber}
                onChange={(event) => setAssetForm({ ...assetForm, serialNumber: event.target.value })}
                placeholder="SN-2026-001"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Fecha de compra</span>
              <input
                type="date"
                value={assetForm.purchaseDate}
                onChange={(event) => setAssetForm({ ...assetForm, purchaseDate: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Coste</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={assetForm.cost}
                onChange={(event) => setAssetForm({ ...assetForm, cost: Number(event.target.value) || 0 })}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Fin de garantía</span>
              <input
                type="date"
                value={assetForm.warrantyEnd ?? ''}
                onChange={(event) => setAssetForm({ ...assetForm, warrantyEnd: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Próxima renovación</span>
              <input
                type="date"
                value={assetForm.nextRenewal ?? ''}
                onChange={(event) => setAssetForm({ ...assetForm, nextRenewal: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Fin de vida</span>
              <input
                type="date"
                value={assetForm.endOfLife ?? ''}
                onChange={(event) => setAssetForm({ ...assetForm, endOfLife: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Observaciones</span>
              <textarea
                rows={3}
                value={assetForm.observations}
                onChange={(event) => setAssetForm({ ...assetForm, observations: event.target.value })}
                placeholder="Activo listo para entrar en inventario."
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <ActionButton type="submit" disabled={isSavingAsset}>
                <HardDriveUpload className="mr-2 h-4 w-4" />
                {isSavingAsset ? 'Guardando...' : 'Crear activo'}
              </ActionButton>
              <ActionButton
                tone="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false)
                  setAssetForm(defaultAssetForm)
                  setFeedbackError(null)
                }}
              >
                Cancelar
              </ActionButton>
            </div>
          </form>
        ) : null}
        <div className="mb-5">
          <input
            value={inventorySearch}
            onChange={(event) => setInventorySearch(event.target.value)}
            placeholder="Buscar por código, modelo, categoría o ubicación"
          />
        </div>
        <DataTable columns={columns} rows={filteredAssets} emptyMessage="No hay activos con ese criterio." />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          eyebrow="Detalle"
          title={selectedAsset.name}
          description={`${selectedAsset.code} · ${selectedAsset.brand} ${selectedAsset.model}`}
          actions={
            permissions.canAssignAssets ? (
              <>
                <ActionButton tone="secondary" onClick={openEditAssetForm}>
                  Editar
                </ActionButton>
                {isDeleteConfirmationOpen ? (
                  <>
                    <ActionButton tone="secondary" onClick={handleDeleteAsset} disabled={isDeletingAsset}>
                      {isDeletingAsset ? 'Eliminando...' : 'Confirmar borrado'}
                    </ActionButton>
                    <ActionButton tone="ghost" onClick={() => setIsDeleteConfirmationOpen(false)}>
                      Cancelar borrado
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton
                    tone="ghost"
                    onClick={() => {
                      setIsDeleteConfirmationOpen(true)
                      setIsEditFormOpen(false)
                      setFeedbackError(null)
                      setFeedbackMessage(null)
                    }}
                  >
                    Borrar
                  </ActionButton>
                )}
              </>
            ) : null
          }
        >
          {isEditFormOpen && editAssetForm ? (
            <form className="mb-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2" onSubmit={handleUpdateAsset}>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Código interno</span>
                <input
                  value={editAssetForm.code}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, code: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Nombre</span>
                <input
                  value={editAssetForm.name}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, name: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Categoría</span>
                <select
                  value={editAssetForm.category}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, category: event.target.value as AssetCategory })
                  }
                >
                  {creatableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Ubicación</span>
                <input
                  value={editAssetForm.location}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, location: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Marca</span>
                <input
                  value={editAssetForm.brand}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, brand: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Modelo</span>
                <input
                  value={editAssetForm.model}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, model: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Número de serie</span>
                <input
                  value={editAssetForm.serialNumber}
                  onChange={(event) => setEditAssetForm({ ...editAssetForm, serialNumber: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Fecha de compra</span>
                <input
                  type="date"
                  value={editAssetForm.purchaseDate}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, purchaseDate: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Coste</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAssetForm.cost}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, cost: Number(event.target.value) || 0 })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Fin de garantía</span>
                <input
                  type="date"
                  value={editAssetForm.warrantyEnd ?? ''}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, warrantyEnd: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Próxima renovación</span>
                <input
                  type="date"
                  value={editAssetForm.nextRenewal ?? ''}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, nextRenewal: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Fin de vida</span>
                <input
                  type="date"
                  value={editAssetForm.endOfLife ?? ''}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, endOfLife: event.target.value })
                  }
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Observaciones</span>
                <textarea
                  rows={3}
                  value={editAssetForm.observations}
                  onChange={(event) =>
                    setEditAssetForm({ ...editAssetForm, observations: event.target.value })
                  }
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <ActionButton type="submit" disabled={isUpdatingAsset}>
                  {isUpdatingAsset ? 'Guardando...' : 'Guardar cambios'}
                </ActionButton>
                <ActionButton tone="ghost" onClick={() => setIsEditFormOpen(false)}>
                  Cancelar edición
                </ActionButton>
              </div>
            </form>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ficha técnica</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <dt>Serie</dt>
                  <dd className="font-medium text-slate-900">{selectedAsset.serialNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Compra</dt>
                  <dd className="font-medium text-slate-900">{formatDate(selectedAsset.purchaseDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Coste</dt>
                  <dd className="font-medium text-slate-900">{formatCurrency(selectedAsset.cost)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Ubicación</dt>
                  <dd className="font-medium text-slate-900">{selectedAsset.location}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Asignado a</dt>
                  <dd className="font-medium text-slate-900">{assignee?.fullName ?? 'Sin asignar'}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operativa</p>
              <div className="mt-4 space-y-3">
                <Pill label={selectedAsset.status} />
                <p className="text-sm text-slate-700">{selectedAsset.observations}</p>
                {latestMaintenance ? (
                  <div className="rounded-2xl border border-white bg-white p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Último mantenimiento</p>
                    <p className="mt-1">
                      {latestMaintenance.type} · {formatDate(latestMaintenance.date)} · {latestMaintenance.technician}
                    </p>
                  </div>
                ) : null}
                <ActionButton tone="secondary" disabled={!permissions.canManageMaintenance}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Enviar a mantenimiento
                </ActionButton>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Trazabilidad"
          title="Historial y renovaciones"
          description="Ciclo de vida completo del activo: asignaciones, intervenciones y hitos de renovación."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 font-heading text-lg text-slate-950">Asignaciones</h3>
              <Timeline
                items={assignmentHistory.map((assignment) => ({
                  id: assignment.id,
                  title: assignment.notes,
                  description: assignment.returnedAt
                    ? `Devuelto el ${formatDate(assignment.returnedAt)}.`
                    : `Activo desde ${formatDate(assignment.deliveredAt)}.`,
                  meta: assignment.assignedBy,
                }))}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="mb-4 font-heading text-lg text-slate-950">Mantenimiento</h3>
                <div className="space-y-3">
                  {maintenanceHistory.length > 0 ? (
                    maintenanceHistory.map((record) => (
                      <div key={record.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                        <p className="font-semibold text-slate-900">{record.type}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(record.date)} · {record.technician}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sin intervenciones registradas.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-4 font-heading text-lg text-slate-950">Renovaciones</h3>
                <div className="space-y-3">
                  {renewals.length > 0 ? (
                    renewals.map((renewal) => (
                      <div key={renewal.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{renewal.type}</p>
                          <Pill label={renewal.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">Vence el {formatDate(renewal.dueDate)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sin hitos de renovación asociados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
