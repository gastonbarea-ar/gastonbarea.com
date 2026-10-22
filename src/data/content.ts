export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  fullScope: {
    overview: string;
    objectives: string[];
    typicalTimeline: string;
    sampleDeliverables: string[];
  };
}

export interface TechSpec {
  id: string;
  name: string;
  category: 'Frontend & UI' | 'Backend & DB' | 'Infraestructura & OS' | 'Data & AI';
  type: string;
  description: string;
  level: 'Senior' | 'Avanzado' | 'Especialista';
}

export interface CaseStudy {
  id: string;
  category: string;
  title: string;
  organization: string;
  challenge: string;
  solution: string;
  technologies: string[];
  metrics: {
    value: string;
    label: string;
    detail: string;
  }[];
  verificationNote: string;
}

export interface MethodologyPhase {
  number: string;
  phaseName: string;
  stageName: string;
  title: string;
  summary: string;
  activities: string[];
  formalDeliverable: string;
}

export interface SectorItem {
  number: string;
  title: string;
  subtitle: string;
  pillars: {
    title: string;
    description: string;
  }[];
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'consultoria',
    number: '01',
    title: 'Consultoría & Dirección de Proyectos Digitales',
    subtitle: 'Liderazgo técnico y planificación estratégica de software',
    description: 'Acompaño a directores, gerentes y líderes de cooperativas en la toma de decisiones tecnológicas clave. Desde la selección del stack adecuado hasta la dirección de equipos de desarrollo y la auditoría de código existente.',
    deliverables: [
      'Auditoría técnica de sistemas y deuda técnica',
      'Roadmap y diagramas de arquitectura de software',
      'Estimación de presupuestos y dimensionamiento de equipos'
    ],
    technologies: ['Arquitectura Hexagonal', 'Clean Code', 'Scrum / Agile', 'Microservicios / Monolitos Modulares'],
    fullScope: {
      overview: 'Diseño estratégico orientado a mitigar riesgos de sobrecosto y paradas no planificadas, estableciendo un gobierno técnico ordenado.',
      objectives: [
        'Alinear la capacidad tecnológica con las prioridades financieras de la organización.',
        'Auditar código fuente, cuellos de botella de infraestructura y contratos de software.',
        'Dirigir comités técnicos y coordinar equipos internos o proveedores externos.'
      ],
      typicalTimeline: '3 a 6 semanas (Diagnóstico inicial) o abono mensual fraccional (CTO Advisory).',
      sampleDeliverables: [
        'Informe de Madurez Tecnológica y Vulnerabilidades',
        'Diagrama de Arquitectura de Solución (C4 Model)',
        'Matriz de Selección Tecnológica y Estimaciones de Costos'
      ]
    }
  },
  {
    id: 'bi-analytics',
    number: '02',
    title: 'Business Intelligence & Data Analytics',
    subtitle: 'Modelado de datos, tableros ejecutivos y toma de decisiones',
    description: 'Transformo datos dispersos en hojas de cálculo y bases operativas en tableros de control ejecutivos en tiempo real. Construcción de pipelines ETL, almacenes de datos y modelos predictivos para maximizar la rentabilidad.',
    deliverables: [
      'Diseño de modelos de datos relacionales y analíticos',
      'Pipelines automáticos de extracción, transformación y carga (ETL)',
      'Dashboards ejecutivos con métricas financieras y operativas'
    ],
    technologies: ['Power BI', 'Metabase', 'PostgreSQL', 'Python', 'SQL Avanzado', 'ETL Pipelines'],
    fullScope: {
      overview: 'Desarrollo de ecosistemas de analítica que convierten registros crudos en indicadores de gestión confiables con actualización automática.',
      objectives: [
        'Eliminar la consolidación manual de hojas de cálculo dispersas.',
        'Implementar repositorios centralizados (Data Warehouse) con esquemas estrella optimizados.',
        'Capacitar a mandos medios y directores en la interpretación de KPIs operativos y de cobranza.'
      ],
      typicalTimeline: '4 a 8 semanas según volumen de fuentes de datos.',
      sampleDeliverables: [
        'Pipelines ETL automatizados con validación de consistencia',
        'Tablero Ejecutivo en tiempo real (Metabase / Power BI)',
        'Diccionario de Datos y Documentación de Fórmulas de Negocio'
      ]
    }
  },
  {
    id: 'infraestructura',
    number: '03',
    title: 'Infraestructura & Sistemas',
    subtitle: 'Administración de servidores Linux, Docker, bases de datos y redes',
    description: 'Diseño, configuro y administro entornos de servidores de alta disponibilidad y tolerancia a fallos. Especialista en virtualización con Docker, hardening de seguridad Linux, configuración de CyberPanel y optimización de bases de datos PostgreSQL.',
    deliverables: [
      'Aprovisionamiento y securitización de servidores Linux (Ubuntu/Debian)',
      'Contenedorización de aplicaciones y orquestación con Docker Compose',
      'Administración y clustering de bases de datos PostgreSQL y Supabase'
    ],
    technologies: ['Linux Ubuntu', 'Docker', 'PostgreSQL', 'Supabase', 'CyberPanel', 'Nginx', 'Redes / VPN'],
    fullScope: {
      overview: 'Ingeniería de sistemas para garantizar operaciones continuas 24/7 sin sorpresas ni dependencia de soluciones cerradas.',
      objectives: [
        'Aislar servicios mediante contenedores reproducibles para migraciones limpias.',
        'Implementar esquemas de copias de seguridad automáticas, cifradas y verificadas.',
        'Configurar firewalls UFW, reglas de reverse proxy con Nginx y redes VPN WireGuard seguras.'
      ],
      typicalTimeline: '2 a 5 semanas para despliegue de infraestructura base o contingencias.',
      sampleDeliverables: [
        'Repositorio de infraestructura con Docker Compose y variables versionadas',
        'Esquema de Backups Diarios Cifrados con retención offsite',
        'Protocolo de Contingencia y Recuperación ante Desastres (DRP)'
      ]
    }
  },
  {
    id: 'desarrollo-web',
    number: '04',
    title: 'Desarrollo Web & UI/UX Design',
    subtitle: 'Interfaces intuitivas y aplicaciones web de alto rendimiento',
    description: 'Creación de aplicaciones web a medida, portales corporativos y sistemas de gestión interna que combinan una experiencia de usuario fluida con una base de código robusta, accesible y fácil de mantener.',
    deliverables: [
      'Diseño de interfaces UI/UX centrado en el usuario (Figma / Prototipado)',
      'Desarrollo frontend moderno con Next.js, React y Tailwind CSS',
      'Integraciones con ERPs (Odoo), CRMs y pasarelas de pago'
    ],
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Odoo ERP', 'WordPress'],
    fullScope: {
      overview: 'Construcción de software a medida que simplifica procesos comerciales y administrativos, priorizando rapidez y autonomía para el cliente.',
      objectives: [
        'Construir interfaces con tiempos de carga ultra-rápidos y arquitectura componentizada.',
        'Conectar portales de clientes y proveedores con Odoo ERP u otros sistemas centrales.',
        'Asegurar compatibilidad completa con dispositivos móviles y normas de accesibilidad.'
      ],
      typicalTimeline: '6 a 12 semanas según complejidad funcional.',
      sampleDeliverables: [
        'Prototipos interactivos en Figma aprobados por áreas clave',
        'Código fuente documentado en TypeScript con cobertura de pruebas',
        'Portal en producción con integración bidireccional a ERP/API'
      ]
    }
  },
  {
    id: 'ecommerce-b2b2c',
    number: '05',
    title: 'Capa de E-Commerce B2B2C & Omnicanalidad',
    subtitle: 'Portales mayoristas B2B, tiendas B2C de alta conversión y sincronización ERP',
    description: 'Diseño e implementación de plataformas de comercio digital unificadas B2B2C. Conectamos distribuidores, mayoristas y clientes corporativos con catálogos dinámicos, cuentas corrientes, compras recurrentes y listas de precios por volumen, integrados en tiempo real con inventarios, pasarelas de pago y ERP (Odoo).',
    deliverables: [
      'Portal Mayorista B2B: Cotizaciones, listas de precios segmentadas y crédito en cuenta corriente',
      'Tienda B2C de Alta Conversión: Checkout en 1-click, pasarelas locales e internacionales (Mercado Pago, Stripe)',
      'Sincronización Omnicanal en Tiempo Real: Stocks descentralizados, logística y facturación automática con ERP'
    ],
    technologies: ['Next.js Commerce', 'Odoo eCommerce B2B', 'PostgreSQL', 'Redis', 'Mercado Pago / Stripe', 'Medusa.js / Shopify Plus', 'GraphQL & REST APIs'],
    fullScope: {
      overview: 'Arquitectura transaccional de alto impacto diseñada para digitalizar canales mayoristas y minoristas sin crear silos de información ni fricción operativa.',
      objectives: [
        'Automatizar la toma de pedidos mayoristas reduciendo hasta un 80% los errores manuales de carga.',
        'Sincronizar stock, precios y facturación en tiempo real entre almacenes físicos, tiendas web y ERP central.',
        'Ofrecer una experiencia de compra B2C fluida (<1s de respuesta) tolerante a picos masivos de demanda.'
      ],
      typicalTimeline: '5 a 9 semanas según cantidad de canales, pasarelas y complejidad de integración ERP.',
      sampleDeliverables: [
        'Portal B2B con gestión de aprobaciones jerárquicas y reordenamiento por SKU/CSV',
        'Storefront B2C Headless responsive optimizado para SEO y Core Web Vitals',
        'Microservicio de integración bidireccional con Odoo ERP para inventarios y facturación electrónica'
      ]
    }
  }
];

