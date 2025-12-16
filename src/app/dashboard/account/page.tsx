'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Shield, LogOut, HardDrive, 
  Activity, Crown, Zap, Loader2 
} from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  
  // Estadísticas
  const [monthlyVideos, setMonthlyVideos] = useState(0)
  const [totalStorage, setTotalStorage] = useState(0) // En Bytes

  // Cambio de Contraseña
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    // 1. Obtener Usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    setUserEmail(user.email || '')
    setUserId(user.id)

    // 2. Calcular Estadísticas del Mes Actual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: logs } = await supabase
      .from('conversion_logs')
      .select('file_size')
      .eq('user_id', user.id)
      .gte('created_at', firstDay) // Solo logs desde el día 1 del mes

    if (logs) {
      setMonthlyVideos(logs.length)
      // Sumamos el peso de todos los videos
      const totalBytes = logs.reduce((acc, curr) => acc + (curr.file_size || 0), 0)
      setTotalStorage(totalBytes)
    }

    setLoading(false)
  }

  // Helper para convertir Bytes a MB/GB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cerrar Sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Cambiar Contraseña
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
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-0">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Mi Cuenta</h1>
        <p className="text-slate-400 text-sm">Administra tu perfil y revisa tu consumo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PERFIL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Datos Personales */}
          <div className="bg-[#151921] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <User size={20} className="text-emerald-500" /> Información Personal
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={userEmail} 
                    disabled 
                    className="w-full bg-[#0f141c] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-400 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID de Usuario</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={userId} 
                    disabled 
                    className="w-full bg-[#0f141c] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-500 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad (Contraseña) */}
          <div className="bg-[#151921] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Shield size={20} className="text-emerald-500" /> Seguridad
            </h3>

            {!isChangingPass ? (
              <div className="flex items-center justify-between bg-[#0f141c] p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-white font-medium">Contraseña</p>
                  <p className="text-slate-500 text-xs">••••••••••••••••</p>
                </div>
                <button 
                  onClick={() => setIsChangingPass(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="bg-[#0f141c] p-4 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
                 <label className="text-xs font-bold text-emerald-500 uppercase mb-2 block">Nueva Contraseña</label>
                 <input 
                   type="password" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="Mínimo 6 caracteres"
                   className="w-full bg-[#151921] border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
                 />
                 <div className="flex gap-3">
                   <button 
                     onClick={handleChangePassword} 
                     disabled={passLoading}
                     className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                   >
                     {passLoading ? 'Actualizando...' : 'Guardar Nueva'}
                   </button>
                   <button 
                     onClick={() => setIsChangingPass(false)} 
                     className="px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg"
                   >
                     Cancelar
                   </button>
                 </div>
              </div>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS Y PLAN */}
        <div className="space-y-6">
          
          {/* Tarjeta de Plan */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-[#151921] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown size={100} />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                Plan Actual
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">FREE</h2>
            <p className="text-emerald-400 text-sm mb-6">Cuenta Gratuita</p>
            
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-not-allowed">
              Gestionar Suscripción (Pronto)
            </button>
          </div>

          {/* Estadísticas de Uso */}
          <div className="bg-[#151921] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Uso este Mes
            </h3>

            <div className="space-y-6">
              {/* Videos Convertidos */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Zap size={14} /> Videos Convertidos
                  </span>
                  <span className="text-white font-mono">{monthlyVideos} / 100</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((monthlyVideos / 100) * 100, 100)}%` }} 
                  />
                </div>
              </div>

              {/* Almacenamiento */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <HardDrive size={14} /> Almacenamiento
                  </span>
                  <span className="text-white font-mono">{formatBytes(totalStorage)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  {/* Barra visual de progreso (ejemplo con límite ficticio de 1GB para mostrar algo) */}
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((totalStorage / (1024*1024*1024)) * 100, 100)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-right">Acumulado en videos generados</p>
              </div>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Cerrar Sesión</span>
          </button>

        </div>
      </div>
    </div>
  )
}