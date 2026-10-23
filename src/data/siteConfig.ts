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
  role: 'Arquitecto de Software & Consultor Tecnológico',
  location: 'Chubut, Patagonia Argentina · Proyectos Remotos Globales',
  domain: 'gastonbarea.com.ar',
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
    meetingTitle: 'Videollamada Google Meet Pro · Diagnóstico Técnico & Arquitectura',
  },

  whatsapp: {
    phoneNumber:
      getEnvVar('VITE_WHATSAPP_PHONE') ||
      '',
    defaultMessage:
      'Hola Gastón, estuve viendo tu sitio web (gastonbarea.com.ar) y me gustaría coordinar una videollamada por Google Meet Pro para evaluar nuestra infraestructura.',
  },

  presentationVideo: {
    youtubeId: 'L_LUpnjgPso',
    title: 'Nuevos Modelos de Negocio Digitales impulsados por Inteligencia y Stack Moderno',
    subtitle: 'Presentación ejecutiva sobre arquitectura escalable, resiliencia y operaciones autónomas con IA.',
    duration: '04:20 min',
    speaker: 'Gastón Barea · Software Architect',
    autoplay: true,
    autoAdvanceSeconds: 15, // Arranca el video y pasa solo al siguiente frame
    frame2: {
      type: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      badge: 'FRAME 02 · ECOSISTEMA & ARQUITECTURA',
      title: 'Topología Desacoplada: Edge Computing + Supabase + Agentes de IA',
      description:
        'Diseñamos infraestructuras resilientes donde el frontend carga en menos de 50ms a nivel global, y los procesos pesados de IA se orquestan en workers dedicados sin afectar la experiencia del cliente.',
      buttonText: 'Agendar Google Meet Pro (30 min)',
      buttonAction: 'schedule',
    },
  },
};