export const TECH_SPECS_DATA: TechSpec[] = [
  { id: '1', name: 'Next.js', category: 'Frontend & UI', type: 'Framework', description: 'Framework React para aplicaciones web modernas con SSR y alto rendimiento.', level: 'Avanzado' },
  { id: '2', name: 'React', category: 'Frontend & UI', type: 'Frontend', description: 'Arquitectura de componentes reactivos y librerías de estado complejas.', level: 'Avanzado' },
  { id: '3', name: 'Tailwind CSS', category: 'Frontend & UI', type: 'Styling', description: 'Diseño UI modular, utilitario y optimizado sin sobrecarga de estilos.', level: 'Avanzado' },
  { id: '4', name: 'TypeScript', category: 'Frontend & UI', type: 'Lenguaje', description: 'Tipado estático para código robusto, refactorizaciones seguras y cero errores de tipo.', level: 'Avanzado' },
  { id: '5', name: 'WordPress', category: 'Frontend & UI', type: 'CMS', description: 'Desarrollo de sitios corporativos autogestionables y arquitectura headless.', level: 'Senior' },
  { id: '6', name: 'Figma & UI/UX', category: 'Frontend & UI', type: 'Diseño', description: 'Prototipado rápido, sistemas de diseño y flujos de usuario intuitivos.', level: 'Avanzado' },
  { id: '7', name: 'PostgreSQL', category: 'Backend & DB', type: 'Base de Datos', description: 'Bases de datos relacionales empresariales, indexación avanzada y consultas complejas.', level: 'Senior' },
  { id: '8', name: 'Supabase', category: 'Backend & DB', type: 'BaaS & Cloud', description: 'Plataforma BaaS abierta con autenticación, base de datos en tiempo real y storage.', level: 'Avanzado' },
  { id: '9', name: 'Odoo ERP', category: 'Backend & DB', type: 'ERP Corporativo', description: 'Implementación, customización de módulos y automatización de flujos de negocio.', level: 'Especialista' },
  { id: '10', name: 'Node.js & Python', category: 'Backend & DB', type: 'Backend', description: 'APIs RESTful, microservicios, tareas programadas y scripts de automatización.', level: 'Avanzado' },
  { id: '11', name: 'Linux (Ubuntu Server)', category: 'Infraestructura & OS', type: 'Sistema Operativo', description: 'Administración, securitización, configuración de kernels y scripts bash.', level: 'Senior' },
  { id: '12', name: 'Docker', category: 'Infraestructura & OS', type: 'DevOps', description: 'Empaquetado de aplicaciones en contenedores reproducibles y portables.', level: 'Senior' },
  { id: '13', name: 'CyberPanel', category: 'Infraestructura & OS', type: 'Hosting & Ops', description: 'Panel de control de alto rendimiento basado en OpenLiteSpeed para hosting corporativo.', level: 'Avanzado' },
  { id: '14', name: 'Nginx & Reverse Proxies', category: 'Infraestructura & OS', type: 'Redes & Web', description: 'Balanceo de carga, terminación SSL/TLS, compresión HTTP/3 y caching.', level: 'Avanzado' },
  { id: '15', name: 'Administración de Servidores', category: 'Infraestructura & OS', type: 'Infraestructura', description: 'Gestión de hardware dedicado, VPS en la nube y entornos híbridos.', level: 'Senior' },
  { id: '16', name: 'Redes & Seguridad', category: 'Infraestructura & OS', type: 'Seguridad', description: 'Firewalls (UFW/iptables), VPNs seguras (WireGuard), SSH hardening y backups.', level: 'Avanzado' },
  { id: '17', name: 'Business Intelligence', category: 'Data & AI', type: 'Analítica', description: 'Dashboards analíticos, modelado dimensional (Star Schema) y KPI tracking.', level: 'Especialista' },
  { id: '18', name: 'AI Tools & APIs', category: 'Data & AI', type: 'Inteligencia Artificial', description: 'Integración de modelos fundacionales (Gemini, Claude) para flujos de trabajo inteligentes.', level: 'Avanzado' },
  { id: '19', name: 'Automatizaciones n8n / Scripts', category: 'Data & AI', type: 'Automatización', description: 'Orquestación de flujos de trabajo automáticos entre múltiples servicios SaaS.', level: 'Avanzado' },
  { id: '20', name: 'Git & CI/CD', category: 'Infraestructura & OS', type: 'Flujo DevOps', description: 'Control de versiones, pipelines automatizados de despliegue continuo y testing.', level: 'Avanzado' }
];

