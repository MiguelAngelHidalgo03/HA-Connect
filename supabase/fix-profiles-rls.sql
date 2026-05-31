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