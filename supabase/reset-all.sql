-- ATENCION: este script es destructivo.
-- Elimina el esquema funcional de la app, limpia Auth y vuelve a crear toda la base desde cero.
-- Si existe la cuenta miguelahidalgo03@gmail.com, la conserva y la promociona a Administrador.
-- Ejecutalo en el SQL Editor de Supabase solo si quieres rehacer el entorno completo.

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.write_audit_event() cascade;
drop function if exists public.sync_asset_from_assignment() cascade;
drop function if exists public.current_app_role() cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.audit_events cascade;
drop table if exists public.kanban_tasks cascade;
drop table if exists public.renewals cascade;
drop table if exists public.maintenance_records cascade;
drop table if exists public.stock_items cascade;
drop table if exists public.asset_assignments cascade;
drop table if exists public.assets cascade;
drop table if exists public.employees cascade;
drop table if exists public.profiles cascade;

drop type if exists public.kanban_task_status cascade;
drop type if exists public.renewal_status cascade;
drop type if exists public.renewal_type cascade;
drop type if exists public.maintenance_type cascade;
drop type if exists public.employee_status cascade;
drop type if exists public.asset_status cascade;
drop type if exists public.asset_category cascade;
drop type if exists public.app_role cascade;

do $$
declare
  admin_email constant text := 'miguelahidalgo03@gmail.com';
  admin_user_id uuid;
begin
  if to_regclass('auth.users') is not null then
    select id
    into admin_user_id
    from auth.users
    where lower(email) = admin_email
    order by created_at desc
    limit 1;
  end if;

  if to_regclass('auth.one_time_tokens') is not null then
    delete from auth.one_time_tokens;
  end if;

  if to_regclass('auth.sessions') is not null then
    delete from auth.sessions;
  end if;

  if to_regclass('auth.refresh_tokens') is not null then
    delete from auth.refresh_tokens;
  end if;

  if to_regclass('auth.mfa_amr_claims') is not null then
    delete from auth.mfa_amr_claims;
  end if;

  if to_regclass('auth.mfa_challenges') is not null then
    delete from auth.mfa_challenges;
  end if;

  if to_regclass('auth.mfa_factors') is not null then
    delete from auth.mfa_factors;
  end if;

  if to_regclass('auth.identities') is not null then
    if admin_user_id is null then
      delete from auth.identities;
    else
      delete from auth.identities where user_id <> admin_user_id;
    end if;
  end if;

  if to_regclass('auth.users') is not null then
    if admin_user_id is null then
      delete from auth.users;
    else
      update auth.users
      set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object(
          'role', 'Administrador',
          'full_name', coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), 'Miguel A. Hidalgo'),
          'department', coalesce(nullif(raw_user_meta_data ->> 'department', ''), 'Dirección')
        )
      where id = admin_user_id;

      delete from auth.users where id <> admin_user_id;
    end if;
  end if;
end;
$$;

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

comment on function public.current_app_role()
is 'Reads the authenticated user role without triggering recursive RLS checks on public.profiles.';

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mapped_role public.app_role;
begin
  mapped_role = case
    when lower(new.email) = 'miguelahidalgo03@gmail.com' then 'Administrador'::public.app_role
    when new.raw_user_meta_data ->> 'role' = 'Administrador' then 'Administrador'::public.app_role
    when new.raw_user_meta_data ->> 'role' = 'Responsable IT' then 'Responsable IT'::public.app_role
    when new.raw_user_meta_data ->> 'role' = 'Supervisor' then 'Supervisor'::public.app_role
    else 'Empleado'::public.app_role
  end;

  insert into public.profiles (id, full_name, email, role, department)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    mapped_role,
    nullif(new.raw_user_meta_data ->> 'department', '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        role = excluded.role,
        department = coalesce(excluded.department, public.profiles.department),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, email, role, department)
