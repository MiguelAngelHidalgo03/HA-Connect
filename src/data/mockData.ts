import type {
  AppNotification,
  Asset,
  AssetCategory,
  AssetStatus,
  Assignment,
  AuditEvent,
  ChartDatum,
  Employee,
  FilterState,
  KanbanColumn,
  KanbanTask,
  MaintenanceRecord,
  RenewalItem,
  StockItem,
  WorkspaceData,
} from '@/types/domain'

export const companyProfile = {
  legalName: 'Hermanos Alcaraz de Lorca S.L.',
  shortName: 'Hermanos Alcaraz de Lorca',
  sectors: ['Transporte nacional', 'Cereal y piensos', 'Servicios ganaderos'],
  employeeCount: 100,
  activeFleet: 38,
  activeWarehouses: 4,
  dailyRoutes: 62,
  activeSites: ['Lorca', 'Murcia', 'Albacete', 'Sevilla'],
  currentCampaign: 'Campana de cereal, pienso y reparto desde Lorca',
}

const initialDemoKanbanTasks: KanbanTask[] = [
  {
    id: 'task-001',
    title: 'Entregar móviles a dos chóferes nuevos de Lorca',
    description: 'Pendiente de firma de entrega antes del arranque del lunes en base central.',
    owner: 'Laura Casas',
    moduleId: 'asignaciones',
    status: 'todo',
    position: 0,
  },
  {
    id: 'task-002',
    title: 'Reponer botas y guantes para la nave de cereal',
    description: 'Compras debe cerrar el pedido urgente para el turno de tarde.',
    owner: 'Diego Martín',
    moduleId: 'stock',
    status: 'todo',
    position: 1,
  },
  {
    id: 'task-003',
    title: 'Renovar licencias del sistema de rutas de la flota',
    description: 'Quedan menos de 10 días para el vencimiento del proveedor actual.',
    owner: 'Miguel A. Hidalgo',
    moduleId: 'renovaciones',
    status: 'todo',
    position: 2,
  },
  {
    id: 'task-004',
    title: 'Revisar tacógrafos y mantenimiento del camión HA-27',
    description: 'El vehículo sigue en taller para no frenar la ruta Lorca-Sevilla.',
    owner: 'Nuria Lozano',
    moduleId: 'mantenimiento',
    status: 'doing',
    position: 0,
  },
  {
    id: 'task-005',
    title: 'Inventario de tablets y lectores en oficina de Lorca',
    description: 'Falta cuadrar tres equipos devueltos por el equipo de rutas.',
    owner: 'Alicia Moreno',
    moduleId: 'activos',
    status: 'doing',
    position: 1,
  },
  {
    id: 'task-006',
    title: 'Preparar alta de personal eventual para la campaña',
    description: 'RRHH revisa documentación y puestos para refuerzo de cereal y granjas.',
    owner: 'Carlos Vega',
    moduleId: 'empleados',
    status: 'doing',
    position: 2,
  },
  {
    id: 'task-007',
    title: 'Reposición de EPIs cerrada en almacén de Lorca',
    description: 'Casco, chaleco y guantes ya están disponibles para el turno de mañana.',
    owner: 'Diego Martín',
    moduleId: 'stock',
    status: 'done',
    position: 0,
  },
  {
    id: 'task-008',
    title: 'Entrega de portátiles al equipo de administración',
    description: 'Equipos configurados, entregados y firmados por recepción interna.',
    owner: 'Laura Casas',
    moduleId: 'asignaciones',
    status: 'done',
    position: 1,
  },
  {
    id: 'task-009',
    title: 'Cierre de avería en impresora de albaranes',
    description: 'La oficina de tráfico vuelve a imprimir rutas y albaranes sin incidencias.',
    owner: 'Nuria Lozano',
    moduleId: 'mantenimiento',
    status: 'done',
    position: 2,
  },
]

export let demoKanbanTasks: KanbanTask[] = cloneRecords(initialDemoKanbanTasks)

export const kanbanColumnDefinitions: Array<Omit<KanbanColumn, 'tasks'>> = [
  { id: 'todo', title: 'Por hacer', tone: 'warning' },
  { id: 'doing', title: 'En marcha', tone: 'info' },
  { id: 'done', title: 'Hecho', tone: 'success' },
]

const categoryColors: Record<AssetCategory, string> = {
  'Informática': '#0f766e',
  Vehículos: '#1d4ed8',
  EPIs: '#d97706',
  Herramientas: '#7c3aed',
  Ropa: '#ea580c',
  Software: '#0891b2',
  Otros: '#64748b',
}

const statusColors: Record<AssetStatus, string> = {
  Disponible: '#16a34a',
  Asignado: '#0f766e',
  'En mantenimiento': '#d97706',
  Averiado: '#dc2626',
  Retirado: '#64748b',
}

