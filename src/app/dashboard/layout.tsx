'use client'

import React from 'react'
import BottomNav from '../../components/ui/BottomNav'
import TopNav from '../../components/ui/TopNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // CAMBIO: Fondo alineado con Landing Page (#020617)
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      
      {/* 1. Barra Superior (Solo visible en PC) */}
      <TopNav />
      
      {/* 2. Contenedor Principal */}
      <main className={`
        flex-1 w-full max-w-7xl mx-auto flex flex-col
        px-4 md:px-8          /* Padding lateral */
        pt-8 md:pt-28         /* Padding superior (Mobile 2rem / PC con espacio para barra) */
        mb-20 md:mb-0         /* 👈 CAMBIO: Aumenté un poco el margen móvil para evitar solapamiento */
        md:pb-12              /* Padding bottom solo en PC */
      `}>
        
        {/* Contenido de la página */}
        <div className="flex-1">
          {children}
        </div>

        {/* 3. Footer: Oculto en Móvil, Visible en PC */}
        {/* CAMBIO: Borde más sutil y colores de marca */}
        <div className="hidden md:block mt-12 py-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-semibold cursor-default">
            Powered by <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors">Aullyk</span>
          </p>
        </div>

      </main>

      {/* 4. Barra Inferior (Solo visible en Móvil) */}
      <BottomNav />
    </div>
  )
}