select
  users.id,
  coalesce(nullif(users.raw_user_meta_data ->> 'full_name', ''), split_part(users.email, '@', 1)),
  users.email,
  case
    when lower(users.email) = 'miguelahidalgo03@gmail.com' then 'Administrador'::public.app_role
    when users.raw_user_meta_data ->> 'role' = 'Administrador' then 'Administrador'::public.app_role
    when users.raw_user_meta_data ->> 'role' = 'Responsable IT' then 'Responsable IT'::public.app_role
    when users.raw_user_meta_data ->> 'role' = 'Supervisor' then 'Supervisor'::public.app_role
    else 'Empleado'::public.app_role
  end,
  nullif(users.raw_user_meta_data ->> 'department', '')
from auth.users as users
on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      department = coalesce(excluded.department, public.profiles.department),
      updated_at = timezone('utc', now());

update public.profiles
set
  full_name = 'Miguel A. Hidalgo',
  role = 'Administrador'::public.app_role,
  department = coalesce(department, 'Dirección'),
  updated_at = timezone('utc', now())
where lower(email) = 'miguelahidalgo03@gmail.com';

insert into public.employees (id, first_name, last_name, email, phone, department, position, start_date, status)
values
  ('11111111-1111-1111-1111-111111111101', 'Laura', 'Casas', 'laura.casas@hmalcaraz.es', '+34 600 112 221', 'Sistemas', 'Responsable de infraestructura', '2022-02-14', 'Activo'),
  ('11111111-1111-1111-1111-111111111102', 'Diego', 'Martín', 'diego.martin@hmalcaraz.es', '+34 600 112 222', 'Operaciones', 'Supervisor de rutas y almacén', '2021-09-01', 'Activo'),
  ('11111111-1111-1111-1111-111111111103', 'Sara', 'Núñez', 'sara.nunez@hmalcaraz.es', '+34 600 112 223', 'Logística', 'Coordinadora de flota', '2023-01-16', 'Activo'),
  ('11111111-1111-1111-1111-111111111104', 'Pablo', 'Rivas', 'pablo.rivas@hmalcaraz.es', '+34 600 112 224', 'Administración', 'Gestor de compras y pedidos', '2024-03-21', 'Activo'),
  ('11111111-1111-1111-1111-111111111105', 'Marta', 'Gálvez', 'marta.galvez@hmalcaraz.es', '+34 600 112 225', 'Finanzas', 'Controller', '2020-06-12', 'Vacaciones'),
  ('11111111-1111-1111-1111-111111111106', 'Inés', 'Romero', 'ines.romero@hmalcaraz.es', '+34 600 112 226', 'Campo', 'Técnica de apoyo y entregas', '2024-04-08', 'Activo')
on conflict (id) do nothing;

