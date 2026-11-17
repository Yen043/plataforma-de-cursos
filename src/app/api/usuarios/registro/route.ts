import { NextRequest, NextResponse } from 'next/server';

import { verificarToken } from '@/services/autenticacion.service';
import { crearUsuario } from '@/repositories/usuario.repository';
import { crearUsuarioSchema } from '@/schemas/usuario.schema';

export async function POST(request: NextRequest) {
  try {
    const encabezado = request.headers.get('authorization');

    if (!encabezado) {
      return NextResponse.json(
        { error: 'No se recibió el token de autenticación.' },
        { status: 401 }
      );
    }

    const usuarioAutenticado = await verificarToken(encabezado);

    const cuerpo = await request.json().catch(() => null);

    const resultado = crearUsuarioSchema.safeParse(cuerpo);

    if (!resultado.success) {
      return NextResponse.json(
        {
          error: 'Los datos del usuario no son válidos.',
          detalles: resultado.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (
      usuarioAutenticado.email?.toLowerCase() !==
      resultado.data.correo.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'El correo no coincide con la cuenta autenticada.' },
        { status: 403 }
      );
    }

    const usuario = await crearUsuario(
      usuarioAutenticado.uid,
      resultado.data
    );

    return NextResponse.json({ usuario }, { status: 201 });

  } catch (error) {
    console.error('ERROR EN API /usuarios/registro:', error);

    const mensaje =
      error instanceof Error ? error.message : 'Error inesperado';

    const noAutorizado = [
      'No estás autenticado',
      'El token de autenticación está vacío',
      'El token de autenticación no es válido',
    ].includes(mensaje);

    const status = noAutorizado
      ? 401
      : mensaje === 'El usuario ya está registrado'
        ? 409
        : 500;

    return NextResponse.json(
      {
        error: status === 500
          ? 'No se pudo registrar el usuario.'
          : mensaje,
      },
      { status }
    );
  }
}