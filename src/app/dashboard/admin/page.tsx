'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, Building2, HardDrive, 
  ArrowUpRight, ArrowDownRight, Video, Loader2,
  Trophy, Monitor, X, Eye
} from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// --- 1. COMPONENTE MODAL RESPONSIVE ---
const RankingModal = ({ isOpen, onClose, title, data, type }: any) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Ajuste Mobile: w-full, rounded-t-2xl (tipo bottom sheet) y en PC rounded-2xl normal */}
      <div className="bg-[#0f141c] border-t sm:border border-slate-700 w-full sm:max-w-md h-[80vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 bg-[#0f141c]">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            {type === 'users' ? <Trophy className="text-vidiooh" size={20}/> : <Monitor className="text-blue-500" size={20}/>}
            {title}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Lista Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border border-white/5 shrink-0
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-slate-300/20 text-slate-300' : 
                        index === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-slate-800 text-slate-500'}`}>
                      {index + 1}
                  </div>
                  <div className="min-w-0"> {/* min-w-0 ayuda a truncar texto en flex */}
                      <p className="text-white text-sm font-medium truncate">{item.label}</p>
                      {item.subLabel && <p className="text-slate-500 text-xs truncate max-w-[150px]">{item.subLabel}</p>}
                  </div>
               </div>
               <div className="text-right shrink-0">
                  <span className="text-white font-bold block">{item.count}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Total</span>
               </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/30 text-center safe-area-bottom">
            <button onClick={onClose} className="w-full sm:w-auto py-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors">
                Cerrar lista
            </button>
        </div>
      </div>
    </div>
  )
}

// --- KPI CARD ---
const KpiCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-[#0f141c] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-vidiooh/30 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-900 rounded-xl group-hover:bg-vidiooh/10 transition-colors">
        <Icon size={20} className="text-slate-400 group-hover:text-vidiooh transition-colors" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">{value}</h3>
      <p className="text-slate-500 text-xs sm:text-sm font-medium">{title}</p>
      {subtext && <p className="text-slate-600 text-[10px] sm:text-xs mt-1 truncate">{subtext}</p>}
    </div>
  </div>
)

