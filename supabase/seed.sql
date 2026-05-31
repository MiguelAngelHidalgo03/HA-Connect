insert into public.employees (id, first_name, last_name, email, phone, department, position, start_date, status)
values
  ('11111111-1111-1111-1111-111111111101', 'Laura', 'Casas', 'laura.casas@assetflow.local', '+34 600 112 221', 'IT', 'Responsable de infraestructura', '2022-02-14', 'Activo'),
  ('11111111-1111-1111-1111-111111111102', 'Diego', 'Martín', 'diego.martin@assetflow.local', '+34 600 112 222', 'Operaciones', 'Supervisor regional', '2021-09-01', 'Activo'),
  ('11111111-1111-1111-1111-111111111103', 'Sara', 'Núñez', 'sara.nunez@assetflow.local', '+34 600 112 223', 'Logística', 'Coordinadora de flota', '2023-01-16', 'Activo'),
  ('11111111-1111-1111-1111-111111111104', 'Pablo', 'Rivas', 'pablo.rivas@assetflow.local', '+34 600 112 224', 'Comercial', 'Ejecutivo de cuentas', '2026-03-21', 'Activo'),
  ('11111111-1111-1111-1111-111111111105', 'Marta', 'Gálvez', 'marta.galvez@assetflow.local', '+34 600 112 225', 'Finanzas', 'Controller', '2020-06-12', 'Vacaciones'),
  ('11111111-1111-1111-1111-111111111106', 'Inés', 'Romero', 'ines.romero@assetflow.local', '+34 600 112 226', 'Producción', 'Técnica de campo', '2024-04-08', 'Activo')
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
  ('22222222-2222-2222-2222-222222222201', 'AFC-IT-001', 'Estación Dell Precision 5680', 'Informática', 'Dell', 'Precision 5680', 'DL-5680-4412', '2025-11-18', 2480, 'Asignado', 'Madrid HQ', 'Equipo principal del área de infraestructura.', '2028-11-18', '2028-05-01', '2029-11-18'),
  ('22222222-2222-2222-2222-222222222202', 'AFC-IT-002', 'Portátil Lenovo ThinkPad X1 Carbon', 'Informática', 'Lenovo', 'X1 Carbon Gen 12', 'LNV-X1-8821', '2025-08-22', 2140, 'Asignado', 'Sevilla', 'Equipo para supervisión operativa y visitas.', '2028-08-22', '2028-06-01', '2029-08-22'),
  ('22222222-2222-2222-2222-222222222203', 'AFC-MB-003', 'iPhone 15 Pro', 'Informática', 'Apple', 'iPhone 15 Pro 256GB', 'APL-IP15-1029', '2026-01-29', 1320, 'Asignado', 'Valencia', 'Terminal corporativo para comercial senior.', '2028-01-29', '2026-09-01', '2028-12-31'),
  ('22222222-2222-2222-2222-222222222204', 'AFC-TB-004', 'Samsung Galaxy Tab S9', 'Informática', 'Samsung', 'Galaxy Tab S9', 'SAM-TABS9-7722', '2025-06-04', 890, 'Disponible', 'Almacén central', 'Tableta lista para visitas técnicas o firma digital.', '2027-06-04', '2027-03-04', '2028-06-04'),
  ('22222222-2222-2222-2222-222222222205', 'AFC-VH-005', 'Furgoneta Ford Transit Custom', 'Vehículos', 'Ford', 'Transit Custom', 'FRD-TRN-5508', '2023-10-10', 32100, 'En mantenimiento', 'Taller MotorSur', 'Revisión ITV y ajustes de batería en curso.', '2027-10-10', '2027-05-18', '2030-10-10'),
  ('22222222-2222-2222-2222-222222222206', 'AFC-VH-006', 'Toyota Corolla Touring Sports', 'Vehículos', 'Toyota', 'Corolla Touring Sports', 'TYT-CRL-1205', '2024-02-02', 28750, 'Asignado', 'Bilbao', 'Vehículo para coordinación logística regional.', '2029-02-02', '2027-02-14', '2031-02-02'),
  ('22222222-2222-2222-2222-222222222207', 'AFC-EPI-009', 'Arnés anticaídas Petzl', 'EPIs', 'Petzl', 'Newton Easyfit', 'PTZ-HAR-2045', '2025-12-18', 265, 'Asignado', 'Planta sur', 'Equipo individual certificado para trabajo en altura.', '2028-12-18', '2026-10-28', '2029-12-18'),
  ('22222222-2222-2222-2222-222222222208', 'AFC-SW-012', 'Licencia Autodesk AutoCAD 2026', 'Software', 'Autodesk', 'AutoCAD 2026', 'ADSK-ACAD-2026', '2026-01-08', 1860, 'Asignado', 'Tenant corporativo', 'Licencia nominal asociada a ingeniería de campo.', '2027-01-08', '2026-07-31', '2029-01-08'),
  ('22222222-2222-2222-2222-222222222209', 'AFC-SW-013', 'Licencia Microsoft 365 E5', 'Software', 'Microsoft', 'M365 E5', 'MS-E5-120034', '2025-06-15', 690, 'Disponible', 'Tenant corporativo', 'Pool de licencias para nuevas incorporaciones.', '2026-06-15', '2026-06-15', '2027-06-15')
