'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Clapperboard, History, Settings, User, LogOut, ShieldCheck } from 'lucide-react'
// Importamos el cerebro que acabamos de crear
import { createClient } from '../../lib/supabase/client'
import { useUserRole } from '../../hooks/useUserRole' 

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Usamos el hook para saber si es admin
  const { role, loading } = useUserRole() 
  const isActive = (path: string) => pathname === path

  // Función para cerrar sesión y mandarte al login
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="hidden md:flex fixed top-0 w-full h-16 bg-slate-950 border-b border-slate-800 items-center justify-between px-8 z-50">
      
      {/* 1. Logo + Etiqueta Admin */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-white tracking-tight">
          Vidiooh
        </div>
        
        {/* Solo aparece si eres ADMIN */}
        {!loading && role === 'admin' && (
          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/50 text-violet-400 text-[10px] font-bold flex items-center gap-1">
            <ShieldCheck size={12} /> ADMIN
          </span>
        )}
      </div>

      {/* 2. Menú Central */}
      <nav className="flex gap-8">
        <Link 
          href="/dashboard/convert" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/convert') ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
        >
          <Clapperboard size={18} /> Convertir
        </Link>
        
        <Link 
          href="/dashboard/history" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/history') ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
        >
          <History size={18} /> Historial
        </Link>
        
        <Link 
          href="/dashboard/formats" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/formats') ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={18} /> Formatos
        </Link>

        <Link 
          href="/dashboard/profile" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/profile') ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
        >
          <User size={18} /> Mi Cuenta
        </Link>
      </nav>

      {/* 3. Botón Salir (Funcional) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-xs font-medium" 
          title="Cerrar Sesión"
        >
          <span className="hidden lg:block">Salir</span>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}