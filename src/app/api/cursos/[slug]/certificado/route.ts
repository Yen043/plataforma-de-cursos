import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { slug } = await context.params;
    const db = getAdminDb();
    const [curso, perfil, inscripcion, aprobados] = await Promise.all([
      db.collection('cursos').doc(slug).get(),
      db.collection('usuarios').doc(usuario.uid).get(),
      db.collection('usuarios').doc(usuario.uid).collection('inscripciones').doc(slug).get(),
      db.collection('usuarios').doc(usuario.uid).collection('resultadosQuiz').where('cursoSlug', '==', slug).where('estado', '==', 'aprobado').limit(1).get(),
    ]);
    if (!curso.exists || !perfil.exists) return NextResponse.json({ error: 'No se encontró el curso o el perfil.' }, { status: 404 });
    if (!inscripcion.exists || inscripcion.get('porcentajeProgreso') !== 100 || !aprobados.size) return NextResponse.json({ error: 'Debes completar todas las lecciones y aprobar el quiz.' }, { status: 409 });
    const ref = db.collection('usuarios').doc(usuario.uid).collection('certificados').doc(slug);
    const fechaExpedicion = Timestamp.now();
    const certificadoNuevo = { id: slug, estudianteId: usuario.uid, nombreEstudiante: perfil.get('nombre'), cursoSlug: slug, nombreCurso: curso.get('titulo'), fechaExpedicion, codigoVerificacion: randomUUID() };
    const resultado = await db.runTransaction(async (transaction) => {
      const existente = await transaction.get(ref);
      if (existente.exists) {
        const datos = existente.data();
        if (!datos) throw new Error('No se pudo consultar el certificado.');
        const fecha = datos.fechaExpedicion as Timestamp;
        return { certificado: { ...datos, fechaExpedicion: fecha.toDate().toISOString() }, creado: false };
      }
      transaction.create(ref, certificadoNuevo);
      return { certificado: { ...certificadoNuevo, fechaExpedicion: fechaExpedicion.toDate().toISOString() }, creado: true };
    });
    return NextResponse.json({ certificado: resultado.certificado }, { status: resultado.creado ? 201 : 200, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo emitir el certificado.';
    const status = mensaje.includes('autentic') || mensaje.includes('token') ? 401 : mensaje.includes('Origen') ? 403 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo emitir el certificado.' : mensaje }, { status });
  }
}
