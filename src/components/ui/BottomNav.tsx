'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, History, Settings, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  // Función simple para detectar si la ruta está activa
  const isActive = (path: string) => pathname === path

  return (
    // 1. Fondo alineado con Landing Page (#020617) + Blur
    // 2. Borde sutil blanco (white/10) en lugar de slate-800
    <nav className="fixed bottom-0 w-full bg-[#020617]/90 backdrop-blur-md border-t border-white/10 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        
        <Link 
          href="/dashboard/convert" 
          // Si está activo usa tu naranja (text-vidiooh), si no, gris apagado
          className={`flex flex-col items-center transition-colors ${isActive('/dashboard/convert') ? 'text-vidiooh' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Clapperboard size={24} />
          <span className="text-[10px] mt-1 font-medium">Convertir</span>
        </Link>
        
        <Link 
          href="/dashboard/history" 
          className={`flex flex-col items-center transition-colors ${isActive('/dashboard/history') ? 'text-vidiooh' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History size={24} />
          <span className="text-[10px] mt-1 font-medium">Historial</span>
        </Link>

        <Link 
          href="/dashboard/formats" 
          className={`flex flex-col items-center transition-colors ${isActive('/dashboard/formats') ? 'text-vidiooh' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Settings size={24} />
          <span className="text-[10px] mt-1 font-medium">Formatos</span>
        </Link>

        <Link 
          href="/dashboard/account" 
          // Corregí la ruta de validación aquí para que coincida con el href (account vs profile)
          className={`flex flex-col items-center transition-colors ${isActive('/dashboard/account') ? 'text-vidiooh' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Cuenta</span>
        </Link>

      </div>
    </nav>
  )
}