export const METHODOLOGY_PHASES: MethodologyPhase[] = [
  {
    number: '01',
    phaseName: 'Fase de Alineación y Diseño',
    stageName: 'Etapa 1 de 4',
    title: 'Diagnóstico & Arquitectura',
    summary: 'Analizo a fondo la infraestructura actual, los requerimientos del negocio y los cuellos de botella tecnológicos antes de escribir una sola línea de código.',
    activities: [
      'Auditoría técnica de sistemas, servidores y bases de datos',
      'Relevamiento funcional con partes interesadas y directivos',
      'Diseño de arquitectura de software y topología de servidores',
      'Definición de stack tecnológico y estimación de costos'
    ],
    formalDeliverable: 'Documento de Arquitectura de Sistemas y Plan Maestro de Implementación'
  },
  {
    number: '02',
    phaseName: 'Fase de Construcción Ágil',
    stageName: 'Etapa 2 de 4',
    title: 'Implementación & Desarrollo',
    summary: 'Desarrollo iterativo centrado en módulos funcionales prioritarios, con control de versiones y revisiones continuas de código.',
    activities: [
      'Configuración de repositorios Git y entornos de staging',
      'Construcción de componentes frontend accesibles y servicios backend',
      'Integraciones con bases de datos y sistemas legados existentes',
      'Pruebas unitarias, de integración y validaciones funcionales'
    ],
    formalDeliverable: 'Código fuente versionado con entregas quincenales funcionales'
  },
  {
    number: '03',
    phaseName: 'Fase de Puesta en Marcha',
    stageName: 'Etapa 3 de 4',
    title: 'Infraestructura & Seguridad',
    summary: 'Aprovisionamiento de servidores en producción con contenedores Docker, hardening de seguridad y conmutación con cero downtime.',
    activities: [
      'Securitización de Linux, configuración de firewalls y certificados SSL/TLS',
      'Orquestación de servicios en Docker Compose con reinicio automático',
      'Migración de datos transaccionales y conmutación controlada',
      'Configuración de copias de seguridad automáticas y cifradas'
    ],
    formalDeliverable: 'Entorno de producción operativo 24/7 con protocolo de contingencia'
  },
  {
    number: '04',
    phaseName: 'Fase de Maduración & Escala',
    stageName: 'Etapa 4 de 4',
    title: 'Optimización Continua & BI',
    summary: 'Medición de rendimiento real en producción, afinamiento de consultas de base de datos y tableros analíticos para dirección.',
    activities: [
      'Monitoreo proactivo de uptime, consumo de CPU y memoria',
      'Afinamiento de índices PostgreSQL y optimización de latencia',
      'Despliegue de dashboards de Business Intelligence (Metabase/Power BI)',
      'Transferencia técnica y capacitación a los equipos internos'
    ],
    formalDeliverable: 'Dashboards ejecutivos activos y manual de operación del sistema'
  }
];

