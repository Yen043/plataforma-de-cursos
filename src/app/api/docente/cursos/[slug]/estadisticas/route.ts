import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario } from '@/services/autenticacion.service';
import { requerirPropietarioCurso } from '@/services/autorizacion-curso.service';
export const runtime = 'nodejs';
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    await requerirPropietarioCurso(usuario.uid, slug, usuario['rol']);
    const db = getAdminDb();
    const cursoRef = db.collection('cursos').doc(slug);
    const [lecciones, inscripciones, resultados, quizzes] = await Promise.all([
      cursoRef.collection('lecciones').orderBy('orden').get(),
      db.collectionGroup('inscripciones').where('cursoSlug', '==', slug).get(),
      db.collectionGroup('resultadosQuiz').where('cursoSlug', '==', slug).get(),
      cursoRef.collection('quizzes').get(),
    ]);
    const intentos = resultados.docs.map((documento) => documento.data());
    const aprobados = intentos.filter((intento) => intento.estado === 'aprobado').length;
    const puntajePromedio = intentos.length ? Math.round(intentos.reduce((suma, intento) => suma + Number(intento.puntajeObtenido || 0), 0) / intentos.length * 100) / 100 : 0;
    const porLeccion = lecciones.docs.map((leccion) => ({ id: leccion.id, titulo: leccion.get('titulo'), completaciones: inscripciones.docs.filter((inscripcion) => (inscripcion.get('completadas') as string[] | undefined)?.includes(leccion.id)).length }));
    const porPregunta: { quizId: string; preguntaId: string; enunciado: string; respuestas: number; correctas: number }[] = [];
    for (const quizDoc of quizzes.docs) {
      const [claveDoc, intentosQuiz] = await Promise.all([
        quizDoc.ref.collection('claves').doc('respuestas').get(),
        Promise.resolve(intentos.filter((intento) => intento.quizId === quizDoc.id)),
      ]);
      const claves = claveDoc.get('respuestas') as Record<string, string> | undefined;
      const preguntas = quizDoc.get('preguntas') as { id: string; enunciado: string }[] | undefined;
      if (!claves || !preguntas) continue;
      for (const pregunta of preguntas) {
        const respuestas = intentosQuiz.filter((intento) => typeof intento.respuestas?.[pregunta.id] === 'string');
        porPregunta.push({ quizId: quizDoc.id, preguntaId: pregunta.id, enunciado: pregunta.enunciado, respuestas: respuestas.length, correctas: respuestas.filter((intento) => intento.respuestas[pregunta.id] === claves[pregunta.id]).length });
      }
    }
    return NextResponse.json({ estadisticas: { totalInscripciones: inscripciones.size, totalIntentos: intentos.length, aprobados, tasaAprobacion: intentos.length ? Math.round(aprobados / intentos.length * 100) : 0, puntajePromedio, porLeccion, porPregunta } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudieron consultar las estadísticas.';
    const status = (mensaje.includes('autentic') || mensaje.includes('token')) ? 401 : mensaje.includes('permisos') ? 403 : mensaje.includes('no existe') ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudieron consultar las estadísticas.' : mensaje }, { status });
  }
}