insert into public.assets (
  id,
  internal_code,
  name,
  category,
  brand,
  model,
  serial_number,
  purchase_date,
  purchase_cost,
  status,
  location,
  notes,
  warranty_end_date,
  renewal_date,
  end_of_life_date
)
values
  ('22222222-2222-2222-2222-222222222201', 'HA-IT-001', 'Estación Dell Precision 5680', 'Informática', 'Dell', 'Precision 5680', 'DL-5680-4412', '2025-11-18', 2480, 'Asignado', 'Lorca - Oficina central', 'Equipo principal del área de sistemas.', '2028-11-18', '2028-05-01', '2029-11-18'),
  ('22222222-2222-2222-2222-222222222202', 'HA-IT-002', 'Portátil Lenovo ThinkPad X1 Carbon', 'Informática', 'Lenovo', 'X1 Carbon Gen 12', 'LNV-X1-8821', '2025-08-22', 2140, 'Asignado', 'Puerto Lumbreras', 'Equipo para supervisión operativa y visitas.', '2028-08-22', '2028-06-01', '2029-08-22'),
  ('22222222-2222-2222-2222-222222222203', 'HA-MB-003', 'iPhone 15 Pro', 'Informática', 'Apple', 'iPhone 15 Pro 256GB', 'APL-IP15-1029', '2026-01-29', 1320, 'Asignado', 'Murcia', 'Terminal corporativo para coordinación comercial.', '2028-01-29', '2026-09-01', '2028-12-31'),
  ('22222222-2222-2222-2222-222222222204', 'HA-TB-004', 'Samsung Galaxy Tab S9', 'Informática', 'Samsung', 'Galaxy Tab S9', 'SAM-TABS9-7722', '2025-06-04', 890, 'Disponible', 'Lorca - Almacén principal', 'Tableta lista para inventario, firma digital o reparto.', '2027-06-04', '2027-03-04', '2028-06-04'),
  ('22222222-2222-2222-2222-222222222205', 'HA-VH-005', 'Furgoneta Ford Transit Custom', 'Vehículos', 'Ford', 'Transit Custom', 'FRD-TRN-5508', '2023-10-10', 32100, 'En mantenimiento', 'Lorca - Taller', 'Revisión ITV y ajuste eléctrico en curso.', '2027-10-10', '2027-05-18', '2030-10-10'),
  ('22222222-2222-2222-2222-222222222206', 'HA-VH-006', 'Toyota Corolla Touring Sports', 'Vehículos', 'Toyota', 'Corolla Touring Sports', 'TYT-CRL-1205', '2024-02-02', 28750, 'Asignado', 'Ruta Lorca-Almería', 'Vehículo para coordinación logística regional.', '2029-02-02', '2027-02-14', '2031-02-02'),
  ('22222222-2222-2222-2222-222222222207', 'HA-EPI-009', 'Arnés anticaídas Petzl', 'EPIs', 'Petzl', 'Newton Easyfit', 'PTZ-HAR-2045', '2025-12-18', 265, 'Asignado', 'Lorca - Nave cereal', 'Equipo individual certificado para trabajo en altura.', '2028-12-18', '2026-10-28', '2029-12-18'),
  ('22222222-2222-2222-2222-222222222208', 'HA-SW-012', 'Licencia Autodesk AutoCAD 2026', 'Software', 'Autodesk', 'AutoCAD 2026', 'ADSK-ACAD-2026', '2026-01-08', 1860, 'Asignado', 'Tenant corporativo', 'Licencia nominal asociada a proyectos técnicos y naves.', '2027-01-08', '2026-07-31', '2029-01-08'),
  ('22222222-2222-2222-2222-222222222209', 'HA-SW-013', 'Licencia Microsoft 365 E5', 'Software', 'Microsoft', 'M365 E5', 'MS-E5-120034', '2025-06-15', 690, 'Disponible', 'Tenant corporativo', 'Pool de licencias para nuevas incorporaciones.', '2026-06-15', '2026-06-15', '2027-06-15')
on conflict (id) do nothing;

insert into public.asset_assignments (id, asset_id, employee_id, delivered_at, returned_at, notes)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '2026-01-15T09:30:00+00:00', null, 'Puesto principal con docking y doble monitor.'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', '2025-09-04T11:00:00+00:00', null, 'Portátil para supervisión de rutas y almacenes.'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111104', '2026-02-11T12:30:00+00:00', null, 'Terminal configurado para pedidos y aprobaciones.'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', '2025-05-04T09:20:00+00:00', '2025-12-10T16:00:00+00:00', 'Tableta usada para conteos en almacén y flota.'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', '2026-03-03T08:45:00+00:00', null, 'Asignación permanente para coordinación logística.'),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111106', '2026-04-07T08:00:00+00:00', null, 'EPI firmado y revisado por PRL.'),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111106', '2026-01-08T10:05:00+00:00', null, 'Licencia nominal para replanteos y documentación técnica.')
on conflict (id) do nothing;

insert into public.stock_items (id, name, category, location, available_quantity, minimum_quantity, unit, last_restock_at)
values
  ('44444444-4444-4444-4444-444444444401', 'Casco dieléctrico', 'EPIs', 'Lorca - PRL', 18, 20, 'uds', '2026-04-20T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444402', 'Chaleco reflectante premium', 'Ropa', 'Lorca - Almacén principal', 54, 30, 'uds', '2026-05-02T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444403', 'Guantes anticorte nivel 5', 'EPIs', 'Puerto Lumbreras - PRL', 12, 15, 'pares', '2026-04-26T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444404', 'Ratón ergonómico', 'Informática', 'Lorca - Sistemas', 9, 10, 'uds', '2026-04-11T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444405', 'Teclado compacto', 'Informática', 'Lorca - Sistemas', 22, 12, 'uds', '2026-05-06T00:00:00+00:00')
on conflict (id) do nothing;

