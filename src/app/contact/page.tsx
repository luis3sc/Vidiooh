'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, Send, Loader2, MessageSquare, Building2, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulación de envío
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-vidiooh selection:text-black relative">
      
      {/* --- FONDO DECORATIVO --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-vidiooh/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-vidiooh/5 blur-[120px] rounded-full" />
      </div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-white/5 border border-white/10 rounded-full group-hover:border-vidiooh transition-colors">
               <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2 opacity-50">
            <span className="font-bold text-lg text-white">Vidiooh</span>
            <span className="text-[10px] uppercase tracking-wider border border-slate-700 px-2 py-0.5 rounded text-slate-500">Soporte</span>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Hablemos.</h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  ¿Eres una empresa de OOH buscando automatizar tu flujo? ¿O una agencia con dudas técnicas? 
                  El equipo de ingeniería de <strong>Aylluk</strong> está listo para ayudarte.
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Card */}
                <div className="flex items-start gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-vidiooh/30 transition-colors">
                  <div className="p-3 bg-vidiooh/10 rounded-xl text-vidiooh">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Ventas y Soporte</h3>
                    <p className="text-sm text-slate-400 mb-2">Respuesta en menos de 24 horas.</p>
                    <a href="mailto:hola@vidiooh.com" className="text-vidiooh hover:underline font-medium">hola@vidiooh.com</a>
                  </div>
                </div>

                {/* Location Card */}
                <div className="flex items-start gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-vidiooh/30 transition-colors">
                  <div className="p-3 bg-vidiooh/10 rounded-xl text-vidiooh">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Oficinas Aylluk</h3>
                    <p className="text-sm text-slate-400">
                      Lima, Perú 🇵🇪<br />
                      Centro de Innovación Tecnológica
                    </p>
                  </div>
                </div>
              </div>

              {/* Nota B2B */}
              <div className="p-4 border-l-2 border-vidiooh bg-vidiooh/5 rounded-r-xl">
                <p className="text-sm text-slate-300">
                  <strong className="text-vidiooh">¿Buscas Plan Corporativo?</strong> Escríbenos directamente para agendar una demo de la API y el portal de Marca Blanca.
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl">
              
              {isSent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-vidiooh rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 className="text-black" size={40} strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    Hemos recibido tu consulta. Nuestro equipo te contactará a la brevedad.
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 text-vidiooh hover:text-white text-sm font-bold hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Nombre</label>
                      <input type="text" placeholder="Tu nombre" required className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-[#F04E30] focus:border-vidiooh outline-none transition-all placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Empresa</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-3.5 text-slate-600" size={18} />
                        <input type="text" placeholder="Ej. JMT Outdoors" className="w-full bg-[#020617] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-1 focus:ring-[#F04E30] focus:border-vidiooh outline-none transition-all placeholder:text-slate-600" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Correo Corporativo</label>
                    <input type="email" placeholder="nombre@empresa.com" required className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-[#F04E30] focus:border-vidiooh outline-none transition-all placeholder:text-slate-600" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Mensaje</label>
                    <textarea rows={4} placeholder="Hola, me interesa saber más sobre..." required className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-[#F04E30] focus:border-vidiooh outline-none transition-all resize-none placeholder:text-slate-600" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-vidiooh hover:bg-vidiooh-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-lg shadow-vidiooh/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Mensaje <Send size={20} /></>}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-white/5 text-center bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © 2025 Vidiooh. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-600 font-medium tracking-wide">
            Desarrollado en Lima por <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors cursor-default">Aylluk</span>.
          </p>
        </div>
      </footer>

    </div>
  )
}