'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function useBlockCheck() {
  const router = useRouter()
  const pathname = usePathname()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkStatus()

    // Escucha en tiempo real (Baneos inmediatos)
    const channel = supabase
      .channel('security-check')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
      async (payload) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && payload.new.id === user.id && payload.new.status === 'banned') {
            router.replace('/banned')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pathname])

  const checkStatus = async () => {
    if (pathname === '/banned' || pathname === '/login' || pathname === '/') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Pedimos las fechas importantes
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, plan_type, trial_ends_at, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (!profile) return

    // 1. REGLA DE BANEO
    if (profile.status === 'banned') {
        router.replace('/banned')
        return
    }

    // 2. REGLA UNIVERSAL DE VENCIMIENTO (Sirve para Trial y para Pro)
    // Definimos qué fecha usar: Si tiene expiración de plan, usa esa. Si no, mira si tiene fin de trial.
    const expirationDate = profile.plan_expires_at || (profile.plan_type === 'TRIAL' ? profile.trial_ends_at : null)

    if (expirationDate) {
        const expires = new Date(expirationDate)
        const now = new Date()

        if (now > expires) {
            console.log("⏳ Tu plan o periodo de prueba ha vencido. Bajando a FREE...")

            // Downgrade automático
            await supabase.from('profiles').update({ 
                plan_type: 'FREE', 
                trial_ends_at: null,
                plan_expires_at: null // Limpiamos la fecha para que no buclee
            }).eq('id', user.id)

            window.location.reload()
        }
    }
  }
}