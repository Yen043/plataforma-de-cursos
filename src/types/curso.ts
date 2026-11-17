export type EstadoCurso = 'borrador' | 'publicado' | 'archivado';

export interface Curso {
  slug: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  docenteUid: string;
  estado: EstadoCurso;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
