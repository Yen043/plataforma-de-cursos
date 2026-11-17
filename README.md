# Aula — Plataforma de cursos

Aplicación Next.js (App Router), React y TypeScript para explorar cursos, inscribirse, avanzar por lecciones, realizar evaluaciones y generar certificados imprimibles.

> **Estado de esta entrega:** incluye una experiencia demostrativa navegable y una base de integración Firebase. Los datos de cursos de demostración y el progreso del modo demo se guardan en el navegador. La evaluación de demostración se califica en un Route Handler y no envía la clave correcta al cliente, pero su contador de intentos vive en memoria del proceso. **No debe desplegarse como sistema real de evaluación ni autenticación hasta completar la persistencia y autorización descritas en `CALIDAD.md`.**

## Requisitos

- Node.js 24.15 o superior (las versiones bloqueadas en `package-lock.json` lo requieren).
- npm 10 o superior.
- Proyecto Firebase con Authentication (correo/contraseña) y Firestore para habilitar persistencia y sesiones reales.

## Ejecutar localmente

```bash
nvm use  # utiliza Node 24.15.0 (.nvmrc)
npm ci
cp .env.example .env.local
# Completa las variables Firebase si vas a probar autenticación/API real.
npm run dev
```

Abre http://localhost:3000. La interfaz demostrativa funciona sin configurar Firebase: usa **Entrar a demo** para guardar un perfil de prueba en el navegador, inscribirte en cursos, completar lecciones, presentar quizzes y generar certificados imprimibles.

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Compilación de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # Vitest
npm run check        # Verificaciones combinadas
```

## Rutas principales

| Ruta | Función |
|---|---|
| `/` | Inicio y cursos destacados |
| `/cursos` | Catálogo y filtros |
| `/cursos/[slug]` | Detalle e inscripción |
| `/aprender/[slug]/[leccion]` | Lección, navegación y progreso |
| `/aprender/[slug]/quiz/[id]` | Evaluación |
| `/certificados` | Certificados e impresión |
| `/docente` | Panel docente demostrativo |
| `/api/auth/sesion` | Crear/eliminar cookie de sesión HttpOnly |
| `/api/auth/yo` | Consultar identidad de sesión |
| `/api/cursos` | Catálogo público / creación autenticada |
| `/api/cursos/[slug]/inscripcion` | Inscripción persistente en Firestore |
| `/api/cursos/[slug]/lecciones` | Listado y creación de lecciones |
| `/api/cursos/[slug]/lecciones/[leccion]` | Lectura protegida de lección |
| `/api/cursos/[slug]/lecciones/[leccion]/completar` | Actualización transaccional de progreso |
| `/api/cursos/[slug]/quizzes/[qid]` | Quiz sin clave de respuestas |
| `/api/cursos/[slug]/quizzes/[qid]/intentos` | Calificación y control de intentos |
| `/api/cursos/[slug]/certificado` | Emisión de certificado |
| `/api/certificados` y `/api/certificados/[codigo]` | Consulta y verificación de certificados |
| `/api/docente/cursos` y `/api/docente/cursos/[slug]/estadisticas` | Panel y estadísticas del docente |
| `/api/usuarios/registro` | Registro de perfil autenticado |

## Firebase y seguridad

- Las credenciales privadas solo van en `.env.local` o en variables de entorno del proveedor de despliegue.
- Nunca subas `.env.local` al repositorio.
- Firestore debe negar el acceso directo al cliente (`allow read, write: if false;`).
- Las rutas privadas deben llamar `requerirUsuario()` y validar permisos por objeto/rol.
- Los roles docentes se asignan con Firebase Admin (custom claims y documento de usuario), nunca desde el navegador. Para promover una cuenta: `npm run role:docente -- <uid>` con las tres variables privadas disponibles en el entorno de ejecución. El estudiante debe cerrar e iniciar sesión para renovar el token.
- La clave de evaluación de producción debe almacenarse en `cursos/{slug}/quizzes/{qid}/claves/respuestas` y leerse solo desde el servidor.
- La ruta de evaluación incluida es **solo demo**: el límite de intentos en memoria no sustituye una transacción Firestore.

## Datos de demostración

Los cursos de ejemplo están en `src/data/cursos-demo.ts`. El progreso se conserva en `localStorage` del navegador. Borrar los datos del sitio reinicia la demostración.

## Calidad

Consulta `CALIDAD.md` para la matriz de requisitos, verificaciones realizadas y tareas que requieren servicios externos o medición en producción.
