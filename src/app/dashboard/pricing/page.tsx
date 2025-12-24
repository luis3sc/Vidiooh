'use client'

import React, { useEffect, useState } from 'react'
import { Check, Zap, Shield, Sparkles, Building2, HelpCircle, ArrowRight, Loader2, PaintBucket, FileText, Users } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function PricingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('FREE')

  useEffect(() => {
    checkCurrentPlan()
  }, [])

  const checkCurrentPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, teams(plan_type)')
        .eq('id', user.id)
        .single()
      
      // @ts-ignore
      const plan = profile?.teams?.plan_type || profile?.plan_type || 'FREE'
      setCurrentPlan(plan)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Planes Flexibles
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Desde freelancers hasta grandes exclusivistas de OOH. Escala sin límites.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-vidiooh" size={40}/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
          
          {/* --- PLAN FREE (ANCLAJE) --- */}
          <div className="bg-[#151921] border border-slate-800 rounded-3xl p-8 flex flex-col h-full hover:border-slate-700 transition-colors order-2 md:order-1">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Freelance</h3>
              <p className="text-slate-400 text-sm mt-2">Para pruebas puntuales.</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">S/ 0</span>
              <span className="text-slate-500 ml-2">/siempre</span>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <Feature text="6 videos al mes" />
              <Feature text="Calidad HD (720p)" />
              <Feature text="2 Formatos guardados" />
              {/* CAMBIO: Ahora mostramos esto como positivo, no tachado */}
              <Feature text="Videos limpios (Sin marca de agua)" highlight />
              <Feature text="Sin historial en la nube" active={false} />
            </div>

            <button 
              disabled={currentPlan === 'FREE'}
              className="w-full py-4 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPlan === 'FREE' ? 'Tu Plan Actual' : 'Downgrade'}
            </button>
          </div>

          {/* --- PLAN PRO (HIGHLIGHT) --- */}
          <div className="bg-[#151921] border-2 border-vidiooh rounded-3xl p-8 flex flex-col h-full relative transform md:-translate-y-4 md:scale-105 shadow-2xl shadow-vidiooh/10 order-1 md:order-2 z-10">
            
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-vidiooh text-black text-xs font-black px-4 py-1.5 rounded-full tracking-wider uppercase shadow-lg shadow-vidiooh/40 flex items-center gap-1">
              <Sparkles size={12} fill="black" /> Recomendado
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Pro / Agencia</h3>
              <p className="text-slate-300 text-sm mt-2">Para uso profesional diario.</p>
            </div>
            
            <div className="mb-2 flex items-end gap-2">
              <span className="text-5xl font-bold text-white tracking-tight">S/ 40</span>
              <span className="text-slate-400 mb-2 font-medium">/mes</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium mb-8 bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
              Facturado anualmente S/ 480
            </p>

            <div className="space-y-4 flex-1 mb-8">
              {/* CAMBIOS: Nuevos límites definidos */}
              <Feature text={<span className="text-white font-bold">45 videos al mes 🔥</span>} highlight />
              <Feature text="Calidad Full HD (1080p)" highlight />
              <Feature text="Videos limpios (Sin marca de agua)" />
              <Feature text="8 Formatos Guardados" />
              <Feature text="Historial Cloud (7 días / 8 videos)" />
            </div>

            <button 
              onClick={() => alert("Integración de pagos pendiente")}
              disabled={currentPlan === 'PRO'}
              className="w-full py-4 rounded-xl bg-vidiooh hover:bg-vidiooh-dark text-black font-black text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-vidiooh/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPlan === 'PRO' ? 'Plan Actual' : 'Obtener PRO Ahora'}
            </button>
          </div>

        </div>
      )}

      {/* --- SECCIÓN CORPORATIVA --- */}
      <div className="mt-16 bg-gradient-to-r from-slate-900 to-[#0f141c] border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
              <Building2 className="text-slate-400"/> Plan Corporativo
            </h3>
            <p className="text-slate-400 max-w-xl">
              Ideal para empresas de OOH con múltiples usuarios. Incluye personalización total y gestión administrativa.
            </p>
          </div>
          
          <a 
            href="mailto:ventas@vidiooh.com?subject=Interesado%20en%20Plan%20Corporativo"
            className="whitespace-nowrap px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 group"
          >
            Contactar Ventas
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </a>
        </div>
        
        {/* Features Corporativas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/50">
            <CorpFeature icon={<PaintBucket size={16}/>} text="MARCA BLANCA (TU LOGO)" />
            <CorpFeature icon={<FileText size={16}/>} text="FACTURA / BOLETA" />
            <CorpFeature icon={<Users size={16}/>} text="ACCESO PARA TU EQUIPO" />
            <CorpFeature icon={<Shield size={16}/>} text="CONTRATO EMPRESARIAL" />
        </div>
      </div>

      <div className="text-center mt-12">
        <Link href="/dashboard/convert" className="text-slate-500 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
            <HelpCircle size={14}/> Regresar al convertidor
        </Link>
      </div>

    </div>
  )
}

// --- SUBCOMPONENTES ---

const Feature = ({ text, active = true, highlight = false }: { text: React.ReactNode, active?: boolean, highlight?: boolean }) => (
  <div className={`flex items-center gap-3 ${!active ? 'opacity-40' : ''}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-vidiooh text-black' : 'bg-slate-800 text-slate-400'}`}>
      {active ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-0.5 bg-slate-500"/>}
    </div>
    <span className={`text-sm ${highlight ? 'text-slate-200' : 'text-slate-400'}`}>{text}</span>
  </div>
)

// Componente modificado para aceptar Icono dinámico
const CorpFeature = ({ text, icon }: { text: string, icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 justify-center md:justify-start text-emerald-500">
        {icon}
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">{text}</span>
    </div>
)