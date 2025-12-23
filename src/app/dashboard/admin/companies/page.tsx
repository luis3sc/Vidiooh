'use client'

import React, { useEffect, useState } from 'react'
import { Search, Plus, Building2, Users, MoreVertical, ShieldCheck, Loader2, Trash2, Video, Eye } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

type Team = {
  id: string
  name: string
  plan_type: string
  created_at: string
  max_users: number
  profiles: { 
    id: string
    conversion_logs: { count: number }[] 
  }[]
}

export default function CompaniesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
            *,
            profiles:profiles (
                id,
                conversion_logs(count)
            )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      // @ts-ignore
      setTeams(data || [])
    } catch (error) {
      console.error("Error cargando empresas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCreate = async () => {
    setIsCreating(true)
    const companyName = prompt("Nombre de la nueva empresa:")
    if (!companyName) { setIsCreating(false); return }

    const { error } = await supabase
      .from('teams')
      .insert([{ name: companyName, plan_type: 'CORPORATE_TIER_1', max_users: 5 }])
      .select()

    if (error) alert("Error: " + error.message)
    else fetchTeams()
    
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("¿Estás seguro?")) return;
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchTeams()
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-vidiooh" size={32}/></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Empresas B2B</h1>
          <p className="text-slate-400">Gestiona las cuentas corporativas y sus límites.</p>
        </div>
        <button onClick={handleQuickCreate} disabled={isCreating} className="bg-vidiooh hover:bg-vidiooh-dark text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-vidiooh/20 transition-all flex items-center gap-2 disabled:opacity-50">
            {isCreating ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18} />}
            <span>Registrar Nueva Empresa</span>
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="Buscar empresa..." className="w-full bg-[#0f141c] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-vidiooh transition-all" />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4 text-center">Usuarios</th>
                <th className="px-6 py-4 text-center">Total Videos</th>
                <th className="px-6 py-4">Creado el</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {teams.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No hay empresas.</td></tr>
              ) : teams.map((team) => {
                
                // CALCULAR TOTAL DE VIDEOS DE LA EMPRESA
                const totalVideos = team.profiles?.reduce((acc, curr) => {
                    return acc + (curr.conversion_logs[0]?.count || 0)
                }, 0) || 0;

                return (
                <tr key={team.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Nombre (Clickable) */}
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/admin/companies/${team.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-black text-lg uppercase">
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                            {team.name} <Eye size={14} className="text-slate-600 group-hover:text-vidiooh"/>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">ID: {team.id.substring(0, 8)}...</div>
                      </div>
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-slate-900 text-vidiooh border border-vidiooh/20 px-2.5 py-1 rounded-md text-xs font-bold">
                      {team.plan_type?.replace(/_/g, ' ') || 'STANDARD'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-300">
                      <Users size={16} className="text-slate-500" />
                      <span className="font-mono font-medium">{team.profiles?.length || 0} / {team.max_users}</span>
                    </div>
                  </td>

                  {/* NUEVO: TOTAL VIDEOS */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-300">
                        <Video size={16} className="text-blue-500" />
                        <span className="font-bold text-white">{totalVideos}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {format(new Date(team.created_at), 'dd MMM yyyy', { locale: es })}
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleDelete(team.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={18} />
                    </button>
                    <Link href={`/dashboard/admin/companies/${team.id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                      <MoreVertical size={18} />
                    </Link>
                  </td>

                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}