insert into public.maintenance_records (id, asset_id, maintenance_type, maintenance_date, cost, description, technician, next_due_date)
values
  ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222205', 'ITV', '2026-05-18', 92, 'Inspección técnica y ajuste de frenos.', 'Taller Lorca Motor', '2027-05-18'),
  ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222205', 'Cambio de batería', '2026-01-09', 240, 'Sustitución preventiva de batería y prueba de carga.', 'Taller Lorca Motor', '2027-01-09'),
  ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222201', 'Revisión', '2026-03-02', 80, 'Mantenimiento preventivo y diagnóstico de estación.', 'Soporte IT interno', '2027-03-02'),
  ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222207', 'Revisión', '2026-04-28', 45, 'Verificación del arnés y costuras de seguridad.', 'PRL Levante', '2026-10-28')
on conflict (id) do nothing;

insert into public.renewals (id, asset_id, renewal_type, due_date, status, notes)
values
  ('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222203', 'Renovación', '2026-09-01', 'Pendiente', 'Revisión del ciclo del terminal comercial.'),
  ('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222208', 'Renovación', '2026-07-31', 'Pendiente', 'Renovación anual de licencia AutoCAD.'),
  ('66666666-6666-6666-6666-666666666603', '22222222-2222-2222-2222-222222222209', 'Renovación', '2026-06-15', 'Pendiente', 'Pool de licencias M365 listo para nuevas altas.'),
  ('66666666-6666-6666-6666-666666666604', '22222222-2222-2222-2222-222222222207', 'Garantía', '2028-12-18', 'Planificada', 'Garantía premium para EPI crítico.'),
  ('66666666-6666-6666-6666-666666666605', '22222222-2222-2222-2222-222222222201', 'Garantía', '2028-11-18', 'Planificada', 'Garantía onsite 48h para el equipo principal.')
on conflict (id) do nothing;

insert into public.kanban_tasks (id, title, description, owner_name, module_id, status, order_index)
values
  ('77777777-7777-7777-7777-777777777701', 'Entregar móviles a dos chóferes nuevos de Lorca', 'Pendiente de firma de entrega antes del arranque del lunes en base central.', 'Laura Casas', 'asignaciones', 'todo', 0),
  ('77777777-7777-7777-7777-777777777702', 'Reponer botas y guantes para la nave de cereal', 'Compras debe cerrar el pedido urgente para el turno de tarde.', 'Diego Martín', 'stock', 'todo', 1),
  ('77777777-7777-7777-7777-777777777703', 'Renovar licencias del sistema de rutas de la flota', 'Quedan menos de diez días para el vencimiento del proveedor actual.', 'Miguel A. Hidalgo', 'renovaciones', 'todo', 2),
  ('77777777-7777-7777-7777-777777777704', 'Revisar tacógrafos y mantenimiento del camión HA-27', 'El vehículo sigue en taller para no frenar la ruta Lorca-Sevilla.', 'Nuria Lozano', 'mantenimiento', 'doing', 0),
  ('77777777-7777-7777-7777-777777777705', 'Inventario de tablets y lectores en oficina de Lorca', 'Falta cuadrar tres equipos devueltos por el equipo de rutas.', 'Alicia Moreno', 'activos', 'doing', 1),
  ('77777777-7777-7777-7777-777777777706', 'Preparar alta de personal eventual para la campaña', 'RRHH revisa documentación y puestos para refuerzo en cereal y granjas.', 'Carlos Vega', 'empleados', 'doing', 2),
  ('77777777-7777-7777-7777-777777777707', 'Reposición de EPIs cerrada en almacén de Lorca', 'Casco, chaleco y guantes ya están disponibles para el turno de mañana.', 'Diego Martín', 'stock', 'done', 0),
  ('77777777-7777-7777-7777-777777777708', 'Entrega de portátiles al equipo de administración', 'Equipos configurados, entregados y firmados por recepción interna.', 'Laura Casas', 'asignaciones', 'done', 1),
  ('77777777-7777-7777-7777-777777777709', 'Cierre de avería en impresora de albaranes', 'La oficina de tráfico vuelve a imprimir rutas y albaranes sin incidencias.', 'Nuria Lozano', 'mantenimiento', 'done', 2)
on conflict (id) do nothing;