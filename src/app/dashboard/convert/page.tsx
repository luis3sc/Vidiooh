'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
// Importamos iconos adicionales para la alerta (Thermometer, Cpu)
import { Upload, Video, Zap, X, FileVideo, Download, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock, Ban, Sparkles, FileWarning, Cloud, CloudOff, Radio, Cpu, Thermometer } from 'lucide-react'
import { useFFmpeg } from '../../../hooks/useFFmpeg'
import { fetchFile } from '@ffmpeg/util'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FeedbackButton from '../../../components/FeedbackButton'
import { useKeepAlive } from '../../../hooks/useKeepAlive'
// 1. IMPORTAR EL NUEVO HOOK DE HARDWARE
import { useHardwareCheck } from '../../../hooks/useHardwareCheck'

// --- CONSTANTES DE LÍMITES (EN BYTES) ---
const PLAN_SIZE_LIMITS: Record<string, number> = {
    FREE: 15 * 1024 * 1024,      
    PRO: 30 * 1024 * 1024,       
    CORPORATE: 60 * 1024 * 1024  
}

type ModalType = 'error' | 'limit' | 'banned' | null

interface FeedbackModalProps {
    type: ModalType
    isOpen: boolean
    onClose: () => void
    data?: { used?: number, limit?: number, maxFileSize?: string }
}

const FeedbackModal = ({ type, isOpen, onClose, data }: FeedbackModalProps) => {
    if (!isOpen || !type) return null

    const content = {
        error: {
            icon: <FileWarning size={48} className="text-red-500" />,
            title: "Archivo demasiado pesado",
            description: `Tu plan actual solo permite videos de hasta ${data?.maxFileSize || '15MB'}. Para procesar archivos más grandes, mejora tu membresía.`,
            buttonText: "Entendido, subiré otro",
            buttonColor: "bg-slate-800 hover:bg-slate-700 text-white",
            action: onClose
        },
        limit: {
            icon: <Sparkles size={48} className="text-yellow-400 animate-pulse" />,
            title: "Límite del Plan Alcanzado",
            description: `Has consumido ${data?.used}/${data?.limit} conversiones de tu plan este mes. ¡No detengas tu flujo de trabajo!`,
            extra: (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 my-4 text-left text-sm text-slate-300">
                    <p className="flex items-center gap-2 mb-2"><CheckCircle2 size={16} className="text-vidiooh"/> Aumentar Capacidad</p>
                    <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-vidiooh"/> Historial Extendido</p>
                </div>
            ),
            buttonText: "Mejorar mi Plan",
            buttonColor: "bg-vidiooh hover:bg-vidiooh-dark text-black font-bold",
            action: () => window.location.href = '/dashboard/pricing'
        },
        banned: {
            icon: <Ban size={48} className="text-red-500" />,
            title: "Cuenta Suspendida",
            description: "Tu cuenta ha sido restringida por incumplimiento de políticas o falta de pago.",
            buttonText: "Contactar Soporte",
            buttonColor: "bg-red-600 hover:bg-red-700 text-white",
            action: () => window.location.href = '/banned'
        }
    }

    const current = content[type]

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f141c] border border-slate-800 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-900 rounded-full border border-slate-800 shadow-lg">
                        {current.icon}
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{current.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {current.description}
                </p>

                {/* @ts-ignore */}
                {current.extra}

                <button 
                    onClick={current.action}
                    className={`w-full py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ${current.buttonColor}`}
                >
                    {current.buttonText}
                </button>

                {(type === 'limit' || type === 'error') && (
                    <button onClick={onClose} className="mt-4 text-xs text-slate-500 hover:text-white underline">
                        {(type === 'error' && data?.maxFileSize !== '60MB') ? 'Ver Planes Pro' : 'Quizás más tarde'}
                    </button>
                )}
            </div>
        </div>
    )
}

// --- PÁGINA PRINCIPAL ---

const PROCESSING_STEPS = [
  "Iniciando motor...",
  "Calculando duración...",
  "Ajustando velocidad...",
  "Redimensionando...",
  "Eliminando audio...",
  "Subiendo a la nube...",
  "Guardando registro..."
]

const getOrientation = (w: number, h: number) => {
  if (w > h) return 'horizontal'
  if (h > w) return 'vertical'
  return 'square'
}

