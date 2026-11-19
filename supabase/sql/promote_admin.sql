-- Ejecutar DESPUÉS de crear el usuario en Supabase Dashboard > Authentication > Users.
-- Reemplaza el correo por el de la persona que administrará el sistema.

update profiles
set role = 'admin'
where id = (select id from auth.users where email = 'CORREO_DEL_ADMIN@ejemplo.com');

-- Verificación
select p.id, p.email, p.full_name, p.role
from profiles p
order by p.created_at;

-- Para promover a otra persona a staff o trainer:
-- update profiles set role = 'staff'   where email = 'persona@ejemplo.com';
-- update profiles set role = 'trainer' where email = 'capacitador@ejemplo.com';
