import { describe, expect, it } from 'vitest';
import { crearLeccionSchema } from '@/schemas/leccion.schema';

const leccionValida = {
  titulo: 'Introducción a JavaScript',
  contenidoMarkdown: 'En esta lección aprenderemos los fundamentos.',
  orden: 1,
  vistaPrevia: false,
};

describe('crearLeccionSchema', () => {
  it('acepta una lección con datos válidos', () => {
    const resultado = crearLeccionSchema.safeParse(leccionValida);

    expect(resultado.success).toBe(true);
  });

  it('rechaza un título demasiado corto', () => {
    const resultado = crearLeccionSchema.safeParse({
      ...leccionValida,
      titulo: 'JS',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un contenido demasiado corto', () => {
    const resultado = crearLeccionSchema.safeParse({
      ...leccionValida,
      contenidoMarkdown: 'Corto',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un orden que no sea entero', () => {
    const resultado = crearLeccionSchema.safeParse({
      ...leccionValida,
      orden: 1.5,
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un orden igual a cero', () => {
    const resultado = crearLeccionSchema.safeParse({
      ...leccionValida,
      orden: 0,
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un valor no booleano para vista previa', () => {
    const resultado = crearLeccionSchema.safeParse({
      ...leccionValida,
      vistaPrevia: 'sí',
    });

    expect(resultado.success).toBe(false);
  });
});
