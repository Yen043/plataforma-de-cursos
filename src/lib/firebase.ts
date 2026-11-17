import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigurado = Object.values(firebaseConfig).every((value) => Boolean(value));
let auth: Auth | undefined;
export function getClientAuth(): Auth {
  if (!firebaseConfigurado) throw new Error('Configura Firebase en .env.local para utilizar el inicio de sesión real.');
  auth ??= getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));
  return auth;
}
