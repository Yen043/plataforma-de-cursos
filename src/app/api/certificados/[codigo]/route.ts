import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';
export async function GET(_request: NextRequest, context: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await context.params;
    const consulta = await getAdminDb().collectionGroup('certificados').where('codigoVerificacion', '==', codigo).limit(1).get();
    if (consulta.empty) return NextResponse.json({ error: 'El código de certificado no es válido.' }, { status: 404 });
    const doc = consulta.docs[0];
    if (!doc) return NextResponse.json({ error: 'El código de certificado no es válido.' }, { status: 404 });
    const fecha = doc.get('fechaExpedicion') as Timestamp;
    return NextResponse.json({ certificado: { nombreEstudiante: doc.get('nombreEstudiante'), nombreCurso: doc.get('nombreCurso'), fechaExpedicion: fecha.toDate().toISOString(), codigoVerificacion: codigo } }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo verificar el certificado.' }, { status: 500 });
  }
}
