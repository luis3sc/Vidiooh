'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr' 
// 1. Agregamos 'User' a los iconos
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, User } from 'lucide-react'

// --- COMPONENTE ICONO VIDIOOH ---
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // 2. Capturamos el nombre
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        // 3. ENVIAMOS EL NOMBRE A SUPABASE (METADATA)
        data: {
            first_name: name, // Esto es lo que usará el Email Template
            full_name: name   // Por si acaso lo necesites luego
        }
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-vidiooh/10 blur-[120px]" />
        </div>

        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl relative z-10 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-vidiooh/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-vidiooh" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Cuenta Creada! 🚀</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Hemos enviado un enlace de confirmación a tu correo. Por favor revísalo para continuar.
          </p>
          <Link href="/login">
            <button className="w-full bg-vidiooh hover:bg-vidiooh-dark text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg">
                Ir al Login
            </button>
          </Link>
        </div>

        <div className="absolute bottom-6 w-full text-center z-20">
          <p className="text-[10px] md:text-xs text-slate-600 font-medium tracking-wide">
            © 2025 Vidiooh. Tecnología desarrollada por <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors cursor-default">Aylluk</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative">
      
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group z-10"
      >
        <div className="p-2 bg-slate-900 border border-slate-800 rounded-full group-hover:border-vidiooh transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-sm font-medium hidden md:block">Volver al inicio</span>
      </Link>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-vidiooh/5 blur-[100px]" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-vidiooh/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 z-10">
        
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
             <div className="w-10 h-10 bg-vidiooh rounded-xl flex items-center justify-center">
                <VidioohIcon className="text-black w-6 h-6" /> 
             </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-400 text-sm">Únete para empezar a convertir videos.</p>
        </div>

        <div className="flex justify-center gap-4 mb-8 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-vidiooh" /> Sin marca de agua</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-vidiooh" /> Calidad HD</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-vidiooh" /> Gratis</div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* --- 4. NUEVO CAMPO NOMBRE --- */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Tu Nombre</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-vidiooh transition-colors" size={20} />
              <input 
                name="name" 
                type="text" 
                placeholder="Juan Pérez" 
                className="w-full bg-[#0f141c] border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:border-vidiooh focus:ring-1 focus:ring-[#F04E30] outline-none transition-all placeholder:text-slate-600" 
                required 
              />
            </div>
          </div>
          {/* --------------------------- */}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-vidiooh transition-colors" size={20} />
              <input 
                name="email" 
                type="email" 
                placeholder="cliente@ejemplo.com" 
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
                placeholder="******" 
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
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Registrarme <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-vidiooh hover:text-vidiooh-light font-bold hover:underline transition-colors">
            Inicia Sesión
          </Link>
        </div>

      </div>

      <div className="absolute bottom-6 w-full text-center z-0">
        <p className="text-[10px] md:text-xs text-slate-600 font-medium tracking-wide">
          © 2025 Vidiooh. Tecnología desarrollada por <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors cursor-default">Aylluk</span>.
        </p>
      </div>

    </div>
  )
}