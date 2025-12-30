'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import BottomNav from '../../components/ui/BottomNav'
import TopNav from '../../components/ui/TopNav'
import FeedbackButton from '../../components/FeedbackButton' // <--- 1. IMPORTAR AQUÍ
// Asegúrate que esta ruta sea correcta hacia el archivo que acabamos de crear arriba
import { useBlockCheck } from '../../hooks/useBlockCheck'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // 🛡️ GUARDIA DE SEGURIDAD
  // Se ejecuta automáticamente al montar el layout.
  // Protege /convert, /history, /pricing, /formats, etc.
  useBlockCheck()

  // 1. DETECTAR SI ESTAMOS EN EL ADMIN
  const isAdminRoute = pathname?.startsWith('/dashboard/admin')

  // 2. SI ES ADMIN, RENDERIZAR "LIMPIO"
  if (isAdminRoute) {
    return <>{children}</>
  }

  // 3. SI ES USUARIO NORMAL, RENDERIZAR LA INTERFAZ COMPLETA
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative"> {/* Agregado relative por si acaso */}
      
      {/* Barra Superior */}
      <TopNav />
      
      {/* Contenedor Principal */}
      <main className={`
        flex-1 w-full max-w-7xl mx-auto flex flex-col
        px-4 md:px-8          
        pt-8 md:pt-28         
        mb-20 md:mb-0         
        md:pb-12              
      `}>
        <div className="flex-1 animate-in fade-in duration-300">
          {children}
        </div>

        {/* Footer */}
        <div className="hidden md:block mt-12 py-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-semibold cursor-default">
            Powered by <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors">Aylluk</span>
          </p>
        </div>
      </main>

      {/* --- 2. BOTÓN DE FEEDBACK (Flotante) --- */}
      <FeedbackButton />

      {/* Barra Inferior */}
      <BottomNav />
    </div>
  )
}