export let demoEmployees: Employee[] = [
  {
    id: 'emp-001',
    firstName: 'Laura',
    lastName: 'Casas',
    fullName: 'Laura Casas',
    email: 'laura.casas@haconnect.local',
    phone: '+34 600 112 221',
    department: 'IT',
    position: 'Responsable de infraestructura',
    startDate: '2022-02-14',
    status: 'Activo',
  },
  {
    id: 'emp-002',
    firstName: 'Diego',
    lastName: 'Martín',
    fullName: 'Diego Martín',
    email: 'diego.martin@haconnect.local',
    phone: '+34 600 112 222',
    department: 'Operaciones',
    position: 'Supervisor regional',
    startDate: '2021-09-01',
    status: 'Activo',
  },
  {
    id: 'emp-003',
    firstName: 'Sara',
    lastName: 'Núñez',
    fullName: 'Sara Núñez',
    email: 'sara.nunez@haconnect.local',
    phone: '+34 600 112 223',
    department: 'Logística',
    position: 'Coordinadora de flota',
    startDate: '2023-01-16',
    status: 'Activo',
  },
  {
    id: 'emp-004',
    firstName: 'Pablo',
    lastName: 'Rivas',
    fullName: 'Pablo Rivas',
    email: 'pablo.rivas@haconnect.local',
    phone: '+34 600 112 224',
    department: 'Comercial',
    position: 'Ejecutivo de cuentas',
    startDate: '2026-03-21',
    status: 'Activo',
  },
  {
    id: 'emp-005',
    firstName: 'Marta',
    lastName: 'Gálvez',
    fullName: 'Marta Gálvez',
    email: 'marta.galvez@haconnect.local',
    phone: '+34 600 112 225',
    department: 'Finanzas',
    position: 'Controller',
    startDate: '2020-06-12',
    status: 'Vacaciones',
  },
  {
    id: 'emp-006',
    firstName: 'Inés',
    lastName: 'Romero',
    fullName: 'Inés Romero',
    email: 'ines.romero@haconnect.local',
    phone: '+34 600 112 226',
    department: 'Producción',
    position: 'Técnica de campo',
    startDate: '2024-04-08',
    status: 'Activo',
  },
  {
    id: 'emp-007',
    firstName: 'Carlos',
    lastName: 'Vega',
    fullName: 'Carlos Vega',
    email: 'carlos.vega@haconnect.local',
    phone: '+34 600 112 227',
    department: 'RRHH',
    position: 'People Operations',
    startDate: '2023-11-06',
    status: 'Activo',
  },
  {
    id: 'emp-008',
    firstName: 'Nuria',
    lastName: 'Lozano',
    fullName: 'Nuria Lozano',
    email: 'nuria.lozano@haconnect.local',
    phone: '+34 600 112 228',
    department: 'Taller',
    position: 'Jefa de mantenimiento',
    startDate: '2019-05-20',
    status: 'Activo',
  },
  {
    id: 'emp-009',
    firstName: 'Antonio',
    lastName: 'Paredes',
    fullName: 'Antonio Paredes',
    email: 'antonio.paredes@hmnosalcaraz.com',
    phone: '+34 600 112 229',
    department: 'Tráfico',
    position: 'Planificador de rutas',
    startDate: '2022-10-17',
    status: 'Activo',
  },
  {
    id: 'emp-010',
    firstName: 'María',
    lastName: 'Serrano',
    fullName: 'María Serrano',
    email: 'maria.serrano@hmnosalcaraz.com',
    phone: '+34 600 112 230',
    department: 'Administración',
    position: 'Administrativa de operaciones',
    startDate: '2021-03-01',
    status: 'Activo',
  },
  {
    id: 'emp-011',
    firstName: 'José',
    lastName: 'Belmonte',
    fullName: 'José Belmonte',
    email: 'jose.belmonte@hmnosalcaraz.com',
    phone: '+34 600 112 231',
    department: 'Flota',
    position: 'Conductor especialista',
    startDate: '2020-11-09',
    status: 'Activo',
  },
  {
    id: 'emp-012',
    firstName: 'Lucía',
    lastName: 'Navarro',
    fullName: 'Lucía Navarro',
    email: 'lucia.navarro@hmnosalcaraz.com',
    phone: '+34 600 112 232',
    department: 'PRL',
    position: 'Técnica de prevención',
    startDate: '2024-01-22',
    status: 'Activo',
  },
]

