import 'server-only';

import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';

export async function verificarToken(
  encabezado: string | null
): Promise<DecodedIdToken> {
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    throw new Error('No estás autenticado');
  }

  const token = encabezado.slice(7).trim();

  if (!token) {
    throw new Error('El token de autenticación está vacío');
  }

  try {
    // Verifica firma, proyecto emisor y vigencia del token.
    return await getAdminAuth().verifyIdToken(token);
  } catch (error) {
    console.error(
      'ERROR REAL AL VALIDAR TOKEN:',
      error instanceof Error ? error.message : error
    );

    throw new Error('El token de autenticación no es válido');
  }
}

export async function requerirUsuario(
  request: NextRequest
): Promise<DecodedIdToken> {
  const cookie = request.cookies.get('sesion')?.value;

  let identidad: DecodedIdToken;

  if (cookie) {
    try {
      // Verifica la cookie de sesión sin comprobar revocación.
      identidad = await getAdminAuth().verifySessionCookie(cookie);
    } catch (error) {
      console.error(
        'ERROR REAL AL VALIDAR COOKIE:',
        error instanceof Error ? error.message : error
      );

      throw new Error('La sesión no es válida o ha expirado');
    }
  } else {
    identidad = await verificarToken(
      request.headers.get('authorization')
    );
  }

  const perfil = await getAdminDb()
    .collection('usuarios')
    .doc(identidad.uid)
    .get();

  if (!perfil.exists || perfil.get('estado') !== 'activo') {
    throw new Error('No estás autenticado');
  }

  return identidad;
}

export function verificarOrigen(request: NextRequest): void {
  const origin = request.headers.get('origin');

  if (!origin) return;

  const esperado = request.nextUrl.origin;

  if (origin !== esperado) {
    throw new Error('Origen de solicitud no permitido');
  }
}