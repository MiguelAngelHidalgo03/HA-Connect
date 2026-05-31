do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'kanban_task_status'
  ) then
    create type public.kanban_task_status as enum ('todo', 'doing', 'done');
  end if;
end
$$;

create table if not exists public.kanban_tasks (
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

create index if not exists kanban_tasks_status_order_idx
on public.kanban_tasks (status, order_index, updated_at desc);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'kanban_tasks_set_updated_at'
  ) then
    create trigger kanban_tasks_set_updated_at
    before update on public.kanban_tasks
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'audit_kanban_changes'
  ) then
    create trigger audit_kanban_changes
    after insert or update or delete on public.kanban_tasks
    for each row execute function public.write_audit_event();
  end if;
end
$$;

alter table public.kanban_tasks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'kanban_tasks'
      and policyname = 'kanban_read'
  ) then
    create policy kanban_read on public.kanban_tasks
    for select to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'kanban_tasks'
      and policyname = 'kanban_manage'
  ) then
    create policy kanban_manage on public.kanban_tasks
    for all to authenticated
    using (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'))
    with check (public.current_app_role() in ('Administrador', 'Responsable IT', 'Supervisor'));
  end if;
end
$$;

insert into public.kanban_tasks (id, title, description, owner_name, module_id, status, order_index)
values
  ('77777777-7777-7777-7777-777777777701', 'Entregar móviles a dos chóferes nuevos de Lorca', 'Pendiente de firma de entrega antes del arranque del lunes en base central.', 'Laura Casas', 'asignaciones', 'todo', 0),
  ('77777777-7777-7777-7777-777777777702', 'Reponer botas y guantes para la nave de cereal', 'Compras debe cerrar el pedido urgente para el turno de tarde.', 'Diego Martín', 'stock', 'todo', 1),
  ('77777777-7777-7777-7777-777777777703', 'Renovar licencias del sistema de rutas de la flota', 'Quedan menos de 10 días para el vencimiento del proveedor actual.', 'Miguel A. Hidalgo', 'renovaciones', 'todo', 2),
  ('77777777-7777-7777-7777-777777777704', 'Revisar tacógrafos y mantenimiento del camión HA-27', 'El vehículo sigue en taller para no frenar la ruta Lorca-Sevilla.', 'Nuria Lozano', 'mantenimiento', 'doing', 0),
  ('77777777-7777-7777-7777-777777777705', 'Inventario de tablets y lectores en oficina de Lorca', 'Falta cuadrar tres equipos devueltos por el equipo de rutas.', 'Alicia Moreno', 'activos', 'doing', 1),
  ('77777777-7777-7777-7777-777777777706', 'Preparar alta de personal eventual para la campaña', 'RRHH revisa documentación y puestos para refuerzo de cereal y granjas.', 'Carlos Vega', 'empleados', 'doing', 2),
  ('77777777-7777-7777-7777-777777777707', 'Reposición de EPIs cerrada en almacén de Lorca', 'Casco, chaleco y guantes ya están disponibles para el turno de mañana.', 'Diego Martín', 'stock', 'done', 0),
  ('77777777-7777-7777-7777-777777777708', 'Entrega de portátiles al equipo de administración', 'Equipos configurados, entregados y firmados por recepción interna.', 'Laura Casas', 'asignaciones', 'done', 1),
  ('77777777-7777-7777-7777-777777777709', 'Cierre de avería en impresora de albaranes', 'La oficina de tráfico vuelve a imprimir rutas y albaranes sin incidencias.', 'Nuria Lozano', 'mantenimiento', 'done', 2)
on conflict (id) do nothing;