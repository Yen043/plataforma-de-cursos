'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { cursosDemo } from '@/data/cursos-demo';

type EstadoLocal = { usuario: { nombre: string; rol: 'estudiante' | 'docente' } | null; inscripciones: string[]; completadas: Record<string, string[]>; certificados: string[] };
const CLAVE = 'aula-progreso-v1';
const inicial: EstadoLocal = { usuario: null, inscripciones: [], completadas: {}, certificados: [] };
const preguntasDemo: Record<string, { enunciado: string; opciones: { id: string; text: string }[] }> = {
  'quiz-react': { enunciado: '¿Cuál es el propósito principal de un componente en React?', opciones: [{ id: 'a', text: 'Representar una parte reutilizable de la interfaz.' }, { id: 'b', text: 'Almacenar contraseñas de usuarios.' }, { id: 'c', text: 'Reemplazar el navegador.' }] },
  'quiz-ts': { enunciado: '¿Qué ventaja ofrece el sistema de tipos de TypeScript?', opciones: [{ id: 'a', text: 'Ejecutar estilos CSS.' }, { id: 'b', text: 'Detectar errores de tipos antes de ejecutar el programa.' }, { id: 'c', text: 'Sustituir JavaScript en el navegador.' }] },
  'quiz-ux': { enunciado: '¿Cuál es el objetivo de la accesibilidad en UX?', opciones: [{ id: 'a', text: 'Usar únicamente colores decorativos.' }, { id: 'b', text: 'Diseñar solo para usuarios de ratón.' }, { id: 'c', text: 'Permitir que personas diversas puedan utilizar el producto.' }] },
};