export default function ConvertPage() {
  const { ffmpeg, load, loaded, isLoading: isEngineLoading } = useFFmpeg()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formats, setFormats] = useState<any[]>([])
  const [formatsLoading, setFormatsLoading] = useState(true)
  const [selectedFormatId, setSelectedFormatId] = useState<string>('')
  const [duration, setDuration] = useState(7)
  const [campaignName, setCampaignName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [shouldSaveToCloud, setShouldSaveToCloud] = useState(false)
  
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [currentSizeLimit, setCurrentSizeLimit] = useState<number>(PLAN_SIZE_LIMITS.FREE)

  const [videoMeta, setVideoMeta] = useState<{ w: number, h: number, orientation: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [finalOutputName, setFinalOutputName] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  
  const [modalType, setModalType] = useState<ModalType>(null)
  const [modalData, setModalData] = useState<{ used?: number, limit?: number, maxFileSize?: string }>({})

  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  const isBackgroundSafe = useKeepAlive(isProcessing)
  
  // 2. USAR EL HOOK DE HARDWARE
  const { isLowSpec } = useHardwareCheck()

  useEffect(() => { load() }, [])

  // Carga inicial
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('custom_formats').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      if (data && data.length > 0) {
        const customMapped = data.map(f => ({
          id: f.id, label: f.label, w: f.width, h: f.height, orientation: getOrientation(f.width, f.height)
        }))
        setFormats(customMapped)
        setSelectedFormatId(customMapped[0].id)
      }
      setFormatsLoading(false)

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, teams(plan_type)')
        .eq('id', user.id)
        .single()
      
      // @ts-ignore
      const actualPlan = profile?.teams?.plan_type || profile?.plan_type || 'FREE'
      setUserPlan(actualPlan)
      
      const limit = PLAN_SIZE_LIMITS[actualPlan] || PLAN_SIZE_LIMITS.FREE
      setCurrentSizeLimit(limit)
    }
    initData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isProcessing) {
      setCurrentStep(0)
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev))
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isProcessing])

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
            setModalData({ maxFileSize: `${(currentSizeLimit / 1024 / 1024).toFixed(0)}MB` })
            setModalType('error') 
            return 
        }
    }

    if (acceptedFiles?.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setVideoUrl(null)
      const videoEl = document.createElement('video')
      videoEl.preload = 'metadata'
      videoEl.src = URL.createObjectURL(selectedFile)
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src)
        const w = videoEl.videoWidth
        const h = videoEl.videoHeight
        setVideoMeta({ w, h, orientation: getOrientation(w, h) })
      }
    }
  }, [currentSizeLimit])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    maxFiles: 1,
    maxSize: currentSizeLimit 
  })

  const selectedFormat = formats.find(f => f.id === selectedFormatId)
  const isOrientationMismatch = React.useMemo(() => {
    if (!videoMeta || !selectedFormat) return false
    if (videoMeta.orientation === 'vertical' && selectedFormat.orientation === 'horizontal') return true
    if (videoMeta.orientation === 'horizontal' && selectedFormat.orientation === 'vertical') return true
    return false
  }, [videoMeta, selectedFormat])

  const getFormattedDate = () => {
    const now = new Date()
    const d = (n: number) => n.toString().padStart(2, '0')
    return `${d(now.getDate())}-${d(now.getMonth() + 1)}-${now.getFullYear()}_${d(now.getHours())}-${d(now.getMinutes())}`
  }

  const handleProcess = async () => {
    if (!file || !ffmpeg || formats.length === 0 || isOrientationMismatch) return
    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay usuario autenticado")

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, plan_type, teams(plan_type)')
        .eq('id', user.id)
        .single()

      if (profile && profile.status === 'banned') {
          setModalType('banned') 
          setIsProcessing(false)
          return 
      }

      // @ts-ignore
      const actualPlan = profile?.teams?.plan_type || profile?.plan_type || 'FREE'

      const PLAN_LIMITS: Record<string, number> = {
          FREE: 6,
          PRO: 45,
          CORPORATE: 999999 
      }

      if (actualPlan !== 'CORPORATE') {
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1) 
          
          const { count } = await supabase
            .from('conversion_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString()) 

          const monthlyLimit = PLAN_LIMITS[actualPlan] || 6
          const used = count || 0

          if (used >= monthlyLimit) {
              setIsProcessing(false) 
              setModalData({ used, limit: monthlyLimit })
              setModalType('limit')
              return 
          }
      }

      await ffmpeg.writeFile('input.mp4', await fetchFile(file))
      
      const format = formats.find(f => f.id === selectedFormatId) || formats[0]
      const safeW = format.w % 2 === 0 ? format.w : format.w - 1
      const safeH = format.h % 2 === 0 ? format.h : format.h - 1

      const tempVideo = document.createElement('video')
      tempVideo.src = URL.createObjectURL(file)
      await new Promise((resolve) => { tempVideo.onloadedmetadata = () => resolve(true) })
      const ptsFactor = duration / (tempVideo.duration || 10)

      await ffmpeg.exec([
        '-i', 'input.mp4', '-vf', `scale=${safeW}:${safeH},setsar=1:1,setpts=${ptsFactor}*PTS`,
        '-an', '-c:v', 'libx264', '-preset', 'ultrafast', 'output.mp4'
      ])

      const data = await ffmpeg.readFile('output.mp4')
      const outputBlob = new Blob([data as any], { type: 'video/mp4' })
      const localBlobUrl = URL.createObjectURL(outputBlob)
      const finalName = `${campaignName ? campaignName.trim().replace(/\s+/g, '_') : file.name.replace(/\.[^/.]+$/, "")}_${duration}s_${format.label.replace(/\s/g, '')}_${getFormattedDate()}.mp4`
      setFinalOutputName(finalName)

      let storagePath = null
      if (shouldSaveToCloud) {
          storagePath = `${user.id}/${Date.now()}_${finalName}`
          const { error: uploadError } = await supabase.storage
              .from('raw-videos')
              .upload(storagePath, outputBlob, { contentType: 'video/mp4', upsert: false })
          if (uploadError) throw uploadError
      }

      const { error: dbError } = await supabase.from('conversion_logs').insert({
          user_id: user.id, 
          original_name: finalName, 
          output_format: format.label, 
          duration: duration, 
          file_size: outputBlob.size, 
          file_path: storagePath
      })
      if (dbError) throw dbError

      setVideoUrl(localBlobUrl) 
      setIsProcessing(false)
      
    } catch (error) {
      console.error("Error:", error)
      alert('Error inesperado: ' + (error as any).message) 
      setIsProcessing(false)
    }
  }

  const handleDownloadAndClose = () => {
    if (downloadLinkRef.current) downloadLinkRef.current.click()
    setTimeout(() => { setVideoUrl(null); setFile(null); setCampaignName(''); setFinalOutputName(''); setVideoMeta(null); }, 1500)
  }

  const handleClose = () => { setVideoUrl(null); setFile(null); setFinalOutputName(''); setVideoMeta(null); }

  const ConvertButton = ({ mobile = false }) => (
    <button 
        onClick={handleProcess} 
        disabled={!file || !loaded || formats.length === 0 || isOrientationMismatch} 
        className={`
            w-full rounded-full font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg
            ${mobile ? 'py-4 text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'mt-4 lg:mt-6 py-3 lg:py-4 text-base lg:text-lg'}
            ${(file && loaded && formats.length > 0 && !isOrientationMismatch) 
                ? 'bg-vidiooh hover:bg-vidiooh-dark text-black cursor-pointer transform active:scale-95' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
        `}
    >
       {formats.length === 0 ? <Lock size={20}/> : <Video size={20} />}
       {formats.length === 0 ? "CREA UN FORMATO" : "PROCESAR VIDEO"}
    </button>
  )

  // COMPONENTE DE ALERTA PARA PC LENTA
  const LowSpecAlert = () => {
    if (!isLowSpec) return null;
    return (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <Thermometer size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
                <h4 className="text-amber-200 text-xs font-bold uppercase tracking-wide mb-1">Recomendación de Rendimiento</h4>
                <p className="text-amber-100/70 text-[11px] leading-tight">
                    Detectamos recursos limitados en tu equipo. Para evitar errores o lentitud:
                </p>
                <ul className="list-disc list-inside text-[10px] text-amber-100/60 mt-1 space-y-0.5">
                    <li>Cierra otras pestañas o programas pesados.</li>
                    <li>No minimices esta ventana mientras procesa.</li>
                </ul>
            </div>
        </div>
    )
  }

  const minDuration = 7
  const maxDuration = 14
  const progressPercent = ((duration - minDuration) / (maxDuration - minDuration)) * 100

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-32 md:pb-0 relative">
      
      <FeedbackModal isOpen={!!modalType} type={modalType} onClose={() => setModalType(null)} data={modalData} />

      {/* --- MODAL DE CARGA (OVERLAY) --- */}
      {(isProcessing || videoUrl) && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-4">
          
          {isProcessing && !videoUrl && (
             <div className="absolute top-4 right-4 z-[110] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 animate-pulse backdrop-blur-md">
                <Radio size={12} className={isBackgroundSafe ? "animate-ping" : ""} />
                {isBackgroundSafe ? "Modo 2do Plano Activo" : "Procesando"}
             </div>
          )}

          {isProcessing && !videoUrl && (
            <div className="flex flex-col items-center max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
               <div className="relative w-28 h-28 md:w-32 md:h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#F04E30] border-r-[#F04E30] border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-vidiooh animate-pulse" size={36} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight text-center">Procesando Video</h2>
              <p className="text-vidiooh text-xs md:text-sm font-mono animate-pulse min-h-[20px] text-center px-4">
                {PROCESSING_STEPS[currentStep]}
              </p>
              
              {/* ALERTA EN PANTALLA DE CARGA TAMBIÉN SI ES LENTA */}
              {isLowSpec && (
                  <p className="mt-4 text-[10px] text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-900/50 flex items-center gap-2">
                      <Cpu size={10} /> Optimizando para tu equipo... no cierres la pestaña.
                  </p>
              )}

              <div className="w-3/4 md:w-full h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-vidiooh transition-all duration-1000 ease-linear" style={{ width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%` }} />
              </div>
            </div>
          )}

          {!isProcessing && videoUrl && (
            <div className="flex flex-col items-center w-full max-w-lg animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-vidiooh rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce">
                  <CheckCircle2 className="text-black" size={30} strokeWidth={3} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">¡Guardado en Historial!</h2>
              </div>
              <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 mb-8 relative group">
                <video src={videoUrl} controls autoPlay muted className="w-full aspect-video object-contain bg-slate-900" />
              </div>
              <div className="w-full space-y-3">
                <button onClick={handleDownloadAndClose} className="w-full bg-vidiooh hover:bg-vidiooh-dark text-black font-black text-base md:text-lg py-3 md:py-4 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Download size={22} strokeWidth={2.5} /> DESCARGAR AHORA
                </button>
                <a ref={downloadLinkRef} href={videoUrl} download={finalOutputName} className="hidden" />
                <button onClick={handleClose} className="w-full text-slate-500 hover:text-white text-xs md:text-sm font-medium py-2 transition-colors">
                  Cerrar y convertir otro
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Procesador de Video 🎥</h1>
        <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-2">
           {isEngineLoading 
             ? <span className="text-amber-400 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Cargando motor...</span> 
             : <span className="text-vidiooh flex items-center gap-1"><CheckCircle2 size={12}/> Motor Listo</span>
           }
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* COLUMNA IZQUIERDA: DROPZONE */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col h-full">
            <div 
              {...getRootProps()} 
              className={`
                flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden
                min-h-[220px] p-4 lg:min-h-[400px] lg:p-8
                ${isDragActive ? 'border-vidiooh bg-vidiooh/10 scale-[0.98]' : ''}
                ${isOrientationMismatch ? 'border-red-500/50 bg-red-500/5 hover:border-red-500' : 'border-slate-700 hover:border-vidiooh/50 hover:bg-[#151921]'}
              `}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-vidiooh/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <FileVideo className="text-vidiooh" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[250px]">{file.name}</h3>
                  {videoMeta && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 font-mono">{videoMeta.w}x{videoMeta.h}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${videoMeta.orientation === 'vertical' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>{videoMeta.orientation}</span>
                      </div>
                  )}
                  <p className="text-emerald-400 text-xs font-medium mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setVideoMeta(null); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs transition-colors flex items-center gap-2 mx-auto hover:text-white"><X size={14} /> Cambiar</button>
                </div>
              ) : (
                <div className="text-center group">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-[#1A202C] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xl group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Upload className="text-vidiooh" size={28} />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold text-white mb-1">Cargar Video</h3>
                  <p className="text-vidiooh text-sm font-medium mb-2 lg:mb-4 group-hover:underline decoration-2 underline-offset-4">Toca para explorar</p>
                  <p className="text-slate-500 text-xs">Máx. {(currentSizeLimit / 1024 / 1024).toFixed(0)}MB (.mp4)</p>
                </div>
              )}
            </div>

            {isOrientationMismatch && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <Ban className="text-red-500 shrink-0 mt-0.5" size={20}/>
                    <div>
                        <h4 className="text-red-200 font-bold text-sm">Formato Incompatible</h4>
                        <p className="text-red-400/80 text-xs mt-1">Estás intentando convertir un video <strong className="uppercase">{videoMeta?.orientation}</strong> a un formato <strong className="uppercase">{selectedFormat?.orientation}</strong>.</p>
                    </div>
                </div>
            )}

            <div className="hidden md:block mt-6">
                {/* 3. AÑADIMOS LA ALERTA ANTES DEL BOTÓN DE ESCRITORIO */}
                <LowSpecAlert />
                <ConvertButton />
            </div>
        </div>

        {/* COLUMNA DERECHA: CONFIGURACIÓN */}
        <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
           <div className="space-y-2">
            <label className="text-xs lg:text-sm font-bold text-white ml-1">Nombre de la Campaña</label>
            <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Ej. Promo Verano" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#F04E30] outline-none transition-all focus:bg-[#0f141c]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs lg:text-sm font-bold text-white ml-1 flex justify-between">
                <span>Formato de Salida (px)</span>
                {formatsLoading && <span className="flex items-center gap-1 text-slate-500"><Loader2 size={10} className="animate-spin"/> Cargando...</span>}
            </label>
            
            {!formatsLoading && formats.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24}/>
                    <p className="text-amber-200 font-bold text-sm mb-1">Sin formatos configurados</p>
                    <p className="text-amber-500/80 text-xs mb-3">Debes crear al menos un formato para convertir videos.</p>
                    <Link href="/dashboard/formats" className="inline-flex items-center gap-2 bg-amber-500 text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">Crear Formato <ArrowRight size={12}/></Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {formats.map((fmt) => {
                        let isFormatIncompatible = false
                        if (videoMeta) {
                            if (videoMeta.orientation === 'vertical' && fmt.orientation === 'horizontal') isFormatIncompatible = true
                            if (videoMeta.orientation === 'horizontal' && fmt.orientation === 'vertical') isFormatIncompatible = true
                        }
                        return (
                            <button
                            key={fmt.id}
                            onClick={() => setSelectedFormatId(fmt.id)}
                            className={`flex items-center justify-center px-3 py-3 rounded-lg text-xs lg:text-sm font-medium transition-all border relative overflow-hidden
                                ${selectedFormatId === fmt.id 
                                    ? (isFormatIncompatible ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-vidiooh text-black border-vidiooh shadow-[0_0_15px_rgba(34,197,94,0.3)]')
                                    : (isFormatIncompatible ? 'bg-[#1A202C] text-slate-500 border-slate-700 opacity-50' : 'bg-[#1A202C] text-slate-300 border-slate-700 hover:border-slate-500')
                                }
                            `}
                            >
                            <span className="z-10 font-medium">{fmt.label}</span>
                            {isFormatIncompatible && selectedFormatId === fmt.id && (
                                <span className="absolute inset-0 bg-red-500/10 flex items-center justify-center"><Ban size={24} className="text-red-500/50 rotate-45"/></span>
                            )}
                            </button>
                        )
                    })}
                    </div>
                    <p className="text-[10px] text-slate-500 text-right pt-1"><Link href="/dashboard/formats" className="hover:text-emerald-500 transition-colors">+ Gestionar Formatos</Link></p>
                </>
            )}
          </div>

          <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm lg:text-lg font-bold text-white">Duración</h3>
              <span className="text-xl font-bold text-vidiooh drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">{duration}s</span>
            </div>
            <div className="relative mb-1">
              <input 
                type="range" 
                min={minDuration} 
                max={maxDuration} 
                step="1" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))} 
                className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none accent-vidiooh bg-slate-700"
                style={{
                    background: `linear-gradient(to right, #F04E30 ${progressPercent}%, #334155 ${progressPercent}%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono"><span>7s</span><span>14s</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 transition-all hover:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shouldSaveToCloud ? 'bg-vidiooh/10 text-vidiooh' : 'bg-slate-800 text-slate-500'}`}>
                        {shouldSaveToCloud ? <Cloud size={18}/> : <CloudOff size={18}/>}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Guardar en Historial (Nube)</p>
                        <p className="text-[10px] text-slate-500">
                            {shouldSaveToCloud ? 'El video se guardará en tu cuenta.' : 'Solo se descargará localmente.'}
                        </p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shouldSaveToCloud} onChange={(e) => setShouldSaveToCloud(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vidiooh"></div>
                </label>
          </div>

        </div>
      </div>

      <div className="fixed bottom-[4rem] left-0 w-full z-40 md:hidden pointer-events-none">
          <div className="absolute bottom-0 w-full h-48 backdrop-blur-xl bg-gradient-to-t from-[#0f141c] via-[#0f141c] to-transparent [mask-image:linear-gradient(to_top,black_80%,transparent_100%)]"></div>
          <div className="relative w-full px-4 pb-6 pt-12 pointer-events-auto flex flex-col items-center">
              <div className="w-full max-w-md">
                 <div className="shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] rounded-full mb-2"> 
                    {/* 4. AÑADIMOS LA ALERTA ANTES DEL BOTÓN DE MÓVIL TAMBIÉN */}
                    <LowSpecAlert />
                    <ConvertButton mobile={true} />
                 </div>

                 <div className="flex justify-center">
                    <FeedbackButton mode="text" />
                 </div>
              </div>
          </div>
          
      </div>
    </div>
  )
}