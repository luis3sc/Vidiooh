'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, Server, ShieldCheck, Mail, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-vidiooh selection:text-black relative">
      
      {/* --- FONDO DECORATIVO --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-vidiooh/5 blur-[120px] rounded-full" />
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
            <span className="text-[10px] uppercase tracking-wider border border-slate-700 px-2 py-0.5 rounded text-slate-500">Privacidad</span>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          
          {/* TÍTULO */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 text-vidiooh mb-4 bg-vidiooh/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              <Lock size={14} /> Protección de Datos
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Política de Privacidad</h1>
            <p className="text-lg text-slate-400">
              Transparencia sobre cómo <strong>Aylluk</strong> (empresa matriz de Vidiooh) gestiona tu información y activos digitales.
            </p>
          </div>

          {/* CUERPO DEL TEXTO */}
          <div className="space-y-12 text-slate-300 leading-relaxed">
            
            {/* SECCIÓN 1: Responsable */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">01</span>
                Responsable del Tratamiento
              </h2>
              <p className="mb-4">
                El responsable del tratamiento de sus datos personales es <strong>Aylluk</strong> ("nosotros"), empresa tecnológica desarrolladora del ecosistema de herramientas digitales para el sector OOH (Out Of Home).
              </p>
              <p className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                Al registrarse en Vidiooh, usted establece una relación comercial con Aylluk, lo que nos permite gestionar su cuenta a través de nuestro portafolio de productos actuales y futuros.
              </p>
            </section>

            {/* SECCIÓN 2: Datos Recopilados */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">02</span>
                Información que Recopilamos
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Mail size={16} className="text-vidiooh"/> Datos de Registro</h3>
                    <p className="text-sm text-slate-400">Correo electrónico, contraseña encriptada y datos de facturación (si contrata un plan de pago).</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Server size={16} className="text-vidiooh"/> Datos Técnicos</h3>
                    <p className="text-sm text-slate-400">Metadatos de uso (formatos más convertidos, errores de renderizado) para mejorar nuestros algoritmos.</p>
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: Privacidad de los Videos (CRÍTICO PARA AGENCIAS) */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">03</span>
                Privacidad de sus Archivos
              </h2>
              <p className="mb-4">
                Sabemos que maneja material publicitario confidencial antes de su lanzamiento. Nuestra arquitectura prioriza la seguridad:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3 items-start">
                  <ShieldCheck size={20} className="text-vidiooh shrink-0 mt-1" />
                  <span><strong>Versión Gratuita (Procesamiento Local):</strong> Usamos tecnología WebAssembly. El video se procesa en la memoria RAM de su dispositivo y nunca toca nuestros servidores.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Database size={20} className="text-vidiooh shrink-0 mt-1" />
                  <span><strong>Planes Pro/Corp (Almacenamiento Temporal):</strong> Si utiliza funciones de historial o colaboración, los archivos se encriptan en reposo y se eliminan automáticamente tras el periodo estipulado.</span>
                </li>
              </ul>
            </section>

            {/* SECCIÓN 4: Uso de la Información */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">04</span>
                Finalidad del Uso
              </h2>
              <p>
                Utilizamos su información para:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4 mt-2 marker:text-vidiooh">
                <li>Proveer el servicio de conversión y optimización de video.</li>
                <li>Facturación y prevención de fraude.</li>
                {/* Cláusula clave para tu futuro portafolio */}
                <li><strong>Comunicación del Ecosistema Aylluk:</strong> Informarle sobre nuevas herramientas (como visualizadores 3D, marketplaces, etc.) desarrolladas por Aylluk para el sector OOH.</li>
              </ul>
            </section>

            {/* SECCIÓN 5: Derechos ARCO */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-vidiooh text-sm">05</span>
                Contacto y Derechos
              </h2>
              <p>
                Para ejercer sus derechos de acceso, rectificación, cancelación u oposición, o para cualquier duda sobre la privacidad en cualquiera de los productos de Aylluk, contacte a:
              </p>
              <a href="mailto:privacidad@aylluk.com" className="inline-block mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-vidiooh transition-colors font-medium">
                privacidad@aylluk.com
              </a>
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