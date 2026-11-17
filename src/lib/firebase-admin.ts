import 'server-only';

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';

import {
  getFirestore,
  type Firestore,
} from 'firebase-admin/firestore';

import {
  getAuth,
  type Auth,
} from 'firebase-admin/auth';

let firestore: Firestore | undefined;
let auth: Auth | undefined;

function obtenerApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    ?.trim()
    .replace(/^['"]|['"]$/g, '');

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin no está configurado. Revisa las variables de entorno.'
    );
  }

  if (
    !privateKey.startsWith('-----BEGIN PRIVATE KEY-----') ||
    !privateKey.endsWith('-----END PRIVATE KEY-----')
  ) {
    throw new Error(
      'La clave privada de Firebase Admin no tiene un formato PEM válido.'
    );
  }

  // Buscar específicamente la aplicación predeterminada.
  const appExistente = getApps().find(
    (app) => app.name === '[DEFAULT]'
  );

  if (appExistente) {
    return appExistente;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

export function getAdminDb(): Firestore {
  firestore ??= getFirestore(obtenerApp());
  return firestore;
}

export function getAdminAuth(): Auth {
  auth ??= getAuth(obtenerApp());
  return auth;
}