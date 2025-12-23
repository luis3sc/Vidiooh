'use client'

import React, { useEffect, useState } from 'react'
import { Search, Download, AlertCircle, CheckCircle2, Clock, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

type LogEntry = {
  id: string
  created_at: string
  original_name: string
  output_format: string
  duration: number
  file_size: number | null
  user_id: string
  profiles: {
    email: string
  } | null
}

export default function ActivityPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Traemos logs y el email del usuario asociado
      const { data, error } = await supabase
        .from('conversion_logs')
        .select(`
            *,
            profiles ( email )
        `)
        .order('created_at', { ascending: false })
        .limit(50) // Limitamos a 50 para no saturar la vista inicial

      if (error) throw error
      // @ts-ignore
      setLogs(data || [])
    } catch (error) {
      console.error("Error cargando logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filtro simple en cliente
  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase()
    const email = log.profiles?.email?.toLowerCase() || ''
    const filename = log.original_name?.toLowerCase() || ''
    const id = log.id.toLowerCase()
    
    return email.includes(searchLower) || filename.includes(searchLower) || id.includes(searchLower)
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-vidiooh" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Auditoría del Sistema</h1>
          <p className="text-slate-400">Registro técnico detallado de todas las transacciones.</p>
        </div>
        
        <button className="bg-[#0f141c] hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
          <Download size={16} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, archivo o usuario..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f141c] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-vidiooh focus:ring-1 focus:ring-vidiooh transition-all placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex gap-2">
            <select className="bg-[#0f141c] border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-3 outline-none focus:border-vidiooh cursor-pointer">
                <option>Todos los Estados</option>
                <option>Exitosos</option>
                {/* Opciones futuras cuando implementemos registro de errores */}
                {/* <option>Fallidos</option> */}
            </select>
        </div>
      </div>

      {/* --- TABLA DE LOGS --- */}
      <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">ID / Hora</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Detalles del Archivo</th>
                <th className="px-6 py-4">Conversión</th>
                <th className="px-6 py-4">Peso</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                        No se encontraron registros recientes.
                    </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  
                  {/* ID & Tiempo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-xs text-slate-500 mb-1" title={log.id}>
                        #{log.id.substring(0, 8)}...
                    </div>
                    <div className="text-white font-medium flex items-center gap-1.5" title={format(new Date(log.created_at), "PPpp", { locale: es })}>
                        <Clock size={12} className="text-vidiooh" /> 
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                    </div>
                  </td>

                  {/* Usuario */}
                  <td className="px-6 py-4">
                    <div className="text-slate-300 font-medium">
                        {log.profiles?.email || 'Usuario eliminado'}
                    </div>
                  </td>

                  {/* Archivo */}
                  <td className="px-6 py-4">
                    <div className="text-white font-medium truncate max-w-[150px]" title={log.original_name}>
                        {log.original_name}
                    </div>
                  </td>

                  {/* Conversión (Formato) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        {/* Como no guardamos input format aun, ponemos Auto */}
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded">Auto</span>
                        <ArrowRight size={12} />
                        <span className="bg-vidiooh/10 text-vidiooh border border-vidiooh/20 px-1.5 py-0.5 rounded font-bold">
                            {log.output_format}
                        </span>
                    </div>
                  </td>

                  {/* Peso */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-400 font-bold">{formatBytes(log.file_size)}</span>
                    </div>
                  </td>

                  {/* Estado (Siempre OK por ahora) */}
                  <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> OK ({log.duration}s)
                      </span>
                  </td>

                  {/* Acción Log */}
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-500 hover:text-white transition-colors" title="Ver log técnico (Próximamente)">
                        <FileText size={18} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer simple */}
        <div className="bg-slate-900/50 border-t border-slate-800 p-4 text-xs text-slate-500 flex justify-between">
           <span>Mostrando últimos 50 registros</span>
        </div>
      </div>

    </div>
  )
}