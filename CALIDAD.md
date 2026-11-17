# CALIDAD — Aula

Fecha de preparación: 16 de noviembre de 2026.

## Matriz de requisitos y estado

| Área | Implementación en esta entrega | Estado / evidencia |
|---|---|---|
| Catálogo y detalle de cursos | `/cursos`, `/cursos/[slug]`, filtros y contenidos de ejemplo | Implementado en modo demo |
| Inscripción y progreso | UI demo y endpoints de inscripción/completar lección con transacciones Firestore | API base implementada; la interfaz demo todavía usa localStorage |
| Retomar aprendizaje | Estado local por curso | Demo localStorage |
| Quiz calificado en servidor | `POST /api/cursos/[slug]/quizzes/[qid]/intentos` usa servicio y transacción Firestore; clave separada de respuestas | API de producción implementada; la pantalla interactiva actual usa endpoint demo en memoria |
| Intentos y espera | 3 intentos y espera de 24 h en handler demo | No resistente a reinicios/escala; completar transacción Firestore |
| Certificado imprimible | Vista de certificado y `@media print`; API para emitirlo en Firestore y verificar código | UI actual demo; API de emisión/verificación implementada |
| Panel docente | API para crear curso/lecciones/quizzes, cambiar estado y consultar estadísticas por curso | API base implementada; interfaz de panel sigue siendo demostrativa |
| Firebase Auth / cookie | Handler de creación/eliminación de cookie HttpOnly y consulta `/api/auth/yo` | Base implementada; requiere variables y proyecto Firebase |
| Autorización por objeto | Repositorio de creación de cursos verifica docente | Parcial; ampliar a todas las rutas privadas |
| API por capas | Route Handlers, schemas Zod, servicios y repositorios; endpoints de inscripción, lecciones, quizzes y estadísticas | Parcial; faltan pruebas de integración y completar CRUD/errores |
| Vercel Blob | Variables documentadas | Pendiente: paquete SDK, ruta `handleUpload`, validación de propiedad y callback |
| Responsive | CSS mobile-first, breakpoints 700/900 y layouts fluidos | Implementado visualmente; medir 360/768/1024 y 320 px |
| Accesibilidad | Skip link, landmarks, labels, foco visible, estados y reduced motion | Implementado parcialmente; falta axe y lector de pantalla |
| SEO | Metadata, Open Graph, robots y sitemap | Implementado; falta validar URLs del dominio final |
| Impresión | Certificados con reglas `@media print` | Implementado; verificar una página en navegador |

## Evidencias de medición (no inventadas)

Los resultados de Lighthouse, PageSpeed, axe, W3C Validator y Core Web Vitals de campo **no se pueden declarar como aprobados sin ejecutar la aplicación desplegada**. La carpeta `calidad/` queda preparada para almacenar esos informes. No se incluyen capturas ni puntuaciones ficticias.

### Mediciones pendientes

- [ ] Lighthouse móvil y escritorio en tres rutas: pública, formulario y sesión iniciada.
- [ ] Core Web Vitals p75 (LCP ≤ 2,5 s; INP ≤ 200 ms; CLS ≤ 0,1) desde producción.
- [ ] Presupuesto JS ≤ 200 kB y página inicial ≤ 1 MB medidos en DevTools sin caché.
- [ ] Playwright a 360, 768 y 1024 px; reflow a 320 px y zoom 200 %.
- [ ] axe DevTools / `@axe-core/playwright` y validación HTML W3C.
- [ ] Recorrido manual solo con teclado y NVDA/VoiceOver.
- [ ] Capturas de pantallas principales en 360/768/1024.
- [ ] Prueba de impresión de certificado en una página.

## Retos de excelencia elegidos

1. **Impresión del certificado:** `@media print` elimina navegación y elementos de acción; reproducir en `/certificados` tras aprobar el quiz demo y usar Imprimir.
2. **Evaluación calificada en servidor:** la clave vive en `src/app/api/quizzes/[id]/route.ts`, no en el componente cliente; comprobar DevTools → Network y verificar que el payload enviado contiene solo la opción elegida.
3. **Diseño responsive y accesible:** CSS mobile-first, menú colapsable, enlace de salto, foco visible y soporte `prefers-reduced-motion`; reproducir con DevTools y completar la batería manual indicada arriba.

## Seguridad: pendientes antes de producción

- [ ] Conectar la interfaz de estudiante a las APIs Firestore de inscripción, progreso y evaluación (la interfaz actual usa modo demo local).
- [ ] Persistir certificados con código de verificación y consulta pública segura.
- [ ] Hacer que cada ruta privada use cookie de sesión verificada (`verifySessionCookie(cookie, true)`) y autorización por objeto.
- [ ] Añadir protección CSRF por `Origin` en todas las mutaciones.
- [ ] Implementar rate limiting real y respuestas 429.
- [ ] Implementar CRUD de lecciones/quizzes, estadísticas y verificación de propiedad del curso.
- [ ] Integrar Vercel Blob con `handleUpload`, límites de tipo/tamaño, prefijo `usuarios/{uid}/` y borrado autorizado.
- [ ] Añadir OpenAPI completo y colección Bruno/Postman.
- [ ] Completar pruebas API 400/401/403/404 e integración Route Handler → servicio → repositorio.
- [ ] Revisar `npm audit`, reglas Firestore y cabeceras/CSP del despliegue.

## Lista manual

| Prueba | Resultado | Fecha |
|---|---|---|
| Teclado completo | Pendiente de ejecución manual | — |
| Zoom 200 % / reflow 320 px | Pendiente de ejecución manual | — |
| Lector de pantalla | Pendiente de ejecución manual | — |
| W3C / axe | Pendiente de ejecución | — |
