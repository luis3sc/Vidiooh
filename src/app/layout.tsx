import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- CONFIGURACIÓN SEO Y METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL('https://vidiooh.com'),
  
  title: {
    default: 'Vidiooh | Optimización de Video para Pantallas LED y DOOH',
    template: '%s | Vidiooh' 
  },
  
  description: 'Plataforma estándar para Agencias y Operadores. Convierte, comprime y valida videos para pantallas LED gigantes, mupis y circuitos DOOH sin perder calidad.',
  
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
  
  authors: [{ name: 'Vidiooh Team' }],
  creator: 'Aylluk Technology',
  
  // ✅ ICONOS (Configuración correcta según tu carpeta public)
  icons: {
    icon: '/favicon.ico',                 
    shortcut: '/android-chrome-192x192.png', 
    apple: '/apple-touch-icon.png',       
  },
  
  openGraph: {
    title: 'Vidiooh - Automatiza tu tráfico digital',
    description: 'Deja de devolver materiales por formato incorrecto. Estandariza tus videos para pantallas LED en segundos.',
    url: 'https://vidiooh.com',
    siteName: 'Vidiooh',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'Vidiooh Dashboard Preview',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Vidiooh | Optimización DOOH',
    description: 'Convierte videos para pantallas LED en segundos.',
    images: ['/og-image.png'], 
  },
};

export const viewport: Viewport = {
  themeColor: '#0f141c', 
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
        
        {/* --- 1. MICROSOFT CLARITY --- */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uwvwbq90rm");
          `}
        </Script>

        {/* --- 2. DATOS ESTRUCTURADOS (SITELINKS JSON-LD) --- */}
        {/* Esto ayuda a Google a entender tus secciones clave (Login, Registro, etc.) */}
        <Script id="schema-sitelinks" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Vidiooh",
              "url": "https://vidiooh.com",
              "hasPart": [
                {
                  "@type": "WebPage",
                  "name": "Iniciar Sesión",
                  "description": "Accede a tu panel de control Vidiooh",
                  "url": "https://vidiooh.com/login"
                },
                {
                  "@type": "WebPage",
                  "name": "Crear Cuenta",
                  "description": "Regístrate gratis y empieza a optimizar",
                  "url": "https://vidiooh.com/register"
                },
                {
                  "@type": "WebPage",
                  "name": "Términos y Condiciones",
                  "description": "Nuestras políticas de uso",
                  "url": "https://vidiooh.com/terms"
                }
              ]
            }
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}