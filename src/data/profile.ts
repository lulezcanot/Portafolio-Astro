// Fuente única de datos personales. Todo sale del CV (Cv-Lezcano Tirado Luis.pdf),
// del portafolio anterior y de GitHub. Edita aquí; no hay nada inventado.

export const profile = {
  name: 'Luis Lezcano Tirado',
  nameLines: ['Luis', 'Lezcano', 'Tirado'],
  role: 'Programador Full Stack Jr',
  roleDetail: 'VTEX IO + React',
  city: 'Trujillo, Perú',
  timezone: 'America/Lima',
  availability: 'Abierto a oportunidades',
  email: 'luislezcano.04.05@gmail.com',
  cv: '/cv-luis-lezcano-tirado.pdf',
  summary:
    'Ingeniero de Sistemas egresado de la Universidad César Vallejo. Autodidacta, proactivo y con ganas de resolver problemas. Construyo y mantengo tiendas online con VTEX IO y React, y quiero especializarme en Front End: interfaces dinámicas, eficientes y pensadas para quien las usa.',
  about: [
    'Soy Luis, de Trujillo. Estudié Ingeniería de Sistemas y me quedé con lo que más disfrutaba: la programación web.',
    'Desde febrero de 2025 trabajo en Consultora Transformación Digital, primero como practicante Frontend y desde diciembre como Programador Full Stack Junior. Mantengo y hago evolucionar tiendas en línea con VTEX IO y React: maquetación, componentes custom, rendimiento y estabilidad.',
    'Fuera del código: gimnasio, música y básquet.',
  ],
  links: {
    linkedin: 'https://www.linkedin.com/in/luis-lezcano-tirado-66b4b5285/',
    github: 'https://github.com/lulezcanot',
    instagram: 'https://www.instagram.com/luis_lezcanot/',
  },
} as const;

export type Experience = {
  company: string;
  role: string;
  from: string;
  to: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    company: 'Consultora Transformación Digital S.A.C.',
    role: 'Programador Full Stack Junior',
    from: 'Dic 2025',
    to: 'Actualidad',
    points: [
      'Mantenimiento y evolución continua de tiendas en línea con VTEX IO y React.',
      'Estabilidad, escalabilidad y correcto funcionamiento de cada web.',
      'Código limpio, control de versiones y entrega constante bajo Scrum.',
    ],
  },
  {
    company: 'Consultora Transformación Digital S.A.C.',
    role: 'Prácticas Preprofesionales Frontend',
    from: 'Feb 2025',
    to: 'Dic 2025',
    points: [
      'Desarrollo y mantenimiento de tiendas e-commerce con VTEX IO y React.',
      'Maquetación, componentes custom, optimización del rendimiento y mejora de la experiencia de usuario.',
    ],
  },
];

export const timeline = [
  { year: '2003', text: 'Nace en Trujillo, Perú.' },
  { year: '2021', text: 'Empieza Ingeniería de Sistemas en la Universidad César Vallejo.' },
  { year: '2023', text: 'Route66 (Big Data) y MediScan (redes neuronales): proyectos de la universidad.' },
  { year: '2024', text: 'Empieza con React y arma sus primeros proyectos en GitHub.' },
  { year: '2025', text: 'Egresa de Ingeniería de Sistemas. En febrero entra a Consultora Transformación Digital como practicante Frontend.' },
  { year: 'Dic 2025', text: 'Pasa a Programador Full Stack Junior: tiendas VTEX IO + React.' },
] as const;

export const skills = [
  { group: 'Front End', items: ['HTML', 'CSS', 'JavaScript', 'React', 'VTEX IO'] },
  { group: 'Lenguajes', items: ['Java', 'JavaScript', 'SQL'] },
  { group: 'Datos', items: ['SQL', 'NoSQL', 'ETL', 'Data Mart', 'Cubo OLAP', 'Power BI'] },
  { group: 'Diseño de sistemas', items: ['UML', 'Diseño orientado a objetos', 'Metodologías de análisis'] },
  { group: 'Equipo', items: ['Git', 'GitHub', 'Bitbucket', 'Scrum'] },
  { group: 'Base', items: ['Redes', 'Ciberseguridad (fundamentos)', 'Excel intermedio'] },
] as const;

export const marquee = [
  'React',
  'VTEX IO',
  'JavaScript',
  'HTML',
  'CSS',
  'Java',
  'SQL',
  'NoSQL',
  'Power BI',
  'Git',
  'Scrum',
] as const;

export const nav = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#casos', label: 'Casos' },
  { href: '#trayectoria', label: 'Trayectoria' },
  { href: '#stack', label: 'Stack' },
  { href: '#contacto', label: 'Contacto' },
] as const;
