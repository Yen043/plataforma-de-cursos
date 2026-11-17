import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { presentarQuiz } from '@/services/presentar-quiz.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string; qid: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug, qid } = await context.params;
    const inscripcion = await getAdminDb().collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug).get();
    if (!inscripcion.exists || !['activa', 'finalizada'].includes(inscripcion.get('estado'))) return NextResponse.json({ error: 'Debes inscribirte al curso para presentar el quiz.' }, { status: 403 });
    const cuerpo = await request.json().catch(() => null) as { respuestas?: Record<string, string> } | null;
    if (!cuerpo || !cuerpo.respuestas || typeof cuerpo.respuestas !== 'object' || Array.isArray(cuerpo.respuestas)) return NextResponse.json({ error: 'Debes enviar las respuestas del cuestionario.' }, { status: 400 });
    const resultado = await presentarQuiz({ estudianteId: usuario.uid, cursoSlug: slug, quizId: qid, respuestas: cuerpo.respuestas });
    return NextResponse.json({ resultado: { id: resultado.id, numeroIntento: resultado.numeroIntento, puntajeObtenido: resultado.puntajeObtenido, puntajeMaximo: resultado.puntajeMaximo, estado: resultado.estado, fechaPresentacion: resultado.fechaPresentacion, siguienteIntentoDisponible: resultado.siguienteIntentoDisponible ?? null } }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo calificar el cuestionario.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('24 horas') || mensaje.includes('aprobado') ? 429 : mensaje.includes('no pertenece') || mensaje.includes('no válida') || mensaje.includes('responder todas') ? 400 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo calificar el cuestionario.' : mensaje }, { status });
  }
}
