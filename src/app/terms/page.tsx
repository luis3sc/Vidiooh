'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, ShieldAlert, FileCheck, DollarSign, Ban, Server } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-vidiooh selection:text-black relative">
      
      {/* --- FONDO DECORATIVO --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vidiooh/5 blur-[120px] rounded-full" />
      </div>

      {/* --- HEADER / NAV --- */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-white/5 border border-white/10 rounded-full group-hover:border-vidiooh transition-colors">
               <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2 opacity-50">
            <span className="font-bold text-lg text-white">Vidiooh</span>
            <span className="text-[10px] uppercase tracking-wider border border-slate-700 px-2 py-0.5 rounded text-slate-500">Términos</span>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          
          {/* TÍTULO */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 text-vidiooh mb-4 bg-vidiooh/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              <Scale size={14} /> Acuerdo Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Términos y Condiciones</h1>
            <p className="text-lg text-slate-400">
              Reglas de uso para los servicios de <strong>Vidiooh</strong>, una plataforma operada por <strong>Aylluk</strong>.
            </p>
          </div>

          {/* CUERPO DEL TEXTO */}
          <div className="space-y-12 text-slate-300 leading-relaxed">
            
            {/* SECCIÓN 1: Definiciones */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">01</span>
                Introducción y Definiciones
              </h2>
              <p className="mb-4">
                Bienvenido a Vidiooh. Estos Términos y Condiciones ("Términos") rigen el uso de nuestra plataforma de conversión y optimización de video.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4 mt-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <li><strong>"La Empresa":</strong> Se refiere a <strong>Aylluk</strong>, la entidad tecnológica matriz propietaria y operadora de Vidiooh y su ecosistema de herramientas.</li>
                <li><strong>"El Servicio":</strong> La plataforma SaaS Vidiooh, accesible vía web para el procesamiento de archivos digitales.</li>
                <li><strong>"El Usuario":</strong> Cualquier persona o entidad (Agencia, OOH, Freelance) que acceda al servicio.</li>
              </ul>
            </section>

            {/* SECCIÓN 2: Uso del Servicio */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">02</span>
                Licencia de Uso
              </h2>
              <p>
                Aylluk otorga al usuario una licencia limitada, no exclusiva e intransferible para utilizar Vidiooh con el fin de optimizar contenido publicitario.
              </p>
              <div className="mt-4 flex gap-3 items-start">
                <Ban size={20} className="text-red-400 shrink-0 mt-1" />
                <p className="text-sm text-slate-400">
                  <strong>Restricciones:</strong> Está prohibido revender el acceso a la plataforma (cuentas compartidas ilegalmente), intentar ingeniería inversa del código fuente de Aylluk, o utilizar el servicio para procesar contenido ilegal o malicioso.
                </p>
              </div>
            </section>

            {/* SECCIÓN 3: Responsabilidad Técnica (CRÍTICO PARA OOH) */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">03</span>
                Limitación de Responsabilidad Técnica
              </h2>
              <p className="mb-4">
                Vidiooh es una herramienta de procesamiento de software. <strong>Aylluk no se hace responsable por fallos en el hardware de exhibición final.</strong>
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-xl text-sm text-yellow-100/90 flex gap-3">
                <ShieldAlert size={20} className="shrink-0" />
                <div>
                  <p className="font-bold mb-1">Exención de Garantía:</p>
                  <p>Aylluk no garantiza que los archivos procesados sean compatibles con pantallas LED defectuosas, controladores mal configurados (ej. tarjetas Novastar/Linsn dañadas) o instalaciones eléctricas inestables. Es responsabilidad del Usuario realizar pruebas técnicas (pauta de prueba) antes de la exhibición comercial masiva.</p>
                </div>
              </div>
            </section>

            {/* SECCIÓN 4: Planes y Pagos */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">04</span>
                Suscripciones y Marca Blanca
              </h2>
              <p className="mb-4">
                <strong>Planes Pro y Corporativos:</strong> Se facturan por adelantado. La falta de pago resultará en la suspensión temporal de la cuenta y del acceso al historial de archivos.
              </p>
              <p>
                <strong>Marca Blanca:</strong> Los clientes del Plan Corporativo que utilicen la funcionalidad de "Marca Blanca" son responsables de la gestión de sus propios sub-usuarios (agencias). Aylluk actúa únicamente como proveedor de la infraestructura tecnológica subyacente.
              </p>
            </section>

            {/* SECCIÓN 5: Propiedad Intelectual */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">05</span>
                Propiedad Intelectual
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <Server size={18} className="text-vidiooh shrink-0 mt-1" />
                  <span><strong>De la Plataforma:</strong> Todo el código, algoritmos, diseño y la marca "Vidiooh" son propiedad exclusiva de <strong>Aylluk</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <FileCheck size={18} className="text-vidiooh shrink-0 mt-1" />
                  <span><strong>De los Videos:</strong> El Usuario conserva el 100% de los derechos de autor y propiedad intelectual sobre los videos subidos y procesados. Aylluk no reclama propiedad sobre su contenido creativo.</span>
                </li>
              </ul>
            </section>

            {/* SECCIÓN 6: Modificaciones */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">06</span>
                Modificaciones y Ley Aplicable
              </h2>
              <p>
                Aylluk se reserva el derecho de modificar estos términos para reflejar cambios en la ley o en nuestras herramientas. El uso continuado de Vidiooh implica la aceptación de dichos cambios. Estos términos se rigen por las leyes vigentes en la jurisdicción fiscal de Aylluk.
              </p>
            </section>

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
            Un producto desarrollado por <span className="text-slate-500 font-bold hover:text-vidiooh transition-colors cursor-default">Aylluk</span>.
          </p>
        </div>
      </footer>

    </div>
  )
}