export let demoAssets: Asset[] = [
  {
    id: 'ast-001',
    code: 'AFC-IT-001',
    name: 'Estación Dell Precision 5680',
    category: 'Informática',
    brand: 'Dell',
    model: 'Precision 5680',
    serialNumber: 'DL-5680-4412',
    purchaseDate: '2025-11-18',
    cost: 2480,
    status: 'Asignado',
    location: 'Madrid HQ',
    observations: 'Equipo principal del área de infraestructura.',
    assignedEmployeeId: 'emp-001',
    warrantyEnd: '2028-11-18',
    nextRenewal: '2028-05-01',
    endOfLife: '2029-11-18',
  },
  {
    id: 'ast-002',
    code: 'AFC-IT-002',
    name: 'Portátil Lenovo ThinkPad X1 Carbon',
    category: 'Informática',
    brand: 'Lenovo',
    model: 'X1 Carbon Gen 12',
    serialNumber: 'LNV-X1-8821',
    purchaseDate: '2025-08-22',
    cost: 2140,
    status: 'Asignado',
    location: 'Sevilla',
    observations: 'Equipo para supervisión operativa y visitas.',
    assignedEmployeeId: 'emp-002',
    warrantyEnd: '2028-08-22',
    nextRenewal: '2028-06-01',
    endOfLife: '2029-08-22',
  },
  {
    id: 'ast-003',
    code: 'AFC-MB-003',
    name: 'iPhone 15 Pro',
    category: 'Informática',
    brand: 'Apple',
    model: 'iPhone 15 Pro 256GB',
    serialNumber: 'APL-IP15-1029',
    purchaseDate: '2026-01-29',
    cost: 1320,
    status: 'Asignado',
    location: 'Valencia',
    observations: 'Terminal corporativo para comercial senior.',
    assignedEmployeeId: 'emp-004',
    warrantyEnd: '2028-01-29',
    nextRenewal: '2026-09-01',
    endOfLife: '2028-12-31',
  },
  {
    id: 'ast-004',
    code: 'AFC-TB-004',
    name: 'Samsung Galaxy Tab S9',
    category: 'Informática',
    brand: 'Samsung',
    model: 'Galaxy Tab S9',
    serialNumber: 'SAM-TABS9-7722',
    purchaseDate: '2025-06-04',
    cost: 890,
    status: 'Disponible',
    location: 'Almacén central',
    observations: 'Tableta lista para visitas técnicas o firma digital.',
    warrantyEnd: '2027-06-04',
    nextRenewal: '2027-03-04',
    endOfLife: '2028-06-04',
  },
  {
    id: 'ast-005',
    code: 'AFC-VH-005',
    name: 'Furgoneta Ford Transit Custom',
    category: 'Vehículos',
    brand: 'Ford',
    model: 'Transit Custom',
    serialNumber: 'FRD-TRN-5508',
    purchaseDate: '2023-10-10',
    cost: 32100,
    status: 'En mantenimiento',
    location: 'Taller MotorSur',
    observations: 'Revisión ITV y ajustes de batería en curso.',
    warrantyEnd: '2027-10-10',
    nextRenewal: '2027-05-18',
    endOfLife: '2030-10-10',
  },
  {
    id: 'ast-006',
    code: 'AFC-VH-006',
    name: 'Toyota Corolla Touring Sports',
    category: 'Vehículos',
    brand: 'Toyota',
    model: 'Corolla Touring Sports',
    serialNumber: 'TYT-CRL-1205',
    purchaseDate: '2024-02-02',
    cost: 28750,
    status: 'Asignado',
    location: 'Bilbao',
    observations: 'Vehículo para coordinación logística regional.',
    assignedEmployeeId: 'emp-003',
    warrantyEnd: '2029-02-02',
    nextRenewal: '2027-02-14',
    endOfLife: '2031-02-02',
  },
  {
    id: 'ast-007',
    code: 'AFC-HR-007',
    name: 'Taladro Bosch GSB 18V-150 C',
    category: 'Herramientas',
    brand: 'Bosch',
    model: 'GSB 18V-150 C',
    serialNumber: 'BSC-GSB-1150',
    purchaseDate: '2025-01-10',
    cost: 320,
    status: 'Disponible',
    location: 'Taller norte',
    observations: 'Herramienta lista para préstamo interno.',
    warrantyEnd: '2027-01-10',
    nextRenewal: '2027-01-10',
    endOfLife: '2029-01-10',
  },
  {
    id: 'ast-008',
    code: 'AFC-HR-008',
    name: 'Atornillador Milwaukee M18 FPD3',
    category: 'Herramientas',
    brand: 'Milwaukee',
    model: 'M18 FPD3',
    serialNumber: 'MWK-M18-4933',
    purchaseDate: '2024-09-19',
    cost: 410,
    status: 'Averiado',
    location: 'Taller norte',
    observations: 'Pendiente de sustitución del motor interno.',
    warrantyEnd: '2026-09-19',
    nextRenewal: '2026-11-10',
    endOfLife: '2028-09-19',
  },
  {
    id: 'ast-009',
    code: 'AFC-EPI-009',
    name: 'Arnés anticaídas Petzl',
    category: 'EPIs',
    brand: 'Petzl',
    model: 'Newton Easyfit',
    serialNumber: 'PTZ-HAR-2045',
    purchaseDate: '2025-12-18',
    cost: 265,
    status: 'Asignado',
    location: 'Planta sur',
    observations: 'Equipo individual certificado para trabajo en altura.',
    assignedEmployeeId: 'emp-006',
    warrantyEnd: '2028-12-18',
    nextRenewal: '2026-10-28',
    endOfLife: '2029-12-18',
  },
  {
    id: 'ast-010',
    code: 'AFC-EPI-010',
    name: 'Detector multigás Dräger',
    category: 'EPIs',
    brand: 'Dräger',
    model: 'X-am 2800',
    serialNumber: 'DRG-XAM-2800',
    purchaseDate: '2025-07-11',
    cost: 1180,
    status: 'Disponible',
    location: 'Sevilla - almacén PRL',
    observations: 'Calibrado y disponible para técnicos desplazados.',
    warrantyEnd: '2027-07-11',
    nextRenewal: '2026-12-15',
    endOfLife: '2028-07-11',
  },
  {
    id: 'ast-011',
    code: 'AFC-RP-011',
    name: 'Chaqueta ignífuga Nomex',
    category: 'Ropa',
    brand: 'Nomex',
    model: 'Series 5',
    serialNumber: 'NMX-JKT-8841',
    purchaseDate: '2025-03-12',
    cost: 142,
    status: 'Disponible',
    location: 'Vestuario central',
    observations: 'Talla M, lote de reposición premium.',
    warrantyEnd: '2026-10-10',
    nextRenewal: '2026-10-10',
    endOfLife: '2027-10-10',
  },
  {
    id: 'ast-012',
    code: 'AFC-SW-012',
    name: 'Licencia Autodesk AutoCAD 2026',
    category: 'Software',
    brand: 'Autodesk',
    model: 'AutoCAD 2026',
    serialNumber: 'ADSK-ACAD-2026',
    purchaseDate: '2026-01-08',
    cost: 1860,
    status: 'Asignado',
    location: 'Tenant corporativo',
    observations: 'Licencia nominal asociada a ingeniería de campo.',
    assignedEmployeeId: 'emp-006',
    warrantyEnd: '2027-01-08',
    nextRenewal: '2026-07-31',
    endOfLife: '2029-01-08',
  },
  {
    id: 'ast-013',
    code: 'AFC-SW-013',
    name: 'Licencia Microsoft 365 E5',
    category: 'Software',
    brand: 'Microsoft',
    model: 'M365 E5',
    serialNumber: 'MS-E5-120034',
    purchaseDate: '2025-06-15',
    cost: 690,
    status: 'Disponible',
    location: 'Tenant corporativo',
    observations: 'Pool de licencias para nuevas incorporaciones.',
    warrantyEnd: '2026-06-15',
    nextRenewal: '2026-06-15',
    endOfLife: '2027-06-15',
  },
  {
    id: 'ast-014',
    code: 'AFC-OT-014',
    name: 'Cámara térmica FLIR C5',
    category: 'Otros',
    brand: 'FLIR',
    model: 'C5',
    serialNumber: 'FLR-C5-9191',
    purchaseDate: '2021-01-11',
    cost: 760,
    status: 'Retirado',
    location: 'Archivo técnico',
    observations: 'Retirada del servicio por obsolescencia y baja contable.',
    warrantyEnd: '2023-01-11',
    nextRenewal: '2026-05-30',
    endOfLife: '2026-05-30',
  },
  {
    id: 'ast-015',
    code: 'AFC-IT-015',
    name: 'MacBook Pro 16 M3 Pro',
    category: 'Informática',
    brand: 'Apple',
    model: 'MacBook Pro 16',
    serialNumber: 'APL-MBP-1611',
    purchaseDate: '2025-11-20',
    cost: 2890,
    status: 'Asignado',
    location: 'Madrid HQ',
    observations: 'Equipo financiero para reporting y analítica.',
    assignedEmployeeId: 'emp-005',
    warrantyEnd: '2028-11-20',
    nextRenewal: '2028-09-01',
    endOfLife: '2030-11-20',
  },
]

