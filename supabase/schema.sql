create extension if not exists pgcrypto;

create type public.app_role as enum ('Administrador', 'Responsable IT', 'Supervisor', 'Empleado');
create type public.asset_category as enum ('Informática', 'Vehículos', 'EPIs', 'Herramientas', 'Ropa', 'Software', 'Otros');
create type public.asset_status as enum ('Disponible', 'Asignado', 'En mantenimiento', 'Averiado', 'Retirado');
create type public.employee_status as enum ('Activo', 'Vacaciones', 'Baja');
create type public.maintenance_type as enum ('Avería', 'Revisión', 'ITV', 'Cambio de batería', 'Sustitución');
create type public.renewal_type as enum ('Garantía', 'Renovación', 'Fin de vida útil');
create type public.renewal_status as enum ('Pendiente', 'Planificada', 'Ejecutada');
create type public.kanban_task_status as enum ('todo', 'doing', 'done');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'Empleado',
  department text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  department text not null,
  position text not null,
  start_date date not null,
  status public.employee_status not null default 'Activo',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  internal_code text not null unique,
  name text not null,
  category public.asset_category not null,
  brand text,
  model text,
  serial_number text unique,
  purchase_date date,
  purchase_cost numeric(12, 2) check (purchase_cost is null or purchase_cost >= 0),
  status public.asset_status not null default 'Disponible',
  location text,
  notes text,
  assigned_employee_id uuid references public.employees (id) on delete set null,
  warranty_end_date date,
  renewal_date date,
  end_of_life_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  delivered_at timestamptz not null default timezone('utc', now()),
  returned_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint asset_assignments_dates check (returned_at is null or returned_at >= delivered_at)
);

create table public.stock_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.asset_category not null,
  location text,
  available_quantity integer not null default 0 check (available_quantity >= 0),
  minimum_quantity integer not null default 0 check (minimum_quantity >= 0),
  unit text not null default 'uds',
  last_restock_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  maintenance_type public.maintenance_type not null,
  maintenance_date date not null,
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  description text not null,
  technician text not null,
  next_due_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.renewals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  renewal_type public.renewal_type not null,
  due_date date not null,
  status public.renewal_status not null default 'Pendiente',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner_name text not null,
  module_id text not null check (module_id in ('inicio', 'dashboard', 'alertas', 'empleados', 'activos', 'asignaciones', 'stock', 'mantenimiento', 'renovaciones', 'historial', 'busqueda', 'exportaciones', 'ajustes')),
  status public.kanban_task_status not null default 'todo',
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_name text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index asset_assignments_active_idx on public.asset_assignments (asset_id) where returned_at is null;
create index assets_category_status_idx on public.assets (category, status);
create index assets_assigned_employee_idx on public.assets (assigned_employee_id);
create index employees_department_idx on public.employees (department);
create index stock_items_restock_idx on public.stock_items (available_quantity, minimum_quantity);
create index maintenance_records_asset_idx on public.maintenance_records (asset_id, maintenance_date desc);
create index renewals_due_date_idx on public.renewals (due_date);
create index kanban_tasks_status_order_idx on public.kanban_tasks (status, order_index, updated_at desc);
create index audit_events_entity_idx on public.audit_events (entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'Empleado'::public.app_role
  );
$$;

create or replace function public.sync_asset_from_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.assets
    set
      status = 'Asignado',
      assigned_employee_id = new.employee_id,
      updated_at = timezone('utc', now())
    where id = new.asset_id;

    return new;
  end if;

  if tg_op = 'UPDATE' and new.returned_at is not null and old.returned_at is null then
    update public.assets
    set
      status = 'Disponible',
      assigned_employee_id = null,
      updated_at = timezone('utc', now())
    where id = new.asset_id;

    return new;
  end if;

  if tg_op = 'DELETE' and old.returned_at is null then
    update public.assets
    set
      status = 'Disponible',
      assigned_employee_id = null,
      updated_at = timezone('utc', now())
    where id = old.asset_id;

    return old;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.write_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  effective_entity_id uuid;
  effective_action text;
  effective_actor_name text;
