import type { CSSProperties, ReactNode } from 'react'

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

type PillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type ButtonTone = 'primary' | 'secondary' | 'ghost'

const pillToneClasses: Record<PillTone, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-700',
}

const inferredPillTones: Record<string, PillTone> = {
  Activo: 'success',
  Vacaciones: 'warning',
  Baja: 'danger',
  Disponible: 'success',
  Asignado: 'info',
  'En mantenimiento': 'warning',
  Averiado: 'danger',
  Retirado: 'neutral',
  Pendiente: 'warning',
  Planificada: 'info',
  Ejecutada: 'success',
  Administrador: 'danger',
  'Responsable IT': 'info',
  Supervisor: 'warning',
  Empleado: 'neutral',
}

const buttonToneClasses: Record<ButtonTone, string> = {
  primary:
    'bg-[#1e3a5f] text-white shadow-[0_16px_32px_-22px_rgba(30,58,95,0.65)] hover:bg-[#27486f]',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:border-[#1e3a5f] hover:text-[#1e3a5f]',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#1e3a5f]',
}

export function Pill({ label, tone }: { label: string; tone?: PillTone }) {
  const resolvedTone = tone ?? inferredPillTones[label] ?? 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide',
        pillToneClasses[resolvedTone],
      )}
    >
      {label}
    </span>
  )
}

export function ActionButton({
  children,
  tone = 'primary',
  type = 'button',
  disabled = false,
  className,
  onClick,
}: {
  children: ReactNode
  tone?: ButtonTone
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-semibold transition duration-200',
        buttonToneClasses[tone],
        className,
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {children}
    </button>
  )
}

export function SectionCard({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6',
        className,
      )}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {eyebrow ? (
            <p className="text-[13px] font-medium text-[#64748b]">{eyebrow}</p>
          ) : null}
          <div>
            <h2 className="font-heading text-[24px] text-[#1e3a5f] sm:text-[28px]">{title}</h2>
            {description ? <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string | number
  helper: string
  icon: ReactNode
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-[#64748b]">{label}</p>
          <p className="mt-3 font-heading text-[28px] text-[#1e3a5f] sm:text-[32px]">{value}</p>
        </div>
        <div className="rounded-xl bg-[#1e3a5f] p-3 text-white">{icon}</div>
      </div>
      <p className="mt-4 text-[14px] leading-6 text-slate-600">{helper}</p>
    </article>
  )
}

export interface TableColumn<T> {
  id: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = 'Sin registros para mostrar.',
}: {
  columns: Array<TableColumn<T>>
  rows: T[]
  emptyMessage?: string
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50 text-[13px] uppercase tracking-[0.12em] text-[#64748b]">
          <tr>
            {columns.map((column) => (
              <th key={column.id} className={cn('px-4 py-3 font-semibold', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-[15px] text-slate-700">
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-4 py-4', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function MiniBarChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span className="font-medium">{item.label}</span>
            <span className="text-slate-500">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
  centerLabel,
}: {
  data: Array<{ label: string; value: number; color: string }>
  centerLabel: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  const gradient = data
    .map((item) => {
      const startAngle = currentAngle
      const nextAngle = total === 0 ? currentAngle : currentAngle + (item.value / total) * 360
      currentAngle = nextAngle
      return `${item.color} ${startAngle}deg ${nextAngle}deg`
    })
    .join(', ')

  const chartStyle: CSSProperties = {
    background: total === 0 ? '#e2e8f0' : `conic-gradient(${gradient})`,
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
      <div className="mx-auto grid h-52 w-52 place-items-center rounded-full p-5" style={chartStyle}>
        <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Estado</p>
            <p className="mt-2 font-heading text-3xl text-slate-950">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-700">{item.label}</span>
            </div>
            <span className="text-slate-500">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Timeline({
  items,
}: {
  items: Array<{ id: string; title: string; description: string; meta: string }>
}) {
  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="relative rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 pl-10">
          <span className="absolute left-4 top-5 h-3 w-3 rounded-full bg-[#1e3a5f]" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.meta}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