export const CASE_STUDIES_DATA: CaseStudy[] = [
  {
    id: 'cooperativa',
    category: 'Infraestructura & DevOps',
    title: 'Virtualización y Modernización de Infraestructura Crítica',
    organization: 'Cooperativa de Servicios Públicos',
    challenge: 'Servidores obsoletos en sitio con caídas frecuentes, copias de seguridad manuales de alto riesgo y costos de mantenimiento desmedidos para sistemas esenciales de facturación y atención ciudadana.',
    solution: 'Migración planificada a una arquitectura de servidores Linux con Docker, aislamiento de servicios de facturación, bases de datos PostgreSQL optimizadas y backups cifrados automáticos en la nube.',
    technologies: ['Linux Ubuntu', 'Docker', 'PostgreSQL', 'CyberPanel', 'Nginx', 'Bash Scripts'],
    metrics: [
      { value: '99.95%', label: 'Disponibilidad de Servicio', detail: 'Operación continua sin caídas en horarios de atención' },
      { value: '-80%', label: 'Reducción en Tiempo de Copias', detail: 'Backups automáticos en segundo plano sin congelar tablas' },
      { value: '45%', label: 'Ahorro de Costos de Servidores', detail: 'Consolidación de hardware y eliminación de licencias redundantes' }
    ],
    verificationNote: 'Auditoría de rendimiento posterior verificada con éxito y continuidad operativa sostenida.'
  },
  {
    id: 'distribuidora',
    category: 'Business Intelligence & Data',
    title: 'Dashboard Ejecutivo de Inteligencia de Negocios (BI)',
    organization: 'Empresa Distribuidora Regional',
    challenge: 'Información crítica de ventas, stock y cobranzas fragmentada en múltiples archivos de Excel sin sincronización, generando demoras de hasta 10 días para obtener cierres contables y decisiones comerciales a ciegas.',
    solution: 'Implementación de un Data Warehouse en PostgreSQL alimentado por pipelines automáticos de sincronización en Python y visualización ejecutiva en Metabase con actualización cada 15 minutos.',
    technologies: ['PostgreSQL', 'Metabase', 'Python', 'SQL Avanzado', 'ETL Pipelines', 'Power BI'],
    metrics: [
      { value: '15 min', label: 'Latencia de Actualización', detail: 'De reportes manuales semanales a datos casi en tiempo real' },
      { value: '100%', label: 'Visibilidad de Cartera Morosa', detail: 'Detección inmediata de alertas crediticias por cliente' },
      { value: '+28%', label: 'Rotación de Inventario', detail: 'Optimización de compras con proyección analítica' }
    ],
    verificationNote: 'Tablero en uso diario por gerencia general y equipo de finanzas.'
  },
  {
    id: 'industrial',
    category: 'Desarrollo de Software & UI/UX',
    title: 'Sistema Web de Gestión & Integración con Odoo ERP',
    organization: 'Empresa de Servicios Industriales',
    challenge: 'Procesos de cotización, partes de trabajo en terreno y certificaciones técnicas gestionados en papel y correos cruzados, provocando errores en compras y facturación demorada.',
    solution: 'Desarrollo de portal corporativo con interfaz responsiva en Next.js y Tailwind CSS integrado bidireccionalmente con Odoo ERP para registrar órdenes técnicas y órdenes de compra con firma digital.',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Odoo ERP', 'Docker'],
    metrics: [
      { value: '3.2x', label: 'Velocidad de Cierre de Órdenes', detail: 'Carga instantánea de partes técnicos desde obra' },
      { value: '0%', label: 'Errores de Facturación Cruzada', detail: 'Validación automática contra catálogo de Odoo ERP' },
      { value: '100%', label: 'Adopción del Personal Operativo', detail: 'Interfaz limpia sin curvas de aprendizaje complejas' }
    ],
    verificationNote: 'Despliegue integral con alta disponibilidad y respaldo de datos transaccionales.'
  },
  {
    id: 'sector-publico-agtech',
    category: 'Gobierno Abierto & Bioeconomía',
    title: 'Trazabilidad y Gestión de Impacto en Redes Productivas',
    organization: 'Iniciativas de Bioeconomía y Economía Social',
    challenge: 'Falta de herramientas abiertas para auditar procesos productivos, certificar buenas prácticas y coordinar cooperativas en economías regionales.',
    solution: 'Arquitectura de software soberana con bases de datos relacionales abiertas y portales de trazabilidad que conectan productores, organismos de control y consumidores finales sin vendor lock-in.',
    technologies: ['PostgreSQL', 'Supabase', 'Docker', 'Next.js', 'Python', 'API REST'],
    metrics: [
      { value: '100%', label: 'Soberanía de Datos', detail: 'Cero ataduras a proveedores cerrados de software' },
      { value: 'Auditable', label: 'Trazabilidad de Cadena', detail: 'Registro inmutable de procesos productivos y origen' },
      { value: 'Abierto', label: 'Código y Estándares Libres', detail: 'Mantenible a 10 años por equipos locales' }
    ],
    verificationNote: 'Implementado con enfoque en sustentabilidad y transferencia de capacidades.'
  }
];

