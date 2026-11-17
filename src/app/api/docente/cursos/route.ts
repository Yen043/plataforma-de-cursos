import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario } from '@/services/autenticacion.service';
import { listarCursosPorDocente } from '@/repositories/curso.repository';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const usuario = await requerirUsuario(request);
    if (usuario['rol'] !== 'docente') return NextResponse.json({ error: 'No tienes permisos de docente.' }, { status: 403 });
    const perfil = await getAdminDb().collection('usuarios').doc(usuario.uid).get();
    if (!perfil.exists || perfil.get('rol') !== 'docente' || perfil.get('estado') !== 'activo') return NextResponse.json({ error: 'No tienes permisos de docente.' }, { status: 403 });
    const cursos = await listarCursosPorDocente(usuario.uid);
    return NextResponse.json({ cursos }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudieron consultar los cursos.';
    const status = mensaje.includes('autentic') || mensaje.includes('token') ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudieron consultar los cursos.' : mensaje }, { status });
  }
}
