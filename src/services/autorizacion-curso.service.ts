import 'server-only';
import { getAdminDb } from '@/lib/firebase-admin';

export async function requerirPropietarioCurso(uid: string, slug: string, rolClaim: unknown) {
  const db = getAdminDb();
  const [curso, usuario] = await Promise.all([
    db.collection('cursos').doc(slug).get(),
    db.collection('usuarios').doc(uid).get(),
  ]);
  if (!curso.exists) throw new Error('El curso no existe');
  if (rolClaim !== 'docente' || !usuario.exists || usuario.get('rol') !== 'docente' || usuario.get('estado') !== 'activo') throw new Error('No tienes permisos de docente');
  if (curso.get('docenteUid') !== uid) throw new Error('No tienes permisos para modificar este curso');
  return curso;
}
