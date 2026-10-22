import type { BlogPost } from '../types/blog.ts';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'orquestacion-agentes-ia-modern-stack',
    title: 'Cómo orquestar Agentes Autónomos con IA en producción sin disparar los costos de infraestructura',
    excerpt:
      'Guía técnica y de negocio para integrar agentes de inteligencia artificial en flujos operativos reales, combinando Vercel Edge, Supabase PostgreSQL RLS y modelos multimodales.',
    category: 'Operaciones con IA',
    coverImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-10-15',
    readTime: '6 min',
    featured: true,
    author: {
      name: 'Gastón Barea',
      role: 'Business Innovación & Software Architect',
    },
    tags: ['Inteligencia Artificial', 'Agentes Autónomos', 'Supabase', 'Vercel Edge', 'Arquitectura'],
    blocks: [
      {
        id: 'b-1',
        type: 'heading',
        level: 2,
        text: '1. El problema del sobredimensionamiento en proyectos de IA',
      },
      {
        id: 'b-2',
        type: 'paragraph',
        content:
          'La mayoría de las empresas cometen el error de desplegar servidores dedicados de costos astronómicos para tareas de inteligencia artificial que son intermitentes. En mis consultorías, el primer principio es la eficiencia: desacoplar la interfaz del procesamiento y apoyarse en arquitecturas orientadas a eventos.',
      },
      {
        id: 'b-3',
        type: 'callout',
        tone: 'highlight',
        title: 'Principio de Arquitectura Resiliente',
        content:
          'Nunca proceses llamadas síncronas de IA que superen los 10 segundos en el hilo principal del usuario. Todo análisis profundo debe delegarse a workers en background y notificarse en tiempo real.',
      },
      {
        id: 'b-4',
        type: 'youtube',
        videoIdOrUrl: 'L_LUpnjgPso',
        caption: 'Masterclass: Despliegue de arquitecturas de software modernas con IA en producción.',
      },
      {
        id: 'b-5',
        type: 'heading',
        level: 2,
        text: '2. Topología recomendada: Edge + PostgreSQL 16 + Agentes',
      },
      {
        id: 'b-6',
        type: 'paragraph',
        content:
          'Cuando un usuario inicia una solicitud (por ejemplo, una simulación de propuesta o auditoría de datos), el frontend en Vercel guarda el registro en Supabase con políticas de Row Level Security (RLS). Supabase dispara un Database Webhook hacia nuestro worker persistente, asegurando cero tiempo de inactividad.',
      },
      {
        id: 'b-7',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Diagrama de topología: Flujo desacoplado entre Frontend Edge, PostgreSQL y Worker de IA.',
        alt: 'Topología de arquitectura de servidores y datos',
      },
      {
        id: 'b-8',
        type: 'heading',
        level: 2,
        text: '3. Episodio de Podcast técnico en Spotify',
      },
      {
        id: 'b-9',
        type: 'paragraph',
        content:
          'En este episodio profundizo sobre las decisiones de diseño para mantener la latencia en menos de 150ms mientras orquestamos modelos de lenguaje en tiempo real:',
      },
      {
        id: 'b-10',
        type: 'spotify',
        spotifyUrlOrUri: 'https://open.spotify.com/episode/7G5M12jG2E49o8Rk1K9f3G',
        caption: 'Episodio: Nuevos Modelos de Negocio & Decisiones de Stack en Spotify.',
      },
      {
        id: 'b-11',
        type: 'heading',
        level: 2,
        text: '4. Nota de voz / Audio explicativo de Gastón',
      },
      {
        id: 'b-12',
        type: 'audio',
        audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/computer_server_ambience.ogg',
        title: 'Nota Técnica de Gastón: Claves de seguridad en Supabase RLS y Webhooks',
        duration: '03:15 min',
        caption: 'Audio exclusivo sobre configuración de aislamiento de tenants y prevención de fugas de datos.',
      },
      {
        id: 'b-13',
        type: 'quote',
        quote:
          'La verdadera madurez tecnológica no es acumular código complejo, sino diseñar sistemas tan limpios que cualquier cambio de escala sea predecible y seguro.',
        author: 'Gastón Barea',
      },
    ],
  },
  {
    id: 'post-2',
    slug: 'modern-tech-stack-vercel-supabase-react-19',
    title: 'Modern Tech Stack: Por qué Vercel Edge + Supabase superan a las arquitecturas tradicionales',
    excerpt:
      'Comparativa de rendimiento, costos operativos en dólares y facilidad de mantenimiento frente a servidores virtuales pesados y dependencias monolíticas.',
    category: 'Modern Tech Stack',
    coverImage:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-10-10',
    readTime: '5 min',
    featured: false,
    author: {
      name: 'Gastón Barea',
      role: 'Business Innovación & Software Architect',
    },
    tags: ['Vercel', 'Supabase', 'React 19', 'PostgreSQL', 'Docker'],
    blocks: [
      {
        id: 'b-201',
        type: 'heading',
        level: 2,
        text: 'El final de las caídas de servidor por sobrecarga',
      },
      {
        id: 'b-202',
        type: 'paragraph',
        content:
          'Durante años, las empresas en Argentina y Latinoamérica han pagado licencias y servidores VPS sobredimensionados por miedo a que el sistema no soporte picos de tráfico. Con la combinación de Edge CDN y bases de datos serverless con pooling de conexiones, el costo acompaña el tráfico real.',
      },
      {
        id: 'b-203',
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
        caption: 'Desarrollo en React 19 con tipado estricto en TypeScript para arquitecturas sin deuda técnica.',
      },
      {
        id: 'b-204',
        type: 'callout',
        tone: 'info',
        title: 'Métrica Clave',
        content:
          'En pruebas de carga con más de 10.000 solicitudes concurrentes, Vercel Edge distribuye el tráfico con 99.99% de éxito y tiempos de respuesta promedio inferiores a 45ms.',
      },
    ],
  },
  {
    id: 'post-3',
    slug: 'transicion-modelos-negocio-digitales-b2b',
    title: 'Nuevos Modelos de Negocio Digitales: Cómo monetizar activos operativos y servicios tradicionales',
    excerpt:
      'Cómo las empresas consolidadas pueden abrir nuevos canales de ingresos recurrentes (SaaS B2B, portales de autoservicio y suscripciones) aprovechando sus ventajas existentes.',
    category: 'Innovación & Negocios',
    coverImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-10-05',
    readTime: '7 min',
    featured: false,
    author: {
      name: 'Gastón Barea',
      role: 'Business Innovación & Software Architect',
    },
    tags: ['Modelos de Negocio', 'SaaS', 'Monetización B2B', 'Estrategia Digital'],
    blocks: [
      {
        id: 'b-301',
        type: 'heading',
        level: 2,
        text: 'Del cobro por hora al software como servicio (SaaS)',
      },
      {
        id: 'b-302',
        type: 'paragraph',
        content:
          'Cualquier empresa que posea datos valiosos sobre su cadena de distribución, logística o clientes puede paquetizar ese conocimiento en una plataforma B2B. La clave no es la tecnología en sí, sino empaquetar una solución que ahorre tiempo o costos inmediatos a su cliente final.',
      },
      {
        id: 'b-303',
        type: 'youtube',
        videoIdOrUrl: 'L_LUpnjgPso',
        caption: 'Estrategia de monetización digital y diseño de productos tecnológicos de alto margen.',
      },
    ],
  },
];
