import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // ✅ NUEVO IMPORT PARA ANALYTICS
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- CONFIGURACIÓN SEO Y METADATA ---
export const metadata: Metadata = {
  // 1. URL Base (Obligatorio para que las imágenes de redes sociales funcionen)
  metadataBase: new URL('https://vidiooh.com'),
  
  // 2. Título Inteligente
  title: {
    default: 'Vidiooh | Optimización de Video para Pantallas LED y DOOH',
    template: '%s | Vidiooh' // Así tus otras páginas dirán "Login | Vidiooh"
  },
  
  // 3. Descripción Potente para Google
  description: 'Plataforma estándar para Agencias y Operadores. Convierte, comprime y valida videos para pantallas LED gigantes, mupis y circuitos DOOH sin perder calidad.',
  
  // 4. Palabras Clave (Keywords) - Lista Ampliada
  keywords: [
    'OOH', 
    'DOOH', 
    'Pantallas LED', 
    'Conversor Video', 
    'Publicidad Exterior Perú', 
    'Traffic Manager', 
    'Circuitos Digitales', 
    'Vallas Digitales', 
    'Novastar', 
    'JMT Outdoors', 
    'Punto Visual',
    'Clear Channel',
    'Pixel Perfect'
  ],
  
  // 5. Autores y Creador
  authors: [{ name: 'Vidiooh Team' }],
  creator: 'Aylluk Technology',
  
  // 6. Configuración de Iconos (Favicon Completo)
  // Asegúrate de tener los archivos en la carpeta /public
  icons: {
    icon: '/favicon.ico',        // Icono pequeño (Pestaña navegador)
    shortcut: '/icon.png',       // Icono accesos directos (Android)
    apple: '/icon.png',          // Icono para iPhone/iPad
  },
  
  // 7. Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: 'Vidiooh - Automatiza tu tráfico digital',
    description: 'Deja de devolver materiales por formato incorrecto. Estandariza tus videos para pantallas LED en segundos.',
    url: 'https://vidiooh.com',
    siteName: 'Vidiooh',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Imagen de 1200x630px en public/
        width: 1200,
        height: 630,
        alt: 'Vidiooh Dashboard Preview',
      },
    ],
  },

  // 8. Twitter Cards (Para X/Twitter)
  twitter: {
    card: 'summary_large_image',
    title: 'Vidiooh | Optimización DOOH',
    description: 'Convierte videos para pantallas LED en segundos.',
    images: ['/og-image.png'], // Reusa la misma imagen
  },
};

// --- VIEWPORT (Zoom y Colores) ---
export const viewport: Viewport = {
  themeColor: '#0f141c', // Color de la barra de estado en Android
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#020617] text-white antialiased`}>
        
        {/* --- MICROSOFT CLARITY (Optimizado para Next.js) --- */}
        {/* strategy="afterInteractive" asegura que no bloquee la carga inicial */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uwvwbq90rm");
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}