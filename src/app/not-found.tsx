import Link from 'next/link';
export default function NotFound() { return <div className="page-wrap"><div className="panel empty-state"><span className="eyebrow">ERROR 404</span><h1 className="page-title">No encontramos esta página</h1><p>Es posible que el enlace haya cambiado o que el contenido ya no exista.</p><Link className="button" href="/">Volver al inicio</Link></div></div>; }
