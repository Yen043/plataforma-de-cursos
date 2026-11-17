import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario } from '@/services/autenticacion.service';
export const runtime = 'nodejs';
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string; leccion: string }> }) {
  try {
    const { slug, leccion } = await context.params;
    const db = getAdminDb();
    const cursoRef = db.collection('cursos').doc(slug);
    const [curso, documento] = await Promise.all([cursoRef.get(), cursoRef.collection('lecciones').doc(leccion).get()]);
    if (!curso.exists || curso.get('estado') !== 'publicado') return NextResponse.json({ error: 'El curso no está disponible.' }, { status: 404 });
    if (!documento.exists) return NextResponse.json({ error: 'La lección no existe.' }, { status: 404 });
    const datos = documento.data();
    if (!datos) return NextResponse.json({ error: 'No se pudo consultar la lección.' }, { status: 404 });
    if (!datos.vistaPrevia) {
      const usuario = await requerirUsuario(request);
      const inscripcion = await db.collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug).get();
      if (!inscripcion.exists || !['activa', 'finalizada'].includes(inscripcion.get('estado'))) return NextResponse.json({ error: 'Debes inscribirte para acceder a esta lección.' }, { status: 403 });
    }
    return NextResponse.json({ leccion: { id: documento.id, titulo: datos.titulo, contenidoMarkdown: datos.contenidoMarkdown, orden: datos.orden, vistaPrevia: Boolean(datos.vistaPrevia), videoUrl: datos.videoUrl ?? null, subtitulosUrl: datos.subtitulosUrl ?? null } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo consultar la lección.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo consultar la lección.' : mensaje }, { status });
  }
}
