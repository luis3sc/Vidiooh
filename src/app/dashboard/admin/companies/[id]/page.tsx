'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Building2, Users, Video, HardDrive, Calendar, 
  Settings, Save, X, Loader2, Clock, RotateCcw 
} from 'lucide-react'
import { createClient } from '../../../../../lib/supabase/client'
import { format, addDays, addMonths, formatDistanceToNow } from 'date-fns' 
import { es } from 'date-fns/locale'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [company, setCompany] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])

  // --- ESTADOS PARA EDICIÓN ---
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    plan_type: '',
    max_users: 1,
    trial_ends_at: null as string | null,
    plan_expires_at: null as string | null // NUEVO CAMPO EMPRESARIAL
  })

  useEffect(() => {
    if (params.id) fetchCompanyDetails()
  }, [params.id])

  // Cargar datos al formulario
  useEffect(() => {
    if (company) {
        setFormData({
            name: company.name,
            plan_type: company.plan_type,
            max_users: company.max_users,
            trial_ends_at: company.trial_ends_at,
            plan_expires_at: company.plan_expires_at
        })
    }
  }, [company])

  // --- LÓGICA DE CAMBIO DE PLAN ---
  const handlePlanChange = (newPlan: string) => {
    let newMaxUsers = formData.max_users
    let newTrialDate = formData.trial_ends_at
    let newExpireDate = formData.plan_expires_at

    // Reglas de negocio
    if (newPlan === 'FREE' || newPlan === 'PRO') {
        newMaxUsers = 1 
        newTrialDate = null 
        newExpireDate = null
    } else if (newPlan === 'TRIAL') {
        newTrialDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        newExpireDate = null
    } else if (newPlan === 'CORPORATE') {
        newTrialDate = null 
        // Corporate mantiene su fecha de expiración si ya tenía, o null si es indefinido
    }

    setFormData({
        ...formData,
        plan_type: newPlan,
        max_users: newMaxUsers,
        trial_ends_at: newTrialDate,
        plan_expires_at: newExpireDate
    })
  }

  // --- BOTONES MÁGICOS DE TIEMPO ---
  const applyDuration = (amount: number, unit: 'days' | 'months' | 'years') => {
      const now = new Date()
      let newDate = now

      if (unit === 'days') newDate = addDays(now, amount)
      if (unit === 'months') newDate = addMonths(now, amount)
      if (unit === 'years') newDate = addMonths(now, amount * 12)

      if (formData.plan_type === 'TRIAL') {
          setFormData({ ...formData, trial_ends_at: newDate.toISOString() })
      } else {
          setFormData({ ...formData, plan_expires_at: newDate.toISOString() })
      }
  }

  const setIndefinite = () => {
      setFormData({ ...formData, plan_expires_at: null, trial_ends_at: null })
  }

  const fetchCompanyDetails = async () => {
    try {
      const companyId = params.id as string

      // 1. Datos Empresa
      const { data: teamData } = await supabase.from('teams').select('*').eq('id', companyId).single()
      setCompany(teamData)

      // 2. Usuarios
      const { data: userData } = await supabase
        .from('profiles')
        .select(`id, email, role, conversion_logs (count)`)
        .eq('team_id', companyId)
      
      const formattedEmployees = (userData || []).map((user: any) => ({
         ...user,
         videoCount: user.conversion_logs[0]?.count || 0
      })).sort((a: any, b: any) => b.videoCount - a.videoCount)
      
      setEmployees(formattedEmployees)

      // 3. Stats Mensuales
      const { data: allLogs } = await supabase
        .from('conversion_logs')
        .select('created_at, file_size')
        .in('user_id', formattedEmployees.map((u: any) => u.id))

      const statsMap: Record<string, { count: number, size: number }> = {}

      allLogs?.forEach(log => {
        const monthKey = format(new Date(log.created_at), 'yyyy-MM')
        if (!statsMap[monthKey]) statsMap[monthKey] = { count: 0, size: 0 }
        statsMap[monthKey].count += 1
        statsMap[monthKey].size += (log.file_size || 0)
      })

      const statsArray = Object.entries(statsMap)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, val]) => ({ month: key, ...val }))

      setMonthlyStats(statsArray)

    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCompany = async () => {
    setSaving(true)
    try {
        const { error } = await supabase
            .from('teams')
            .update({
                name: formData.name,
                plan_type: formData.plan_type,
                max_users: formData.max_users,
                trial_ends_at: formData.trial_ends_at,
                plan_expires_at: formData.plan_expires_at // Guardamos la expiración del contrato
            })
            .eq('id', company.id)

        if (error) throw error
        
        await fetchCompanyDetails()
        setIsEditing(false)
        alert("Empresa actualizada correctamente")

    } catch (error: any) {
        alert("Error al actualizar: " + error.message)
    } finally {
        setSaving(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-vidiooh" size={32}/></div>

  // Calcular días restantes (Trial o Contrato)
  const expirationDate = company?.plan_type === 'TRIAL' ? company?.trial_ends_at : company?.plan_expires_at
  
  const daysLeft = expirationDate 
    ? Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- MODAL DE EDICIÓN --- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f141c] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white">Configurar Empresa</h3>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                
                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Nombre Comercial</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vidiooh outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Plan Contratado</label>
                        <select 
                            value={formData.plan_type}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vidiooh outline-none"
                        >
                            <option value="TRIAL">TRIAL (Demo 30 Días)</option>
                            <option value="FREE">FREE (Gratuito)</option>
                            <option value="PRO">PRO (Profesional)</option>
                            <option value="CORPORATE">CORPORATE (Empresarial)</option>
                        </select>
                    </div>

                    {/* CONFIGURACIÓN DE VIGENCIA */}
                    {(formData.plan_type === 'TRIAL' || formData.plan_type === 'CORPORATE') && (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-end mb-3">
                                <label className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                                    <Calendar size={12}/> {formData.plan_type === 'TRIAL' ? 'Fin de Prueba' : 'Vencimiento Contrato'}
                                </label>
                                <span className="text-xs font-mono text-emerald-400">
                                    {formData.plan_type === 'TRIAL' 
                                        ? (formData.trial_ends_at ? format(new Date(formData.trial_ends_at), "dd/MM/yyyy") : 'Sin fecha')
                                        : (formData.plan_expires_at ? format(new Date(formData.plan_expires_at), "dd/MM/yyyy") : '∞ Indefinido')
                                    }
                                </span>
                            </div>

                            {/* BOTONES MÁGICOS */}
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {formData.plan_type === 'TRIAL' ? (
                                    <>
                                        <button onClick={() => applyDuration(15, 'days')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+15 Días</button>
                                        <button onClick={() => applyDuration(30, 'days')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+30 Días</button>
                                        <button onClick={setIndefinite} className="col-span-2 bg-slate-800 hover:text-red-400 text-slate-400 text-xs py-2 rounded transition-colors"><RotateCcw size={14} className="mx-auto"/></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => applyDuration(1, 'months')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+1 Mes</button>
                                        <button onClick={() => applyDuration(6, 'months')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+6 M</button>
                                        <button onClick={() => applyDuration(1, 'years')} className="bg-slate-800 hover:bg-vidiooh hover:text-black text-white text-xs py-2 rounded transition-colors">+1 Año</button>
                                        <button onClick={setIndefinite} className="bg-slate-800 hover:bg-emerald-500 hover:text-white text-emerald-500 text-xs py-2 rounded transition-colors border border-emerald-500/20">∞</button>
                                    </>
                                )}
                            </div>

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
                    )}

                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Límite de Usuarios</label>
                        <input 
                            type="number" 
                            value={formData.max_users}
                            onChange={(e) => setFormData({...formData, max_users: parseInt(e.target.value)})}
                            // Solo editable si es CORPORATE
                            disabled={formData.plan_type !== 'CORPORATE'}
                            className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none 
                                ${formData.plan_type !== 'CORPORATE' ? 'opacity-50 cursor-not-allowed' : 'focus:border-vidiooh'}`}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                            {formData.plan_type === 'CORPORATE' 
                                ? 'Editable: Ajusta según el contrato del cliente.' 
                                : 'Fijo: Este plan permite solo 1 usuario.'}
                        </p>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="pt-4 flex gap-3">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleUpdateCompany}
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

      {/* HEADER & NAV */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                <ArrowLeft size={16} /> Volver a Empresas
            </button>
            
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-vidiooh/20 rounded-2xl flex items-center justify-center text-vidiooh">
                    <Building2 size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{company?.name}</h1>
                    <div className="flex gap-3 mt-2 flex-wrap">
                        {/* Badge de Plan */}
                        <span className={`text-xs font-bold px-2 py-1 rounded border 
                             ${company?.plan_type === 'TRIAL' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                               company?.plan_type === 'CORPORATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                               'bg-slate-800 text-slate-300 border-slate-700'}`}>
                            {company?.plan_type}
                        </span>
                        
                        {/* Info de Vencimiento */}
                        {expirationDate ? (
                            <span className={`text-xs flex items-center gap-1 font-bold ${daysLeft !== null && daysLeft > 0 ? 'text-slate-400' : 'text-red-500'}`}>
                                <Clock size={12}/> 
                                {daysLeft !== null && daysLeft > 0 
                                    ? `Vence en ${daysLeft} días (${format(new Date(expirationDate), 'dd/MM/yyyy')})` 
                                    : 'EXPIRADO'}
                            </span>
                        ) : (
                            <span className="text-xs flex items-center gap-1 font-bold text-slate-500 italic">
                                <Clock size={12}/> Indefinido
                            </span>
                        )}

                        <span className="text-slate-500 text-xs flex items-center gap-1">ID: {company?.id}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* BOTÓN DE CONFIGURACIÓN (EDITAR) */}
        <button 
            onClick={() => setIsEditing(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm font-bold border border-slate-700 transition-all flex items-center gap-2"
        >
            <Settings size={18} />
            <span>Configurar Plan</span>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#0f141c] p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-xs uppercase font-bold">Total Empleados</p>
            <p className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <Users className="text-vidiooh" size={20}/> {employees.length} / {company?.max_users}
            </p>
         </div>
         <div className="bg-[#0f141c] p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-xs uppercase font-bold">Total Videos Convertidos</p>
            <p className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <Video className="text-blue-500" size={20}/> 
                {employees.reduce((acc, curr) => acc + curr.videoCount, 0)}
            </p>
         </div>
         <div className="bg-[#0f141c] p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-xs uppercase font-bold">Consumo Total</p>
            <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2 mt-1">
                <HardDrive size={20}/> 
                {formatBytes(monthlyStats.reduce((acc, curr) => acc + curr.size, 0))}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
        {/* TABLA: DESGLOSE POR USUARIO */}
        <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-800"><h3 className="font-bold text-white">Producción por Usuario</h3></div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                    <tr><th className="px-6 py-4">Empleado</th><th className="px-6 py-4 text-center">Videos</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 text-white">
                                {emp.email}<br/><span className="text-[10px] text-slate-500">{emp.role}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-mono font-bold">{emp.videoCount}</span>
                            </td>
                        </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-slate-500">Sin empleados</td></tr>}
                </tbody>
            </table>
        </div>

        {/* TABLA: REPORTE MENSUAL */}
        <div className="bg-[#0f141c] border border-slate-800 rounded-2xl overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-vidiooh"/>
                <h3 className="font-bold text-white">Historial Mensual</h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                    <tr>
                        <th className="px-6 py-4">Mes</th>
                        <th className="px-6 py-4 text-center">Videos</th>
                        <th className="px-6 py-4 text-right">Almacenamiento</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {monthlyStats.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">No hay actividad registrada</td></tr>
                    ) : monthlyStats.map((stat) => (
                        <tr key={stat.month} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-bold text-white">
                                {format(new Date(stat.month + '-01T00:00:00'), 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-300">{stat.count}</td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-400">{formatBytes(stat.size)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>

    </div>
  )
}