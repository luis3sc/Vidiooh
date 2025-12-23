'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, Shield, User, Building2, CheckCircle2, Mail, Loader2, Edit2, X, Save, Ban, AlertCircle } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

type UserProfile = {
  id: string
  email: string
  role: string
  status: string // 'active' | 'banned'
  created_at: string
  plan_type: string
  trial_ends_at: string | null
  team_id: string | null
  teams: {
    name: string
    plan_type: string
  } | null
}

export default function UsersPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filter, setFilter] = useState('')

  // --- ESTADOS PARA EDICIÓN ---
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    role: 'user',
    status: 'active', // Nuevo campo estado
    plan_type: 'FREE',
    trial_ends_at: null as string | null
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            teams (
                name,
                plan_type
            )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      // @ts-ignore
      setUsers(data || [])
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  // Abrir Modal con datos cargados
  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
        role: user.role,
        status: user.status || 'active', // Cargar estado actual
        plan_type: user.plan_type || 'FREE',
        trial_ends_at: user.trial_ends_at
    })
  }

  // Guardar Cambios
  const handleUpdateUser = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                role: formData.role,
                status: formData.status, // Guardar estado
                plan_type: formData.plan_type,
                trial_ends_at: formData.trial_ends_at
            })
            .eq('id', editingUser.id)

        if (error) throw error
        
        await fetchUsers() 
        setEditingUser(null) 
        alert("Usuario actualizado correctamente")
    } catch (error: any) {
        alert("Error: " + error.message)
    } finally {
        setSaving(false)
    }
  }

  const handlePlanChange = (newPlan: string) => {
    let newDate = formData.trial_ends_at
    if (newPlan === 'TRIAL') {
        newDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } else {
        newDate = null
    }
    setFormData({ ...formData, plan_type: newPlan, trial_ends_at: newDate })
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-vidiooh" size={32} /></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- MODAL DE EDICIÓN --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f141c] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                
                <div className="p-3 bg-slate-800/50 rounded-lg mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Cuenta</p>
                        <p className="text-white font-medium">{editingUser.email}</p>
                    </div>
                    {/* Badge de Estado actual en el header del usuario */}
                    {formData.status === 'banned' ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded border border-red-500/50 flex items-center gap-1">
                            <Ban size={12}/> BLOQUEADO
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded border border-emerald-500/50 flex items-center gap-1">
                            <CheckCircle2 size={12}/> ACTIVO
                        </span>
                    )}
                </div>

                {/* --- SECCIÓN CRÍTICA: ESTADO DE ACCESO --- */}
                <div className="border-b border-slate-800 pb-4 mb-4">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Estado de Acceso</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFormData({...formData, status: 'active'})}
                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                formData.status === 'active' 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                        >
                            <CheckCircle2 size={18} /> Activo
                        </button>
                        <button
                            onClick={() => setFormData({...formData, status: 'banned'})}
                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                formData.status === 'banned' 
                                ? 'bg-red-500/10 border-red-500 text-red-500' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                        >
                            <Ban size={18} /> Bloquear
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                        * Los usuarios bloqueados no podrán iniciar sesión ni convertir videos.
                    </p>
                </div>

                {/* PLAN (Solo freelance) */}
                {editingUser.team_id ? (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
                        <Building2 className="text-blue-500 shrink-0" size={20}/>
                        <div>
                            <p className="text-sm text-blue-400 font-bold">Usuario Corporativo</p>
                            <p className="text-xs text-slate-400 mt-1">Gestionado por <strong>{editingUser.teams?.name}</strong>.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Plan Individual</label>
                            <select 
                                value={formData.plan_type}
                                onChange={(e) => handlePlanChange(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vidiooh outline-none"
                            >
                                <option value="FREE">FREE</option>
                                <option value="PRO">PRO</option>
                                <option value="TRIAL">TRIAL (30 días)</option>
                            </select>
                        </div>
                        {formData.plan_type === 'TRIAL' && (
                             <div>
                                <label className="text-xs text-yellow-500 font-bold uppercase mb-1 block">Fin de Prueba</label>
                                <input 
                                    type="date"
                                    value={formData.trial_ends_at ? formData.trial_ends_at.split('T')[0] : ''}
                                    onChange={(e) => setFormData({...formData, trial_ends_at: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none"
                                />
                             </div>
                        )}
                    </div>
                )}

                {/* Rol */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Rol de Sistema</label>
                    <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vidiooh outline-none"
                    >
                        <option value="user">Usuario Normal</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                {/* Footer Modal */}
                <div className="pt-4 flex gap-3">
                    <button onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancelar</button>
                    <button 
                        onClick={handleUpdateUser}
                        disabled={saving}
                        className="flex-1 py-3 bg-vidiooh text-white rounded-xl font-bold hover:bg-vidiooh-dark transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin"/> : <Save size={18} />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER & FILTROS (Igual que antes) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Usuarios del Sistema</h1>
          <p className="text-slate-400">Administra accesos, roles y estados de cuenta.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
          <Mail size={18} />
          <span>Invitar Usuario</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="Buscar por correo..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-[#0f141c] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-vidiooh transition-all" />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#0f141c] border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors text-sm font-medium"><Filter size={18} /><span>Filtros</span></button>
      </div>

      {/* TABLA */}
      <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Tipo / Empresa</th>
                <th className="px-6 py-4">Plan Actual</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-10 text-slate-500">No se encontraron usuarios.</td></tr>
              ) : filteredUsers.map((user) => {
                
                const isCorp = !!user.team_id; 
                const isAdmin = user.role === 'admin';
                const planName = isCorp ? user.teams?.plan_type : (user.plan_type || 'FREE');
                const companyName = isCorp ? user.teams?.name : 'Freelance';
                
                // Estilo para fila baneada (opacidad reducida)
                const rowClass = user.status === 'banned' ? 'hover:bg-red-500/5 bg-red-900/10' : 'hover:bg-slate-800/30';

                return (
                <tr key={user.id} className={`${rowClass} transition-colors group`}>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold uppercase">
                        {isAdmin ? <Shield size={18} className="text-vidiooh" /> : user.email?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                            {user.email?.split('@')[0]}
                            {isAdmin && <span className="text-[10px] bg-vidiooh/10 text-vidiooh border border-vidiooh/20 px-1.5 rounded">ADMIN</span>}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {isCorp ? (
                        <div className="flex items-center gap-2 text-emerald-400"><Building2 size={14} /><span className="font-medium">{companyName}</span></div>
                    ) : isAdmin ? (
                        <div className="flex items-center gap-2 text-vidiooh"><Shield size={14} /><span className="font-medium">Staff Vidiooh</span></div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400"><User size={14} /><span>Freelance</span></div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {planName === 'FREE' && <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-800">FREE</span>}
                    {planName === 'PRO' && <span className="text-xs font-bold text-black bg-white px-2 py-1 rounded">PRO</span>}
                    {planName === 'TRIAL' && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">TRIAL</span>}
                    {planName?.includes('CORP') && <span className="text-xs font-bold text-black bg-emerald-500 px-2 py-1 rounded border border-emerald-400">CORP</span>}
                  </td>

                  {/* ESTADO REAL DESDE DB */}
                  <td className="px-6 py-4">
                      {user.status === 'banned' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit border border-red-500/20">
                            <Ban size={12} /> BLOQUEADO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                            <CheckCircle2 size={14} /> Activo
                        </span>
                      )}
                  </td>

                  <td className="px-6 py-4">
                     <span className="text-slate-400 text-xs capitalize">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es })}</span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(user)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Editar Usuario">
                      <Edit2 size={18} />
                    </button>
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