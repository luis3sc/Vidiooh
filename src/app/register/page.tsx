'use client'

import React, { useState } from 'react'
import Link from 'next/link'
// CORREGIDO: Usamos ../.. para llegar a la carpeta lib sin usar @
import { createClient } from '../../lib/supabase/client' 
import { Lock, Mail, UserPlus, Loader2, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // CORREGIDO: location.origin a veces falla en server, mejor dejarlo simple por ahora
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 text-center">
        <div className="max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">¡Cuenta Creada! 🚀</h2>
          <p className="text-slate-400 mb-6">
            Revisa tu correo para confirmar (o revisa Supabase si usas auto-confirm).
          </p>
          <Link href="/login" className="text-violet-500 hover:text-violet-400 font-medium">
            Ir al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Crear Cuenta</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Correo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input name="email" type="email" placeholder="cliente@ejemplo.com" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-violet-500" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input name="password" type="password" placeholder="******" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-violet-500" required />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Registrarme <UserPlus size={18} /></>}
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta? <Link href="/login" className="text-violet-400 hover:text-violet-300">Inicia Sesión</Link>
        </div>
      </div>
    </div>
  )
}