import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { crearInscripcionSchema } from '@/schemas/inscripcion.schema';

export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    const validacion = crearInscripcionSchema.safeParse({ cursoSlug: slug });
    if (!validacion.success) return NextResponse.json({ error: 'Identificador de curso inválido.', detalles: validacion.error.flatten() }, { status: 400 });
    const db = getAdminDb();
    const cursoRef = db.collection('cursos').doc(slug);
    const inscripcionRef = db.collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug);
    await db.runTransaction(async (transaction) => {
      const curso = await transaction.get(cursoRef);
      const existente = await transaction.get(inscripcionRef);
      if (!curso.exists || curso.get('estado') !== 'publicado') throw new Error('CURSO_NO_DISPONIBLE');
      if (existente.exists) return;
      transaction.create(inscripcionRef, { cursoSlug: slug, estudianteId: usuario.uid, estado: 'activa', completadas: [], intentos: {}, inscritoEn: Timestamp.now(), porcentajeProgreso: 0 });
    });
    return NextResponse.json({ mensaje: 'Inscripción registrada.' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo completar la inscripción.';
    const status = mensaje === 'CURSO_NO_DISPONIBLE' ? 404 : (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('Origen') ? 403 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo completar la inscripción.' : mensaje }, { status });
  }
}