on conflict (id) do nothing;

insert into public.asset_assignments (id, asset_id, employee_id, delivered_at, returned_at, notes)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '2026-01-15T09:30:00+00:00', null, 'Puesto de trabajo principal con docking y monitores.'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', '2025-09-04T11:00:00+00:00', null, 'Configurado con VPN y acceso de supervisión.'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111104', '2026-02-11T12:30:00+00:00', null, 'Terminal preparado para viajes y firma de contratos.'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', '2025-05-04T09:20:00+00:00', '2025-12-10T16:00:00+00:00', 'Tableta usada para inventario de almacenes temporales.'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', '2026-03-03T08:45:00+00:00', null, 'Asignación permanente para coordinación de flota.'),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111106', '2026-04-07T08:00:00+00:00', null, 'EPI registrado con firma de entrega y revisión PRL.'),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111106', '2026-01-08T10:05:00+00:00', null, 'Licencia nominal para diseño y replanteo.')
on conflict (id) do nothing;

insert into public.stock_items (id, name, category, location, available_quantity, minimum_quantity, unit, last_restock_at)
values
  ('44444444-4444-4444-4444-444444444401', 'Casco dieléctrico', 'EPIs', 'Sevilla - PRL', 18, 20, 'uds', '2026-04-20T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444402', 'Chaleco reflectante premium', 'Ropa', 'Almacén central', 54, 30, 'uds', '2026-05-02T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444403', 'Guantes anticorte nivel 5', 'EPIs', 'Bilbao - PRL', 12, 15, 'pares', '2026-04-26T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444404', 'Ratón ergonómico', 'Informática', 'Madrid HQ', 9, 10, 'uds', '2026-04-11T00:00:00+00:00'),
  ('44444444-4444-4444-4444-444444444405', 'Teclado compacto', 'Informática', 'Madrid HQ', 22, 12, 'uds', '2026-05-06T00:00:00+00:00')
on conflict (id) do nothing;

insert into public.maintenance_records (id, asset_id, maintenance_type, maintenance_date, cost, description, technician, next_due_date)
values
  ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222205', 'ITV', '2026-05-18', 92, 'Inspección técnica y ajuste de frenos.', 'Taller MotorSur', '2027-05-18'),
  ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222205', 'Cambio de batería', '2026-01-09', 240, 'Sustitución preventiva de batería y prueba de carga.', 'Taller MotorSur', '2027-01-09'),
  ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222201', 'Revisión', '2026-03-02', 80, 'Mantenimiento preventivo, limpieza interna y diagnóstico.', 'Soporte IT interno', '2027-03-02'),
  ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222207', 'Revisión', '2026-04-28', 45, 'Verificación de arnés y estado de costuras de seguridad.', 'PRL Iberia', '2026-10-28')
on conflict (id) do nothing;

insert into public.renewals (id, asset_id, renewal_type, due_date, status, notes)
values
  ('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222203', 'Renovación', '2026-09-01', 'Pendiente', 'Revisión del ciclo del terminal comercial.'),
  ('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222208', 'Renovación', '2026-07-31', 'Pendiente', 'Renovación anual de licencia AutoCAD.'),
  ('66666666-6666-6666-6666-666666666603', '22222222-2222-2222-2222-222222222209', 'Renovación', '2026-06-15', 'Pendiente', 'Pool de licencias M365 listo para nuevas altas.'),
  ('66666666-6666-6666-6666-666666666604', '22222222-2222-2222-2222-222222222207', 'Garantía', '2028-12-18', 'Planificada', 'Garantía premium para EPI crítico.'),
  ('66666666-6666-6666-6666-666666666605', '22222222-2222-2222-2222-222222222201', 'Garantía', '2028-11-18', 'Planificada', 'Garantía premium onsite 48h.')
on conflict (id) do nothing;

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
