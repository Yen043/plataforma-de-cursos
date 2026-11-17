import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cursosDemo, obtenerCurso } from '@/data/cursos-demo';
import { DetalleCurso } from '@/components/Plataforma';
export function generateStaticParams() { return cursosDemo.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const curso = obtenerCurso(slug); return { title: curso?.titulo ?? 'Curso no encontrado', description: curso?.descripcion }; }
export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!obtenerCurso(slug)) notFound(); return <DetalleCurso slug={slug}/>; }
