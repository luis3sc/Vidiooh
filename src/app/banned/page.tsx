'use client'

import React, { useEffect, useState } from 'react'
import { Ban, ShieldAlert, LogOut, Loader2 } from 'lucide-react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BannedPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [caseId, setCaseId] = useState<string>('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setCaseId(Math.random().toString(36).substr(2, 9).toUpperCase())
    
    // 1. Verificación inicial (por si ya entra desbaneado)
    const checkInitialStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.replace('/login')
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .single()

        if (data?.status !== 'banned') {
            router.replace('/dashboard/convert')
        } else {
            setChecking(false) // Solo quitamos carga si sigue baneado
            
            // 2. ACTIVAR ESCUCHA EN TIEMPO REAL (WebSockets)
            // Solo nos suscribimos si confirmamos que el usuario está ahí
            subscribeToChanges(user.id)
        }
    }

    checkInitialStatus()

    // Limpieza al desmontar
    return () => {
        supabase.channel('custom-filter-channel').unsubscribe()
    }
  }, [])

  const subscribeToChanges = (userId: string) => {
    console.log("👂 Escuchando cambios en tiempo real...")

    const channel = supabase
      .channel('profile-status-change')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Escuchar solo actualizaciones
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`, // Solo escuchar MI fila, no la de otros
        },
        (payload) => {
          // payload.new es el nuevo dato que llegó de la base de datos
          const newStatus = payload.new.status
          console.log("Cambio detectado:", newStatus)

          if (newStatus !== 'banned') {
             // ¡LIBRE! Redirección instantánea
             router.replace('/dashboard/convert')
          }
        }
      )
      .subscribe()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
      return (
          <div className="min-h-screen bg-[#020617] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-red-500" size={40}/>
                <p className="text-slate-500 text-sm animate-pulse">Verificando estado de cuenta...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {/* ... (El resto del diseño visual se mantiene IDÉNTICO) ... */}
      <div className="max-w-md w-full bg-[#0f141c] border border-red-900/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-200 text-sm font-medium flex items-center justify-center gap-2">
                <Ban size={16}/> Tu cuenta ha sido suspendida.
            </p>
        </div>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Detectamos actividad que incumple nuestras <span className="text-slate-300 font-bold"> Políticas de Uso</span> o falta de pago.
            <br/><br/>
            Si crees que esto es un error, por favor contacta a soporte para revisar tu caso.
        </p>
        <div className="space-y-3">
            <a href="mailto:soporte@vidiooh.com" className="block w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">Contactar Soporte</a>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 text-slate-500 hover:text-white transition-colors text-sm font-medium">
                <LogOut size={16}/> Cerrar Sesión
            </button>
        </div>
        <p className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest">
            ID de caso: {caseId}
        </p>
      </div>
    </div>
  )
}