export type EstadoIntento = 'aprobado' | 'reprobado' | 'en_espera';

export interface ResultadoQuiz {
  id: string;
  quizId: string;
  estudianteId: string;
  cursoSlug: string;
  numeroIntento: number;
  respuestas: Record<string, string>;
  puntajeObtenido: number;
  puntajeMaximo: number;
  estado: EstadoIntento;
  fechaPresentacion: Date;
  siguienteIntentoDisponible?: Date;
}
