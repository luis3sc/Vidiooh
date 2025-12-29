'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Clock, Trash2, Download, AlertTriangle, PlayCircle, Loader2, 
  ShieldCheck, CloudOff, ArrowRight, Search, FileX 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

type ConversionLog = {
  id: string
  created_at: string
  original_name: string
  output_format: string
  duration: number
  file_path: string | null 
  deleted_at: string | null
  file_size: number
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
  const [userPlan, setUserPlan] = useState<string>('FREE')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, teams(plan_type)')
        .eq('id', user.id)
        .single()

      // @ts-ignore
      const actualPlan = profile?.teams?.plan_type || profile?.plan_type || 'FREE'
      setUserPlan(actualPlan)

      if (actualPlan === 'FREE') {
        setLoading(false)
        return
      }

      let query = supabase
        .from('conversion_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (actualPlan === 'PRO') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          query = query.gte('created_at', sevenDaysAgo.toISOString())
          query = query.limit(8)
      } else if (actualPlan === 'CORPORATE') {
          const fifteenDaysAgo = new Date()
          fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
          query = query.gte('created_at', fifteenDaysAgo.toISOString())
          query = query.limit(100)
      } else {
          query = query.limit(20)
      }

      const { data } = await query

      if (data) setLogs(data)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (log: ConversionLog) => {
    setLogToDelete(log)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!logToDelete) return
    
    if (logToDelete.file_path) {
        const { error: storageError } = await supabase.storage.from('raw-videos').remove([logToDelete.file_path])
        if (storageError) console.warn(storageError.message)
    }
    
    const { error: dbError } = await supabase.from('conversion_logs').update({ deleted_at: new Date().toISOString() }).eq('id', logToDelete.id)
    if (dbError) alert('Error: ' + dbError.message)
    else {
      setLogs(logs.filter(l => l.id !== logToDelete.id))
      setIsDeleteModalOpen(false)
      setLogToDelete(null)
    }
  }


  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-vidiooh" size={32} /></div>

  if (userPlan === 'FREE') {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-0 relative space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Tu Historial</h1>
            <p className="text-slate-400">Archivos y copias de seguridad.</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0f141c] p-8 md:p-16 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-800 relative">
                    <CloudOff size={32} className="text-slate-400" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-4 border-[#0f141c]">
                        <ShieldCheck size={16} className="text-[#0f141c]" />
                    </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Modo Local <span className="text-emerald-500">Activo</span>
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                    Como usuario Free, tus videos se procesan y eliminan inmediatamente para máxima privacidad. 
                    <br/><br/>
                    <span className="text-white font-medium">¿Necesitas copias de seguridad en la nube?</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8 text-left">
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="p-2 bg-slate-800 rounded-lg"><CloudOff size={16} className="text-emerald-500"/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Plan Free</p>
                            <p className="text-sm text-white">Almacenamiento Local (0GB)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-vidiooh/5 rounded-xl border border-vidiooh/20">
                         <div className="p-2 bg-vidiooh/10 rounded-lg"><Clock size={16} className="text-vidiooh"/></div>
                         <div>
                            <p className="text-xs text-vidiooh uppercase font-bold">Plan Pro</p>
                            <p className="text-sm text-white">Historial en la Nube (7 días)</p>
                        </div>
                    </div>
                </div>
                <Link href="/dashboard/pricing" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-vidiooh rounded-xl hover:bg-vidiooh-dark hover:scale-105 shadow-lg shadow-vidiooh/25">
                    <span>Activar Cloud Backup</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <p className="mt-6 text-xs text-slate-600">
                    Tu privacidad es primero. Solo subimos archivos si tienes el <span className="text-slate-400">Plan PRO</span> o superior.
                </p>
            </div>
        </div>
      </div>
    )
  }

  // --- VISTA NORMAL (GRID) ---
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-0 relative">
      
      {/* HEADER CORREGIDO: items-start en móvil, items-end en desktop */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Historial Cloud</h1>
          <p className="text-slate-400 text-sm">Tus copias de seguridad seguras.</p>
        </div>
        
        {/* Búsqueda visible en móvil (w-full) */}
        <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
             <input type="text" placeholder="Buscar archivo..." className="w-full bg-[#0f141c] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-vidiooh transition-all" />
        </div>
      </div>

      {/* GRID DE VIDEOS */}
      {(!logs || logs.length === 0) ? (
        <div className="text-center py-20 bg-[#0f141c]/50 rounded-3xl border border-slate-800/50">
          <Clock className="text-slate-500 mx-auto mb-4" size={32} />
          <h3 className="text-white font-bold text-lg mb-2">Historial vacío</h3>
          <p className="text-slate-500 text-sm mb-6">Tus conversiones PRO aparecerán aquí.</p>
          <a href="/dashboard/convert" className="px-6 py-3 bg-vidiooh hover:bg-vidiooh-dark text-white font-bold rounded-xl inline-block transition-colors shadow-lg shadow-vidiooh/20">
            Convertir video
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {logs.map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })
            const resolutionLabel = log.output_format ? log.output_format.replace('x', ' X ') : 'VIDEO'
            
            // --- MANEJO SEGURO DE ARCHIVOS LOCALES ---
            let videoUrl = null
            if (log.file_path) {
                const { data: publicData } = supabase.storage.from('raw-videos').getPublicUrl(log.file_path)
                videoUrl = publicData.publicUrl
            }

            return (
              <div key={log.id} className="group bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl transition-all flex flex-col">
                
                {/* PREVIEW O PLACEHOLDER */}
                <div className="w-full h-48 md:h-40 bg-black relative flex-shrink-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                   {videoUrl ? (
                       <>
                        <video src={`${videoUrl}#t=0.5`} className="w-full h-full object-cover" preload="none" muted />
                        <a href={videoUrl} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors group/play">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                                <PlayCircle className="text-white fill-white/20" size={24} />
                            </div>
                        </a>
                       </>
                   ) : (
                       // VISUAL PARA VIDEOS SIN NUBE
                       <div className="flex flex-col items-center justify-center text-slate-600">
                           <FileX size={32} className="mb-2 opacity-50"/>
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">No guardado en Nube</span>
                       </div>
                   )}
                   
                   <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                     {log.duration}s
                   </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white mb-2 break-words leading-snug line-clamp-2" title={log.original_name}>
                      {log.original_name.replace('.mp4', '')}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-slate-900 text-vidiooh text-[10px] font-bold px-2 py-1 rounded-md border border-slate-800 whitespace-nowrap">{resolutionLabel}</span>
                      <span className="text-slate-500 text-[10px] truncate">{timeAgo}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2 mt-auto border-t border-slate-800/50">
                      {/* Botón Download solo si hay URL */}
                      {videoUrl ? (
                          <a href={videoUrl} target="_blank" className="p-2.5 bg-vidiooh/10 text-vidiooh rounded-xl hover:bg-vidiooh hover:text-white transition-colors border border-vidiooh/20 hover:border-vidiooh">
                            <Download size={18} />
                          </a>
                      ) : (
                          <button disabled className="p-2.5 bg-slate-900 text-slate-700 rounded-xl cursor-not-allowed border border-slate-800">
                            <CloudOff size={18} />
                          </button>
                      )}
                      
                      <button onClick={() => confirmDelete(log)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 border border-transparent transition-all">
                        <Trash2 size={18} />
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
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 px-4">
          <div className="bg-[#0f141c] w-full max-w-sm rounded-3xl border border-slate-800 p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
                {logToDelete?.file_path ? "¿Borrar del Cloud?" : "¿Borrar registro?"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-xl border border-slate-700">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}