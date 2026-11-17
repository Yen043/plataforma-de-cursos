'use client';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="page-wrap"><div className="panel"><h1 className="page-title">Algo salió mal</h1><p>No pudimos cargar esta sección. Inténtalo nuevamente.</p><button type="button" className="button" onClick={() => reset()}>Reintentar</button></div></div>; }
