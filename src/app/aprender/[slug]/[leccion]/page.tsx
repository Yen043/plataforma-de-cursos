import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { obtenerCurso } from '@/data/cursos-demo';
import { LeccionCurso } from '@/components/Plataforma';
export async function generateMetadata({ params }: { params: Promise<{ slug: string; leccion: string }> }): Promise<Metadata> { const { slug, leccion } = await params; const curso = obtenerCurso(slug); return { title: curso?.lecciones.find((item) => item.id === leccion)?.titulo ?? 'Lección' }; }
export default async function LeccionPage({ params }: { params: Promise<{ slug: string; leccion: string }> }) { const { slug, leccion } = await params; if (!obtenerCurso(slug)?.lecciones.some((item) => item.id === leccion)) notFound(); return <LeccionCurso slug={slug} leccionId={leccion}/>; }
