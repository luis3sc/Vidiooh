'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Shield, LogOut, HardDrive, 
  Activity, Crown, Zap, Loader2, Building2, CalendarDays, Clock 
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  
  // Datos del Usuario
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [companyName, setCompanyName] = useState('Freelance / Independiente') 
  const [userPlan, setUserPlan] = useState('FREE') 
  
  // FECHAS DE MEMBRESÍA
  const [planStartsAt, setPlanStartsAt] = useState<string | null>(null)
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)

  // Estadísticas
  const [monthlyVideos, setMonthlyVideos] = useState(0)
  const [totalStorage, setTotalStorage] = useState(0)

  // Cambio de Contraseña
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    // 1. Obtener Usuario Autenticado
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUserEmail(user.email || '')
    setUserId(user.id)

    // 2. Obtener Perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
       console.error("Error al cargar perfil:", profileError.message)
    }

    // 3. Obtener Equipo / Plan y FECHAS
    if (profile && profile.team_id) {
        // SI ES CORPORATIVO
        const { data: team } = await supabase
            .from('teams')
            .select('*')
            .eq('id', profile.team_id)
            .single()
        
        if (team) {
            setCompanyName(team.name)
            // @ts-ignore
            setUserPlan(team.plan_type?.toUpperCase() || 'FREE')
            setPlanStartsAt(team.created_at)
            setPlanExpiresAt(team.plan_expires_at)
        }
    } else {
        // SI ES INDIVIDUAL
        setCompanyName('Freelance / Independiente')
        setUserPlan(profile?.plan_type || 'FREE')
        setPlanStartsAt(profile?.plan_starts_at || profile?.created_at)
        
        if (profile?.plan_type === 'TRIAL') {
            setPlanExpiresAt(profile?.trial_ends_at)
        } else {
            setPlanExpiresAt(profile?.plan_expires_at)
        }
    }
    
    // 4. Calcular Estadísticas
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: logs } = await supabase
      .from('conversion_logs')
      .select('file_size')
      .eq('user_id', user.id)
      .gte('created_at', firstDay)

    if (logs) {
      setMonthlyVideos(logs.length)
      const totalBytes = logs.reduce((acc, curr) => acc + (curr.file_size || 0), 0)
      setTotalStorage(totalBytes)
    }

    setLoading(false)
  }

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return 'No definida'
    return format(new Date(dateStr), "dd 'de' MMMM, yyyy", { locale: es })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setPassLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('¡Contraseña actualizada correctamente!')
      setIsChangingPass(false)
      setNewPassword('')
    }
    setPassLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-vidiooh" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-0">
      
      {/* HEADER CON BOTÓN DE SALIDA RÁPIDA (VISIBLE SIEMPRE) */}
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Mi Cuenta</h1>
            <p className="text-slate-400 text-sm">Administra tu perfil y revisa tu membresía.</p>
        </div>
        
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20 text-sm font-bold shadow-lg"
        >
            <LogOut size={18}/> 
            <span>Salir</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PERFIL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Datos Personales */}
          <div className="bg-[#0f141c] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <User size={20} className="text-vidiooh" /> Información Personal
            </h3>

            <div className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-vidiooh uppercase ml-1">Empresa / Organización</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-vidiooh" size={18} />
                  <input 
                    type="text" 
                    value={companyName} 
                    disabled 
                    className="w-full bg-[#151921] border border-vidiooh/30 rounded-xl pl-12 pr-4 py-3 text-white font-bold cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" value={userEmail} disabled className="w-full bg-[#151921] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-400 cursor-not-allowed select-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID de Usuario</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" value={userId.substring(0, 18) + '...'} disabled className="w-full bg-[#151921] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-500 text-xs font-mono cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETALLES DE MEMBRESÍA */}
          {userPlan !== 'FREE' && (
            <div className="bg-[#0f141c] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-vidiooh/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                    <CalendarDays size={20} className="text-vidiooh" /> Detalles de Membresía
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-[#151921] p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Clock size={18} className="text-emerald-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Miembro Desde</span>
                        </div>
                        <p className="text-white font-bold ml-11 text-sm md:text-base">
                            {formatFullDate(planStartsAt)}
                        </p>
                    </div>

                    <div className="bg-[#151921] p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-vidiooh/10 rounded-lg">
                                <Zap size={18} className="text-vidiooh" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Vencimiento / Renovación</span>
                        </div>
                        <p className="text-white font-bold ml-11 text-sm md:text-base">
                            {planExpiresAt ? formatFullDate(planExpiresAt) : 'Acceso Vitalicio / Indefinido'}
                        </p>
                    </div>
                </div>
                
                <p className="mt-4 text-[10px] text-slate-500 italic relative z-10">
                    * Si tienes dudas sobre tu facturación, contacta a soporte.
                </p>
            </div>
          )}

          {/* Seguridad */}
          <div className="bg-[#0f141c] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Shield size={20} className="text-vidiooh" /> Seguridad
            </h3>
            {!isChangingPass ? (
              <div className="flex items-center justify-between bg-[#151921] p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-white font-medium">Contraseña</p>
                  <p className="text-slate-500 text-xs">••••••••••••••••</p>
                </div>
                <button onClick={() => setIsChangingPass(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">Cambiar</button>
              </div>
            ) : (
              <div className="bg-[#151921] p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-vidiooh uppercase mb-2 block">Nueva Contraseña</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#0f141c] border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-vidiooh outline-none mb-4" />
                  <div className="flex gap-3">
                    <button onClick={handleChangePassword} disabled={passLoading} className="flex-1 bg-vidiooh hover:bg-vidiooh-dark text-black font-bold py-2 rounded-lg">{passLoading ? 'Actualizando...' : 'Guardar Nueva'}</button>
                    <button onClick={() => setIsChangingPass(false)} className="px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg">Cancelar</button>
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PLAN Y ESTADÍSTICAS */}
        <div className="space-y-6">
          
          {/* Tarjeta de Plan DINÁMICA */}
          <div className="bg-gradient-to-br from-vidiooh/20 to-[#0f141c] border border-vidiooh/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown size={100} className="text-vidiooh" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${userPlan === 'PRO' || userPlan === 'CORPORATE' ? 'bg-vidiooh text-black' : 'bg-slate-600 text-white'}`}>
                Plan Actual
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">{userPlan === 'CORPORATE' ? 'EMPRESAS' : userPlan}</h2>
            <p className="text-vidiooh text-sm mb-6 font-medium">
              {userPlan === 'FREE' ? 'Cuenta Gratuita' : userPlan === 'CORPORATE' ? 'Plan Corporativo Activo' : 'Suscripción Profesional'}
            </p>
            
            <button onClick={() => router.push('/dashboard/pricing')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">
              {userPlan === 'FREE' ? 'Mejorar Plan' : 'Ver Planes'}
            </button>
          </div>

          <div className="bg-[#0f141c] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><Activity size={20} className="text-vidiooh" /> Uso este Mes</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Zap size={14} /> Videos Convertidos</span>
                  <span className="text-white font-mono">{monthlyVideos} / {userPlan === 'FREE' ? '6' : userPlan === 'PRO' ? '45' : '∞'}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-vidiooh rounded-full transition-all duration-500" style={{ width: `${Math.min((monthlyVideos / (userPlan === 'FREE' ? 6 : userPlan === 'PRO' ? 45 : 100)) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                  <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 flex items-center gap-2"><HardDrive size={14} /> Almacenamiento</span>
                  <span className="text-white font-mono">{formatBytes(totalStorage)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-vidiooh rounded-full" style={{ width: '5%' }} /> 
                </div>
              </div>
            </div>
          </div>

          {/* ✅ HE ELIMINADO EL BOTÓN DE CERRAR SESIÓN QUE ESTABA AQUÍ
             PORQUE YA LO TIENES EN EL HEADER VISIBLE PARA MÓVIL
          */}

        </div>
      </div>
    </div>
  )
}