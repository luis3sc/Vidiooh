'use client'

import React, { useState } from 'react'
import { MessageSquarePlus, X, Loader2, Send, Bug, Lightbulb, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { usePathname } from 'next/navigation'

interface FeedbackButtonProps {
  mode?: 'floating' | 'inline' | 'text'
}

export default function FeedbackButton({ mode = 'floating' }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'bug' | 'idea'>('bug')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const { error } = await supabase.from('feedbacks').insert({
            user_id: user.id,
            user_email: user.email,
            type,
            message,
            page_url: pathname 
        })

        if (!error) {
            setSent(true)
            setTimeout(() => {
                setSent(false)
                setIsOpen(false)
                setMessage('')
            }, 2500)
        } else {
            alert("Error al enviar el reporte.")
        }
    }
    setSending(false)
  }

  // --- RENDERIZADO DEL ACTIVADOR (TRIGGER) ---
  const renderTrigger = () => {
    // 1. MODO TEXTO (Opción 3: Discreto para móvil en /convert, etc.)
    if (mode === 'text') {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full py-4 opacity-80 hover:opacity-100"
            >
                <AlertCircle size={14} /> 
                <span>¿Problemas? <span className="underline decoration-slate-700 underline-offset-4 decoration-1">Reportar error</span></span>
            </button>
        )
    }

    // 2. MODO INLINE (Cuadrado, por si lo necesitas luego)
    if (mode === 'inline') {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className={`bg-[#1A202C] hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 h-full aspect-square rounded-2xl flex items-center justify-center transition-all shadow-lg ${isOpen ? 'opacity-50' : 'opacity-100'}`}
                title="Reportar Error"
            >
                <MessageSquarePlus size={28} strokeWidth={2} />
            </button>
        )
    }

    // 3. MODO FLOTANTE (Solo Desktop)
    // CAMBIO CLAVE: Agregamos 'hidden md:block' para que en móvil NO exista este botón flotante.
    return (
        <button 
            onClick={() => setIsOpen(true)}
            className={`
                hidden md:block  /* <--- AQUÍ ESTÁ EL CAMBIO: Oculto en móvil, visible en escritorio */
                fixed z-[60] bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300
                bg-slate-800 text-slate-400 border border-slate-700 hover:bg-vidiooh hover:text-black hover:border-black
                ${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
            `}
            title="Reportar Error"
        >
            <MessageSquarePlus size={24} strokeWidth={2.5} />
        </button>
    )
  }

  return (
    <>
      {renderTrigger()}

      {/* --- MODAL (COMÚN PARA TODOS LOS MODOS) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          {/* Fondo oscuro para cerrar */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsOpen(false)}></div>

          <div className="bg-[#0f141c] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto relative animate-in zoom-in-95 fade-in duration-200 flex flex-col overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    Ayúdanos a mejorar 🛠️
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {sent ? (
                // ÉXITO
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Send size={32}/>
                    </div>
                    <h3 className="text-white font-bold text-lg">¡Recibido!</h3>
                    <p className="text-slate-400 text-sm mt-2">Gracias por el feedback.</p>
                </div>
            ) : (
                // FORMULARIO
                <form onSubmit={handleSubmit} className="p-5">
                    
                    <div className="flex bg-slate-900 p-1 rounded-lg mb-4 border border-slate-800">
                        <button 
                            type="button" 
                            onClick={() => setType('bug')} 
                            className={`flex-1 flex items-center justify-center gap-2 text-xs py-2 rounded-md font-bold transition-all ${type === 'bug' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Bug size={14}/> Error
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setType('idea')} 
                            className={`flex-1 flex items-center justify-center gap-2 text-xs py-2 rounded-md font-bold transition-all ${type === 'idea' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Lightbulb size={14}/> Idea
                        </button>
                    </div>

                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'bug' ? "Cuéntanos qué falló..." : "¿Qué te gustaría ver?"}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-vidiooh focus:border-transparent outline-none resize-none h-32 mb-4"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-600 mb-4 px-1">
                        <span>Ruta:</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 truncate max-w-[150px]">{pathname}</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={sending || !message.trim()}
                        className="w-full py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin"/> : "Enviar Feedback"}
                    </button>
                </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}