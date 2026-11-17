import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { requerirUsuarioMock, verificarOrigenMock, crearCursoMock, listarCursosMock } = vi.hoisted(() => ({
  requerirUsuarioMock: vi.fn(),
  verificarOrigenMock: vi.fn(),
  crearCursoMock: vi.fn(),
  listarCursosMock: vi.fn(),
}));
vi.mock('@/services/autenticacion.service', () => ({ requerirUsuario: requerirUsuarioMock, verificarOrigen: verificarOrigenMock }));
vi.mock('@/repositories/curso.repository', () => ({ crearCurso: crearCursoMock, listarCursosPublicados: listarCursosMock }));
import { POST } from '@/app/api/cursos/route';

const cursoValido = { slug: 'react-basico', titulo: 'React desde cero', descripcion: 'Aprende los fundamentos de React paso a paso.' };
function crearRequest(body: unknown) { return new NextRequest('http://localhost/api/cursos', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'http://localhost' }, body: JSON.stringify(body) }); }

describe('POST /api/cursos', () => {
  beforeEach(() => { vi.clearAllMocks(); requerirUsuarioMock.mockResolvedValue({ uid: 'docente-1', rol: 'docente' }); crearCursoMock.mockResolvedValue(cursoValido); });
  it('crea un curso para un docente autenticado', async () => {
    const response = await POST(crearRequest(cursoValido));
    expect(response.status).toBe(201);
    expect(crearCursoMock).toHaveBeenCalledWith(cursoValido, 'docente-1');
  });
  it('rechaza datos inválidos con 400', async () => {
    const response = await POST(crearRequest({ slug: '!', titulo: 'x', descripcion: 'corta' }));
    expect(response.status).toBe(400);
    expect(crearCursoMock).not.toHaveBeenCalled();
  });
  it('responde 401 cuando no existe sesión', async () => {
    requerirUsuarioMock.mockRejectedValue(new Error('No estás autenticado'));
    const response = await POST(crearRequest(cursoValido));
    expect(response.status).toBe(401);
  });
  it('responde 403 cuando la cuenta no tiene rol docente', async () => {
    crearCursoMock.mockRejectedValue(new Error('El usuario no tiene permisos de docente'));
    const response = await POST(crearRequest(cursoValido));
    expect(response.status).toBe(403);
  });
});
