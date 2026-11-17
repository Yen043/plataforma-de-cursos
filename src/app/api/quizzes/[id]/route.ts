import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Claves de respuesta únicamente en el servidor. En producción se consultan desde Firestore.
const evaluaciones: Record<string, { correcta: string; opciones: string[] }> = {
  'quiz-react': { correcta: 'a', opciones: ['a', 'b', 'c'] },
  'quiz-ts': { correcta: 'b', opciones: ['a', 'b', 'c'] },
  'quiz-ux': { correcta: 'c', opciones: ['a', 'b', 'c'] },
};
const intentos = new Map<string, { cantidad: number; ultimo: number; aprobado: boolean }>();
const envioSchema = z.object({ respuesta: z.string().min(1).max(10) }).strict();

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluacion = evaluaciones[id];
  if (!evaluacion) return NextResponse.json({ error: 'La evaluación no existe.' }, { status: 404 });
  const parsed = envioSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !evaluacion.opciones.includes(parsed.data.respuesta)) return NextResponse.json({ error: 'Selecciona una respuesta válida.' }, { status: 400 });
  const cookieId = request.cookies.get('aula-demo-id')?.value || request.headers.get('x-demo-session') || 'sesion-demo-compartida';
  const key = `${cookieId}:${id}`;
  const estado = intentos.get(key) || { cantidad: 0, ultimo: 0, aprobado: false };
  const ahora = Date.now();
  if (estado.aprobado) return NextResponse.json({ error: 'Esta evaluación ya fue aprobada.' }, { status: 409 });
  if (estado.cantidad >= 3 && ahora - estado.ultimo < 24 * 60 * 60 * 1000) return NextResponse.json({ error: 'Has utilizado los tres intentos. Podrás volver a intentarlo después de 24 horas.' }, { status: 429 });
  const aprobado = parsed.data.respuesta === evaluacion.correcta;
  const nuevo = { cantidad: estado.cantidad + 1, ultimo: ahora, aprobado };
  intentos.set(key, nuevo);
  return NextResponse.json({ porcentaje: aprobado ? 100 : 0, aprobado, intento: nuevo.cantidad, intentosRestantes: Math.max(0, 3 - nuevo.cantidad) });
}
