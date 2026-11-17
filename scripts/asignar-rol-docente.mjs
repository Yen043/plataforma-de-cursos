import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const uid = process.argv[2]?.trim();
const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^['\"]|['\"]$/g, '');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^['\"]|['\"]$/g, '').replace(/\\n/g, '\n');
if (!uid || !projectId || !clientEmail || !privateKey) {
  process.stderr.write('Uso: FIREBASE_PROJECT_ID=... FIREBASE_CLIENT_EMAIL=... FIREBASE_PRIVATE_KEY=... node scripts/asignar-rol-docente.mjs <uid>\n');
  process.exit(1);
}
const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);
const cuenta = await auth.getUser(uid);
const perfilRef = db.collection('usuarios').doc(uid);
const perfil = await perfilRef.get();
if (!perfil.exists) { process.stderr.write('El perfil de la persona debe estar registrado antes de asignar el rol docente.\n'); process.exit(1); }
await auth.setCustomUserClaims(uid, { ...cuenta.customClaims, rol: 'docente' });
await perfilRef.update({ rol: 'docente', estado: 'activo', fechaActualizacion: FieldValue.serverTimestamp() });
process.stdout.write(`Rol docente asignado a ${uid}. El usuario debe volver a iniciar sesión para renovar su token.\n`);
