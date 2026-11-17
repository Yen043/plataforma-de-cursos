export interface Leccion {
  id: string;
  cursoSlug: string;
  titulo: string;
  contenidoMarkdown: string;
  orden: number;
  vistaPrevia: boolean;
  videoUrl?: string;
  subtitulosUrl?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