function leerEstado(): EstadoLocal {
  if (typeof window === 'undefined') return inicial;
  try { return { ...inicial, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') } as EstadoLocal; } catch { return inicial; }
}

export function useEstadoPlataforma() {
  const [estado, setEstado] = useState<EstadoLocal>(inicial);
  const [listo, setListo] = useState(false);
  useEffect(() => { setEstado(leerEstado()); setListo(true); }, []);
  useEffect(() => { if (listo) { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* El modo demo sigue disponible durante esta sesión. */ } } }, [estado, listo]);
  return { estado, setEstado, listo };
}

export function BarraNavegacion() {
  const { estado, setEstado, listo } = useEstadoPlataforma();
  const [menuAbierto, setMenuAbierto] = useState(false);
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="Aula, inicio"><span className="brand-mark">a.</span><span>Aula<span className="brand-dot">.</span></span></Link>
    <button className="menu-toggle" type="button" aria-expanded={menuAbierto} aria-controls="main-nav" onClick={() => setMenuAbierto(!menuAbierto)}><span className="sr-only">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>☰</button>
    <nav id="main-nav" className={`main-nav ${menuAbierto ? 'is-open' : ''}`} aria-label="Navegación principal">
      <Link href="/cursos" onClick={() => setMenuAbierto(false)}>Explorar cursos</Link>
      {!estado.usuario && <Link href="/login" onClick={() => setMenuAbierto(false)}>Iniciar sesión</Link>}
      <Link href="/certificados" onClick={() => setMenuAbierto(false)}>Mis certificados</Link>
      <Link href="/docente" onClick={() => setMenuAbierto(false)}>Panel docente</Link>
      {listo && estado.usuario ? <button className="profile-chip" type="button" onClick={() => setEstado((actual) => ({ ...actual, usuario: null }))}>{estado.usuario.nombre} · Salir</button> : <button className="button button-small" type="button" onClick={() => setEstado((actual) => ({ ...actual, usuario: { nombre: 'Estudiante de prueba', rol: 'estudiante' } }))}>Entrar a demo</button>}
    </nav>
  </div></header>;
}

export function Catalogo({ compact = false }: { compacto?: boolean }) {
  const { estado } = useEstadoPlataforma();
  const [filtro, setFiltro] = useState('Todos');
  const categorias = ['Todos', ...Array.from(new Set(cursosDemo.map((curso) => curso.categoria)))];
  const cursos = useMemo(() => filtro === 'Todos' ? cursosDemo : cursosDemo.filter((curso) => curso.categoria === filtro), [filtro]);
  return <section className="section-block" aria-labelledby="catalog-title">
    <div className="section-heading"><div><span className="eyebrow">APRENDE A TU RITMO</span><h2 id="catalog-title">Cursos para llevarte más lejos</h2><p>Contenido práctico, lecciones breves y progreso a tu manera.</p></div>{!compact && <span className="course-count">{cursosDemo.length} cursos disponibles</span>}</div>
    {!compact && <div className="filter-row" role="group" aria-label="Filtrar cursos">{categorias.map((categoria) => <button key={categoria} type="button" className={`filter-chip ${filtro === categoria ? 'active' : ''}`} aria-pressed={filtro === categoria} onClick={() => setFiltro(categoria)}>{categoria}</button>)}</div>}
    <div className="course-grid">{cursos.map((curso, indice) => {
      const completadas = estado.completadas[curso.slug] || [];
      const progreso = Math.round((completadas.length / curso.lecciones.length) * 100);
      return <article className="course-card" key={curso.slug}>
        <Link className={`course-art ${curso.color}`} href={`/cursos/${curso.slug}`} aria-label={`Ver curso ${curso.titulo}`}><span className="course-art-icon">{curso.icono}</span><span className="art-index">0{indice + 1}</span></Link>
        <div className="course-card-body"><div className="meta-row"><span>{curso.categoria}</span><span>{curso.nivel}</span></div><h3><Link href={`/cursos/${curso.slug}`}>{curso.titulo}</Link></h3><p>{curso.descripcion}</p><div className="course-foot"><span>◷ {curso.duracion}</span><span>{curso.lecciones.length} lecciones</span></div>
        {estado.inscripciones.includes(curso.slug) && <div className="mini-progress"><div><span>Tu progreso</span><strong>{progreso}%</strong></div><progress value={progreso} max="100" aria-label={`Progreso de ${curso.titulo}: ${progreso}%`} /></div>}
        <Link className="text-link" href={`/cursos/${curso.slug}`}>{estado.inscripciones.includes(curso.slug) ? 'Continuar aprendiendo' : 'Ver programa'} <span aria-hidden="true">→</span></Link></div>
      </article>;
    })}</div>
  </section>;
}

export function Hero() {
  return <section className="hero"><div className="hero-copy"><span className="eyebrow eyebrow-light">CONOCIMIENTO QUE SE CONVIERTE EN ACCIÓN</span><h1>Aprende algo nuevo. <em>Transforma</em> lo que viene.</h1><p>Un espacio para desarrollar habilidades reales, avanzar a tu ritmo y celebrar cada logro.</p><div className="hero-actions"><Link className="button button-light" href="/cursos">Explorar cursos <span aria-hidden="true">→</span></Link><a className="hero-secondary" href="#como-funciona">Conoce cómo funciona</a></div><div className="hero-proof"><div className="avatar-stack"><span>LM</span><span>AG</span><span>SR</span></div><span>Aprendizaje claro, paso a paso</span></div></div><div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="floating-card card-top"><span className="floating-icon">✦</span><span><b>Tu siguiente logro</b><small>Está más cerca de lo que crees</small></span></div><div className="learning-window"><div className="window-dots"><i/><i/><i/></div><div className="window-symbol">✳</div><span className="window-kicker">LECCIÓN EN CURSO</span><strong>Pequeños pasos,<br/>grandes ideas.</strong><div className="window-progress"><span/><span/><span/><span/><span/></div><small>Tu camino de aprendizaje</small></div><div className="floating-card card-bottom"><span className="check-icon">✓</span><span><b>Progreso guardado</b><small>Cada paso cuenta</small></span></div></div></section>;
}

export function InicioPlataforma() {
  return <><Hero/><div className="content-wrap"><Catalogo compacto/><section id="como-funciona" className="steps-section"><span className="eyebrow">SIMPLE POR DISEÑO</span><h2>Tu aprendizaje, en tres pasos</h2><div className="steps-grid"><article><span>01</span><h3>Elige tu curso</h3><p>Encuentra un tema que te interese y conoce su ruta de aprendizaje.</p></article><article><span>02</span><h3>Avanza a tu ritmo</h3><p>Completa lecciones, practica y retoma donde lo dejaste.</p></article><article><span>03</span><h3>Consigue tu logro</h3><p>Aprueba la evaluación y genera tu certificado de finalización.</p></article></div></section></div></>;
}

export function PiePagina() { return <footer className="site-footer"><div className="footer-inner"><Link className="brand" href="/"><span className="brand-mark">a.</span><span>Aula<span className="brand-dot">.</span></span></Link><p>Aprender también es avanzar.</p><span>© {new Date().getFullYear()} Aula · Proyecto académico</span></div></footer>; }

export function DetalleCurso({ slug }: { slug: string }) {
  const { estado, setEstado } = useEstadoPlataforma();
  const curso = cursosDemo.find((item) => item.slug === slug);
  if (!curso) return <div className="page-wrap"><h1 className="page-title">Curso no encontrado</h1><Link className="text-link" href="/cursos">Volver al catálogo</Link></div>;
  const inscrito = estado.inscripciones.includes(slug);
  const completadas = estado.completadas[slug] || [];
  const progreso = Math.round(completadas.length / curso.lecciones.length * 100);
  function inscribirse() { setEstado((actual) => ({ ...actual, usuario: actual.usuario || { nombre: 'Estudiante de prueba', rol: 'estudiante' }, inscripciones: Array.from(new Set([...actual.inscripciones, slug])) })); }
  return <div className="page-wrap"><div className="breadcrumbs"><Link href="/cursos">Cursos</Link> / {curso.titulo}</div><div className="detail-layout"><section><div className={`course-art course-cover ${curso.color}`}><span className="course-art-icon">{curso.icono}</span></div><span className="eyebrow">{curso.categoria} · {curso.nivel}</span><h1 className="page-title">{curso.titulo}</h1><p className="page-lead">{curso.descripcion}</p><div className="course-foot"><span>Docente: {curso.docente}</span><span>◷ {curso.duracion}</span><span>{curso.lecciones.length} lecciones</span></div><h2>Lo que aprenderás</h2><ul><li>Comprender los conceptos fundamentales.</li><li>Aplicar lo aprendido con ejemplos prácticos.</li><li>Comprobar tus conocimientos con una evaluación.</li></ul><h2>Contenido del curso</h2><ol className="lesson-list">{curso.lecciones.map((leccion, index) => <li key={leccion.id}><Link href={inscrito || leccion.vistaPrevia ? `/aprender/${slug}/${leccion.id}` : '#inscripcion'}><span><strong>{String(index + 1).padStart(2, '0')} · {leccion.titulo}</strong><br/><small>{leccion.duracion}{leccion.vistaPrevia ? ' · Vista previa' : ''}</small></span><span>{completadas.includes(leccion.id) ? '✓' : '→'}</span></Link></li>)}</ol></section><aside className="panel detail-aside" id="inscripcion"><span className="eyebrow">TU SIGUIENTE PASO</span><h2>{inscrito ? 'Continúa aprendiendo' : 'Empieza hoy'}</h2><p>{inscrito ? 'Tu progreso queda guardado en este navegador.' : 'Inscríbete gratis y avanza a tu propio ritmo.'}</p>{inscrito ? <><div className="mini-progress"><div><span>Progreso del curso</span><strong>{progreso}%</strong></div><progress value={progreso} max="100"/></div><Link className="button" href={`/aprender/${slug}/${curso.lecciones.find((l) => !completadas.includes(l.id))?.id || curso.lecciones[0]?.id || ''}`}>Continuar curso</Link></> : <button className="button" type="button" onClick={inscribirse}>Inscribirme al curso</button>}<p className="muted-note">{curso.lecciones.length} lecciones · Certificado al completar y aprobar el quiz.</p></aside></div></div>;
}

export function LeccionCurso({ slug, leccionId }: { slug: string; leccionId: string }) {
  const { estado, setEstado } = useEstadoPlataforma();
  const curso = cursosDemo.find((item) => item.slug === slug);
  const leccion = curso?.lecciones.find((item) => item.id === leccionId);
  const inscrito = estado.inscripciones.includes(slug);
  const finLeccionRef = useRef<HTMLDivElement>(null);
  const marcarCompletada = useCallback(() => {
    setEstado((actual) => ({ ...actual, inscripciones: Array.from(new Set([...actual.inscripciones, slug])), completadas: { ...actual.completadas, [slug]: Array.from(new Set([...(actual.completadas[slug] || []), leccionId])) } }));
  }, [setEstado, slug, leccionId]);
  useEffect(() => {
    if (!inscrito || !finLeccionRef.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { marcarCompletada(); observer.disconnect(); }
    }, { threshold: 0.8 });
    observer.observe(finLeccionRef.current);
    return () => observer.disconnect();
  }, [inscrito, marcarCompletada]);
  if (!curso || !leccion) return <div className="page-wrap"><h1 className="page-title">Lección no encontrada</h1><Link href="/cursos">Volver a cursos</Link></div>;
  if (!inscrito && !leccion.vistaPrevia) return <div className="page-wrap"><div className="notice warning">Esta lección forma parte del curso. Inscríbete para continuar.</div><Link className="button" href={`/cursos/${slug}`}>Ver curso e inscribirme</Link></div>;
  const completadas = estado.completadas[slug] || [];
  const actualIndex = curso.lecciones.findIndex((item) => item.id === leccionId);
  const siguiente = curso.lecciones[actualIndex + 1];
  const anterior = curso.lecciones[actualIndex - 1];
  return <div className="page-wrap"><div className="breadcrumbs"><Link href="/cursos">Cursos</Link> / <Link href={`/cursos/${slug}`}>{curso.titulo}</Link> / Lección {actualIndex + 1}</div><div className="detail-layout"><aside className="panel"><h2>Contenido del curso</h2><p>{completadas.length} de {curso.lecciones.length} lecciones completadas</p><progress value={completadas.length} max={curso.lecciones.length} aria-label="Progreso del curso"/><ol className="lesson-list">{curso.lecciones.map((item, index) => <li key={item.id}><Link href={`/aprender/${slug}/${item.id}`}><span>{index + 1}. {item.titulo}</span><span>{completadas.includes(item.id) ? '✓' : '○'}</span></Link></li>)}</ol></aside><article className="panel lesson-content"><span className="eyebrow">LECCIÓN {actualIndex + 1} · {leccion.duracion.toUpperCase()}</span><h1 className="page-title">{leccion.titulo}</h1>{leccion.videoUrl && <figure className="lesson-video"><video controls preload="metadata"><source src={leccion.videoUrl}/>{leccion.subtitulosUrl && <track kind="captions" src={leccion.subtitulosUrl} srcLang="es" label="Español" default/>}Tu navegador no puede reproducir este video. Lee el contenido de la lección a continuación.</video><figcaption>Video de la lección con subtítulos en español.</figcaption></figure>}{leccion.contenido.map((parrafo, index) => <p key={index}>{parrafo}</p>)}<div className="notice">Idea clave: aprende un concepto, practícalo y avanza cuando estés preparado.</div><div ref={finLeccionRef} aria-hidden="true" className="lesson-sentinel"/><div className="lesson-nav"><div>{anterior && <Link className="text-link" href={`/aprender/${slug}/${anterior.id}`}>← Lección anterior</Link>}</div><div>{inscrito && <button className="button" type="button" onClick={marcarCompletada}>{completadas.includes(leccionId) ? 'Lección completada ✓' : 'Marcar como completada'}</button>}</div></div>{siguiente ? <p><Link className="text-link" href={`/aprender/${slug}/${siguiente.id}`}>Siguiente lección: {siguiente.titulo} →</Link></p> : <div className="notice success"><strong>¡Llegaste al final del contenido!</strong><p>Ahora puedes presentar la evaluación del curso.</p><Link className="text-link" href={`/aprender/${slug}/quiz/${curso.quizId}`}>Ir al cuestionario →</Link></div>}</article></div></div>;
}

