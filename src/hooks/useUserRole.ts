'use client'

import { useEffect, useState } from 'react'
// Ruta relativa para evitar errores con @
import { createClient } from '../lib/supabase/client'

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setRole(null)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setRole(profile?.role || 'client')
      } catch (error) {
        console.error('Error verificando rol:', error)
        setRole('client')
      } finally {
        setLoading(false)
      }
    }

    getUserRole()
  }, [])

  return { role, loading }
}