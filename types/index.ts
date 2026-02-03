// Tipos de TypeScript para el Sistema de Inventario TI

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Estado {
  id: string;
  nombre: string;
  color: string;
  activo: boolean;
}

export interface Sede {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  activo: boolean;
}

export interface Prioridad {
  id: string;
  nombre: string;
  color: string;
  orden: number;
}

export interface AccionMantenimiento {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface InventarioGeneral {
  id: string;
  serial: string;
  cantidad: number;
  marca: string;
  modelo: string;
  categoriaId: string;
  estadoId: string;
  sedeId: string;
  ubicacionDetallada?: string;
  responsable?: string;
  fechaRegistro?: Date;
  imagenes: string[];
  esCritico: boolean;
  observaciones?: string;
  categoria?: Categoria;
  estado?: Estado;
  sede?: Sede;
  equipoCritico?: EquipoCritico;
  planesMantenimiento?: PlanMantenimiento[];
}

export interface EquipoCritico {
  id: string;
  idEquipo: string;
  nivelPrioridadId: string;
  accionRequerida: string;
  imagenes: string[];
  costoEstimado?: number;
  fechaLimiteAccion?: Date;
  resuelto: boolean;
  notasResolucion?: string;
  fechaResolucion?: Date;
  nivelPrioridad?: Prioridad;
  equipo?: InventarioGeneral;
}

export interface PlanMantenimiento {
  id: string;
  idEquipo: string;
  accionId: string;
  descripcionTrabajo?: string;
  responsableEjecucion?: string;
  fechaProgramada: Date;
  fechaEjecucion?: Date;
  estadoEjecucion: string;
  presupuesto?: number;
  costoReal?: number;
  observaciones?: string;
  imagenes?: string[];
  analisisIa?: any;
  equipo?: InventarioGeneral;
  accion?: AccionMantenimiento;
}

// Tipos para formularios
export interface InventarioFormData {
  serialEtiqueta: string;
  marca: string;
  modelo: string;
  categoriaId: string;
  estadoId: string;
  sedeId: string;
  ubicacionDetallada?: string;
  responsable?: string;
  fechaUltimoMantenimiento?: string;
  especificacionesTecnicas?: string;
  imagenes?: string[];
  critico?: boolean;
  observaciones?: string;
}

export interface EquipoCriticoFormData {
  idEquipo: string;
  nivelPrioridadId: string;
  accionRequerida: string;
  imagenes?: string[];
  costoEstimado?: number;
  fechaLimiteAccion?: string;
}

export interface PlanMantenimientoFormData {
  idEquipo: string;
  accionId: string;
  responsableEjecucion?: string;
  fechaProgramada: string;
  presupuesto?: number;
  observaciones?: string;
}

// Tipos para Dashboard
export interface DashboardKPIs {
  totalEquipos: number;
  equiposOperativos: number;
  porcentajeOperativos: number;
  equiposCriticos: number;
  equiposFaltantes: number;
  equiposDanados: number;
}

export interface EquiposPorSede {
  sede: string;
  cantidad: number;
}

export interface EquiposPorCategoria {
  categoria: string;
  cantidad: number;
}

export interface EquiposPorEstado {
  estado: string;
  cantidad: number;
  color: string;
}