export let demoAssignments: Assignment[] = [
  {
    id: 'asn-001',
    assetId: 'ast-001',
    employeeId: 'emp-001',
    assignedAt: '2026-01-15T09:10:00',
    deliveredAt: '2026-01-15T09:30:00',
    assignedBy: 'Alicia Moreno',
    assignedByRole: 'Administrador',
    notes: 'Puesto de trabajo principal con docking y monitores.',
  },
  {
    id: 'asn-002',
    assetId: 'ast-002',
    employeeId: 'emp-002',
    assignedAt: '2025-09-04T10:20:00',
    deliveredAt: '2025-09-04T11:00:00',
    assignedBy: 'Laura Casas',
    assignedByRole: 'Responsable IT',
    notes: 'Configurado con VPN y acceso de supervisión.',
  },
  {
    id: 'asn-003',
    assetId: 'ast-002',
    employeeId: 'emp-007',
    assignedAt: '2024-07-01T08:30:00',
    deliveredAt: '2024-07-01T09:00:00',
    returnedAt: '2025-08-20T17:45:00',
    assignedBy: 'Alicia Moreno',
    assignedByRole: 'Administrador',
    notes: 'Reasignado tras renovación de puesto de RRHH.',
  },
  {
    id: 'asn-004',
    assetId: 'ast-003',
    employeeId: 'emp-004',
    assignedAt: '2026-02-11T12:00:00',
    deliveredAt: '2026-02-11T12:30:00',
    assignedBy: 'Laura Casas',
    assignedByRole: 'Responsable IT',
    notes: 'Terminal preparado para viajes y firma de contratos.',
  },
  {
    id: 'asn-005',
    assetId: 'ast-004',
    employeeId: 'emp-003',
    assignedAt: '2025-05-04T09:00:00',
    deliveredAt: '2025-05-04T09:20:00',
    returnedAt: '2025-12-10T16:00:00',
    assignedBy: 'Diego Martín',
    assignedByRole: 'Supervisor',
    notes: 'Tableta usada para inventario de almacenes temporales.',
  },
  {
    id: 'asn-006',
    assetId: 'ast-006',
    employeeId: 'emp-003',
    assignedAt: '2026-03-03T08:00:00',
    deliveredAt: '2026-03-03T08:45:00',
    assignedBy: 'Diego Martín',
    assignedByRole: 'Supervisor',
    notes: 'Asignación permanente para coordinación de flota.',
  },
  {
    id: 'asn-007',
    assetId: 'ast-006',
    employeeId: 'emp-002',
    assignedAt: '2025-02-01T08:15:00',
    deliveredAt: '2025-02-01T09:00:00',
    returnedAt: '2026-02-15T18:00:00',
    assignedBy: 'Alicia Moreno',
    assignedByRole: 'Administrador',
    notes: 'Vehículo transferido al área logística tras reorganización.',
  },
  {
    id: 'asn-008',
    assetId: 'ast-009',
    employeeId: 'emp-006',
    assignedAt: '2026-04-07T07:45:00',
    deliveredAt: '2026-04-07T08:00:00',
    assignedBy: 'Nuria Lozano',
    assignedByRole: 'Supervisor',
    notes: 'EPI registrado con firma de entrega y revisión PRL.',
  },
  {
    id: 'asn-009',
    assetId: 'ast-012',
    employeeId: 'emp-006',
    assignedAt: '2026-01-08T10:00:00',
    deliveredAt: '2026-01-08T10:05:00',
    assignedBy: 'Laura Casas',
    assignedByRole: 'Responsable IT',
    notes: 'Licencia nominal para diseño y replanteo.',
  },
  {
    id: 'asn-010',
    assetId: 'ast-015',
    employeeId: 'emp-005',
    assignedAt: '2025-11-20T09:30:00',
    deliveredAt: '2025-11-20T10:15:00',
    assignedBy: 'Alicia Moreno',
    assignedByRole: 'Administrador',
    notes: 'Equipo para reporting financiero y presupuestos.',
  },
  {
    id: 'asn-011',
    assetId: 'ast-007',
    employeeId: 'emp-008',
    assignedAt: '2025-01-18T07:30:00',
    deliveredAt: '2025-01-18T08:00:00',
    returnedAt: '2025-03-11T18:00:00',
    assignedBy: 'Diego Martín',
    assignedByRole: 'Supervisor',
    notes: 'Préstamo temporal para mantenimiento correctivo.',
  },
  {
    id: 'asn-012',
    assetId: 'ast-013',
    employeeId: 'emp-007',
    assignedAt: '2025-10-02T09:15:00',
    deliveredAt: '2025-10-02T09:15:00',
    returnedAt: '2026-01-05T18:30:00',
    assignedBy: 'Laura Casas',
    assignedByRole: 'Responsable IT',
    notes: 'Licencia temporal para onboarding y recruiting.',
  },
]

