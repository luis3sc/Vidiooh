'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, Shield, User, Building2, CheckCircle2, Mail, Loader2, Edit2, X, Save, Ban, Calendar, Clock, RotateCcw } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/client'
import { formatDistanceToNow, addMonths, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

type UserProfile = {
  id: string
  email: string
  role: string
  status: string 
  created_at: string
  plan_type: string
  trial_ends_at: string | null
  plan_expires_at: string | null 
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
    status: 'active',
    plan_type: 'FREE',
    trial_ends_at: null as string | null,
    plan_expires_at: null as string | null
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
        status: user.status || 'active',
        plan_type: user.plan_type || 'FREE',
        trial_ends_at: user.trial_ends_at,
        plan_expires_at: user.plan_expires_at
    })
  }

  // --- LOGICA DE BOTONES MÁGICOS ---
  const applyDuration = (amount: number, unit: 'days' | 'months' | 'years') => {
      const now = new Date()
      let newDate = now

      if (unit === 'days') newDate = addDays(now, amount)
      if (unit === 'months') newDate = addMonths(now, amount)
      if (unit === 'years') newDate = addMonths(now, amount * 12)

      // Aplicar a la fecha correcta según el plan seleccionado
      if (formData.plan_type === 'TRIAL') {
          setFormData({ ...formData, trial_ends_at: newDate.toISOString() })
      } else {
          setFormData({ ...formData, plan_expires_at: newDate.toISOString() })
      }
  }

  const setIndefinite = () => {
      setFormData({ ...formData, plan_expires_at: null, trial_ends_at: null })
  }

  // Guardar Cambios
  const handleUpdateUser = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
        // Limpieza de datos antes de enviar
        const updates: any = {
            role: formData.role,
            status: formData.status,
            plan_type: formData.plan_type,
        }

        // Si es FREE, limpiamos fechas
        if (formData.plan_type === 'FREE') {
            updates.trial_ends_at = null
            updates.plan_expires_at = null
        } 
        // Si es TRIAL
        else if (formData.plan_type === 'TRIAL') {
            updates.trial_ends_at = formData.trial_ends_at
            updates.plan_expires_at = null
        } 
        // Si es PRO
        else if (formData.plan_type === 'PRO') {
            updates.trial_ends_at = null
            updates.plan_expires_at = formData.plan_expires_at
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', editingUser.id)

        if (error) throw error
        
        await fetchUsers() 
        setEditingUser(null) 
    } catch (error: any) {
        alert("Error: " + error.message)
    } finally {
        setSaving(false)
    }
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
            <div className="bg-[#0f141c] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                        <p className="text-xs text-slate-400">{editingUser.email}</p>
                    </div>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* ESTADO */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-bold uppercase block">Acceso</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none font-bold ${
                                formData.status === 'active' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                                : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}
                        >
                            <option value="active">ACTIVO</option>
                            <option value="banned">BLOQUEADO</option>
                        </select>
                    </div>

                    {/* ROL */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-bold uppercase block">Rol</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-vidiooh outline-none"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-slate-800 my-2"></div>

                {/* --- SECCIÓN SUSCRIPCIÓN --- */}
                {editingUser.team_id ? (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-4 items-center">
                        <Building2 className="text-blue-500 shrink-0" size={24}/>
                        <div>
                            <p className="text-sm text-blue-400 font-bold uppercase tracking-wide">Gestionado por Empresa</p>
                            <p className="text-xs text-slate-300 mt-1">
                                Este usuario pertenece a <strong>{editingUser.teams?.name}</strong>. 
                                <br/>Edita la empresa para cambiar permisos globales.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-vidiooh font-bold uppercase flex items-center gap-2">
                                <Shield size={14}/> Suscripción Individual
                            </label>
                        </div>

                        {/* SELECTOR DE PLAN */}
                        <div className="grid grid-cols-3 gap-2">
                            {['FREE', 'PRO', 'TRIAL'].map((plan) => (
                                <button
                                    key={plan}
                                    onClick={() => setFormData({...formData, plan_type: plan})}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                        formData.plan_type === plan
                                        ? 'bg-white text-black border-white'
                                        : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>

                        {/* CONFIGURACIÓN DE FECHAS (Solo si no es FREE) */}
                        {formData.plan_type !== 'FREE' && (
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                                        <Calendar size={12}/> Vencimiento
                                    </label>
                                    <span className="text-xs font-mono text-emerald-400">
                                        {formData.plan_type === 'TRIAL' 
                                            ? (formData.trial_ends_at ? format(new Date(formData.trial_ends_at), "dd/MM/yyyy") : 'Sin fecha')
                                            : (formData.plan_expires_at ? format(new Date(formData.plan_expires_at), "dd/MM/yyyy") : '∞ Indefinido')
                                        }
                                    </span>
                                </div>

                                {/* BOTONES MÁGICOS */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-500">Asignar vigencia rápida:</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {formData.plan_type === 'TRIAL' ? (
                                            <>
                                                <button onClick={() => applyDuration(7, 'days')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+7 Días</button>
                                                <button onClick={() => applyDuration(15, 'days')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+15 Días</button>
                                                <button onClick={() => applyDuration(30, 'days')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+30 Días</button>
                                                <button onClick={setIndefinite} className="bg-slate-800 hover:text-red-400 text-slate-400 text-xs py-2 rounded transition-colors"><RotateCcw size={14} className="mx-auto"/></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => applyDuration(1, 'months')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+1 Mes</button>
                                                <button onClick={() => applyDuration(6, 'months')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+6 Meses</button>
                                                <button onClick={() => applyDuration(1, 'years')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+1 Año</button>
                                                <button onClick={setIndefinite} className="bg-slate-800 hover:bg-emerald-500 hover:text-white text-emerald-500 text-xs py-2 rounded transition-colors border border-emerald-500/20">∞ Infinito</button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* INPUT MANUAL */}
                                <div className="mt-3 pt-3 border-t border-slate-800">
                                    <input 
                                        type="date"
                                        value={
                                            formData.plan_type === 'TRIAL' 
                                            ? (formData.trial_ends_at ? formData.trial_ends_at.split('T')[0] : '')
                                            : (formData.plan_expires_at ? formData.plan_expires_at.split('T')[0] : '')
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value ? new Date(e.target.value).toISOString() : null
                                            if(formData.plan_type === 'TRIAL') setFormData({...formData, trial_ends_at: val})
                                            else setFormData({...formData, plan_expires_at: val})
                                        }}
                                        className="w-full bg-[#0f141c] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-vidiooh"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-2 flex gap-3">
                    <button onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Cancelar</button>
                    <button 
                        onClick={handleUpdateUser}
                        disabled={saving}
                        className="flex-1 py-3 bg-vidiooh text-black rounded-xl font-bold hover:bg-vidiooh-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-vidiooh/20"
                    >
                        {saving ? <Loader2 className="animate-spin"/> : <Save size={18} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER & FILTROS */}
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

      {/* TABLA SIN ERRORES */}
      <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Tipo / Empresa</th>
                <th className="px-6 py-4">Plan Actual</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Vencimiento</th>
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
                
                // Calculamos fecha para mostrar en tabla
                let expireDate = null
                if (planName === 'TRIAL') expireDate = user.trial_ends_at
                else if (!isCorp && planName !== 'FREE') expireDate = user.plan_expires_at

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

                  {/* COLUMNA VENCIMIENTO */}
                  <td className="px-6 py-4">
                      {isCorp ? (
                          <span className="text-slate-600 text-xs">--</span>
                      ) : expireDate ? (
                          <div className="flex items-center gap-1 text-xs text-white">
                              <Clock size={12} className="text-vidiooh"/>
                              {formatDistanceToNow(new Date(expireDate), { addSuffix: true, locale: es })}
                          </div>
                      ) : (
                          <span className="text-slate-600 text-xs italic">Indefinido</span>
                      )}
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