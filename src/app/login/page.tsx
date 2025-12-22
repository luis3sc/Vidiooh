'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' 
import { createClient } from '../../lib/supabase/client'
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

// --- COMPONENTE ICONO VIDIOOH (SVG Actualizado) ---
const VidioohIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 494.22 494.22"
    className={className}
    fill="currentColor"
  >
    <polygon points="167.38 472.94 8.67 472.94 8.67 60.65 321.86 250.45 107.71 390.55 107.71 245.14 160.84 245.14 160.84 292.3 222.19 252.17 61.8 154.98 61.8 419.81 150.22 419.81 389.85 246.91 96.45 66.54 124.28 21.28 485.56 243.38 167.38 472.94"/>
  </svg>
)
// --------------------------------------------------

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Correo o contraseña incorrectos.' 
        : error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative">
      
      {/* --- BOTÓN VOLVER AL INICIO --- */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group z-10"
      >
        <div className="p-2 bg-slate-900 border border-slate-800 rounded-full group-hover:border-vidiooh transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-sm font-medium hidden md:block">Volver al inicio</span>
      </Link>

      {/* Fondo decorativo (Idéntico al Registro) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-vidiooh/5 blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-vidiooh/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 z-10">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
             <div className="w-10 h-10 bg-vidiooh rounded-xl flex items-center justify-center">
                {/* --- NUEVO ICONO SVG --- */}
                <VidioohIcon className="text-black w-6 h-6" /> 
             </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-vidiooh transition-colors" size={20} />
              <input 
                name="email"
                type="email" 
                placeholder="ejemplo@correo.com"
                className="w-full bg-[#0f141c] border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:border-vidiooh focus:ring-1 focus:ring-[#F04E30] outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-vidiooh transition-colors" size={20} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#0f141c] border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:border-vidiooh focus:ring-1 focus:ring-[#F04E30] outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-vidiooh hover:bg-vidiooh-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-vidiooh/10"
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Ingresar al Sistema <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center text-sm text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="text-vidiooh hover:text-vidiooh-light font-bold hover:underline transition-colors">
            Crear cuenta gratis
          </Link>
        </div>

      </div>

      {/* --- FOOTER AYLLUK --- */}
      <div className="absolute bottom-6 w-full text-center z-0">
        <p className="text-[10px] md:text-xs text-slate-600 font-medium tracking-wide">
          © 2025 Vidiooh. Tecnología desarrollada por <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors cursor-default">Aylluk</span>.
        </p>
      </div>

    </div>
  )
}