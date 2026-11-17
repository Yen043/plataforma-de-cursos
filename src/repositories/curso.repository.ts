import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '../lib/firebase-admin';
import type { CrearCursoDTO } from '../schemas/curso.schema';
import type { Curso } from '../types/curso';

function convertirCurso(id: string, datos: FirebaseFirestore.DocumentData): Curso {
  return {
    ...datos,
    slug: id,
    fechaCreacion: (datos.fechaCreacion as Timestamp).toDate(),
    fechaActualizacion: (datos.fechaActualizacion as Timestamp).toDate(),
  } as Curso;
}

export async function crearCurso(datos: CrearCursoDTO, docenteUid: string): Promise<Curso> {
  if (!docenteUid.trim()) {
    throw new Error('Debes proporcionar el identificador del docente');
  }

  const cursoRef = getAdminDb().collection('cursos').doc(datos.slug);
  const docenteRef = getAdminDb().collection('usuarios').doc(docenteUid);

  return getAdminDb().runTransaction(async (transaccion) => {
    const documentoDocente = await transaccion.get(docenteRef);

    if (!documentoDocente.exists) {
      throw new Error('El docente no existe');
    }

    const docente = documentoDocente.data();

    if (docente?.rol !== 'docente') {
      throw new Error('El usuario no tiene permisos de docente');
    }

    if (docente?.estado !== 'activo') {
      throw new Error('El docente no está activo');
    }

    const documentoCurso = await transaccion.get(cursoRef);

    if (documentoCurso.exists) {
      throw new Error('Ya existe un curso con ese identificador');
    }

    const ahora = Timestamp.now();

    const nuevoCurso = {
      ...datos,
      docenteUid: docenteUid,
      estado: 'borrador' as const,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
    };

    transaccion.create(cursoRef, nuevoCurso);

    return convertirCurso(datos.slug, nuevoCurso);
  });
}

export async function consultarCurso(slug: string): Promise<Curso> {
  const documento = await getAdminDb().collection('cursos').doc(slug).get();

  if (!documento.exists) {
    throw new Error('El curso no existe');
  }

  const datos = documento.data();

  if (!datos) {
    throw new Error('No se pudo consultar el curso');
  }

  return convertirCurso(documento.id, datos);
}

export async function listarCursos(): Promise<Curso[]> {
  const consulta = await getAdminDb().collection('cursos').get();

  return consulta.docs.map((documento) => convertirCurso(documento.id, documento.data()));
}
export async function listarCursosPublicados(): Promise<Curso[]> {
  const consulta = await getAdminDb().collection('cursos').where('estado', '==', 'publicado').get();

  return consulta.docs.map((documento) => convertirCurso(documento.id, documento.data()));
}
export async function listarCursosPorDocente(docenteUid: string): Promise<Curso[]> {
  const consulta = await getAdminDb().collection('cursos').where('docenteUid', '==', docenteUid).get();

  return consulta.docs.map((documento) => convertirCurso(documento.id, documento.data()));
}
