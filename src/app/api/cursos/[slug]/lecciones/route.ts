import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { crearLeccionSchema } from '@/schemas/leccion.schema';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { requerirPropietarioCurso } from '@/services/autorizacion-curso.service';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const db = getAdminDb();
    const cursoRef = db.collection('cursos').doc(slug);
    const curso = await cursoRef.get();
    if (!curso.exists || curso.get('estado') !== 'publicado') return NextResponse.json({ error: 'El curso no está disponible.' }, { status: 404 });
    let inscrito = false;
    try {
      const usuario = await requerirUsuario(request);
      const inscripcion = await db.collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug).get();
      inscrito = inscripcion.exists && ['activa', 'finalizada'].includes(inscripcion.get('estado'));
    } catch { inscrito = false; }
    const consulta = await cursoRef.collection('lecciones').orderBy('orden').get();
    const lecciones = consulta.docs.filter((doc) => inscrito || Boolean(doc.get('vistaPrevia'))).map((doc) => ({ id: doc.id, titulo: doc.get('titulo'), orden: doc.get('orden'), vistaPrevia: Boolean(doc.get('vistaPrevia')) }));
    return NextResponse.json({ lecciones }, { headers: { 'Cache-Control': inscrito ? 'private, no-store' : 'public, s-maxage=60' } });
  } catch {
    return NextResponse.json({ error: 'No se pudieron consultar las lecciones.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    await requerirPropietarioCurso(usuario.uid, slug, usuario['rol']);
    const validacion = crearLeccionSchema.safeParse(await request.json().catch(() => null));
    if (!validacion.success) return NextResponse.json({ error: 'Los datos de la lección no son válidos.', detalles: validacion.error.flatten() }, { status: 400 });
    const db = getAdminDb();
    const leccionId = randomUUID();
    const ahora = Timestamp.now();
    const leccion = { ...validacion.data, fechaCreacion: ahora, fechaActualizacion: ahora };
    const cursoRef = db.collection('cursos').doc(slug);
    const leccionRef = cursoRef.collection('lecciones').doc(leccionId);
    const batch = db.batch();
    batch.create(leccionRef, leccion);
    batch.update(cursoRef, { totalLecciones: FieldValue.increment(1), fechaActualizacion: ahora });
    await batch.commit();
    return NextResponse.json({ leccion: { id: leccionId, ...validacion.data } }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo crear la lección.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('permisos') ? 403 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo crear la lección.' : mensaje }, { status });
  }
}
