/**
 * Configuración centralizada de perfiles, canales de contacto y agenda técnica
 * Todos estos valores pueden ser sobreescritos fácilmente mediante variables de entorno (Vercel o .env)
 */

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
  };
  booking: {
    // Si tenés Calendly o Cal.com podés configurarlo aquí o en Vercel como VITE_CALENDLY_URL o VITE_CAL_COM_URL
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
    twitter:
      getEnvVar('VITE_TWITTER_URL') ||
      'https://x.com/gastonbarea',
  },

  booking: {
    calendlyUrl:
      getEnvVar('VITE_CALENDLY_URL') ||
      'https://calendly.com/gastonbarea/30min',
    calComUrl:
      getEnvVar('VITE_CAL_COM_URL') ||
      'https://cal.com/gastonbarea/30min',
    defaultDuration: '30 minutos',
    meetingTitle: 'Diagnóstico Técnico & Arquitectura de Software',
  },

  whatsapp: {
    phoneNumber:
      getEnvVar('VITE_WHATSAPP_PHONE') ||
      '', // Si está vacío, se usa wa.me/?text=... para que el usuario elija contacto o se complete con número de Gastón
    defaultMessage:
      'Hola Gastón, estuve viendo tu sitio web (gastonbarea.com.ar) y me gustaría coordinar una reunión de diagnóstico técnico para mi organización.',
  },

  presentationVideo: {
    youtubeId: 'L_LUpnjgPso', // ID predeterminado de YouTube (fácilmente personalizable)
    title: 'Nuevos Modelos de Negocio Digitales impulsados por Inteligencia y Stack Moderno',
    subtitle: 'Presentación ejecutiva sobre arquitectura escalable, resiliencia y operaciones autónomas con IA.',
    duration: '04:20 min',
    speaker: 'Gastón Barea · Software Architect',
  },
};

