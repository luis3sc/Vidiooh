'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Clapperboard, History, Settings, User, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '../../lib/supabase/client'
import { useUserRole } from '../../hooks/useUserRole' 

// --- COMPONENTE LOGO SVG (Para el Dashboard) ---
const VidioohLogo = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1366 369" 
    className={className} 
  >
    <g fill="#FFFFFF">
      <path d="M408.34,91.39h48.59l33.57,93.89c.7,1.88,2.58,9.39,5.63,22.53,3.05-13.14,5.16-20.66,5.87-22.53l33.33-93.89h48.59l-70.42,167.83h-34.74l-70.42-167.83Z"/>
      <path d="M595.88,143.5h40.84v115.72h-40.84v-115.72Z"/>
      <path d="M792.58,259.22h-37.56v-18.78c-10.33,15.49-23.24,23.24-39.2,23.24-31.92,0-53.28-23.47-53.28-62.2s21.59-61.73,51.87-61.73c19.01,0,30.04,5.63,40.37,23-.94-6.57-1.41-13.61-1.41-20.66v-60.56h39.2v177.69ZM729.67,172.37c-16.43,0-26.52,11.27-26.52,29.11s10.09,29.11,26.52,29.11,26.76-11.03,26.76-29.11-10.33-29.11-26.76-29.11Z"/>
      <path d="M824.03,143.5h40.84v115.72h-40.84v-115.72Z"/>
      <path d="M954.07,263.68c-36.85,0-64.55-27.93-64.55-61.97s27.93-61.97,64.55-61.97,64.78,27.7,64.78,61.97-28.17,61.97-64.78,61.97ZM954.07,173.78c-15.02,0-24.18,10.8-24.18,27.93s9.15,27.7,24.18,27.7,24.18-10.56,24.18-27.7-9.15-27.93-24.18-27.93Z"/>
      <path d="M1100.3,263.68c-36.85,0-64.55-27.93-64.55-61.97s27.93-61.97,64.55-61.97,64.78,27.7,64.78,61.97-28.17,61.97-64.78,61.97ZM1100.3,173.78c-15.02,0-24.18,10.8-24.18,27.93s9.15,27.7,24.18,27.7,24.18-10.56,24.18-27.7-9.15-27.93-24.18-27.93Z"/>
      <path d="M1188.55,81.53h40.14v62.44c0,7.04-.47,14.32-1.41,20.89,10.56-17.37,23.47-25.12,42.95-25.12,15.02,0,27.23,5.16,34.27,14.08,7.75,9.86,8.45,22.53,8.45,39.2v66.19h-40.84v-61.97c0-18.07-5.4-26.52-19.01-26.52-18.31,0-24.41,13.85-24.41,39.9v48.59h-40.14V81.53Z"/>
    </g>
    {/* Icono: Usa la clase "text-vidiooh" del padre o se puede poner fill="#F04E30" directo */}
    <polygon className="text-vidiooh" fill="currentColor" points="136.72 324.12 30.88 324.12 30.88 49.18 239.73 175.75 96.93 269.17 96.93 172.21 132.36 172.21 132.36 203.66 173.26 176.9 66.31 112.08 66.31 288.69 125.27 288.69 285.07 173.39 89.42 53.11 107.97 22.93 348.89 171.03 136.72 324.12"/>
  </svg>
)
// ----------------------------

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const { role, loading } = useUserRole() 
  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    // CAMBIO: Fondo alineado (#020617) y borde sutil
    <header className="hidden md:flex fixed top-0 w-full h-16 bg-[#020617] border-b border-white/10 items-center justify-between px-8 z-50">
      
      {/* 1. Logo Real + Etiqueta Admin */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/convert">
            <VidioohLogo className="h-7 w-auto text-vidiooh" />
        </Link>
        
        {/* Etiqueta Admin Branding: Naranja en lugar de Violeta */}
        {!loading && role === 'admin' && (
          <span className="px-2 py-0.5 rounded-full bg-vidiooh/10 border border-vidiooh/50 text-vidiooh text-[10px] font-bold flex items-center gap-1">
            <ShieldCheck size={12} /> ADMIN
          </span>
        )}
      </div>

      {/* 2. Menú Central */}
      <nav className="flex gap-8">
        <Link 
          href="/dashboard/convert" 
          // CAMBIO: text-vidiooh para estado activo
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/convert') ? 'text-vidiooh' : 'text-slate-400 hover:text-white'}`}
        >
          <Clapperboard size={18} /> Convertir
        </Link>
        
        <Link 
          href="/dashboard/history" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/history') ? 'text-vidiooh' : 'text-slate-400 hover:text-white'}`}
        >
          <History size={18} /> Historial
        </Link>
        
        <Link 
          href="/dashboard/formats" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/formats') ? 'text-vidiooh' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={18} /> Formatos
        </Link>

        <Link 
          href="/dashboard/account" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard/account') ? 'text-vidiooh' : 'text-slate-400 hover:text-white'}`}
        >
          <User size={18} /> Mi Cuenta
        </Link>
      </nav>

      {/* 3. Botón Salir */}
      <div className="flex items-center gap-4">
      </div>
    </header>
  )
}