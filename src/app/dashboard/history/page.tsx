'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Clock, Trash2, Download, Search, Filter, AlertTriangle, PlayCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

type ConversionLog = {
  id: string
  created_at: string
  original_name: string
  output_format: string
  duration: number
  file_path: string
  deleted_at: string | null
}

export default function HistoryPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [logs, setLogs] = useState<ConversionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<ConversionLog | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('conversion_logs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setLogs(data)
    setLoading(false)
  }

  const confirmDelete = (log: ConversionLog) => {
    setLogToDelete(log)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!logToDelete) return

    // ---------------------------------------------------------
    // 1. AHORRO DE ALMACENAMIENTO (Borrado Físico)
    // ---------------------------------------------------------
    // Borramos el archivo real del disco de Supabase para recuperar espacio.
    const { error: storageError } = await supabase.storage
      .from('raw-videos')
      .remove([logToDelete.file_path])

    if (storageError) {
      console.warn('Advertencia: No se pudo borrar el archivo físico:', storageError.message)
      // Continuamos igual para quitarlo de la vista visualmente
    }

    // ---------------------------------------------------------
    // 2. MANTENER ESTADÍSTICAS (Borrado Lógico)
    // ---------------------------------------------------------
    // Actualizamos la DB con fecha de borrado. El registro NO se elimina,
    // así la página "Mi Cuenta" puede seguir sumando su peso histórico.
    const { error: dbError } = await supabase
      .from('conversion_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', logToDelete.id)

    if (dbError) {
      alert('Error al actualizar registro: ' + dbError.message)
    } else {
      // Éxito: Lo quitamos de la lista visual
      setLogs(logs.filter(l => l.id !== logToDelete.id))
      setIsDeleteModalOpen(false)
      setLogToDelete(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-0 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Historial Reciente</h1>
          <p className="text-slate-400 text-sm">Actividad de las últimas 24h</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Buscar video..." className="w-full bg-[#151921] border border-slate-800 rounded-xl pl-10 pr-4 py-3 md:py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors"/>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#151921] border border-slate-800 text-slate-300 px-4 py-3 md:py-2 rounded-xl text-sm hover:bg-slate-800 transition-colors">
            <Filter size={18} /> <span className="hidden md:inline">Filtrar</span>
          </button>
        </div>
      </div>

      {/* LISTA DE VIDEOS */}
      {loading ? (
        <p className="text-slate-500 text-center py-10 animate-pulse">Cargando historial...</p>
      ) : (!logs || logs.length === 0) ? (
        <div className="text-center py-20 bg-[#151921]/50 rounded-3xl border border-slate-800/50">
          <Clock className="text-slate-500 mx-auto mb-4" size={32} />
          <h3 className="text-white font-bold text-lg mb-2">Aún no hay historial</h3>
          <a href="/dashboard/convert" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl inline-block">Convertir video</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {logs.map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })
            const resolutionLabel = log.output_format ? log.output_format.replace('x', ' X ') : 'VIDEO'
            const { data: publicData } = supabase.storage.from('raw-videos').getPublicUrl(log.file_path)
            const videoUrl = publicData.publicUrl

            return (
              <div key={log.id} className="group bg-[#151921] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all flex flex-col">
                
                {/* PREVISUALIZACIÓN OPTIMIZADA (AHORRO DE BANDA ANCHA) */}
                <div className="w-full h-48 md:h-40 bg-black relative flex-shrink-0 group-hover:opacity-90 transition-opacity">
                   <video 
                     src={`${videoUrl}#t=0.5`} 
                     className="w-full h-full object-cover" 
                     preload="none" // <--- CAMBIO CRÍTICO: No descarga ni un byte hasta dar play
                     muted 
                   />
                   
                   {/* Botón Play Overlay (Siempre visible para indicar que hay video) */}
                   <a href={videoUrl} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                        <PlayCircle className="text-white" size={24} />
                      </div>
                   </a>
                   
                   <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                     {log.duration}s
                   </div>
                </div>

                {/* INFO BODY */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white mb-2 break-words leading-snug" title={log.original_name}>
                      {log.original_name.replace('.mp4', '')}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-slate-800 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-700 whitespace-nowrap">
                        {resolutionLabel}
                      </span>
                      <span className="text-slate-500 text-[10px] truncate">
                        {timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="flex justify-end gap-3 pt-2 mt-auto border-t border-slate-800/50">
                     <a href={videoUrl} target="_blank" className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-colors active:scale-95">
                       <Download size={20} />
                     </a>
                     <button onClick={() => confirmDelete(log)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors active:scale-95">
                       <Trash2 size={20} />
                     </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 px-4">
          <div className="bg-[#0f141c] w-full max-w-sm rounded-3xl border border-slate-800 p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Borrar video?</h2>
            <p className="text-slate-400 text-sm mb-6 break-words">
              Se eliminará <span className="text-white font-medium">"{logToDelete?.original_name}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-colors">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}