export interface OpcionQuiz {
  id: string;
  texto: string;
}

export interface PreguntaQuiz {
  id: string;
  enunciado: string;
  opciones: OpcionQuiz[];
  orden: number;
  puntaje: number;
}

export interface Quiz {
  id: string;
  cursoSlug: string;
  titulo: string;
  descripcion: string;
  preguntas: PreguntaQuiz[];
  numeroMaximoIntentos: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