begin
  effective_entity_id = coalesce(new.id, old.id);
  select full_name into effective_actor_name from public.profiles where id = auth.uid();

  effective_action = case
    when tg_table_name = 'asset_assignments' and tg_op = 'INSERT' then 'Asignación'
    when tg_table_name = 'asset_assignments'
      and tg_op = 'UPDATE'
      and coalesce(to_jsonb(new) ->> 'returned_at', '') <> ''
      and coalesce(to_jsonb(old) ->> 'returned_at', '') = '' then 'Devolución'
    when tg_table_name = 'maintenance_records' then 'Mantenimiento'
    when tg_op = 'INSERT' then 'Creación'
    when tg_op = 'DELETE' then 'Baja'
    else 'Modificación'
  end;

  insert into public.audit_events (entity_type, entity_id, action, actor_id, actor_name, payload)
  values (
    tg_table_name,
    effective_entity_id,
    effective_action,
    auth.uid(),
    coalesce(effective_actor_name, 'Sistema'),
    jsonb_build_object(
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    )
  );

  return coalesce(new, old);
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

create trigger assets_set_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

create trigger stock_items_set_updated_at
before update on public.stock_items
for each row execute function public.set_updated_at();

create trigger renewals_set_updated_at
before update on public.renewals
for each row execute function public.set_updated_at();

create trigger kanban_tasks_set_updated_at
before update on public.kanban_tasks
for each row execute function public.set_updated_at();

create trigger sync_asset_assignment_state
after insert or update or delete on public.asset_assignments
for each row execute function public.sync_asset_from_assignment();

create trigger audit_employees_changes
after insert or update or delete on public.employees
for each row execute function public.write_audit_event();

create trigger audit_assets_changes
after insert or update or delete on public.assets
for each row execute function public.write_audit_event();

create trigger audit_assignment_changes
after insert or update or delete on public.asset_assignments
for each row execute function public.write_audit_event();

create trigger audit_stock_changes
after insert or update or delete on public.stock_items
for each row execute function public.write_audit_event();

create trigger audit_maintenance_changes
after insert or update or delete on public.maintenance_records
for each row execute function public.write_audit_event();

create trigger audit_renewals_changes
after insert or update or delete on public.renewals
for each row execute function public.write_audit_event();

create trigger audit_kanban_changes
after insert or update or delete on public.kanban_tasks
for each row execute function public.write_audit_event();

alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.assets enable row level security;
alter table public.asset_assignments enable row level security;
alter table public.stock_items enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.renewals enable row level security;
alter table public.kanban_tasks enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_read on public.profiles
for select to authenticated
using (auth.uid() = id or public.current_app_role() in ('Administrador', 'Responsable IT'));

create policy profiles_manage on public.profiles
for all to authenticated
using (public.current_app_role() = 'Administrador')
with check (public.current_app_role() = 'Administrador');

create policy employees_read on public.employees
for select to authenticated
using (true);

create policy employees_manage on public.employees
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy assets_read on public.assets
for select to authenticated
using (true);

create policy assets_manage on public.assets
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy assignments_read on public.asset_assignments
for select to authenticated
using (true);

create policy assignments_manage on public.asset_assignments
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy stock_read on public.stock_items
for select to authenticated
using (true);

create policy stock_manage on public.stock_items
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy maintenance_read on public.maintenance_records
for select to authenticated
using (true);

create policy maintenance_manage on public.maintenance_records
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy renewals_read on public.renewals
for select to authenticated
using (true);

create policy renewals_manage on public.renewals
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy kanban_read on public.kanban_tasks
for select to authenticated
using (true);

create policy kanban_manage on public.kanban_tasks
for all to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));

create policy audit_read on public.audit_events
for select to authenticated
using (public.current_app_role() in ('Administrador', 'Responsable IT'));
