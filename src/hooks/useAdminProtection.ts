import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export function useAdminProtection() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // 1. Verificar si hay sesión activa
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login') // Si no hay usuario, mandar a login
        return
      }

      // 2. Consultar el rol en la base de datos
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !profile || profile.role !== 'admin') {
        console.warn("Acceso denegado: Usuario no es administrador")
        router.replace('/dashboard/convert') // Si no es admin, mandar al dashboard normal
        return
      }

      // 3. Si pasa todo, es admin
      setIsAdmin(true)
    } catch (error) {
      router.replace('/dashboard/convert')
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading }
}