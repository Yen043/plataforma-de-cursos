import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/quizzes/[id]/route';

function request(id: string, respuesta: string, session: string) {
  return new NextRequest(`http://localhost/api/quizzes/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-demo-session': session },
    body: JSON.stringify({ respuesta }),
  });
}

describe('API de evaluación de demostración', () => {
  it('califica una respuesta correcta en el servidor', async () => {
    const response = await POST(request('quiz-react', 'a', 'correcta-1'), { params: Promise.resolve({ id: 'quiz-react' }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ aprobado: true, porcentaje: 100, intento: 1 });
  });

  it('rechaza respuestas inválidas', async () => {
    const response = await POST(request('quiz-react', 'z', 'invalida-1'), { params: Promise.resolve({ id: 'quiz-react' }) });
    expect(response.status).toBe(400);
  });

  it('devuelve 404 para una evaluación inexistente', async () => {
    const response = await POST(request('no-existe', 'a', 'inexistente-1'), { params: Promise.resolve({ id: 'no-existe' }) });
    expect(response.status).toBe(404);
  });

  it('aplica tres intentos y una espera de 24 horas', async () => {
    const session = 'limite-3-intentos';
    for (let index = 0; index < 3; index += 1) {
      const response = await POST(request('quiz-react', 'b', session), { params: Promise.resolve({ id: 'quiz-react' }) });
      expect(response.status).toBe(200);
    }
    const bloqueado = await POST(request('quiz-react', 'b', session), { params: Promise.resolve({ id: 'quiz-react' }) });
    expect(bloqueado.status).toBe(429);
  });
});
