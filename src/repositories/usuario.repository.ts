import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '../lib/firebase-admin';
import type { CrearUsuarioDTO } from '../schemas/usuario.schema';
import type { Usuario, RolUsuario } from '../types/usuario';

export async function crearUsuario(
  uid: string,
  datos: CrearUsuarioDTO,
  rol: RolUsuario = 'estudiante',
): Promise<Usuario> {
  if (!uid.trim()) {
    throw new Error('El identificador del usuario es obligatorio');
  }

  const usuarioRef = getAdminDb().collection('usuarios').doc(uid);
  const documento = await usuarioRef.get();

  if (documento.exists) {
    throw new Error('El usuario ya está registrado');
  }

  const nuevoUsuario = {
    uid,
    nombre: datos.nombre,
    correo: datos.correo,
    rol,
    estado: 'activo' as const,
    fechaCreacion: Timestamp.now(),
  };

  await usuarioRef.create(nuevoUsuario);

  return {
    ...nuevoUsuario,
    fechaCreacion: nuevoUsuario.fechaCreacion.toDate(),
  };
}

export async function consultarUsuario(uid: string): Promise<Usuario> {
  const documento = await getAdminDb().collection('usuarios').doc(uid).get();

  if (!documento.exists) {
    throw new Error('El usuario no existe');
  }

  const datos = documento.data();

  if (!datos) {
    throw new Error('No se pudo consultar el usuario');
  }

  return {
    ...datos,
    uid: documento.id,
    fechaCreacion: (datos.fechaCreacion as Timestamp).toDate(),
  } as Usuario;
}
