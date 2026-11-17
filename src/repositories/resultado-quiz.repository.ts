import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import type { Transaction } from 'firebase-admin/firestore';
import { getAdminDb } from '../lib/firebase-admin';
import type { ResultadoQuiz } from '../types/resultado-quiz';

interface EstadoControlIntentos {
  numeroIntentos: number;
  aprobado: boolean;
  fechaUltimoIntento?: Date;
}

interface DisponibilidadIntento {
  permitido: boolean;
  motivo?: string;
}

type VerificarDisponibilidad = (
  estado: EstadoControlIntentos,
  ahora: Date,
) => DisponibilidadIntento;

type NuevoResultadoQuiz = Omit<
  ResultadoQuiz,
  'numeroIntento' | 'fechaPresentacion' | 'siguienteIntentoDisponible'
>;

function obtenerEstadoIntentos(
  datosControl: FirebaseFirestore.DocumentData | undefined,
): EstadoControlIntentos {
  const fechaGuardada = datosControl?.fechaUltimoIntento as Timestamp | undefined;

  return {
    numeroIntentos: datosControl?.numeroIntentos ?? 0,
    aprobado: datosControl?.aprobado ?? false,
    fechaUltimoIntento: fechaGuardada?.toDate(),
  };
}

function crearNuevoResultado(
  resultado: NuevoResultadoQuiz,
  estado: EstadoControlIntentos,
  ahora: Date,
): ResultadoQuiz {
  const numeroIntento = estado.numeroIntentos + 1;
  const aprobado = resultado.estado === 'aprobado';

  const siguienteIntentoDisponible =
    !aprobado && numeroIntento >= 3 ? new Date(ahora.getTime() + 24 * 60 * 60 * 1000) : undefined;

  return {
    ...resultado,
    numeroIntento,
    fechaPresentacion: ahora,
    ...(siguienteIntentoDisponible ? { siguienteIntentoDisponible } : {}),
  };
}

function actualizarControlIntentos(
  transaction: Transaction,
  controlRef: FirebaseFirestore.DocumentReference,
  resultado: ResultadoQuiz,
  ahora: Date,
): void {
  transaction.set(controlRef, {
    numeroIntentos: resultado.numeroIntento,
    aprobado: resultado.estado === 'aprobado',
    fechaUltimoIntento: ahora,
  });
}

export async function registrarIntentoQuiz(
  resultado: NuevoResultadoQuiz,
  verificarDisponibilidad: VerificarDisponibilidad,
): Promise<ResultadoQuiz> {
  const usuarioRef = getAdminDb().collection('usuarios').doc(resultado.estudianteId);
  const controlRef = usuarioRef.collection('controlQuizzes').doc(resultado.quizId);
  const resultadoRef = usuarioRef.collection('resultadosQuiz').doc(resultado.id);

  return getAdminDb().runTransaction(async (transaction: Transaction) => {
    const documentoControl = await transaction.get(controlRef);
    const estado = obtenerEstadoIntentos(documentoControl.data());
    const ahora = new Date();

    const disponibilidad = verificarDisponibilidad(estado, ahora);

    if (!disponibilidad.permitido) {
      throw new Error(disponibilidad.motivo ?? 'No puedes presentar este cuestionario');
    }

    const nuevoResultado = crearNuevoResultado(resultado, estado, ahora);

    actualizarControlIntentos(transaction, controlRef, nuevoResultado, ahora);
    transaction.set(resultadoRef, nuevoResultado);

    return nuevoResultado;
  });
}

export async function consultarResultadosQuiz(
  estudianteId: string,
  quizId: string,
): Promise<ResultadoQuiz[]> {
  const consulta = await getAdminDb()
    .collection('usuarios')
    .doc(estudianteId)
    .collection('resultadosQuiz')
    .where('quizId', '==', quizId)
    .get();

  return consulta.docs.map((documento) => {
    const resultado = documento.data() as ResultadoQuiz;
    const fechaPresentacion = documento.get('fechaPresentacion') as Timestamp;
    const siguienteIntento = documento.get('siguienteIntentoDisponible') as Timestamp | undefined;

    return {
      ...resultado,
      fechaPresentacion: fechaPresentacion.toDate(),
      ...(siguienteIntento ? { siguienteIntentoDisponible: siguienteIntento.toDate() } : {}),
    };
  });
}
