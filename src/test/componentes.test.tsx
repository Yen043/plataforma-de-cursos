import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Catalogo, Hero, PanelDocente } from '@/components/Plataforma';

afterEach(() => { cleanup(); localStorage.clear(); });

describe('componentes de interfaz', () => {
  it('muestra los cursos disponibles en el catálogo', () => {
    render(<Catalogo/>);
    expect(screen.getByRole('heading', { name: 'Cursos para llevarte más lejos' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Fundamentos de React/ }).length).toBeGreaterThan(0);
  });

  it('filtra cursos por categoría', () => {
    render(<Catalogo/>);
    fireEvent.click(screen.getByRole('button', { name: 'Diseño' }));
    expect(screen.getByRole('heading', { name: 'Diseño UX accesible' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fundamentos de React' })).not.toBeInTheDocument();
  });

  it('presenta una llamada a la acción en la portada', () => {
    render(<Hero/>);
    expect(screen.getByRole('heading', { name: /Aprende algo nuevo/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar cursos/ })).toHaveAttribute('href', '/cursos');
  });

  it('muestra el formulario de creación del panel docente', () => {
    render(<PanelDocente/>);
    expect(screen.getByRole('heading', { name: 'Panel docente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar borrador demo' })).toBeInTheDocument();
  });
});