export default function AdminDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  // Estados Datos
  const [stats, setStats] = useState({ totalUsers: 0, totalCompanies: 0, totalVideos: 0, totalStorage: 0 })
  
  // Listas Completas para el Modal
  const [allTopUsers, setAllTopUsers] = useState<any[]>([])
  const [allTopFormats, setAllTopFormats] = useState<any[]>([])
  
  // Tabla Reciente
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  // Estado del Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'users' | 'formats'>('users')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true })
      const { data: logsData } = await supabase
        .from('conversion_logs')
        .select(`file_size, output_format, user_id, profiles (email)`)

      let totalVideos = 0
      let totalStorage = 0

      if (logsData && logsData.length > 0) {
        totalVideos = logsData.length
        totalStorage = logsData.reduce((acc, curr) => acc + (curr.file_size || 0), 0)

        // --- CALCULO FORMATOS ---
        const formatCounts: Record<string, number> = {}
        logsData.forEach(log => {
            const fmt = log.output_format || 'Desconocido'
            formatCounts[fmt] = (formatCounts[fmt] || 0) + 1
        })
        const sortedFormats = Object.entries(formatCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([format, count]) => ({ label: format, count }))
        
        setAllTopFormats(sortedFormats)

        // --- CALCULO USUARIOS ---
        const userCounts: Record<string, number> = {}
        const userEmails: Record<string, string> = {}
        logsData.forEach(log => {
            const uid = log.user_id
            if (uid) {
                userCounts[uid] = (userCounts[uid] || 0) + 1
                // @ts-ignore
                if (log.profiles?.email) userEmails[uid] = log.profiles.email
            }
        })
        const sortedUsers = Object.entries(userCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([uid, count]) => ({ 
                label: userEmails[uid]?.split('@')[0] || 'N/A', 
                subLabel: userEmails[uid],
                count 
            }))
        
        setAllTopUsers(sortedUsers)
      }

      setStats({
        totalUsers: userCount || 0,
        totalCompanies: teamCount || 0,
        totalVideos,
        totalStorage,
      })

      const { data: recentActivity } = await supabase
        .from('conversion_logs')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentLogs(recentActivity || [])

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openModal = (type: 'users' | 'formats') => {
    setModalType(type)
    setModalOpen(true)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-vidiooh" size={40} /></div>

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 sm:pb-0">
      
      {/* MODAL */}
      <RankingModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        type={modalType}
        title={modalType === 'users' ? "Ranking de Usuarios" : "Ranking de Formatos"}
        data={modalType === 'users' ? allTopUsers.slice(0, 15) : allTopFormats.slice(0, 15)} 
      />

      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard General</h1>
          <p className="text-slate-400 text-sm">Bienvenido al centro de control.</p>
        </div>
      </div>

      {/* KPI CARDS - GRID ADAPTATIVO */}
      {/* En mobile (default) 1 columna, en sm (tablets peques) 2 columnas, en lg 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard title="Usuarios Totales" value={stats.totalUsers} subtext="Registrados" icon={Users} trend={12} />
        <KpiCard title="Empresas B2B" value={stats.totalCompanies} subtext="Activas" icon={Building2} trend={0} />
        <KpiCard title="Videos Procesados" value={stats.totalVideos} subtext="Histórico" icon={Video} trend={24} />
        <KpiCard title="Storage Usado" value={formatBytes(stats.totalStorage)} subtext="Total S3" icon={HardDrive} trend={5} />
      </div>

      {/* RANKINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* TOP USUARIOS */}
        <div className="bg-[#0f141c] border border-slate-800 p-5 sm:p-6 rounded-2xl relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-vidiooh/10 rounded-lg text-vidiooh"><Trophy size={18} /></div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Top Usuarios</h3>
                </div>
                <button onClick={() => openModal('users')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800">
                    <Eye size={14}/> Ver todos
                </button>
            </div>
            
            <div className="space-y-3">
                {allTopUsers.slice(0, 3).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs 
                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-slate-400/20 text-slate-400' : 'bg-orange-700/20 text-orange-700'}`}>
                                {index + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.label}</p>
                                <p className="text-slate-500 text-[10px] truncate">{user.subLabel}</p>
                            </div>
                        </div>
                        <span className="text-vidiooh font-black text-lg shrink-0">{user.count}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* TOP FORMATOS */}
        <div className="bg-[#0f141c] border border-slate-800 p-5 sm:p-6 rounded-2xl relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Monitor size={18} /></div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Top Formatos</h3>
                </div>
                <button onClick={() => openModal('formats')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800">
                    <Eye size={14}/> Ver todos
                </button>
            </div>
            
            <div className="space-y-3">
                {allTopFormats.slice(0, 3).map((fmt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">#{index + 1}</div>
                            <p className="text-white text-sm font-mono">{fmt.label}</p>
                        </div>
                        <span className="text-slate-400 text-xs font-bold w-6 text-right">{fmt.count}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* TABLA RECIENTE & ESTADO SISTEMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800"><h3 className="font-bold text-white text-sm sm:text-base">Actividad Reciente</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                    <tr>
                        <th className="px-6 py-3 whitespace-nowrap">Usuario</th>
                        <th className="px-6 py-3 whitespace-nowrap">Archivo</th>
                        <th className="px-6 py-3 whitespace-nowrap">Formato</th>
                        <th className="px-6 py-3 whitespace-nowrap">Tiempo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{log.profiles?.email || 'Desconocido'}</td>
                        <td className="px-6 py-4 text-slate-400 truncate max-w-[120px] sm:max-w-[150px]">{log.original_name}</td>
                        <td className="px-6 py-4 text-white whitespace-nowrap"><span className="bg-slate-800 px-2 py-1 rounded text-xs font-mono">{log.output_format}</span></td>
                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
        
        {/* Estado del sistema lateral */}
        <div className="bg-[#0f141c] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-white mb-6">Estado del Sistema</h3>
          <div className="space-y-6 flex-1">
             <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                 <span className="text-sm font-medium text-emerald-400">Motor de Conversión</span>
                 <span className="text-xs font-bold text-emerald-500">OPERATIVO</span>
             </div>
             <div>
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Almacenamiento Total</span>
                    <span className="text-white">{formatBytes(stats.totalStorage)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%]" /></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}