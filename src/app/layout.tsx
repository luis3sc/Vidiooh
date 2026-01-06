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
  
  // ✅ CORRECCIÓN DE ICONOS SEGÚN TU CARPETA PUBLIC
  icons: {
    icon: '/favicon.ico',                 // Tienes este archivo
    shortcut: '/android-chrome-192x192.png', // Usamos este para Android/PC
    apple: '/apple-touch-icon.png',       // Usamos este para iPhone
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
        
        {/* --- MICROSOFT CLARITY --- */}
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