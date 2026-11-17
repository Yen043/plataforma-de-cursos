import { describe, expect, it } from 'vitest';
import { crearUsuarioSchema } from '@/schemas/usuario.schema';

describe('crearUsuarioSchema', () => {
  it('acepta un usuario con datos válidos', () => {
    const resultado = crearUsuarioSchema.safeParse({
      nombre: 'Camila Cardona',
      correo: 'camila@gmail.com',
    });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un nombre demasiado corto', () => {
    const resultado = crearUsuarioSchema.safeParse({
      nombre: 'A',
      correo: 'camila@gmail.com',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un correo inválido', () => {
    const resultado = crearUsuarioSchema.safeParse({
      nombre: 'Camila Cardona',
      correo: 'correo-invalido',
    });

    expect(resultado.success).toBe(false);
  });

  it('convierte el correo a minúsculas', () => {
    const resultado = crearUsuarioSchema.safeParse({
      nombre: 'Camila Cardona',
      correo: 'CAMILA@GMAIL.COM',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.correo).toBe('camila@gmail.com');
    }
  });
});
