# AssetFlow

Aplicación web SaaS para la gestión de activos empresariales orientada a organizaciones de unas 100 personas. El proyecto está preparado para crecer sobre React, TypeScript, Tailwind y Supabase, con una arquitectura modular y un diseño moderno de producto B2B.

## Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Vite

## Módulos incluidos

- Autenticación con roles y modo demo preparado para Supabase
- Dashboard ejecutivo con KPIs, gráficos y últimos movimientos
- Directorio de empleados con activos asignados e historial
- Inventario completo de activos con detalle y trazabilidad
- Gestión de asignaciones y devoluciones
- Control de stock y alertas de reposición
- Mantenimiento preventivo y correctivo
- Renovaciones, garantías y fin de vida útil
- Historial auditado de eventos
- Búsqueda avanzada
- Exportaciones a CSV, Excel compatible y PDF imprimible

## Estructura

- `src/App.tsx`: shell de la aplicación, autenticación y navegación entre módulos
- `src/components`: componentes reutilizables de UI y visualización
- `src/data`: dataset de demostración y selectores derivados
- `src/features/auth`: permisos por rol
- `src/lib`: cliente Supabase y utilidades de exportación
- `src/pages`: módulos funcionales desacoplados
- `supabase/schema.sql`: esquema inicial con RLS, auditoría y sincronización de asignaciones

## Puesta en marcha

```bash
npm install
npm run dev
```

Para conectar Supabase, copia `.env.example` a `.env` y completa:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Después aplica en este orden:

1. `supabase/schema.sql` para crear tablas, RLS y auditoría.
2. `supabase/post-setup.sql` para autogenerar perfiles desde `auth.users` y backfillear usuarios existentes.
3. `supabase/seed.sql` si quieres arrancar con un dataset inicial real y no con la demo local.

## Enfoque de producción

- Preparado para RLS y separación de responsabilidades por rol
- Eventos críticos auditados desde base de datos
- Estructura lista para incorporar tickets, OCR, GLPI, Microsoft 365, Google Workspace, QR, códigos de barras e IA
- UI responsive y pensada para un uso diario en entorno corporativo
