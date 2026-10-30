/**
 * Configuración centralizada de perfiles, canales de contacto, agenda técnica y showcase
 * Todos estos valores pueden ser sobreescritos fácilmente mediante variables de entorno o desde el Panel de Control
 */

export interface Frame2Settings {
  type: 'image' | 'video';
  mediaUrl: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonAction: 'schedule' | 'diagnostico';
}

export interface SiteConfig {
  name: string;
  role: string;
  location: string;
  domain: string;
  email: string;
  social: {
    linkedin: string;
    github: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  booking: {
    googleMeetUrl: string;
    calendlyUrl: string;
    calComUrl: string;
    defaultDuration: string;
    meetingTitle: string;
  };
  whatsapp: {
    phoneNumber: string; // Formato internacional sin símbolos, ej: 5492804xxxxxx
    defaultMessage: string;
  };
  presentationVideo: {
    youtubeId: string;
    directVideoUrl?: string;
    videoFitMode?: 'cover' | 'contain';
    title: string;
    subtitle: string;
    duration: string;
    speaker: string;
    autoplay: boolean;
    autoAdvanceSeconds: number; // Segundos antes de pasar automáticamente al Frame 2
    frame2: Frame2Settings;
  };
}

const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // Ignore in non-vite runtimes
  }
  return undefined;
};

export const SITE_CONFIG: SiteConfig = {
  name: 'Gastón Barea',
  role: 'Consultor y Desarrollador de Proyectos de Base Tecnológica & Bioeconomía',
  location: 'Chubut, Patagonia Argentina · Dirección de Proyectos & Consultoría Global',
  domain: 'gastonbarea.com',
  email: 'gastonbarea.com@gmail.com',

  social: {
    linkedin:
      getEnvVar('VITE_LINKEDIN_URL') ||
      'https://www.linkedin.com/in/gastonbarea',
    github:
      getEnvVar('VITE_GITHUB_URL') ||
      'https://github.com/xpatagonia',
    youtube:
      getEnvVar('VITE_YOUTUBE_URL') ||
      'https://www.youtube.com/@gastonbarea',
    twitter:
      getEnvVar('VITE_TWITTER_URL') ||
      'https://x.com/gastonbarea',
    instagram:
      getEnvVar('VITE_INSTAGRAM_URL') ||
      'https://instagram.com/gastonbarea',
  },

  booking: {
    googleMeetUrl:
      getEnvVar('VITE_GOOGLE_MEET_URL') ||
      'https://meet.google.com/gb-consultoria-pro',
    calendlyUrl:
      getEnvVar('VITE_CALENDLY_URL') ||
      'https://calendly.com/gastonbarea/30min',
    calComUrl:
      getEnvVar('VITE_CAL_COM_URL') ||
      'https://cal.com/gastonbarea/30min',
    defaultDuration: '30 minutos (Google Meet Pro)',
    meetingTitle: 'Sesión Ejecutiva Google Meet Pro · Proyectos de Base Tecnológica & Bioeconomía',
  },

  whatsapp: {
    phoneNumber:
      getEnvVar('VITE_WHATSAPP_PHONE') ||
      '',
    defaultMessage:
      'Hola Gastón, estuve interactuando con tu Gemelo Digital en gastonbarea.com y me gustaría coordinar una reunión por Google Meet Pro para evaluar un proyecto.',
  },

  presentationVideo: {
    youtubeId: 'XVYUP8Pz-hE',
    directVideoUrl: getEnvVar('VITE_DIRECT_VIDEO_URL') || '',
    videoFitMode: 'cover',
    title: 'Proyectos de Base Tecnológica y Bioeconomía: De la Estrategia a la Ejecución Productiva',
    subtitle: '30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos estratégicos con clientes.',
    duration: '04:20 min',
    speaker: 'Gastón Barea · Consultor & Director de Proyectos',
    autoplay: true,
    autoAdvanceSeconds: 15,
    frame2: {
      type: 'image',
      mediaUrl: '',
      badge: 'Arquitectura · Bioeconomía · PMO',
      title: 'Ingeniería de Sistemas, Trazabilidad Bioindustrial y Dirección Ejecutiva',
      description:
        'Articulamos plataformas digitales B2B2C, ERP Odoo, inteligencia artificial e infraestructura crítica para escalar proyectos tecnológicos y bioeconómicos con retorno real.',
      buttonText: 'Agendar Google Meet Pro (30 min)',
      buttonAction: 'schedule',
    },
  },
};