export const SECTOR_SOLUTIONS: SectorItem[] = [
  {
    number: '01',
    title: 'Para Empresas y Sector Corporativo',
    subtitle: 'Eficiencia, automatización y comercio B2B de alto impacto',
    pillars: [
      {
        title: 'Arquitectura de Software a Medida',
        description: 'Desarrollo de plataformas web modernas y aplicaciones descentralizadas optimizadas para rendimiento, seguridad y tolerancia a fallos.'
      },
      {
        title: 'Integración y ERPs Escalables (Odoo)',
        description: 'Implementación y despliegue avanzado de Odoo ERP para unificar finanzas, operaciones, trazabilidad y canales de venta B2B sin fricciones.'
      },
      {
        title: 'Optimización de Infraestructura',
        description: 'Servidores autogestionados, contenedores Docker y entornos de alta disponibilidad listos para soportar picos de demanda operativa.'
      }
    ]
  },
  {
    number: '02',
    title: 'Para el Estado y Sector Público',
    subtitle: 'Transparencia, soberanía tecnológica y eficiencia operativa',
    pillars: [
      {
        title: 'Gobierno Abierto y Trazabilidad',
        description: 'Desarrollo de sistemas orientados a la gestión de datos públicos, trazabilidad de cadenas productivas y control de procesos complejos.'
      },
      {
        title: 'Modernización del Estado',
        description: 'Reducción de burocracia mediante flujos de trabajo automatizados, portales institucionales autogestionables y ciberseguridad aplicada.'
      },
      {
        title: 'Soberanía Tecnológica',
        description: 'Arquitecturas abiertas y auditables que reducen la dependencia de proveedores cerrados y garantizan la continuidad operativa a largo plazo.'
      }
    ]
  },
  {
    number: '03',
    title: 'Tercer Sector y Economía Social',
    subtitle: 'Articulación comunitaria, bioeconomía y sostenibilidad regional',
    pillars: [
      {
        title: 'Plataformas de Articulación Comunitaria',
        description: 'Herramientas digitales diseñadas para conectar redes de colaboración, gestionar recursos y medir el impacto ambiental y social.'
      },
      {
        title: 'Proyectos de Bioeconomía y AgTech',
        description: 'Soluciones especializadas para la trazabilidad de cultivos, gestión de cooperativas y modelos de desarrollo sostenible en la Patagonia y el país.'
      },
      {
        title: 'Transferencia de Capacidades',
        description: 'Capacitación pragmática de equipos locales para garantizar la autogestión y soberanía de los sistemas implementados.'
      }
    ]
  }
];

