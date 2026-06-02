# Documentación de HA Connect

## 1. Resumen del proyecto

HA Connect es una aplicación web para la gestión de activos, materiales y recursos empresariales en una organización de aproximadamente 100 personas. El proyecto nace para resolver un problema habitual en empresas con operativa diaria intensa: no existe un control claro de qué recursos tiene cada empleado, qué materiales quedan en stock, qué activos requieren mantenimiento y qué elementos deben renovarse.

La aplicación se ha diseñado con una interfaz moderna tipo SaaS, estructura modular y dos modos de uso:

- modo demo local para enseñar el producto sin depender de infraestructura externa;
- modo conectado con Supabase para persistir datos reales.

El objetivo del proyecto es crear orden, trazabilidad y visibilidad operativa sobre recursos como ordenadores, móviles, vehículos, EPIs, ropa, herramientas y licencias de software.

## 2. Problema que resuelve

En muchas empresas la gestión de materiales y activos se lleva con hojas de cálculo, mensajes sueltos o conocimiento informal del equipo. Eso provoca varios problemas:

- no se sabe con precisión qué tiene asignado cada persona;
- no hay control fiable de fechas de entrega, devolución o renovación;
- el stock disponible no está centralizado;
- los mantenimientos pueden pasarse por alto;
- la dirección no tiene una vista clara del estado general;
- se pierde tiempo en búsquedas manuales y seguimiento administrativo.

HA Connect responde a este problema con una plataforma única donde inventario, empleados, asignaciones, stock, mantenimiento, renovaciones y auditoría comparten la misma base funcional.

## 3. Objetivos

Los objetivos principales del proyecto son:

1. Centralizar la información de activos y materiales.
2. Relacionar cada activo con su empleado o situación actual.
3. Registrar entregas, devoluciones y movimientos.
4. Controlar stock mínimo, alertas y disponibilidad.
5. Hacer seguimiento de mantenimientos y renovaciones.
6. Añadir trazabilidad y auditoría de cambios.
7. Permitir distintas vistas según el rol del usuario.
8. Preparar la herramienta para crecer en el futuro.

## 4. Stack tecnológico

La solución está construida con las siguientes tecnologías:

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Supabase
- Lucide React para iconografía

Además del stack técnico, el proyecto sigue estas decisiones de producto:

- diseño visual tipo SaaS;
- interfaz responsive;
- estructura modular por áreas de negocio;
- soporte para modo demo y modo conectado;
- control de acceso por roles y permisos.

## 5. Arquitectura general

La aplicación está organizada por capas sencillas y bien separadas.

### 5.1. Capa de interfaz

La entrada principal está en `src/App.tsx`, donde se gestionan:

- autenticación;
- sesión de usuario;
- selección de módulo activo;
- preferencias de interfaz;
- renderizado del shell principal de la aplicación.

### 5.2. Capa de navegación y shell

El layout común se encuentra en `src/layouts/AppShell.tsx`. Esta capa gestiona:

- barra lateral de navegación;
- cabecera de aplicación;
- notificaciones;
- perfil activo;
- contenedor principal de cada módulo.

### 5.3. Capa de páginas funcionales

Cada área de negocio tiene su propia página en `src/pages`.

Esto permite que cada módulo evolucione sin mezclar su lógica con los demás.

### 5.4. Capa de estado y datos

El proyecto usa un snapshot compartido de workspace para leer el estado global. La parte demo se apoya en `src/data/mockData.ts`, mientras que la sincronización y mutaciones reales se canalizan a través de `src/lib/workspace.ts`.

Esta capa se encarga de:

- cargar datos desde Supabase;
- transformar filas de base de datos a tipos de frontend;
- ejecutar altas, ediciones y borrados;
- mantener sincronizado el estado del workspace.

### 5.5. Capa de autenticación y permisos

La definición de roles, permisos y módulos visibles se encuentra en `src/features/auth/permissions.ts`.

## 6. Estructura del proyecto

La estructura principal del repositorio es la siguiente:

- `src/App.tsx`: punto de entrada de la aplicación.
- `src/components`: componentes reutilizables de interfaz.
- `src/layouts`: shell y estructura común.
- `src/pages`: módulos funcionales.
- `src/data`: datos demo, selectores y utilidades derivadas.
- `src/features/auth`: configuración de roles y permisos.
- `src/lib`: conexión a Supabase, exportaciones y lógica de persistencia.
- `src/types`: tipos de dominio.
- `supabase`: scripts SQL de esquema, seeds, migraciones y reseteo.

## 7. Módulos funcionales actuales

La aplicación ya cuenta con los siguientes módulos.

### 7.1. Inicio

El módulo de inicio ofrece una visión general de la plataforma con:

- KPIs operativos;
- accesos rápidos;
- widgets configurables;
- contexto del rol activo;
- panel de seguimiento general.

