import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string; leccion: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug, leccion } = await context.params;
    const db = getAdminDb();
    const cursoRef = db.collection('cursos').doc(slug);
    const leccionRef = cursoRef.collection('lecciones').doc(leccion);
    const inscripcionRef = db.collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug);
    await db.runTransaction(async (transaction) => {
      const [curso, leccionDoc, inscripcion] = await Promise.all([transaction.get(cursoRef), transaction.get(leccionRef), transaction.get(inscripcionRef)]);
      if (!curso.exists || curso.get('estado') !== 'publicado' || !leccionDoc.exists) throw new Error('NO_ENCONTRADO');
      if (!inscripcion.exists || !['activa', 'finalizada'].includes(inscripcion.get('estado'))) throw new Error('SIN_INSCRIPCION');
      const lecciones = await transaction.get(cursoRef.collection('lecciones'));
      const total = lecciones.size;
      const completadas = new Set<string>([...((inscripcion.get('completadas') as string[] | undefined) ?? []), leccion]);
      const porcentaje = total ? Math.round(completadas.size / total * 100) : 0;
      transaction.update(inscripcionRef, { completadas: FieldValue.arrayUnion(leccion), porcentajeProgreso: porcentaje, ...(porcentaje === 100 ? { estado: 'finalizada', fechaFinalizacion: new Date().toISOString() } : {}) });
    });
    return NextResponse.json({ mensaje: 'Lección marcada como completada.' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el progreso.';
    const status = mensaje === 'NO_ENCONTRADO' ? 404 : mensaje === 'SIN_INSCRIPCION' ? 403 : (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('Origen') ? 403 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo guardar el progreso.' : mensaje }, { status });
  }
}
