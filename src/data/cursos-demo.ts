export interface LeccionDemo {
  id: string;
  titulo: string;
  duracion: string;
  contenido: string[];
  vistaPrevia?: boolean;
  videoUrl?: string;
  subtitulosUrl?: string;
}

export interface CursoDemo {
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion: string;
  docente: string;
  color: string;
  icono: string;
  lecciones: LeccionDemo[];
  quizId: string;
}

export const cursosDemo: CursoDemo[] = [
  {
    slug: 'fundamentos-react', titulo: 'Fundamentos de React', descripcion: 'Construye interfaces modernas comprendiendo componentes, propiedades, estado y efectos.', categoria: 'Desarrollo web', nivel: 'Principiante', duracion: '3 h 20 min', docente: 'Laura Martínez', color: 'lavender', icono: '⚛', quizId: 'quiz-react',
    lecciones: [
      { id: 'bienvenida', titulo: 'Bienvenida y ruta de aprendizaje', duracion: '8 min', vistaPrevia: true, contenido: ['En este curso aprenderás a construir interfaces reutilizables con React.', 'Comenzaremos con los conceptos esenciales y avanzaremos hacia componentes que responden a las acciones de las personas.', 'Al finalizar podrás organizar una aplicación pequeña, reutilizar componentes y administrar su estado.'] },
      { id: 'componentes', titulo: 'Componentes y JSX', duracion: '24 min', contenido: ['Los componentes son funciones que devuelven una descripción de la interfaz.', 'JSX permite escribir una sintaxis similar a HTML dentro de JavaScript. Cada componente debe tener un nombre que comience con mayúscula.', 'Divide la interfaz en piezas pequeñas que tengan una responsabilidad clara.'] },
      { id: 'props', titulo: 'Propiedades y composición', duracion: '28 min', contenido: ['Las props permiten que un componente reciba información de su componente padre.', 'La composición consiste en combinar componentes pequeños para crear experiencias más completas.', 'Mantén las props explícitas y evita duplicar estructuras visuales.'] },
      { id: 'estado', titulo: 'Estado e interacciones', duracion: '35 min', contenido: ['El estado representa información que puede cambiar mientras la aplicación está en uso.', 'El hook useState permite declarar estado local y una función para actualizarlo.', 'Cuando el estado cambia, React vuelve a renderizar el componente para reflejar la nueva información.'] },
    ],
  },
  {
    slug: 'typescript-esencial', titulo: 'TypeScript esencial', descripcion: 'Escribe JavaScript más seguro con tipos, interfaces, funciones y genéricos.', categoria: 'Programación', nivel: 'Principiante', duracion: '2 h 45 min', docente: 'Andrés Gómez', color: 'mint', icono: 'TS', quizId: 'quiz-ts',
    lecciones: [
      { id: 'introduccion', titulo: '¿Por qué TypeScript?', duracion: '10 min', vistaPrevia: true, contenido: ['TypeScript agrega un sistema de tipos estático a JavaScript.', 'El compilador detecta muchos errores antes de ejecutar la aplicación.', 'Los tipos también documentan las expectativas de una función o componente.'] },
      { id: 'tipos', titulo: 'Tipos primitivos y uniones', duracion: '22 min', contenido: ['Los tipos básicos incluyen string, number, boolean, null y undefined.', 'Los tipos de unión permiten expresar que un valor puede pertenecer a más de un tipo.', 'Prefiere tipos precisos y evita recurrir a any cuando existe una alternativa.'] },
      { id: 'interfaces', titulo: 'Interfaces y objetos', duracion: '30 min', contenido: ['Las interfaces describen la forma que debe tener un objeto.', 'Puedes reutilizar una interfaz para mantener consistencia entre funciones y componentes.', 'Usa propiedades opcionales solo cuando realmente puedan faltar.'] },
    ],
  },
  {
    slug: 'ux-accesible', titulo: 'Diseño UX accesible', descripcion: 'Aprende principios prácticos para crear experiencias digitales inclusivas.', categoria: 'Diseño', nivel: 'Intermedio', duracion: '2 h 10 min', docente: 'Sofía Ramírez', color: 'peach', icono: '✳', quizId: 'quiz-ux',
    lecciones: [
      { id: 'principios', titulo: 'Principios de accesibilidad', duracion: '14 min', vistaPrevia: true, contenido: ['La accesibilidad busca que las personas puedan percibir, comprender y utilizar los productos digitales.', 'El diseño inclusivo considera distintas capacidades, dispositivos y contextos de uso.', 'La accesibilidad beneficia a todas las personas, no solo a quienes utilizan tecnologías de asistencia.'] },
      { id: 'contraste', titulo: 'Color y contraste', duracion: '26 min', contenido: ['El color no debe ser el único medio para transmitir información.', 'Comprueba el contraste entre texto y fondo y acompaña los estados con etiquetas o iconos.', 'Mantén indicadores de foco visibles para quienes navegan con teclado.'] },
      { id: 'teclado', titulo: 'Navegación por teclado', duracion: '31 min', contenido: ['Todas las acciones deben poder realizarse sin ratón.', 'Utiliza elementos HTML nativos: enlaces para navegar y botones para ejecutar acciones.', 'Respeta un orden de foco lógico y evita ocultar el indicador de foco.'] },
    ],
  },
];

export function obtenerCurso(slug: string) {
  return cursosDemo.find((curso) => curso.slug === slug);
}