### 7.2. Dashboard / Kanban

El dashboard actual está centrado en un tablero Kanban para gestión de tareas. Permite:

- crear tareas;
- editar tareas;
- mover tareas entre columnas;
- reorganizar prioridades;
- relacionar tareas con módulos de negocio.

### 7.3. Alertas

Reúne avisos operativos sobre renovaciones, stock y mantenimientos próximos.

### 7.4. Empleados

Incluye:

- listado de empleados;
- detalle individual;
- activos asignados;
- historial de asignaciones;
- alta, edición y baja según permisos.

### 7.5. Inventario de activos

Gestiona:

- catálogo de activos;
- detalle de activo;
- estados;
- ubicación;
- empleado asignado;
- renovaciones y mantenimientos relacionados.

### 7.6. Asignaciones y devoluciones

Permite registrar movimientos de entrega y devolución entre activos y empleados.

### 7.7. Stock

Centraliza materiales consumibles o recursos con cantidad disponible y mínimo esperado.

### 7.8. Mantenimiento

Recoge revisiones, averías y mantenimientos preventivos o correctivos.

### 7.9. Renovaciones

Controla garantías, renovaciones y fin de vida útil de los recursos.

### 7.10. Historial

Muestra la auditoría de eventos críticos de la plataforma.

### 7.11. Búsqueda avanzada

Permite buscar activos con filtros combinados por:

- texto libre;
- categoría;
- empleado;
- departamento;
- estado;
- rango de fechas.

### 7.12. Exportaciones

La aplicación incluye salidas a:

- CSV;
- Excel compatible;
- PDF imprimible.

### 7.13. Ajustes

Contiene preferencias de experiencia y opciones relacionadas con el entorno de uso.

## 8. Roles y permisos

La plataforma soporta cuatro roles principales.

### 8.1. Administrador

Capacidades principales:

- acceso a todos los módulos;
- control completo de empleados, activos y configuración;
- acceso a auditoría y exportaciones;
- capacidad de administración funcional global.

### 8.2. Responsable IT

Capacidades principales:

- gestión de inventario TI;
- asignaciones;
- mantenimiento;
- renovaciones;
- exportaciones;
- lectura de auditoría.

No administra la seguridad avanzada ni el modelo global de autorización.

### 8.3. Supervisor

Capacidades principales:

- seguimiento de operativa diaria;
- gestión de asignaciones y stock;
- revisión de alertas;
- exportaciones;
- consulta de empleados e inventario.

No tiene acceso completo al historial corporativo ni a toda la administración de plantilla.

### 8.4. Empleado

Capacidades principales:

- consulta de recursos visibles;
- búsqueda operativa básica;
- acceso a entorno personal y ajustes.

No puede crear empleados, asignar activos, exportar información ni administrar módulos sensibles.

## 9. Modelo de datos

El backend de Supabase define las tablas y relaciones principales.

### 9.1. `profiles`

Extiende la información de `auth.users` con nombre, email, rol y departamento.

### 9.2. `employees`

Representa a los empleados visibles en la plataforma y sus datos operativos.

### 9.3. `assets`

Contiene el catálogo de activos con datos como código interno, categoría, estado, ubicación, fechas y empleado asignado.

### 9.4. `asset_assignments`

Registra la relación temporal entre un activo y un empleado, incluyendo fecha de entrega, devolución y notas.

### 9.5. `stock_items`

Gestiona materiales con cantidades disponibles y mínimos de referencia.

### 9.6. `maintenance_records`

Guarda intervenciones de mantenimiento realizadas sobre activos.

### 9.7. `renewals`

Registra próximos vencimientos, garantías o renovaciones.

### 9.8. `kanban_tasks`

Tabla destinada al tablero Kanban del dashboard.

### 9.9. `audit_events`

Registra trazabilidad de cambios y eventos relevantes de negocio.

## 10. Seguridad y trazabilidad

La base de datos está preparada con medidas de control importantes.

### 10.1. RLS

Las tablas principales tienen Row Level Security activado para limitar el acceso según usuario autenticado y rol.

### 10.2. Resolución de rol

La función `public.current_app_role()` obtiene el rol efectivo del usuario autenticado sin depender de consultas inseguras desde frontend.

### 10.3. Auditoría automática

La función `public.write_audit_event()` registra inserciones, cambios, devoluciones, bajas y mantenimientos relevantes.

### 10.4. Sincronización entre asignaciones y activos

La función `public.sync_asset_from_assignment()` mantiene coherencia entre movimientos de asignación y estado del activo.

### 10.5. Alta automática de perfiles

La función `public.handle_new_user()` crea o actualiza perfiles desde `auth.users`.

## 11. Modos de funcionamiento

La aplicación puede trabajar en dos modos.

### 11.1. Modo demo

