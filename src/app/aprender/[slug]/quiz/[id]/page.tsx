import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { obtenerCurso } from '@/data/cursos-demo';
import { EvaluacionCurso } from '@/components/Plataforma';
export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }): Promise<Metadata> {
  const { slug, id } = await params;
  const curso = obtenerCurso(slug);
  if (!curso || curso.quizId !== id) return { title: 'Evaluación no encontrada' };
  return { title: `Evaluación · ${curso.titulo}`, description: `Comprueba lo aprendido en ${curso.titulo}.` };
}
export default async function QuizPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  if (obtenerCurso(slug)?.quizId !== id) notFound();
  return <EvaluacionCurso slug={slug} quizId={id}/>;
}
