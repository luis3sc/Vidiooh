'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, History, Settings, User } from 'lucide-react'
//import { cn } from '@/lib/utils' // Si no tienes utils, borra esta linea y usa clases normales

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 w-full bg-slate-950/90 backdrop-blur border-t border-slate-800 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/dashboard/convert" className={`flex flex-col items-center ${isActive('/dashboard/convert') ? 'text-violet-500' : 'text-slate-400'}`}>
          <Clapperboard size={24} />
          <span className="text-[10px] mt-1">Convertir</span>
        </Link>
        
        <Link href="/dashboard/history" className={`flex flex-col items-center ${isActive('/dashboard/history') ? 'text-violet-500' : 'text-slate-400'}`}>
          <History size={24} />
          <span className="text-[10px] mt-1">Historial</span>
        </Link>

        <Link href="/dashboard/formats" className={`flex flex-col items-center ${isActive('/dashboard/formats') ? 'text-violet-500' : 'text-slate-400'}`}>
          <Settings size={24} />
          <span className="text-[10px] mt-1">Formatos</span>
        </Link>

        <Link href="/dashboard/profile" className={`flex flex-col items-center ${isActive('/dashboard/profile') ? 'text-violet-500' : 'text-slate-400'}`}>
          <User size={24} />
          <span className="text-[10px] mt-1">Cuenta</span>
        </Link>
      </div>
    </nav>
  )
}