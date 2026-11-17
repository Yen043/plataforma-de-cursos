import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { verificarOrigen } from '@/services/autenticacion.service';

const DURACION_SESION = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    verificarOrigen(request);

    const cuerpo = await request.json().catch(() => null);

    if (
      !cuerpo ||
      typeof cuerpo.idToken !== 'string' ||
      !cuerpo.idToken.trim()
    ) {
      return NextResponse.json(
        { error: 'Falta el token de autenticación.' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();

    // Verificar el token de Firebase.
    const decoded = await auth.verifyIdToken(cuerpo.idToken);

    // Comprobar que el inicio de sesión sea reciente.
    const ahora = Math.floor(Date.now() / 1000);

    if (ahora - decoded.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: 'Vuelve a iniciar sesión para continuar.' },
        { status: 401 }
      );
    }

    // Crear cookie de sesión.
    const cookie = await auth.createSessionCookie(
      cuerpo.idToken,
      { expiresIn: DURACION_SESION }
    );

    const response = new NextResponse(null, { status: 204 });

    response.cookies.set('sesion', cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DURACION_SESION / 1000,
    });

    return response;

  } catch (error) {
    // No imprimir tokens ni claves privadas.
    console.error('ERROR AL CREAR SESIÓN:', error);

    const mensaje = error instanceof Error ? error.message : '';

    if (mensaje.includes('Origen')) {
      return NextResponse.json(
        { error: 'Origen de solicitud no permitido.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'No se pudo crear la sesión.' },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    verificarOrigen(request);
  } catch {
    return NextResponse.json(
      { error: 'Origen de solicitud no permitido.' },
      { status: 403 }
    );
  }

  const response = new NextResponse(null, { status: 204 });

  response.cookies.set('sesion', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}