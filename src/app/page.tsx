'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, Video, Zap, FileVideo, CheckCircle2, 
  Crown, LayoutGrid, Monitor, ShieldCheck, ArrowRight, X, Briefcase, Loader2, Menu, HelpCircle, ChevronDown, Cpu 
} from 'lucide-react'

// --- CONSTANTE DE COLOR PARA ESTILOS EN LÍNEA (Slider) ---
const BRAND_HEX = '#F04E30'; 

// --- COMPONENTE LOGO SVG ---
const VidioohLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1366 369" className={className}>
    <g fill="#FFFFFF">
      <path d="M408.34,91.39h48.59l33.57,93.89c.7,1.88,2.58,9.39,5.63,22.53,3.05-13.14,5.16-20.66,5.87-22.53l33.33-93.89h48.59l-70.42,167.83h-34.74l-70.42-167.83Z"/>
      <path d="M595.88,143.5h40.84v115.72h-40.84v-115.72Z"/>
      <path d="M792.58,259.22h-37.56v-18.78c-10.33,15.49-23.24,23.24-39.2,23.24-31.92,0-53.28-23.47-53.28-62.2s21.59-61.73,51.87-61.73c19.01,0,30.04,5.63,40.37,23-.94-6.57-1.41-13.61-1.41-20.66v-60.56h39.2v177.69ZM729.67,172.37c-16.43,0-26.52,11.27-26.52,29.11s10.09,29.11,26.52,29.11,26.76-11.03,26.76-29.11-10.33-29.11-26.76-29.11Z"/>
      <path d="M824.03,143.5h40.84v115.72h-40.84v-115.72Z"/>
      <path d="M954.07,263.68c-36.85,0-64.55-27.93-64.55-61.97s27.93-61.97,64.55-61.97,64.78,27.7,64.78,61.97-28.17,61.97-64.78,61.97ZM954.07,173.78c-15.02,0-24.18,10.8-24.18,27.93s9.15,27.7,24.18,27.7,24.18-10.56,24.18-27.7-9.15-27.93-24.18-27.93Z"/>
      <path d="M1100.3,263.68c-36.85,0-64.55-27.93-64.55-61.97s27.93-61.97,64.55-61.97,64.78,27.7,64.78,61.97-28.17,61.97-64.78,61.97ZM1100.3,173.78c-15.02,0-24.18,10.8-24.18,27.93s9.15,27.7,24.18,27.7,24.18-10.56,24.18-27.7-9.15-27.93-24.18-27.93Z"/>
      <path d="M1188.55,81.53h40.14v62.44c0,7.04-.47,14.32-1.41,20.89,10.56-17.37,23.47-25.12,42.95-25.12,15.02,0,27.23,5.16,34.27,14.08,7.75,9.86,8.45,22.53,8.45,39.2v66.19h-40.84v-61.97c0-18.07-5.4-26.52-19.01-26.52-18.31,0-24.41,13.85-24.41,39.9v48.59h-40.14V81.53Z"/>
    </g>
    <polygon className="text-vidiooh" fill="currentColor" points="136.72 324.12 30.88 324.12 30.88 49.18 239.73 175.75 96.93 269.17 96.93 172.21 132.36 172.21 132.36 203.66 173.26 176.9 66.31 112.08 66.31 288.69 125.27 288.69 285.07 173.39 89.42 53.11 107.97 22.93 348.89 171.03 136.72 324.12"/>
  </svg>
)

// --- DATA DE PRECIOS ---
const PRICING_TIERS = {
  month: { price: 50, label: '/mes', note: 'Facturado mensualmente' },
  semiannual: { price: 270, label: '/semestre', note: 'Equivale a S/ 45/mes (Ahorras 10%)' },
  year: { price: 480, label: '/año', note: 'Equivale a S/ 40/mes (Ahorras 20%)' }
}

const PROCESSING_STEPS = [
  "Iniciando motor...",
  "Calculando duración...",
  "Ajustando velocidad...",
  "Redimensionando...",
  "Eliminando audio...",
  "Optimizando bitrate...",
  "Generando vista previa..."
]

