import { NextRequest, NextResponse } from 'next/server';
import { requerirUsuario } from '@/services/autenticacion.service';
import { consultarUsuario } from '@/repositories/usuario.repository';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const identidad = await requerirUsuario(request);
    const usuario = await consultarUsuario(identidad.uid);
    return NextResponse.json({ usuario: { uid: usuario.uid, correo: usuario.correo, rol: usuario.rol } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo verificar la sesión';
    return NextResponse.json({ error: mensaje }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
}
