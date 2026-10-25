import type { BlogPost } from '../types/blog.ts';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'bioeconomia-trazabilidad-digital-sector-productivo',
    title: 'Bioeconomía y Trazabilidad Digital: Cómo certificar valor en cadenas agroindustriales y productivas',
    excerpt:
      'Análisis sobre la integración de telemetría IoT, bases de datos PostgreSQL y sistemas ERP para medir conversión de biomasa, eficiencia energética y trazabilidad de lote.',
    category: 'Innovación & Negocios',
    coverImage: '',
    publishedAt: '2026-10-18',
    readTime: '6 min',
    featured: true,
    author: {
      name: 'Gastón Barea',
      role: 'Consultor en Proyectos de Base Tecnológica & Bioeconomía',
    },
    tags: ['Bioeconomía', 'Trazabilidad', 'IoT Productivo', 'Economía Circular', 'PostgreSQL'],
    blocks: [
      {
        id: 'b-1',
        type: 'heading',
        level: 2,
        text: '1. La convergencia entre recursos biológicos e ingeniería de datos',
      },
      {
        id: 'b-2',
        type: 'paragraph',
        content:
          'A lo largo de 30 años en el sector tecnológico-productivo, he visto cómo las plantas industriales y proyectos agroindustriales pierden margen por no registrar en tiempo real sus variables críticas. En los proyectos modernos de bioeconomía, el dato verificable de origen y transformación vale tanto como el producto físico.',
      },
      {
        id: 'b-3',
        type: 'callout',
        tone: 'highlight',
        title: 'Principio Productivo',
        content:
          'Todo proyecto basado en bioeconomía requiere trazabilidad desde la captura de biomasa hasta la facturación B2B para acceder a mercados internacionales y certificaciones de sostenibilidad.',
      },
      {
        id: 'b-4',
        type: 'youtube',
        videoIdOrUrl: 'XVYUP8Pz-hE',
        caption: 'Presentación: Arquitectura tecnológica aplicada a sistemas productivos y bioeconómicos.',
      },
      {
        id: 'b-5',
        type: 'quote',
        quote:
          'La verdadera innovación ocurre cuando la ingeniería de software resuelve cuellos de botella reales en la producción física y biológica.',
        author: 'Gastón Barea',
      },
    ],
  },
  {
    id: 'post-2',
    slug: 'direccion-proyectos-pmo-14-anos-experiencia-clientes',
    title: 'Claves en la Dirección de Proyectos Tecnológicos: Aprendizajes de 14 años liderando implementaciones con clientes',
    excerpt:
      'Por qué fracasan los desarrollos de software tradicionales y cómo la metodología por hitos verificables (40/40/20) en entornos de Staging protege la inversión.',
    category: 'Modern Tech Stack',
    coverImage: '',
    publishedAt: '2026-10-12',
    readTime: '5 min',
    featured: false,
    author: {
      name: 'Gastón Barea',
      role: 'Director de Proyectos & Arquitecto de Sistemas',
    },
    tags: ['Dirección de Proyectos', 'PMO', 'Odoo ERP', 'Staging', 'Metodología'],
    blocks: [
      {
        id: 'b-201',
        type: 'heading',
        level: 2,
        text: 'Gobernanza técnica y alineación con el negocio',
      },
      {
        id: 'b-202',
        type: 'paragraph',
        content:
          'Dirigir un proyecto con clientes durante más de una década enseña que la tecnología nunca se implementa en el vacío: se implementa sobre personas, procesos contables, depósitos y cadenas logísticas que no pueden detenerse.',
      },
      {
        id: 'b-204',
        type: 'callout',
        tone: 'info',
        title: 'Hitos Auditables',
        content:
          'El esquema 40% inicio, 40% validación funcional en servidor Staging y 20% salida en vivo garantiza que el cliente verifique cada funcionalidad antes de pasar a producción.',
      },
    ],
  },
  {
    id: 'post-3',
    slug: 'gemelos-digitales-empresas-base-tecnologica-ebt',
    title: 'Gemelos Digitales y Empresas de Base Tecnológica (EBTs): Multiplicando la capacidad consultiva con IA',
    excerpt:
      'Cómo estructurar plataformas interactivas que representan el conocimiento experto de una organización para diagnosticar, cotizar y atender clientes 24/7.',
    category: 'Operaciones con IA',
    coverImage: '',
    publishedAt: '2026-10-05',
    readTime: '7 min',
    featured: false,
    author: {
      name: 'Gastón Barea',
      role: 'Consultor en Proyectos de Base Tecnológica & Bioeconomía',
    },
    tags: ['Gemelo Digital', 'Base Tecnológica', 'Inteligencia Artificial', 'B2B2C'],
    blocks: [
      {
        id: 'b-301',
        type: 'heading',
        level: 2,
        text: 'De la página web estática al Gemelo Digital interactivo',
      },
      {
        id: 'b-302',
        type: 'paragraph',
        content:
          'Una plataforma corporativa moderna no debe limitarse a un folleto estático. Al integrar modelos de lenguaje entrenados con la experiencia real del consultor y conectarla con el CRM y el Portal de Clientes, el sitio web se convierte en un motor vivo de pre-ingeniería y relación comercial.',
      },
    ],
  },
];
