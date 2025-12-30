🎥 Vidiooh - Client-Side Video Processor

**Vidiooh** es una plataforma SaaS moderna para la optimización y conversión de videos, diseñada específicamente para campañas de marketing. Permite a los usuarios ajustar formatos, duración y peso de archivos directamente desde el navegador, eliminando la necesidad de servidores costosos de procesamiento.

![Project Status](https://img.shields.io/badge/Status-Beta-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Características Principales

- **Procesamiento en el Cliente (Client-Side):** Utiliza `ffmpeg.wasm` para convertir videos usando la CPU del usuario, garantizando privacidad y reduciendo costos de servidor.
- **Multitarea Real:** Implementación de un sistema **"Keep Alive"** (Audio Hack + Wake Lock API) que permite procesar videos en segundo plano sin que el navegador congele la pestaña.
- **Detección de Hardware Inteligente:** Detecta automáticamente equipos de gama baja (pocos núcleos) y sugiere optimizaciones al usuario para evitar bloqueos.
- **Diseño Responsivo Adaptativo:**
  - **Móvil:** Interfaz simplificada con controles en el footer.
  - **Tablet/Desktop:** Interfaz completa tipo dashboard.
- **Gestión de Planes:** Límites de tamaño de archivo dinámicos (Free: 15MB, Pro: 30MB, Corporate: 60MB).
- **Historial en la Nube:** Integración con Supabase Storage para guardar y gestionar conversiones pasadas.
- **Feedback System:** Módulo integrado para reporte de bugs y sugerencias.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/), Lucide React (Iconos).
- **Core Engine:** [FFmpeg.wasm](https://ffmpegwasm.netlify.app/).
- **Backend / BaaS:** [Supabase](https://supabase.com/) (Auth, Database, Storage).
- **Gestión de Estado:** React Hooks personalizados (`useKeepAlive`, `useHardwareCheck`).