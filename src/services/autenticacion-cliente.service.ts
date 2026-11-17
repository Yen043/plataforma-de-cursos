import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { getClientAuth } from '@/lib/firebase';

function requerirAuth() {
  return getClientAuth();
}

async function guardarPerfil(
  usuario: User,
  nombre: string
): Promise<'creado' | 'existente'> {
  // Obtener un token actualizado de Firebase.
  const token = await usuario.getIdToken(true);

  // Registrar o comprobar el perfil del usuario.
  const respuesta = await fetch('/api/usuarios/registro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre,
      correo: usuario.email,
    }),
  });

  const resultado = await respuesta.json();

  const perfilExistente = respuesta.status === 409;

  if (!respuesta.ok && !perfilExistente) {
    throw new Error(
      resultado.error || 'No se pudo guardar el perfil del usuario'
    );
  }

  // Crear la cookie de sesión segura.
  const sesion = await fetch('/api/auth/sesion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: token,
    }),
  });

  if (!sesion.ok) {
    const errorSesion = await sesion.json().catch(() => ({}));

    throw new Error(
      errorSesion.error || 'No se pudo establecer la sesión segura.'
    );
  }

  return perfilExistente ? 'existente' : 'creado';
}

export async function registrarCuenta(
  nombre: string,
  correo: string,
  contrasena: string
): Promise<void> {
  const credencial = await createUserWithEmailAndPassword(
    requerirAuth(),
    correo.trim(),
    contrasena
  );

  await guardarPerfil(credencial.user, nombre.trim());
}

export async function iniciarSesionCuenta(
  correo: string,
  contrasena: string
): Promise<'creado' | 'existente'> {
  const credencial = await signInWithEmailAndPassword(
    requerirAuth(),
    correo.trim(),
    contrasena
  );

  const nombre =
    credencial.user.displayName ||
    correo.split('@')[0] ||
    'Estudiante';

  return guardarPerfil(credencial.user, nombre);
}

export async function cerrarSesionCuenta(): Promise<void> {
  await signOut(requerirAuth());

  const respuesta = await fetch('/api/auth/sesion', {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    console.error('No se pudo eliminar la cookie de sesión');
  }
}