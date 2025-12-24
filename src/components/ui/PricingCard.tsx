import React from 'react'
import { Check, CheckCircle2, Sparkles, X } from 'lucide-react'

interface PricingCardProps {
  plan: any // O el tipo importado de tu config
  billingCycle?: 'monthly' | 'semiannual' | 'yearly' // Solo para landing
  currentPlan?: string // Solo para dashboard (para saber cual deshabilitar)
  onAction: () => void // Función al hacer click
}

export const PricingCard = ({ plan, billingCycle = 'monthly', currentPlan, onAction }: PricingCardProps) => {
  
  // Lógica de precio dinámico
  let displayPrice = plan.price
  let note = "/siempre"

  if (plan.id === 'PRO') {
      if (billingCycle === 'monthly') {
          displayPrice = plan.prices.monthly
          note = "/mes"
      } else if (billingCycle === 'semiannual') {
          displayPrice = Math.round(plan.prices.semiannual / 6)
          note = "/mes (Facturado semestral)"
      } else {
          displayPrice = Math.round(plan.prices.yearly / 12)
          note = "/mes (Ahorras 20%)"
      }
  }

  const isCurrent = currentPlan === plan.id
  const isPro = plan.id === 'PRO'

  return (
    <div className={`
        relative flex flex-col p-8 rounded-3xl border transition-all duration-300
        ${isPro 
            ? 'bg-[#151921] border-vidiooh shadow-2xl shadow-vidiooh/10 md:-translate-y-4' 
            : 'bg-[#0f141c] border-slate-800 hover:border-slate-700'}
    `}>
      {/* Badge Popular */}
      {isPro && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-vidiooh text-black text-xs font-black px-4 py-1.5 rounded-full uppercase shadow-lg shadow-vidiooh/40 flex items-center gap-1">
          <Sparkles size={12} fill="black" /> Recomendado
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-slate-400 text-sm">{plan.description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">S/ {displayPrice}</span>
            <span className="text-slate-500 font-medium mb-1">{note}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 mb-8">
        {plan.features.map((feature: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 text-sm ${!feature.included ? 'opacity-50' : ''}`}>
             {feature.included 
                ? <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${feature.highlight ? 'bg-vidiooh text-black' : 'bg-slate-800 text-slate-400'}`}><Check size={14} strokeWidth={3}/></div>
                : <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-slate-900 text-slate-600"><X size={14}/></div>
             }
             <span className={`${feature.highlight ? 'text-white font-medium' : 'text-slate-300'}`}>{feature.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onAction}
        disabled={isCurrent}
        className={`w-full py-4 rounded-xl font-bold transition-all
            ${isPro 
                ? 'bg-vidiooh hover:bg-vidiooh-dark text-black shadow-lg hover:scale-[1.02]' 
                : 'border border-slate-700 hover:bg-slate-800 text-white'}
            ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isCurrent ? 'Plan Actual' : plan.buttonText}
      </button>
    </div>
  )
}