export let demoStockItems: StockItem[] = [
  {
    id: 'stk-001',
    name: 'Casco dieléctrico',
    category: 'EPIs',
    available: 18,
    minimum: 20,
    location: 'Sevilla - PRL',
    unit: 'uds',
    lastRestock: '2026-04-20',
  },
  {
    id: 'stk-002',
    name: 'Chaleco reflectante premium',
    category: 'Ropa',
    available: 54,
    minimum: 30,
    location: 'Almacén central',
    unit: 'uds',
    lastRestock: '2026-05-02',
  },
  {
    id: 'stk-003',
    name: 'Guantes anticorte nivel 5',
    category: 'EPIs',
    available: 12,
    minimum: 15,
    location: 'Bilbao - PRL',
    unit: 'pares',
    lastRestock: '2026-04-26',
  },
  {
    id: 'stk-004',
    name: 'Ratón ergonómico',
    category: 'Informática',
    available: 9,
    minimum: 10,
    location: 'Madrid HQ',
    unit: 'uds',
    lastRestock: '2026-04-11',
  },
  {
    id: 'stk-005',
    name: 'Teclado compacto',
    category: 'Informática',
    available: 22,
    minimum: 12,
    location: 'Madrid HQ',
    unit: 'uds',
    lastRestock: '2026-05-06',
  },
  {
    id: 'stk-006',
    name: 'Protector auditivo reusable',
    category: 'EPIs',
    available: 48,
    minimum: 25,
    location: 'Planta sur',
    unit: 'uds',
    lastRestock: '2026-05-10',
  },
]

export let demoMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'mnt-001',
    assetId: 'ast-005',
    type: 'ITV',
    date: '2026-05-18',
    cost: 92,
    description: 'Inspección técnica y ajuste de frenos.',
    technician: 'Taller MotorSur',
    nextDue: '2027-05-18',
  },
  {
    id: 'mnt-002',
    assetId: 'ast-005',
    type: 'Cambio de batería',
    date: '2026-01-09',
    cost: 240,
    description: 'Sustitución preventiva de batería y prueba de carga.',
    technician: 'Taller MotorSur',
    nextDue: '2027-01-09',
  },
  {
    id: 'mnt-003',
    assetId: 'ast-008',
    type: 'Avería',
    date: '2026-05-04',
    cost: 165,
    description: 'Motor con pérdida de torque y vibraciones anómalas.',
    technician: 'Servicio técnico Milwaukee',
  },
  {
    id: 'mnt-004',
    assetId: 'ast-001',
    type: 'Revisión',
    date: '2026-03-02',
    cost: 80,
    description: 'Mantenimiento preventivo, limpieza interna y diagnóstico.',
    technician: 'Soporte IT interno',
    nextDue: '2027-03-02',
  },
  {
    id: 'mnt-005',
    assetId: 'ast-006',
    type: 'Revisión',
    date: '2026-02-14',
    cost: 180,
    description: 'Mantenimiento anual de flota y actualización documental.',
    technician: 'Toyota Business Center',
    nextDue: '2027-02-14',
  },
  {
    id: 'mnt-006',
    assetId: 'ast-009',
    type: 'Revisión',
    date: '2026-04-28',
    cost: 45,
    description: 'Verificación de arnés y estado de costuras de seguridad.',
    technician: 'PRL Iberia',
    nextDue: '2026-10-28',
  },
]