export function EvaluacionCurso({ slug, quizId }: { slug: string; quizId: string }) {
  const { estado, setEstado } = useEstadoPlataforma();
  const curso = cursosDemo.find((item) => item.slug === slug && item.quizId === quizId);
  const pregunta = preguntasDemo[quizId];
  const [respuesta, setRespuesta] = useState('');
  const [resultado, setResultado] = useState<{ porcentaje: number; aprobado: boolean } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  if (!curso || !pregunta) return <div className="page-wrap"><h1 className="page-title">Evaluación no encontrada</h1><Link href="/cursos">Volver a cursos</Link></div>;
  if (!estado.inscripciones.includes(slug)) return <div className="page-wrap"><div className="notice warning">Debes inscribirte al curso antes de presentar su evaluación.</div><Link className="button" href={`/cursos/${slug}`}>Ver curso</Link></div>;
  const pendientes = curso.lecciones.filter((leccion) => !(estado.completadas[slug] || []).includes(leccion.id));
  if (pendientes.length > 0) return <div className="page-wrap"><div className="notice warning">Completa todas las lecciones antes de presentar la evaluación.</div><Link className="button" href={`/aprender/${slug}/${pendientes[0]?.id || curso.lecciones[0]?.id || ''}`}>Continuar con la siguiente lección</Link></div>;
  async function enviar(evento: FormEvent<HTMLFormElement>) { evento.preventDefault(); setCargando(true); setError(''); try { let demoSession = crypto.randomUUID(); try { demoSession = localStorage.getItem('aula-demo-session') || demoSession; localStorage.setItem('aula-demo-session', demoSession); } catch { /* La API mantiene un identificador temporal si el almacenamiento está bloqueado. */ } const response = await fetch(`/api/quizzes/${quizId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-demo-session': demoSession }, body: JSON.stringify({ respuesta }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo calificar el cuestionario'); setResultado(data); if (data.aprobado) setEstado((actual) => ({ ...actual, certificados: Array.from(new Set([...actual.certificados, slug])) })); } catch (e) { setError(e instanceof Error ? e.message : 'Error al enviar las respuestas'); } finally { setCargando(false); } }
  return <div className="page-wrap"><div className="breadcrumbs"><Link href={`/cursos/${slug}`}>{curso.titulo}</Link> / Evaluación</div><section className="panel quiz-panel"><span className="eyebrow">EVALUACIÓN FINAL</span><h1 className="page-title">Comprueba lo que aprendiste</h1><p className="page-lead">Responde la pregunta de selección múltiple. La calificación se calcula en el servidor.</p>{resultado ? <div className={`notice ${resultado.aprobado ? 'success' : 'warning'}`} role="status"><h2>{resultado.aprobado ? '¡Evaluación aprobada!' : 'Sigue practicando'}</h2><p>Tu resultado: {resultado.porcentaje}%.</p>{resultado.aprobado ? <Link className="button" href="/certificados">Ver mi certificado</Link> : <button className="button" type="button" onClick={() => { setResultado(null); setRespuesta(''); }}>Intentar de nuevo</button>}</div> : <form onSubmit={enviar}><fieldset className="quiz-fieldset"><legend><strong>{pregunta.enunciado}</strong></legend>{pregunta.opciones.map((opcion) => <label className="quiz-option" key={opcion.id}><input type="radio" name="respuesta" value={opcion.id} checked={respuesta === opcion.id} onChange={(e) => setRespuesta(e.target.value)} required/><span>{opcion.text}</span></label>)}</fieldset>{error && <p role="alert" className="notice warning">{error}</p>}<button className="button" type="submit" disabled={cargando || !respuesta}>{cargando ? 'Calificando…' : 'Enviar respuestas'}</button></form>}</section></div>;
}

export function PanelDocente() {
  const { estado } = useEstadoPlataforma();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [creados, setCreados] = useState<string[]>([]);
  return <div className="page-wrap"><span className="eyebrow">ESPACIO DE ENSEÑANZA</span><h1 className="page-title">Panel docente</h1><p className="page-lead">Administra tu contenido y consulta una vista general del aprendizaje.</p><div className="stats-grid"><div className="stat-card"><strong>{cursosDemo.length + creados.length}</strong><span>Cursos en catálogo</span></div><div className="stat-card"><strong>{estado.inscripciones.length}</strong><span>Inscripciones de esta sesión demo</span></div><div className="stat-card"><strong>{Object.values(estado.completadas).reduce((total, items) => total + items.length, 0)}</strong><span>Lecciones completadas</span></div></div><div className="detail-layout"><section className="panel"><h2>Mis cursos</h2>{cursosDemo.map((curso) => <div className="course-foot" key={curso.slug}><strong>{curso.titulo}</strong><span>{curso.lecciones.length} lecciones</span></div>)}{creados.map((item) => <p key={item}>{item} · Borrador local</p>)}</section><form className="panel" onSubmit={(e) => { e.preventDefault(); if (titulo.trim().length < 5 || descripcion.trim().length < 10) { setMensaje('El título debe tener 5 caracteres y la descripción 10 como mínimo.'); return; } setCreados((actual) => [...actual, titulo.trim()]); setTitulo(''); setDescripcion(''); setMensaje('Curso agregado a la vista de demostración. Para publicarlo necesitas configurar Firebase.'); }}><h2>Crear un curso (vista demo)</h2><div className="form-field"><label htmlFor="titulo-curso">Título</label><input id="titulo-curso" value={titulo} onChange={(e) => setTitulo(e.target.value)} minLength={5} maxLength={100} required/></div><div className="form-field"><label htmlFor="descripcion-curso">Descripción</label><textarea id="descripcion-curso" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} minLength={10} maxLength={500} required/></div><button className="button" type="submit">Guardar borrador demo</button>{mensaje && <p role="status" className="notice">{mensaje}</p>}</form></div><p className="notice warning teacher-alert">El panel docente de esta versión es una demostración local. La publicación real, roles y estadísticas persistentes requieren Firebase Admin y sesión configurada.</p></div>;
}

export function Certificados() {
  const { estado } = useEstadoPlataforma();
  const cursos = cursosDemo.filter((curso) => estado.certificados.includes(curso.slug));
  return <div className="page-wrap"><span className="eyebrow">TUS LOGROS</span><h1 className="page-title">Mis certificados</h1><p className="page-lead">Aquí encontrarás los certificados de los cursos que hayas aprobado.</p>{cursos.length ? cursos.map((curso) => <article className="certificate" key={curso.slug}><span className="eyebrow">AULA · CERTIFICADO DE FINALIZACIÓN</span><h2>Certificado de logro</h2><p>Se reconoce que</p><p className="cert-name">Estudiante de prueba</p><p>ha completado satisfactoriamente el curso</p><h3>{curso.titulo}</h3><p>Emitido el {new Date().toLocaleDateString('es-CO')}</p><button className="button no-print" type="button" onClick={() => window.print()}>Imprimir certificado</button></article>) : <div className="panel empty-state"><h2>Aún no tienes certificados</h2><p>Completa las lecciones y aprueba la evaluación de un curso para obtener tu certificado.</p><Link className="button" href="/cursos">Explorar cursos</Link></div>}</div>;
}