export default function LandingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'month' | 'semiannual' | 'year'>('year')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [fakeFile, setFakeFile] = useState<File | null>(null)
  const [showRegisterGate, setShowRegisterGate] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [duration, setDuration] = useState(7)
  const [selectedFormat, setSelectedFormat] = useState('1280x720')

  const activePrice = PRICING_TIERS[billingCycle]

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFakeFile(acceptedFiles[0]),
    maxFiles: 1,
    noClick: false
  })

  // Animación de Carga
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSimulating) {
      setCurrentStep(0)
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < PROCESSING_STEPS.length - 1) {
            return prev + 1
          } else {
            clearInterval(interval)
            setTimeout(() => {
                setIsSimulating(false)
                setShowRegisterGate(true)
            }, 500)
            return prev
          }
        })
      }, 600)
    }
    return () => clearInterval(interval)
  }, [isSimulating])

  // Bloquear scroll del cuerpo
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  const handleProcessClick = () => {
    if (!fakeFile) return
    setIsSimulating(true)
  }

  const FORMATS = [
    { id: '1280x720', label: '1280 x 720' },
    { id: '1280x616', label: '1280 x 616' },
    { id: '1280x654', label: '1280 x 654' },
    { id: '1280x672', label: '1280 x 672' },
  ]

  // --- 1. DEFINICIÓN DE DATOS ESTRUCTURADOS SEO (JSON-LD) ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Vidiooh',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Plataforma de conversión y validación de video para pantallas publicitarias DOOH.',
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-vidiooh selection:text-black font-sans">
      
      {/* --- MODAL POPUP DE CARGA --- */}
      {isSimulating && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-4">
            <div className="flex flex-col items-center max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="relative w-28 h-28 md:w-32 md:h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-vidiooh border-r-vidiooh border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-vidiooh animate-pulse" size={36} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight text-center">Procesando Video</h2>
              <p className="text-vidiooh text-xs md:text-sm font-mono animate-pulse min-h-[20px] text-center px-4">
                {PROCESSING_STEPS[currentStep]}
              </p>
              <div className="w-3/4 md:w-full h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-vidiooh transition-all duration-300 ease-linear" style={{ width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%` }} />
              </div>
              <p className="text-slate-500 text-[10px] md:text-xs mt-4">No cierres esta pestaña</p>
            </div>
        </div>
      )}

      {/* --- MODAL POPUP DE REGISTRO --- */}
      {showRegisterGate && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 p-6 text-center">
            <div className="relative max-w-md w-full bg-[#0f141c] border border-vidiooh/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
                <button onClick={() => setShowRegisterGate(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <div className="w-20 h-20 bg-vidiooh rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px] shadow-vidiooh/40">
                  <CheckCircle2 className="text-white" size={40} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">¡Video Procesado!</h3>
                <p className="text-slate-300 mb-8 text-base">
                  Tu video está listo en <strong>Full HD</strong>. Crea tu cuenta gratuita para descargarlo sin marca de agua.
                </p>
                <Link href="/register" className="w-full">
                  <button className="w-full py-4 bg-vidiooh hover:bg-vidiooh-dark text-white font-black text-xl rounded-xl transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                    CREAR CUENTA GRATIS <ArrowRight size={24} />
                  </button>
                </Link>
                <p className="mt-6 text-sm text-slate-500">
                  Ya tienes cuenta? <Link href="/login" className="text-vidiooh hover:underline font-bold">Ingresa aquí</Link>
                </p>
            </div>
        </div>
      )}

      {/* --- NAVBAR RESPONSIVE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-50">
            <VidioohLogo className="h-8 md:h-10 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Ingresar
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-vidiooh hover:bg-vidiooh-dark text-white text-sm font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px] shadow-vidiooh/30">
              Regístrate Gratis
            </Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden relative z-[70] p-2 text-slate-300 hover:text-white transition-colors focus:outline-none">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-[#020617] z-[60] flex flex-col pt-24 px-6 h-screen w-screen animate-in slide-in-from-top-10 duration-200">
              <div className="flex flex-col gap-6 text-lg font-medium text-slate-300 border-b border-white/10 pb-6">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 flex items-center justify-between border-b border-slate-800/50">Características <ArrowRight size={16} className="opacity-50"/></a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 flex items-center justify-between border-b border-slate-800/50">Precios <ArrowRight size={16} className="opacity-50"/></a>
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-4 bg-[#151921] border border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all">Ingresar a mi cuenta</button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-4 bg-vidiooh hover:bg-vidiooh-dark text-black font-black text-lg rounded-xl shadow-[0_0_20px] shadow-vidiooh/30 transition-all flex items-center justify-center gap-2">Regístrate Gratis <Zap size={20} fill="black" /></button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-vidiooh/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center mb-12 relative z-10">
          <span className="inline-block px-3 py-1 bg-vidiooh/10 border border-vidiooh/20 text-vidiooh text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
            Nueva Versión 3.0
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Plataforma de Optimización <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vidiooh to-yellow-500">
              para DOOH y Pantallas LED
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            La solución estándar para <strong className="text-slate-200">Agencias</strong>, <strong className="text-slate-200">Retail Media</strong> y <strong className="text-slate-200">Operadores</strong>. 
            Exporta videos <strong>Pixel-Perfect</strong> sin barras negras ni errores de codec.
          </p>
        </div>

        {/* --- UI DEL CONVERTIDOR --- */}
        <div className="max-w-6xl mx-auto bg-[#0f141c] border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Procesador de Video 🎥</h1>
            <p className="text-slate-400 text-sm">Sube tu contenido y configura la campaña.</p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 relative">
            <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col h-full">
               <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden min-h-[220px] md:min-h-[280px] p-6 ${isDragActive ? 'border-vidiooh bg-vidiooh/5' : 'border-slate-700 hover:border-vidiooh/50 hover:bg-[#151921]'}`}>
                 <input {...getInputProps()} />
                 {fakeFile ? (
                   <div className="text-center animate-in zoom-in duration-300">
                     <div className="w-16 h-16 bg-vidiooh/20 rounded-full flex items-center justify-center mx-auto mb-3">
                       <FileVideo className="text-vidiooh" size={32} />
                     </div>
                     <h3 className="text-white font-bold mb-1 truncate max-w-[200px] mx-auto">{fakeFile.name}</h3>
                     <p className="text-vidiooh text-xs">Listo para procesar</p>
                     <p className="text-slate-500 text-[10px] mt-2">(Clic para cambiar)</p>
                   </div>
                 ) : (
                   <div className="text-center group">
                     <div className="w-16 h-16 bg-[#1A202C] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                       <Upload className="text-vidiooh" size={28} />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Cargar Video</h3>
                     <p className="text-vidiooh text-sm font-medium mb-2">Toca para explorar</p>
                     <p className="text-slate-500 text-xs">Soporta MP4, MOV, AVI</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
               <div className="space-y-2">
                <label className="text-xs lg:text-sm font-bold text-white ml-1">Nombre de la Campaña</label>
                <input type="text" placeholder="Ej. Promo Verano" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-vidiooh outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs lg:text-sm font-bold text-white ml-1">Formato de Salida (px)</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map((fmt) => (
                    <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)} className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs lg:text-sm font-medium transition-all border ${selectedFormat === fmt.id ? 'bg-vidiooh text-white border-vidiooh' : 'bg-[#1A202C] text-slate-300 border-slate-700 hover:border-slate-500'}`}>
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm lg:text-lg font-bold text-white">Duración</h3>
                  <span className="text-xl font-bold text-vidiooh drop-shadow-[0_0_8px_rgba(240,78,48,0.6)]">{duration}s</span>
                </div>
                
                <div className="relative mb-1">
                  <input 
                    type="range" min="7" max="14" step="1" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} 
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-vidiooh" 
                    style={{ background: `linear-gradient(to right, ${BRAND_HEX} ${((duration - 7) * 100) / 7}%, #334155 ${((duration - 7) * 100) / 7}%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono"><span>7s</span><span>14s</span></div>
                </div>
              </div>

              <button onClick={handleProcessClick} disabled={!fakeFile || isSimulating} className={`w-full py-4 rounded-full font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${!fakeFile ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-vidiooh hover:bg-vidiooh-dark text-white cursor-pointer hover:scale-[1.01] shadow-vidiooh/20'}`}>
                  {isSimulating ? <><Loader2 className="animate-spin" size={24} /> PROCESANDO...</> : <><Video size={24} /> PROCESAR VIDEO</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- BARRA DE CONFIANZA --- */}
      <div className="border-y border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden">
        <div className="py-10">
          <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
            La tecnología elegida por equipos de operaciones en
          </p>
          <div className="relative flex overflow-x-hidden group">
             <div className="absolute top-0 bottom-0 left-0 w-20 z-10 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none"></div>
             <div className="absolute top-0 bottom-0 right-0 w-20 z-10 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none"></div>
             <div className="flex animate-scroll whitespace-nowrap">
               {['JMT Outdoors', 'Clear Channel', 'Punto Visual', 'Alac OOH', 'Brapex', 'Cosas OOH', 'Latin American Outdoors'].map((brand, index) => (
                 <span key={index} className="mx-12 text-xl md:text-2xl font-black text-slate-500 opacity-50 uppercase tracking-widest hover:text-white hover:opacity-100 transition-all cursor-default select-none">{brand}</span>
               ))}
             </div>
             <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
               {['JMT Outdoors', 'Clear Channel', 'Punto Visual', 'Alac OOH', 'Brapex', 'Cosas OOH', 'Latin American Outdoors'].map((brand, index) => (
                 <span key={index} className="mx-12 text-xl md:text-2xl font-black text-slate-500 opacity-50 uppercase tracking-widest hover:text-white hover:opacity-100 transition-all cursor-default select-none">{brand}</span>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* --- COMPARATIVA CORREGIDA (GRIS vs VIDIOOH) --- */}
      <section className="py-20 px-6 bg-[#020617]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Deja de rechazar videos por "formato incorrecto"</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              El flujo tradicional de recepción de archivos es lento y frustrante. Vidiooh lo estandariza.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* LADO IZQUIERDO: EL PROBLEMA (Apagado / Gris) */}
            <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <X className="text-slate-500" /> Flujo Tradicional
              </h3>
              <ul className="space-y-4 border-l-2 border-slate-700 pl-6">
                <li className="text-slate-500 text-sm">❌ Cliente envía video por WeTransfer/Drive.</li>
                <li className="text-slate-500 text-sm">❌ Operaciones descarga y revisa manual.</li>
                <li className="text-slate-500 text-sm">❌ El video tiene bordes negros o pesa 500MB.</li>
                <li className="text-slate-500 text-sm">❌ Se envían correos de corrección.</li>
              </ul>
            </div>

            {/* LADO DERECHO: LA SOLUCIÓN (Color de Marca) */}
            <div className="bg-[#0f141c] border border-vidiooh/30 p-8 rounded-3xl relative shadow-[0_0_50px] shadow-vidiooh/10">
              <div className="absolute top-0 right-0 bg-vidiooh text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl">OPTIMIZADO</div>
              <h3 className="text-xl font-bold text-vidiooh flex items-center gap-2 mb-6">
                <CheckCircle2 className="text-vidiooh" /> Flujo Vidiooh
              </h3>
              <ul className="space-y-4">
                <li className="text-white text-sm flex gap-3">
                  <span className="bg-vidiooh/20 text-vidiooh w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Agencia sube el video a nuestra plataforma.
                </li>
                <li className="text-white text-sm flex gap-3">
                  <span className="bg-vidiooh/20 text-vidiooh w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Vidiooh ajusta automáticamente al pixel exacto de tu pantalla.
                </li>
                <li className="text-white text-sm flex gap-3">
                  <span className="bg-vidiooh/20 text-vidiooh w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  Recibes el archivo listo para descargar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Monitor size={24} />, title: "Pixel Perfect", desc: "Adaptación inteligente a la resolución nativa de tus gabinetes. Elimina barras negras y aprovecha el 100% de tu inventario LED." },
            { icon: <Cpu size={24} />, title: "Hardware Safe", desc: "Bitrate y encoding validados para controladores Novastar, Linsn y Colorlight. Evita bloqueos, lag y pantallas en negro." },
            { icon: <CheckCircle2 size={24} />, title: "Broadcast Ready", desc: "Estandariza tu recepción de archivos. Reduce el 'rebote' de correos y obtén videos listos para pautar al instante." }
          ].map((feature, i) => (
            <div key={i} className="bg-[#0f141c] border border-slate-800 p-8 rounded-2xl hover:border-slate-600 transition-colors group">
              <div className="w-12 h-12 bg-[#1A202C] rounded-lg flex items-center justify-center text-vidiooh mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-20 px-6 bg-[#020617] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Planes Flexibles</h2>
            <p className="text-slate-400 text-lg mb-8">Elige la potencia que necesitas para tu flujo de trabajo.</p>
            <div className="inline-flex bg-[#0f141c] p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {(['month', 'semiannual', 'year'] as const).map((cycle) => (
                <button key={cycle} onClick={() => setBillingCycle(cycle)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${billingCycle === cycle ? 'bg-vidiooh text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                  {cycle === 'month' ? 'Mensual' : cycle === 'semiannual' ? '6 Meses' : 'Anual'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* PLAN FREE */}
            <div className="bg-[#0f141c] border border-slate-800 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-slate-600 transition-all">
              <div className="mb-8"><h3 className="text-2xl font-bold text-white mb-2">Freelance</h3><p className="text-slate-400 text-sm">Perfecto para empezar y probar.</p></div>
              <div className="mb-8"><span className="text-4xl font-black text-white">S/ 0</span></div>
              <div className="space-y-4 mb-8 flex-1">
                {/* ✅ LÍMITE 15MB AQUÍ */}
                {["6 videos al mes", "Máx. 15MB por archivo", "Calidad HD (720p)", "Sin marca de agua (Limpio) ✨", "2 Formatos guardados", "Sin historial (Descarga inmediata)"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300 text-sm"><CheckCircle2 size={16} className="text-slate-500 shrink-0" />{item}</div>
                ))}
              </div>
              <Link href="/register"><button className="w-full py-3 border border-slate-700 hover:border-white text-white rounded-xl font-bold transition-colors">Comenzar Gratis</button></Link>
            </div>

            {/* PLAN PRO */}
            <div className="bg-[#0f141c] border border-vidiooh/50 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px] shadow-vidiooh/10 transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-vidiooh text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <div className="mb-8"><h3 className="text-2xl font-bold text-white mb-2">Agencia / Pro</h3><p className="text-vidiooh text-sm">Máxima potencia sin límites.</p></div>
              <div className="mb-8"><div className="flex items-end gap-2"><span className="text-4xl font-black text-white">S/ {activePrice.price}</span><span className="text-slate-500 font-medium mb-1">{activePrice.label}</span></div><p className="text-xs text-vidiooh mt-2 font-medium">{activePrice.note}</p></div>
              <div className="space-y-4 mb-8 flex-1">
                {/* ✅ LÍMITE 30MB AQUÍ */}
                {["Conversiones Ilimitadas 🔥", "Máx. 30MB por archivo", "Calidad Full HD (1080p)", "8 Presets Guardados", "Historial de 7 días", "Soporte Prioritario"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white text-sm"><CheckCircle2 size={16} className="text-vidiooh shrink-0" />{item}</div>
                ))}
              </div>
              <Link href="/register?plan=pro"><button className="w-full py-4 bg-vidiooh hover:bg-vidiooh-dark text-white rounded-xl font-black shadow-lg transition-transform hover:scale-[1.02]">Obtener Pro</button></Link>
            </div>
          </div>

          {/* PLAN CORPORATIVO */}
          <div className="bg-gradient-to-r from-slate-900 to-[#0f141c] border border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-5 pointer-events-none hidden lg:block">
                <Crown size={300} />
             </div>
             
             <div className="relative z-10 flex items-start gap-5">
               
               <div>
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Plan Corporativo / Agencias</h3>
                 <p className="text-slate-400 max-w-lg mb-4">¿Necesitas licencias por volumen (5+ usuarios) o marca blanca total con tu logo?</p>
                 {/* ✅ LÍMITE 60MB AQUÍ */}
                 <div className="flex gap-4 text-xs font-bold text-vidiooh uppercase tracking-wider">
                    <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Máx. 60MB / Video</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Formatos Ilimitados</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Marca Blanca</span>
                 </div>
               </div>
             </div>
             <a href="mailto:ventas@vidiooh.com" className="relative z-10 whitespace-nowrap px-8 py-4 bg-white hover:bg-slate-200 text-black font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xl">Contactar Ventas <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">Preguntas Frecuentes</h2>
        <div className="grid gap-6">
          {[
            { q: "¿Mis videos se suben a la nube?", a: "No en la versión gratuita. El procesamiento se realiza localmente en tu navegador para máxima privacidad y velocidad." },
            { q: "¿Qué formatos de pantalla soportan?", a: "Todos. Desde pantallas estándar 16:9 hasta formatos irregulares, cintillos (ribbons), tótems verticales y videowalls de gran formato." },
            { q: "¿Afecta la calidad del video?", a: "Al contrario. Optimizamos el bitrate para evitar el 'pixelado' en pantallas LED gigantes, manteniendo el peso del archivo ligero para los controladores Novastar." }
          ].map((faq, i) => (
            <div key={i} className="bg-[#0f141c] border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><HelpCircle size={18} className="text-vidiooh" /> {faq.q}</h3>
              <p className="text-slate-400 text-sm ml-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center md:text-left bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <VidioohLogo className="h-6 w-auto text-white" />
          </div>
          <div className="flex gap-8 text-xs text-slate-500 font-medium"><a href="/terms" className="hover:text-white">Términos y Condiciones</a><a href="/privacy" className="hover:text-white">Política de Privacidad</a><a href="/contact" className="hover:text-white">Contacto</a></div>
          <p className="text-[10px] text-slate-600">© 2025 Vidiooh. Tecnología de Aullyk.</p>
        </div>
      </footer>

      {/* --- 2. INYECCIÓN DEL SCRIPT SEO AL FINAL DEL DIV PRINCIPAL --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </div>
  )
}