export let demoRenewals: RenewalItem[] = [
  {
    id: 'ren-001',
    assetId: 'ast-003',
    type: 'Renovación',
    dueDate: '2026-09-01',
    status: 'Pendiente',
    notes: 'Revisión del ciclo del terminal comercial.',
  },
  {
    id: 'ren-002',
    assetId: 'ast-012',
    type: 'Renovación',
    dueDate: '2026-07-31',
    status: 'Pendiente',
    notes: 'Renovación anual de licencia AutoCAD.',
  },
  {
    id: 'ren-003',
    assetId: 'ast-013',
    type: 'Renovación',
    dueDate: '2026-06-15',
    status: 'Pendiente',
    notes: 'Pool de licencias M365 listo para nuevas altas.',
  },
  {
    id: 'ren-004',
    assetId: 'ast-011',
    type: 'Fin de vida útil',
    dueDate: '2026-10-10',
    status: 'Pendiente',
    notes: 'Planificar lote de sustitución para ropa técnica.',
  },
  {
    id: 'ren-005',
    assetId: 'ast-014',
    type: 'Fin de vida útil',
    dueDate: '2026-05-30',
    status: 'Planificada',
    notes: 'Activo retirado pendiente de cierre documental.',
  },
  {
    id: 'ren-006',
    assetId: 'ast-001',
    type: 'Garantía',
    dueDate: '2028-11-18',
    status: 'Planificada',
    notes: 'Garantía premium onsite 48h.',
  },
]

export let demoAuditEvents: AuditEvent[] = [
  {
    id: 'evt-001',
    entity: 'Renovación',
    action: 'Alerta',
    actor: 'Sistema',
    occurredAt: '2026-05-22T08:30:00',
    description: 'La licencia Microsoft 365 E5 entra en ventana crítica de renovación.',
  },
  {
    id: 'evt-002',
    entity: 'Mantenimiento',
    action: 'Mantenimiento',
    actor: 'Nuria Lozano',
    occurredAt: '2026-05-18T11:05:00',
    description: 'La Ford Transit Custom fue enviada a taller por ITV y revisión general.',
  },
  {
    id: 'evt-003',
    entity: 'Activo',
    action: 'Modificación',
    actor: 'Diego Martín',
    occurredAt: '2026-05-04T17:12:00',
    description: 'El atornillador Milwaukee M18 quedó marcado como averiado.',
  },
  {
    id: 'evt-004',
    entity: 'Asignación',
    action: 'Asignación',
    actor: 'Nuria Lozano',
    occurredAt: '2026-04-07T08:00:00',
    description: 'Arnés Petzl entregado a Inés Romero con revisión PRL firmada.',
  },
  {
    id: 'evt-005',
    entity: 'Activo',
    action: 'Modificación',
    actor: 'Carlos Vega',
    occurredAt: '2026-04-01T10:20:00',
    description: 'Detector multigás reubicado al almacén PRL de Sevilla.',
  },
  {
    id: 'evt-006',
    entity: 'Empleado',
    action: 'Creación',
    actor: 'Alicia Moreno',
    occurredAt: '2026-03-21T09:40:00',
    description: 'Alta de Pablo Rivas en el área comercial.',
  },
  {
    id: 'evt-007',
    entity: 'Asignación',
    action: 'Asignación',
    actor: 'Diego Martín',
    occurredAt: '2026-03-03T08:45:00',
    description: 'Toyota Corolla asignado a Sara Núñez para coordinación logística.',
  },
  {
    id: 'evt-008',
    entity: 'Mantenimiento',
    action: 'Mantenimiento',
    actor: 'Laura Casas',
    occurredAt: '2026-03-02T12:15:00',
    description: 'Revisión preventiva ejecutada sobre la Dell Precision 5680.',
  },
  {
    id: 'evt-009',
    entity: 'Renovación',
    action: 'Modificación',
    actor: 'Laura Casas',
    occurredAt: '2026-02-01T09:00:00',
    description: 'AutoCAD renovado y calendarizado hasta julio.',
  },
  {
    id: 'evt-010',
    entity: 'Activo',
    action: 'Baja',
    actor: 'Alicia Moreno',
    occurredAt: '2026-01-16T18:10:00',
    description: 'La cámara térmica FLIR C5 fue retirada del inventario activo.',
  },
]

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

type WorkspaceListener = () => void

function cloneRecords<T extends object>(records: T[]): T[] {
  return records.map((record) => ({ ...record })) as T[]
}

function deriveDepartments() {
  return [...new Set(demoEmployees.map((employee) => employee.department))].sort()
}

function buildWorkspaceSnapshot(): WorkspaceData {
  return {
    employees: demoEmployees,
    assets: demoAssets,
    assignments: demoAssignments,
    stockItems: demoStockItems,
    maintenanceRecords: demoMaintenanceRecords,
    renewals: demoRenewals,
    kanbanTasks: demoKanbanTasks,
    auditEvents: demoAuditEvents,
  }
}

