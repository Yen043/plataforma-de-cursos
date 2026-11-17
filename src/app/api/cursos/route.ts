import { NextRequest, NextResponse } from 'next/server';
import { requerirUsuario, verificarOrigen } from '@/services/autenticacion.service';
import { crearCurso, listarCursosPublicados } from '@/repositories/curso.repository';
import { crearCursoSchema } from '@/schemas/curso.schema';
import { cursosDemo } from '@/data/cursos-demo';

export async function GET() {
  try {
    const cursos = (await listarCursosPublicados()).map(({ slug, titulo, descripcion, imagenUrl, fechaCreacion }) => ({ slug, titulo, descripcion, imagenUrl: imagenUrl ?? null, fechaCreacion }));
    return NextResponse.json({ cursos }, { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch {
    // El catálogo demostrativo permite ejecutar la interfaz antes de configurar Firebase.
    return NextResponse.json({ cursos: cursosDemo.map(({ lecciones, quizId, ...curso }) => ({ ...curso, totalLecciones: lecciones.length, quizId })) }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    if (usuario['rol'] !== 'docente') return NextResponse.json({ error: 'No tienes permisos de docente.' }, { status: 403 });
    const cuerpo = await request.json().catch(() => null);
    const resultado = crearCursoSchema.safeParse(cuerpo);
    if (!resultado.success) return NextResponse.json({ error: 'Los datos del curso no son válidos', detalles: resultado.error.flatten() }, { status: 400 });
    const curso = await crearCurso(resultado.data, usuario.uid);
    return NextResponse.json({ curso }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error inesperado';
    const noAutorizado = ['No estás autenticado', 'El token de autenticación está vacío', 'El token de autenticación no es válido'].includes(mensaje);
    const prohibido = ['El usuario no tiene permisos de docente', 'El docente no está activo', 'Origen de solicitud no permitido'].includes(mensaje);
    const noEncontrado = mensaje === 'El docente no existe';
    const conflicto = mensaje === 'Ya existe un curso con ese identificador';
    const status = noAutorizado ? 401 : prohibido ? 403 : noEncontrado ? 404 : conflicto ? 409 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo crear el curso.' : mensaje }, { status });
  }
}
