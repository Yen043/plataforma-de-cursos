export type EstadoInscripcion = 'activa' | 'finalizada' | 'cancelada';

export interface Inscripcion {
  id: string;
  estudianteId: string;
  cursoSlug: string;
  estado: EstadoInscripcion;
  completadas: string[];
  porcentajeProgreso: number;
  inscritoEn: Date;
  fechaFinalizacion?: Date;
}
