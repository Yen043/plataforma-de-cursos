const INTENTOS_INICIALES = 3;
const HORAS_ESPERA = 24;

export interface EstadoIntentosQuiz {
  numeroIntentos: number;
  aprobado: boolean;
  fechaUltimoIntento?: Date;
}

export interface DisponibilidadIntento {
  permitido: boolean;
  siguienteIntentoDisponible?: Date;
  motivo?: string;
}

export function verificarDisponibilidadIntento(
  estado: EstadoIntentosQuiz,
  ahora: Date = new Date(),
): DisponibilidadIntento {
  if (estado.aprobado) {
    return {
      permitido: false,
      motivo: 'El cuestionario ya fue aprobado',
    };
  }

  if (estado.numeroIntentos < INTENTOS_INICIALES) {
    return { permitido: true };
  }

  if (!estado.fechaUltimoIntento) {
    return {
      permitido: false,
      motivo: 'No existe la fecha del último intento',
    };
  }

  const siguienteIntentoDisponible = new Date(
    estado.fechaUltimoIntento.getTime() + HORAS_ESPERA * 60 * 60 * 1000,
  );

  if (ahora < siguienteIntentoDisponible) {
    return {
      permitido: false,
      siguienteIntentoDisponible,
      motivo: 'Debes esperar 24 horas para presentar otro intento',
    };
  }

  return { permitido: true };
}
