import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { consultarQuizConRespuestas } from '@/repositories/quiz.repository';
import { requerirUsuario } from '@/services/autenticacion.service';
export const runtime = 'nodejs';
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string; qid: string }> }) {
  try {
    const usuario = await requerirUsuario(request);
    const { slug, qid } = await context.params;
    const inscripcion = await getAdminDb().collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug).get();
    if (!inscripcion.exists || !['activa', 'finalizada'].includes(inscripcion.get('estado'))) return NextResponse.json({ error: 'Debes inscribirte para consultar este cuestionario.' }, { status: 403 });
    const { quiz } = await consultarQuizConRespuestas(slug, qid);
    return NextResponse.json({ quiz }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo consultar el cuestionario.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo consultar el cuestionario.' : mensaje }, { status });
  }
}
