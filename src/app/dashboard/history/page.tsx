'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Clock, Trash2, Download, Search, Filter, Check, AlertTriangle, PlayCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Definimos el tipo de Log
type ConversionLog = {
  id: string
  created_at: string
  original_name: string
  output_format: string
  duration: number
  file_path: string
}

export default function HistoryPage() {
  // Cliente Supabase para el navegador
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [logs, setLogs] = useState<ConversionLog[]>([])
  const [loading, setLoading] = useState(true)

  // Estado del Modal de Eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<ConversionLog | null>(null)

  // 1. Cargar datos al iniciar
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
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setLogs(data)
    setLoading(false)
  }

  // 2. Abrir confirmación
  const confirmDelete = (log: ConversionLog) => {
    setLogToDelete(log)
    setIsDeleteModalOpen(true)
  }

  // 3. Ejecutar borrado real
  const handleDelete = async () => {
    if (!logToDelete) return

    // A. Borrar archivo del Storage (Nube)
    const { error: storageError } = await supabase.storage
      .from('raw-videos')
      .remove([logToDelete.file_path])

    if (storageError) {
      alert('Error al borrar archivo: ' + storageError.message)
      return
    }

    // B. Borrar registro de la Base de Datos
    const { error: dbError } = await supabase
      .from('conversion_logs')
      .delete()
      .eq('id', logToDelete.id)

    if (dbError) {
      alert('Error al borrar registro: ' + dbError.message)
    } else {
      // C. Actualizar UI sin recargar
      setLogs(logs.filter(l => l.id !== logToDelete.id))
      setIsDeleteModalOpen(false)
      setLogToDelete(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20 md:pb-0 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Historial Reciente</h1>
          <p className="text-slate-400 text-sm">Actividad de las últimas 24h</p>
        </div>
        
        {/* Filtros Visuales */}
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Buscar video..." className="w-full bg-[#151921] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors"/>
          </div>
          <button className="flex items-center gap-2 bg-[#151921] border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-colors">
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
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {logs.map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })
            const resolutionLabel = log.output_format ? log.output_format.replace('x', ' X ') : 'VIDEO'
            
            // Generar URL pública al vuelo
            const { data: publicData } = supabase.storage.from('raw-videos').getPublicUrl(log.file_path)
            const videoUrl = publicData.publicUrl

            return (
              <div key={log.id} className="group bg-[#151921] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all flex flex-row md:flex-col h-28 md:h-auto">
                
                {/* PREVISUALIZACIÓN */}
                <div className="w-32 md:w-full h-full md:h-40 bg-black relative flex-shrink-0 group-hover:opacity-90 transition-opacity">
                   <video src={`${videoUrl}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted />
                   <a href={videoUrl} target="_blank" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"><PlayCircle className="text-white" size={24} /></div>
                   </a>
                   <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">{log.duration}s</div>
                </div>

                {/* INFO */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm md:text-base truncate w-40 md:w-auto mb-1 text-white" title={log.original_name}>
                      {log.original_name.replace('.mp4', '')}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-slate-800 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-700">{resolutionLabel}</span>
                      <span className="text-slate-500 text-[10px] truncate">{timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                     <a href={videoUrl} target="_blank" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"><Download size={18} /></a>
                     {/* BOTÓN ELIMINAR REAL */}
                     <button onClick={() => confirmDelete(log)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors">
                       <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 px-4">
          <div className="bg-[#0f141c] w-full max-w-sm rounded-3xl border border-slate-800 p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Borrar video?</h2>
            <p className="text-slate-400 text-sm mb-6">Se eliminará "{logToDelete?.original_name}" permanentemente de la nube.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}