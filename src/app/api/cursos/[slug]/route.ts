import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { requerirPropietarioCurso } from '@/services/autorizacion-curso.service';
const actualizarCursoSchema = z.object({ estado: z.enum(['borrador', 'publicado', 'archivado']) }).strict();
export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const documento = await getAdminDb().collection('cursos').doc(slug).get();
    if (!documento.exists) return NextResponse.json({ error: 'El curso no existe.' }, { status: 404 });
    const datos = documento.data();
    if (!datos) return NextResponse.json({ error: 'No se pudo consultar el curso.' }, { status: 404 });
    if (datos.estado !== 'publicado') {
      const usuario = await requerirUsuario(request);
      await requerirPropietarioCurso(usuario.uid, slug, usuario['rol']);
    }
    return NextResponse.json({ curso: { slug: documento.id, titulo: datos.titulo, descripcion: datos.descripcion, imagenUrl: datos.imagenUrl ?? null, totalLecciones: datos.totalLecciones ?? 0, estado: datos.estado } }, { headers: { 'Cache-Control': datos.estado === 'publicado' ? 'public, s-maxage=60' : 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo consultar el curso.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('permisos') ? 403 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo consultar el curso.' : mensaje }, { status });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    await requerirPropietarioCurso(usuario.uid, slug, usuario['rol']);
    const validacion = actualizarCursoSchema.safeParse(await request.json().catch(() => null));
    if (!validacion.success) return NextResponse.json({ error: 'El estado del curso no es válido.', detalles: validacion.error.flatten() }, { status: 400 });
    const cursoRef = getAdminDb().collection('cursos').doc(slug);
    if (validacion.data.estado === 'publicado') {
      const [lecciones, quizzes] = await Promise.all([cursoRef.collection('lecciones').limit(1).get(), cursoRef.collection('quizzes').limit(1).get()]);
      if (lecciones.empty || quizzes.empty) return NextResponse.json({ error: 'Agrega al menos una lección y un cuestionario antes de publicar.' }, { status: 409 });
    }
    await cursoRef.update({ estado: validacion.data.estado, fechaActualizacion: Timestamp.now() });
    return NextResponse.json({ mensaje: 'Estado del curso actualizado.', estado: validacion.data.estado }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo actualizar el curso.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('permisos') ? 403 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo actualizar el curso.' : mensaje }, { status });
  }
}
