import { Check, CheckCircle2 } from 'lucide-react'

export const PLANS_CONFIG = {
  FREE: {
    id: 'FREE',
    name: 'Freelance',
    description: 'Perfecto para empezar y probar.',
    price: 0,
    features: [
      { text: "6 videos al mes", included: true },
      { text: "Calidad HD (720p)", included: true },
      { text: "Videos limpios (Sin marca de agua)", included: true, highlight: true }, // Tu nueva regla
      { text: "2 Formatos guardados", included: true },
      { text: "Sin historial (Privacidad Local)", included: false }, // Feature negativa visualmente
    ],
    buttonText: "Comenzar Gratis",
    limits: {
        videos: 6,
        formats: 2,
        historyDays: 0
    }
  },
  PRO: {
    id: 'PRO',
    name: 'Agencia / Pro',
    description: 'Máxima potencia para uso diario.',
    isPopular: true,
    prices: {
        monthly: 50,    // Precio si paga mes a mes
        semiannual: 270, // Precio x 6 meses (45/mes)
        yearly: 480     // Precio x 1 año (40/mes)
    },
    features: [
      { text: "45 videos al mes 🔥", included: true, highlight: true },
      { text: "Calidad Full HD (1080p)", included: true },
      { text: "Videos limpios (Sin marca de agua)", included: true },
      { text: "8 Formatos Guardados", included: true },
      { text: "Historial Cloud (7 días / 8 videos)", included: true },
      { text: "Soporte Prioritario", included: true },
    ],
    buttonText: "Obtener PRO",
    limits: {
        videos: 45,
        formats: 8,
        historyDays: 7
    }
  }
}