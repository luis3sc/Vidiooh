'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, Zap, X, FileVideo, Download, Loader2, CheckCircle2 } from 'lucide-react'
import { useFFmpeg } from '../../../hooks/useFFmpeg'
import { fetchFile } from '@ffmpeg/util'
import { createBrowserClient } from '@supabase/ssr'

// --- DEFAULTS ---
const DEFAULT_FORMATS = [
  { id: 'default_1', label: '1280 x 720', w: 1280, h: 720 },
  { id: 'default_2', label: '1280 x 616', w: 1280, h: 616 },
  { id: 'default_3', label: '1280 x 654', w: 1280, h: 654 },
  { id: 'default_4', label: '1280 x 672', w: 1280, h: 672 },
]

const PROCESSING_STEPS = [
  "Iniciando motor...",
  "Calculando duración...",
  "Ajustando velocidad...",
  "Redimensionando...",
  "Eliminando audio...",
  "Subiendo a la nube...",
  "Guardando registro..."
]

export default function ConvertPage() {
  const { ffmpeg, load, loaded, isLoading: isEngineLoading } = useFFmpeg()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formats, setFormats] = useState(DEFAULT_FORMATS)
  const [selectedFormatId, setSelectedFormatId] = useState('default_1')

  const [duration, setDuration] = useState(7)
  const [campaignName, setCampaignName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null) // Guardará el BLOB LOCAL
  const [finalOutputName, setFinalOutputName] = useState('')

  const [currentStep, setCurrentStep] = useState(0)
  
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => { load() }, [])

  // Cargar formatos personalizados
  useEffect(() => {
    const loadCustomFormats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('custom_formats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        const customMapped = data.map(f => ({
          id: f.id,
          label: f.label,
          w: f.width,
          h: f.height
        }))
        setFormats([...DEFAULT_FORMATS, ...customMapped])
      }
    }
    loadCustomFormats()
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0])
      setVideoUrl(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  })

  // --- FUNCIÓN HELPER PARA FECHA ---
  const getFormattedDate = () => {
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    // Retorna: 16-12-2025_14-30
    return `${day}-${month}-${year}_${hours}-${minutes}`
  }

  const handleProcess = async () => {
    if (!file || !ffmpeg) return
    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay usuario autenticado")

      await ffmpeg.writeFile('input.mp4', await fetchFile(file))
      
      const format = formats.find(f => f.id === selectedFormatId) || formats[0]

      const tempVideo = document.createElement('video')
      tempVideo.src = URL.createObjectURL(file)
      await new Promise((resolve) => { tempVideo.onloadedmetadata = () => resolve(true) })
      const inputDuration = tempVideo.duration || 10
      const ptsFactor = duration / inputDuration

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `scale=${format.w}:${format.h},setsar=1:1,setpts=${ptsFactor}*PTS`,
        '-an',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        'output.mp4'
      ])

      const data = await ffmpeg.readFile('output.mp4')
      const outputBlob = new Blob([data as any], { type: 'video/mp4' })
      
      // ---------------------------------------------------------
      // 1. GENERAMOS LA URL LOCAL (BLOB) - ¡ESTO AHORRA DINERO!
      // ---------------------------------------------------------
      // Esta URL apunta a la memoria RAM del usuario, no a Supabase.
      const localBlobUrl = URL.createObjectURL(outputBlob)
      
      // Construcción del nombre
      const timestamp = getFormattedDate()
      const baseName = campaignName 
        ? campaignName.trim().replace(/\s+/g, '_') 
        : file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_')
      const cleanResolution = format.label.replace(/\s/g, '')
      const finalName = `${baseName}_${duration}s_${cleanResolution}_${timestamp}.mp4`
      
      setFinalOutputName(finalName)

      // ---------------------------------------------------------
      // 2. SUBIDA SILENCIOSA (Para el Historial)
      // ---------------------------------------------------------
      // Subimos el archivo para que exista en el futuro, pero NO usamos 
      // su URL para la descarga inmediata.
      const storagePath = `${user.id}/${Date.now()}_${finalName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('raw-videos')
        .upload(storagePath, outputBlob, { contentType: 'video/mp4', upsert: false })

      if (uploadError) throw uploadError

      // Insertar en Base de Datos
      const { error: dbError } = await supabase
        .from('conversion_logs')
        .insert({
          user_id: user.id,
          original_name: finalName, 
          output_format: format.label,
          duration: duration,
          file_size: outputBlob.size,
          file_path: uploadData.path 
        })

      if (dbError) throw dbError

      // ---------------------------------------------------------
      // 3. ESTABLECEMOS EL VIDEO PARA DESCARGA
      // ---------------------------------------------------------
      // Usamos 'localBlobUrl' que creamos en el paso 1
      setVideoUrl(localBlobUrl) 
      setIsProcessing(false)
      
    } catch (error) {
      console.error("Error:", error)
      alert('Error: ' + (error as any).message)
      setIsProcessing(false)
    }
  }

  const handleDownloadAndClose = () => {
    // Esto activa el enlace oculto que tiene href={videoUrl} (el Blob local)
    if (downloadLinkRef.current) downloadLinkRef.current.click()
    
    setTimeout(() => {
      // Limpieza
      setVideoUrl(null)
      setFile(null)
      setCampaignName('')
      setFinalOutputName('')
    }, 1500)
  }

  const handleClose = () => {
    setVideoUrl(null)
    setFile(null)
    setFinalOutputName('')
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-8 md:pb-0 relative">
      
      {(isProcessing || videoUrl) && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-4">
          
          {isProcessing && !videoUrl && (
            <div className="flex flex-col items-center max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="relative w-28 h-28 md:w-32 md:h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#22c55e] border-r-[#22c55e] border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-[#22c55e] animate-pulse" size={36} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight text-center">Procesando Video</h2>
              <p className="text-[#22c55e] text-xs md:text-sm font-mono animate-pulse min-h-[20px] text-center px-4">
                {PROCESSING_STEPS[currentStep]}
              </p>
              <div className="w-3/4 md:w-full h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
                <div 
                  className="h-full bg-[#22c55e] transition-all duration-1000 ease-linear"
                  style={{ width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-slate-500 text-[10px] md:text-xs mt-4">No cierres esta pestaña</p>
            </div>
          )}

          {!isProcessing && videoUrl && (
            <div className="flex flex-col items-center w-full max-w-lg animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce">
                  <CheckCircle2 className="text-black" size={30} strokeWidth={3} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">¡Guardado en Historial!</h2>
                <p className="text-slate-400 text-xs md:text-sm">Video procesado con éxito.</p>
              </div>
              <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 mb-8 relative group">
                <video src={videoUrl} controls autoPlay muted className="w-full aspect-video object-contain bg-slate-900" />
              </div>
              <div className="w-full space-y-3">
                <button onClick={handleDownloadAndClose} className="w-full bg-[#22c55e] hover:bg-[#1db954] text-black font-black text-base md:text-lg py-3 md:py-4 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Download size={22} strokeWidth={2.5} /> DESCARGAR AHORA
                </button>
                {/* AQUÍ ESTÁ EL AHORRO DE BANDA ANCHA: 
                   href={videoUrl} apunta al Blob local, no a Supabase.
                */}
                <a ref={downloadLinkRef} href={videoUrl} download={finalOutputName} className="hidden" />
                <button onClick={handleClose} className="w-full text-slate-500 hover:text-white text-xs md:text-sm font-medium py-2 transition-colors">
                  Cerrar y convertir otro
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Procesador de Video 🎥</h1>
        <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-2">
           {isEngineLoading 
             ? <span className="text-amber-400 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Cargando motor...</span> 
             : <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Motor Listo</span>
           }
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col h-full">
            <div 
              {...getRootProps()} 
              className={`
                flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden
                min-h-[220px] p-4 lg:min-h-[400px] lg:p-8
                ${isDragActive ? 'border-[#22c55e] bg-[#22c55e]/10 scale-[0.98]' : 'border-slate-700 hover:border-[#22c55e]/50 hover:bg-[#151921]'}
              `}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-[#22c55e]/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <FileVideo className="text-[#22c55e]" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[250px]">{file.name}</h3>
                  <p className="text-emerald-400 text-xs font-medium mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs transition-colors flex items-center gap-2 mx-auto hover:text-white"><X size={14} /> Cambiar</button>
                </div>
              ) : (
                <div className="text-center group">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-[#1A202C] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xl group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Upload className="text-[#22c55e]" size={28} />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold text-white mb-1">Cargar Video</h3>
                  <p className="text-[#22c55e] text-sm font-medium mb-2 lg:mb-4 group-hover:underline decoration-2 underline-offset-4">Toca para explorar</p>
                  <p className="text-slate-500 text-xs">Máx. 50MB (.mp4)</p>
                </div>
              )}
            </div>

            <button onClick={handleProcess} disabled={!file || !loaded} className={`mt-4 lg:mt-6 w-full py-3 lg:py-4 rounded-full font-black text-base lg:text-lg tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${(file && loaded) ? 'bg-[#22c55e] hover:bg-[#1db954] text-black shadow-[#22c55e]/20 cursor-pointer transform hover:scale-[1.02] active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}>
               <Video size={20} /> PROCESAR VIDEO
            </button>
        </div>

        <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
           <div className="space-y-2">
            <label className="text-xs lg:text-sm font-bold text-white ml-1">Nombre de la Campaña</label>
            <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Ej. Promo Verano" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#22c55e] outline-none transition-all focus:bg-[#0f141c]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs lg:text-sm font-bold text-white ml-1">Formato de Salida (px)</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {formats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormatId(fmt.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs lg:text-sm font-medium transition-all border ${selectedFormatId === fmt.id ? 'bg-[#22c55e] text-black border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#1A202C] text-slate-300 border-slate-700 hover:border-slate-500'}`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-right pt-1">
              <a href="/dashboard/formats" className="hover:text-emerald-500 transition-colors">+ Gestionar Formatos</a>
            </p>
          </div>

          <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm lg:text-lg font-bold text-white">Duración</h3>
              <span className="text-xl font-bold text-[#22c55e] drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">{duration}s</span>
            </div>
            <div className="relative mb-1">
              <input type="range" min="7" max="14" step="1" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#22c55e]" />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono"><span>7s</span><span>14s</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}