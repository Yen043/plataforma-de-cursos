import type { MetadataRoute } from 'next';
import { cursosDemo } from '@/data/cursos-demo';
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; return [{ url: base, changeFrequency: 'weekly', priority: 1 }, { url: `${base}/cursos`, changeFrequency: 'weekly', priority: .9 }, ...cursosDemo.map((curso) => ({ url: `${base}/cursos/${curso.slug}`, changeFrequency: 'monthly' as const, priority: .8 }))]; }
