'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Users, Building2, Activity, LogOut, Loader2 
} from 'lucide-react'
import { useAdminProtection } from '../../../hooks/useAdminProtection'

// --- COMPONENTE: ITEM DE MENÚ ESCRITORIO ---
const SidebarItem = ({ href, icon: Icon, label, active }: any) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-vidiooh text-white shadow-lg shadow-vidiooh/20 font-bold' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
)

// --- COMPONENTE: ITEM DE MENÚ MÓVIL (BOTTOM BAR) ---
const BottomNavItem = ({ href, icon: Icon, label, active }: any) => (
  <Link 
    href={href}
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-full ${
      active 
        ? 'text-vidiooh' 
        : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <Icon size={active ? 24 : 22} className={active ? "drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" : ""} />
    <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </Link>
)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Protección de Admin
  const { isAdmin, loading } = useAdminProtection()

  const handleExit = async () => {
    router.push('/dashboard/convert') 
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-vidiooh animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse font-medium">Cargando panel...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans relative">
      
      {/* =========================================
          SIDEBAR (SOLO ESCRITORIO - MD en adelante)
         ========================================= */}
      <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col bg-[#0f141c] shrink-0 h-screen sticky top-0">
        
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-black text-white tracking-tight">
            Vidiooh <span className="text-vidiooh">Admin</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem href="/dashboard/admin" icon={LayoutDashboard} label="General" active={pathname === '/dashboard/admin'} />
          <SidebarItem href="/dashboard/admin/companies" icon={Building2} label="Empresas" active={pathname.includes('/companies')} />
          <SidebarItem href="/dashboard/admin/users" icon={Users} label="Usuarios" active={pathname.includes('/users')} />
          <SidebarItem href="/dashboard/admin/activity" icon={Activity} label="Auditoría" active={pathname.includes('/activity')} />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#0f141c]">
          <button onClick={handleExit} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all w-full">
            <LogOut size={18} />
            <span className="text-sm">Salir del Admin</span>
          </button>
        </div>
      </aside>


      {/* =========================================
          CONTENIDO PRINCIPAL
         ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 border-b border-slate-800 bg-[#0f141c]/80 backdrop-blur flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0">
           <div className="flex items-center gap-3">
             {/* Logo visible solo en móvil ya que no hay sidebar */}
             <span className="md:hidden text-lg font-black text-white tracking-tight">
                Vidiooh <span className="text-vidiooh">Admin</span>
             </span>
             <h2 className="text-sm font-medium text-slate-400 hidden md:block">Panel de Control Global</h2>
           </div>

           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-emerald-500 font-bold hidden sm:block">Sistema Operativo</span>
             </div>
             
             {/* Botón Salir (Solo Móvil - Icono pequeño) */}
             <button onClick={handleExit} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full">
                <LogOut size={16} />
             </button>
           </div>
        </header>

        {/* ÁREA DE SCROLL (Con padding extra abajo para el menú móvil) */}
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full pb-24 md:pb-8">
          {children}
        </div>

      </main>


      {/* =========================================
          BOTTOM NAVIGATION (SOLO MÓVIL)
         ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f141c]/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 pb-safe z-50 flex justify-around items-center h-[72px]">
          <BottomNavItem 
            href="/dashboard/admin" 
            icon={LayoutDashboard} 
            label="General" 
            active={pathname === '/dashboard/admin'} 
          />
          <BottomNavItem 
            href="/dashboard/admin/companies" 
            icon={Building2} 
            label="Empresas" 
            active={pathname.includes('/companies')} 
          />
          <BottomNavItem 
            href="/dashboard/admin/users" 
            icon={Users} 
            label="Usuarios" 
            active={pathname.includes('/users')} 
          />
          <BottomNavItem 
            href="/dashboard/admin/activity" 
            icon={Activity} 
            label="Auditoría" 
            active={pathname.includes('/activity')} 
          />
      </div>

    </div>
  )
}