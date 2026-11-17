import { describe, expect, it } from 'vitest';
import { verificarDisponibilidadIntento } from '../services/quiz-intentos.service';

const fechaUltimoIntento = new Date('2026-11-15T10:00:00');

describe('verificarDisponibilidadIntento: intentos iniciales', () => {
  it('permite presentar el cuestionario si tiene menos de tres intentos', () => {
    const resultado = verificarDisponibilidadIntento({
      numeroIntentos: 2,
      aprobado: false,
    });

    expect(resultado.permitido).toBe(true);
  });

  it('bloquea nuevos intentos si el estudiante ya aprobó', () => {
    const resultado = verificarDisponibilidadIntento({
      numeroIntentos: 1,
      aprobado: true,
    });

    expect(resultado.permitido).toBe(false);
    expect(resultado.motivo).toBe('El cuestionario ya fue aprobado');
  });
});

describe('verificarDisponibilidadIntento: primera espera', () => {
  it('bloquea el intento antes de completar las 24 horas', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 3,
        aprobado: false,
        fechaUltimoIntento,
      },
      new Date('2026-11-16T09:59:00'),
    );

    expect(resultado.permitido).toBe(false);
  });

  it('permite un intento al completar las 24 horas', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 3,
        aprobado: false,
        fechaUltimoIntento,
      },
      new Date('2026-11-16T10:00:00'),
    );

    expect(resultado.permitido).toBe(true);
  });

  it('calcula correctamente la fecha del siguiente intento', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 3,
        aprobado: false,
        fechaUltimoIntento,
      },
      new Date('2026-11-16T09:00:00'),
    );

    expect(resultado.siguienteIntentoDisponible).toEqual(new Date('2026-11-16T10:00:00'));
  });

  it('bloquea si faltan los datos de la fecha del último intento', () => {
    const resultado = verificarDisponibilidadIntento({
      numeroIntentos: 3,
      aprobado: false,
    });

    expect(resultado.permitido).toBe(false);
  });
});

describe('verificarDisponibilidadIntento: intentos adicionales', () => {
  it('permite el cuarto intento después de esperar otras 24 horas', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 4,
        aprobado: false,
        fechaUltimoIntento: new Date('2026-11-16T10:00:00'),
      },
      new Date('2026-11-17T10:00:00'),
    );

    expect(resultado.permitido).toBe(true);
  });

  it('bloquea el quinto intento si todavía no completa las 24 horas', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 5,
        aprobado: false,
        fechaUltimoIntento: new Date('2026-11-17T10:00:00'),
      },
      new Date('2026-11-18T09:59:00'),
    );

    expect(resultado.permitido).toBe(false);
  });

  it('permite el quinto intento al completar otras 24 horas', () => {
    const resultado = verificarDisponibilidadIntento(
      {
        numeroIntentos: 5,
        aprobado: false,
        fechaUltimoIntento: new Date('2026-11-17T10:00:00'),
      },
      new Date('2026-11-18T10:00:00'),
    );

    expect(resultado.permitido).toBe(true);
  });
});
