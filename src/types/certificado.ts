export interface Certificado {
  id: string;
  estudianteId: string;
  cursoSlug: string;
  nombreEstudiante: string;
  nombreCurso: string;
  fechaExpedicion: Date;
  codigoVerificacion: string;
}
