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

export interface BookingSlotOption {
  id: string;
  label: string;
  value: string;
  tag: string;
  enabled: boolean;
}

export interface BookingAvailabilityConfig {
  notificationEmail: string;
  googleMeetUrl: string;
  enabledWeekdays: number[]; // 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  slots: BookingSlotOption[];
  blockedDates: string[]; // ['2026-11-20', ...]
}

export const DEFAULT_BOOKING_AVAILABILITY: BookingAvailabilityConfig = {
  notificationEmail: 'notificaciones@gastonbarea.com',
  googleMeetUrl: 'https://meet.google.com/gastonbarea-consultoria',
  enabledWeekdays: [1, 2, 3, 4, 5],
  slots: [
    {
      id: 'slot-0900',
      label: '09:00 hs',
      value: '09:00 - 09:45 (GMT-3)',
      tag: 'Mañana',
      enabled: false,
    },
    {
      id: 'slot-1000',
      label: '10:00 hs',
      value: '10:00 - 10:45 (GMT-3)',
      tag: 'Mañana',
      enabled: true,
    },
    {
      id: 'slot-1130',
      label: '11:30 hs',
      value: '11:30 - 12:15 (GMT-3)',
      tag: 'Mediodía',
      enabled: true,
    },
    {
      id: 'slot-1500',
      label: '15:00 hs',
      value: '15:00 - 15:45 (GMT-3)',
      tag: 'Tarde',
      enabled: true,
    },
    {
      id: 'slot-1700',
      label: '17:00 hs',
      value: '17:00 - 17:45 (GMT-3)',
      tag: 'Tarde',
      enabled: true,
    },
    {
      id: 'slot-1830',
      label: '18:30 hs',
      value: '18:30 - 19:15 (GMT-3)',
      tag: 'Última Hora',
      enabled: false,
    },
  ],
  blockedDates: [],
};

export const SITE_CONFIG: SiteConfig = {
  name: 'Gastón Barea',
  role: 'Consultor y Desarrollador de Proyectos de Base Tecnológica & Bioeconomía',
  location: 'Chubut, Patagonia Argentina · Dirección de Proyectos & Consultoría Global',
  domain: 'gastonbarea.com',
  email: 'notificaciones@gastonbarea.com',

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
      'https://meet.google.com/gastonbarea-consultoria',
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
    directVideoUrl:
      getEnvVar('VITE_DIRECT_VIDEO_URL') ||
      'https://pub-eae6e588df744c44ab3e62f36cc7875d.r2.dev/gemini_generated_video_05630b9d.mp4',
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
