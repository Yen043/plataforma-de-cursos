import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { crearQuizConClaveSchema } from '@/schemas/quiz-con-clave.schema';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { requerirPropietarioCurso } from '@/services/autorizacion-curso.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    await requerirPropietarioCurso(usuario.uid, slug, usuario['rol']);
    const validacion = crearQuizConClaveSchema.safeParse(await request.json().catch(() => null));
    if (!validacion.success) return NextResponse.json({ error: 'Los datos del cuestionario no son válidos.', detalles: validacion.error.flatten() }, { status: 400 });
    const { respuestasCorrectas, ...datosQuiz } = validacion.data;
    const db = getAdminDb();
    const quizId = randomUUID();
    const ahora = Timestamp.now();
    const quizRef = db.collection('cursos').doc(slug).collection('quizzes').doc(quizId);
    const batch = db.batch();
    batch.create(quizRef, { ...datosQuiz, numeroMaximoIntentos: 3, fechaCreacion: ahora, fechaActualizacion: ahora });
    batch.create(quizRef.collection('claves').doc('respuestas'), { respuestas: respuestasCorrectas });
    await batch.commit();
    return NextResponse.json({ quiz: { id: quizId, ...datosQuiz } }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo crear el cuestionario.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('permisos') ? 403 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo crear el cuestionario.' : mensaje }, { status });
  }
}