Usa datos locales y permite enseñar el producto sin depender de una base de datos externa.

### 11.2. Modo Supabase

Cuando las variables de entorno están configuradas, la aplicación usa Supabase para:

- autenticación;
- persistencia de datos;
- sincronización de cambios;
- gestión real de perfiles y permisos.

## 12. Puesta en marcha local

### 12.1. Instalación

```bash
npm install
```

### 12.2. Desarrollo

```bash
npm run dev
```

### 12.3. Build de producción

```bash
npm run build
```

### 12.4. Variables de entorno

Para conectar Supabase se deben definir:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

La aplicación también acepta `VITE_SUPABASE_ANON_KEY` como alternativa al publishable key.

## 13. Scripts SQL de Supabase

En la carpeta `supabase` existen varios scripts con objetivos distintos.

### 13.1. `schema.sql`

Script principal para crear:

- tipos;
- tablas;
- índices;
- triggers;
- funciones de negocio;
- políticas RLS.

### 13.2. `fix-profiles-rls.sql`

Ajuste específico relacionado con la resolución segura del rol y la lectura de perfiles.

### 13.3. `post-setup.sql`

Instala la función y trigger que sincronizan `auth.users` con `public.profiles`.

### 13.4. `seed.sql`

Inserta datos iniciales de empleados, activos, asignaciones, stock, mantenimientos, renovaciones y tareas Kanban.

### 13.5. `kanban-migration.sql`

Script específico para añadir el soporte Kanban sobre una instalación previa.

### 13.6. `reset-all.sql`

Script destructivo pensado para rehacer el entorno completo desde cero.

Importante: este archivo borra datos existentes y debe utilizarse con cuidado.

## 14. Orden recomendado para preparar Supabase

Si se parte de una base vacía, el flujo recomendado es:

1. ejecutar `supabase/schema.sql`;
2. ejecutar `supabase/fix-profiles-rls.sql` si se necesita reforzar la lectura del rol;
3. ejecutar `supabase/post-setup.sql`;
4. ejecutar `supabase/seed.sql` si se quiere una base inicial de ejemplo.

Si se quiere resetear completamente el entorno, usar `supabase/reset-all.sql`.

## 15. Flujo recomendado para la demo

Para enseñar el proyecto en clase o presentación, el recorrido más claro es:

1. iniciar sesión;
2. mostrar el Inicio con KPIs y widgets;
3. abrir el Kanban;
4. enseñar Inventario y el detalle de un activo;
5. enseñar Empleados y sus asignaciones;
6. enseñar Alertas;
7. enseñar Historial;
8. terminar en Exportaciones.

Este orden permite explicar primero el problema general y después bajar al detalle de los módulos.

## 16. Comparativa con soluciones ya existentes

Existen herramientas que podrían resolver parcialmente este problema, por ejemplo:

- Excel;
- Google Sheets;
- Airtable;
- Notion;
- GLPI;
- Odoo.

Ventajas de esas herramientas:

- implantación rápida;
- menor desarrollo inicial;
- ecosistemas ya conocidos.

Limitaciones frente a una app propia como HA Connect:

- menor adaptación al caso concreto de la empresa;
- experiencia menos visual o menos dirigida al flujo real;
- integración parcial entre inventario, asignaciones, stock y auditoría;
- menor control del producto y su evolución.

## 17. Hoja de ruta futura

Las siguientes mejoras encajan bien con la arquitectura actual:

1. sistema de tickets;
2. gestión documental;
3. firma digital;
4. QR y códigos de barras;
5. inventario móvil;
6. OCR de facturas;
7. OCR de albaranes;
8. IA para predicción de renovaciones;
9. automatizaciones;
10. correos y notificaciones importantes;
11. dashboards más analíticos para dirección.

## 18. Limitaciones actuales

En el estado actual del proyecto conviene tener presentes estas consideraciones:

- parte de la experiencia sigue preparada para demo local;
- algunas mejoras futuras aparecen como concepto, pero no están implantadas todavía;
- el valor principal está en la arquitectura funcional, la experiencia de uso y la base preparada para crecer.

## 19. Conclusión

HA Connect no es solo una interfaz para listar activos. Es una propuesta de organización operativa para empresas que necesitan controlar inventario, movimientos, mantenimiento, stock, renovaciones y trazabilidad en un único entorno.

El proyecto ya demuestra una solución funcional, moderna y ampliable. Además, está preparado para conectarse a un backend real con Supabase y evolucionar hacia una herramienta más completa de gestión empresarial.

## 20. Preparación para PDF

Este documento está pensado para reutilizarse como base de memoria, entrega o PDF final. Si se desea generar una versión formal para entregar, el siguiente paso natural es convertir este contenido en:

- memoria técnica;
- documento funcional;
- anexos de base de datos;
- versión PDF maquetada.