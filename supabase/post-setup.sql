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
