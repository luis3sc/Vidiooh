'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '../../hooks/useUserRole'
import { Loader2 } from 'lucide-react'

export default function DashboardRoot() {
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Esperar a que Supabase responda

    if (role === 'admin') {
      // 👮‍♂️ Si es JEFE -> A la oficina
      router.replace('/dashboard/admin')
    } else {
      // 👷‍♂️ Si es CLIENTE (o no tiene rol) -> A trabajar
      router.replace('/dashboard/convert')
    }
  }, [role, loading, router])

  // Mientras piensa, mostramos un spinner elegante
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-4">
      <Loader2 className="animate-spin text-violet-500" size={40} />
      <p className="text-sm font-medium animate-pulse">Verificando credenciales...</p>
    </div>
  )
}