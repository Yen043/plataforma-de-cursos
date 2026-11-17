import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requerirUsuario } from '@/services/autenticacion.service';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const usuario = await requerirUsuario(request);
    const consulta = await getAdminDb().collection('usuarios').doc(usuario.uid).collection('certificados').orderBy('fechaExpedicion', 'desc').get();
    const certificados = consulta.docs.map((doc) => {
      const fecha = doc.get('fechaExpedicion') as Timestamp;
      return { ...doc.data(), fechaExpedicion: fecha.toDate().toISOString() };
    });
    return NextResponse.json({ certificados }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudieron consultar los certificados.';
    const status = mensaje.includes('autentic') || mensaje.includes('token') ? 401 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudieron consultar los certificados.' : mensaje }, { status });
  }
}