export const FAQS_DATA = [
  {
    question: '¿En qué modalidades de contratación trabajás?',
    answer: 'Ofrezco tres modalidades principales: Consultoría por Proyecto (con alcance, entregables y plazos cerrados), Dirección Tecnológica Fraccional (CTO / Arquitecto de Software externo por horas mensuales para acompañar a tu equipo directivo), y Mantenimiento / Administración de Infraestructura continua con acuerdos de nivel de servicio.'
  },
  {
    question: '¿Trabajás con clientes fuera de Chubut o de forma remota?',
    answer: 'Sí, la base de operaciones está en Chubut, Patagonia Argentina, y brindo consultoría técnica remota para organizaciones en todo el país y a nivel internacional. Mantenemos comunicación fluida mediante reuniones sincrónicas de trabajo y repositorios colaborativos.'
  },
  {
    question: '¿Qué diferencia a tu consultoría de una agencia de desarrollo tradicional?',
    answer: 'Tratas directamente con un arquitecto senior con más de 10 años en producción (y más de 30 años de visión de sistemas). No hay intermediarios comerciales ni desarrolladores junior no supervisados. Mi enfoque prioriza la economía real: código limpio, arquitectura desacoplada y soberanía de datos sin generar dependencias artificiales de licencias caras.'
  },
  {
    question: '¿Podemos migrar un sistema antiguo o infraestructura legacy sin detener la operación?',
    answer: 'Absolutamente. Es una de mis especialidades. Diseñamos planes de migración con conmutación controlada en horarios no críticos, replicación previa de datos transaccionales y planes de contingencia inmediata para garantizar cero pérdida de transacciones y mínima o nula afectación a usuarios.'
  }
];