const baseWorkspaceData: WorkspaceData = {
  employees: cloneRecords(demoEmployees),
  assets: cloneRecords(demoAssets),
  assignments: cloneRecords(demoAssignments),
  stockItems: cloneRecords(demoStockItems),
  maintenanceRecords: cloneRecords(demoMaintenanceRecords),
  renewals: cloneRecords(demoRenewals),
  kanbanTasks: cloneRecords(initialDemoKanbanTasks),
  auditEvents: cloneRecords(demoAuditEvents),
}

export function getInitialKanbanTasks() {
  return cloneRecords(initialDemoKanbanTasks)
}

export let departments = deriveDepartments()
export const categoryOptions: Array<AssetCategory | 'Todos'> = [
  'Todos',
  'Informática',
  'Vehículos',
  'EPIs',
  'Herramientas',
  'Ropa',
  'Software',
  'Otros',
]
export const statusOptions: Array<AssetStatus | 'Todos'> = [
  'Todos',
  'Disponible',
  'Asignado',
  'En mantenimiento',
  'Averiado',
  'Retirado',
]

const workspaceListeners = new Set<WorkspaceListener>()
let workspaceSnapshot = buildWorkspaceSnapshot()

function emitWorkspaceChange() {
  workspaceSnapshot = buildWorkspaceSnapshot()
  workspaceListeners.forEach((listener) => listener())
}

export function getWorkspaceData(): WorkspaceData {
  return workspaceSnapshot
}

export function getWorkspaceSnapshot(): WorkspaceData {
  return workspaceSnapshot
}

export function subscribeWorkspaceData(listener: WorkspaceListener) {
  workspaceListeners.add(listener)

  return () => {
    workspaceListeners.delete(listener)
  }
}

export function setWorkspaceData(data: WorkspaceData) {
  demoEmployees = cloneRecords(data.employees)
  demoAssets = cloneRecords(data.assets)
  demoAssignments = cloneRecords(data.assignments)
  demoStockItems = cloneRecords(data.stockItems)
  demoMaintenanceRecords = cloneRecords(data.maintenanceRecords)
  demoRenewals = cloneRecords(data.renewals)
  demoKanbanTasks = cloneRecords(data.kanbanTasks)
  demoAuditEvents = cloneRecords(data.auditEvents)
  departments = deriveDepartments()
  emitWorkspaceChange()
}

export function resetWorkspaceData() {
  setWorkspaceData(baseWorkspaceData)
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function daysUntil(value: string) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((new Date(value).getTime() - Date.now()) / millisecondsPerDay)
}

export function getEmployeeById(employeeId?: string) {
  return demoEmployees.find((employee) => employee.id === employeeId)
}

export function getAssetById(assetId: string) {
  return demoAssets.find((asset) => asset.id === assetId)
}

export function getActiveAssignments() {
  return demoAssignments.filter((assignment) => !assignment.returnedAt)
}

export function getAssignmentsForEmployee(employeeId: string) {
  return [...demoAssignments]
    .filter((assignment) => assignment.employeeId === employeeId)
    .sort((left, right) => right.deliveredAt.localeCompare(left.deliveredAt))
}

export function getAssignmentsForAsset(assetId: string) {
  return [...demoAssignments]
    .filter((assignment) => assignment.assetId === assetId)
    .sort((left, right) => right.deliveredAt.localeCompare(left.deliveredAt))
}

export function getAssignedAssetsForEmployee(employeeId: string) {
  return demoAssets.filter(
    (asset) => asset.assignedEmployeeId === employeeId && asset.status === 'Asignado',
  )
}

export function getLatestMaintenanceForAsset(assetId: string) {
  return [...demoMaintenanceRecords]
    .filter((record) => record.assetId === assetId)
    .sort((left, right) => right.date.localeCompare(left.date))[0]
}

export function getMaintenanceForAsset(assetId: string) {
  return [...demoMaintenanceRecords]
    .filter((record) => record.assetId === assetId)
    .sort((left, right) => right.date.localeCompare(left.date))
}

export function getRenewalsForAsset(assetId: string) {
  return [...demoRenewals]
    .filter((renewal) => renewal.assetId === assetId)
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
}

export function getUpcomingRenewals(limitInDays = 90) {
  return [...demoRenewals]
    .filter((renewal) => daysUntil(renewal.dueDate) <= limitInDays)
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
}

export function getStockAlerts() {
  return demoStockItems.filter((item) => item.available <= item.minimum)
}

export function getMaintenanceUpcoming(limitInDays = 120) {
  return [...demoMaintenanceRecords]
    .filter((record) => record.nextDue && daysUntil(record.nextDue) <= limitInDays)
    .sort((left, right) => String(left.nextDue).localeCompare(String(right.nextDue)))
}

