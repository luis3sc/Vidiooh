'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr' // O tu import '../lib/supabase/client'

export function useBlockCheck() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Usamos createBrowserClient para consistencia con tus otros archivos
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // 1. Chequeo inicial al cargar
    checkStatus()

    // 2. ESCUCHA EN TIEMPO REAL (El "Francotirador") 
    // Esto detecta si cambias el status en tu panel de Admin y lo expulsa al instante
    const channel = supabase
      .channel('security-check')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, async (payload) => {
        // Obtenemos el usuario actual para ver si el cambio me afecta a MÍ
        const { data: { user } } = await supabase.auth.getUser()
        
        // Si el ID modificado es el mío Y el nuevo estado es 'banned' -> ¡Fuera!
        if (user && payload.new.id === user.id && payload.new.status === 'banned') {
            console.warn("⛔ Tu cuenta ha sido suspendida en tiempo real.")
            router.replace('/banned')
        }
      })
      .subscribe()

    // Limpieza al desmontar
    return () => { supabase.removeChannel(channel) }

  }, [pathname]) // Se reactiva si cambias de ruta

  const checkStatus = async () => {
    // Evitamos bucles si ya estamos donde debemos estar
    if (pathname === '/banned' || pathname === '/login' || pathname === '/') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    if (profile && profile.status === 'banned') {
        router.replace('/banned')
    }
  }
}