export function getAuditEvents(limit?: number) {
  const sorted = [...demoAuditEvents].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function buildKanbanBoard(tasks: KanbanTask[]): KanbanColumn[] {
  return kanbanColumnDefinitions.map((column) => ({
    ...column,
    tasks: [...tasks]
      .filter((task) => task.status === column.id)
      .sort((left, right) => left.position - right.position || left.title.localeCompare(right.title, 'es')),
  }))
}

export function getKanbanBoard() {
  return buildKanbanBoard(demoKanbanTasks)
}

export function getDashboardSummary() {
  return {
    totalAssets: demoAssets.length,
    assignedAssets: demoAssets.filter((asset) => asset.status === 'Asignado').length,
    availableAssets: demoAssets.filter((asset) => asset.status === 'Disponible').length,
    maintenanceAssets: demoAssets.filter((asset) => asset.status === 'En mantenimiento').length,
    upcomingRenewals: getUpcomingRenewals(90).length,
    recentMovements: getAuditEvents(6),
  }
}

export function getCriticalAlertCount() {
  return getUpcomingRenewals(45).length + getStockAlerts().length + getMaintenanceUpcoming(60).length
}

export function getAppNotifications(limit = 8): AppNotification[] {
  const renewalNotifications: AppNotification[] = getUpcomingRenewals(45).slice(0, 3).map((renewal, index) => {
    const asset = getAssetById(renewal.assetId)

    return {
      id: `notif-renewal-${renewal.id}`,
      title: `${asset?.name ?? 'Activo'} requiere renovación`,
      description: `Vence el ${formatDate(renewal.dueDate)} y conviene dejar la gestión cerrada esta semana.`,
      createdAt: `${renewal.dueDate}T08:15:00`,
      moduleId: 'renovaciones',
      tone: 'danger',
      unread: index < 2,
    }
  })

  const stockNotifications: AppNotification[] = getStockAlerts().slice(0, 3).map((item, index) => ({
    id: `notif-stock-${item.id}`,
    title: `${item.name} está por debajo del mínimo`,
    description: `Quedan ${item.available} ${item.unit} y el mínimo operativo está marcado en ${item.minimum}.`,
    createdAt: `${item.lastRestock}T10:30:00`,
    moduleId: 'stock',
    tone: 'warning',
    unread: index === 0,
  }))

  const maintenanceNotifications: AppNotification[] = getMaintenanceUpcoming(60).slice(0, 2).map((record) => {
    const asset = getAssetById(record.assetId)

    return {
      id: `notif-maintenance-${record.id}`,
      title: `${asset?.name ?? 'Activo'} entra en revisión`,
      description: `La próxima actuación está prevista para el ${formatDate(record.nextDue ?? record.date)}.`,
      createdAt: `${record.date}T07:45:00`,
      moduleId: 'mantenimiento',
      tone: 'info',
      unread: false,
    }
  })

  const activityNotifications: AppNotification[] = getAuditEvents(4).map((event, index) => ({
    id: `notif-audit-${event.id}`,
    title: `${event.entity} · ${event.action}`,
    description: event.description,
    createdAt: event.occurredAt,
    moduleId: 'historial',
    tone: index === 0 ? 'success' : 'neutral',
    unread: false,
  }))

  return [...renewalNotifications, ...stockNotifications, ...maintenanceNotifications, ...activityNotifications]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
}

export function getAssetChartByCategory(): ChartDatum[] {
  return categoryOptions
    .filter((category): category is AssetCategory => category !== 'Todos')
    .map((category) => ({
      label: category,
      value: demoAssets.filter((asset) => asset.category === category).length,
      color: categoryColors[category],
    }))
}

export function getAssetChartByStatus(): ChartDatum[] {
  return statusOptions
    .filter((status): status is AssetStatus => status !== 'Todos')
    .map((status) => ({
      label: status,
      value: demoAssets.filter((asset) => asset.status === status).length,
      color: statusColors[status],
    }))
}

export function getAssetChartByDepartment(): ChartDatum[] {
  const palette = ['#0f766e', '#1d4ed8', '#d97706', '#7c3aed', '#ea580c', '#0891b2', '#475569']

  return departments.map((department, index) => ({
    label: department,
    value: demoAssets.filter((asset) => getEmployeeById(asset.assignedEmployeeId)?.department === department).length,
    color: palette[index % palette.length],
  }))
}

export function filterAssets(filters: FilterState) {
  return demoAssets.filter((asset) => {
    const assignedEmployee = getEmployeeById(asset.assignedEmployeeId)
    const searchValue = [
      asset.code,
      asset.name,
      asset.brand,
      asset.model,
      asset.serialNumber,
      asset.location,
      assignedEmployee?.fullName ?? '',
      assignedEmployee?.department ?? '',
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery = filters.query.trim().length === 0 || searchValue.includes(filters.query.toLowerCase())
    const matchesCategory = filters.category === 'Todos' || asset.category === filters.category
    const matchesEmployee = filters.employeeId === 'Todos' || asset.assignedEmployeeId === filters.employeeId
    const matchesDepartment =
      filters.department === 'Todos' || assignedEmployee?.department === filters.department
    const matchesStatus = filters.status === 'Todos' || asset.status === filters.status
    const matchesDateFrom = filters.dateFrom.length === 0 || asset.purchaseDate >= filters.dateFrom
    const matchesDateTo = filters.dateTo.length === 0 || asset.purchaseDate <= filters.dateTo

    return (
      matchesQuery &&
      matchesCategory &&
      matchesEmployee &&
      matchesDepartment &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo
    )
  })
}
