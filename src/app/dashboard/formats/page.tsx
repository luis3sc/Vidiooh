'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, Edit2, X, AlertTriangle, RectangleHorizontal, RectangleVertical, Loader2 } from 'lucide-react'

// Definición del tipo de dato
type VideoFormat = {
  id: string
  label: string
  width: number
  height: number
  user_id: string
}

export default function FormatsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formats, setFormats] = useState<VideoFormat[]>([])
  const [loading, setLoading] = useState(true)
  // 1. Estado para guardar el plan actual
  const [currentPlan, setCurrentPlan] = useState('FREE') 
  
  // Modal Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Inputs del formulario
  const [inputName, setInputName] = useState('')
  const [inputW, setInputW] = useState('')
  const [inputH, setInputH] = useState('')

  // Modal Eliminar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formatToDelete, setFormatToDelete] = useState<string | null>(null)

  useEffect(() => { fetchFormats() }, [])

  const fetchFormats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. OBTENER EL PLAN ACTUAL DEL USUARIO
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, teams(plan_type)')
        .eq('id', user.id)
        .single()

    // @ts-ignore
    const plan = profile?.teams?.plan_type || profile?.plan_type || 'FREE'
    setCurrentPlan(plan)

    // 3. OBTENER FORMATOS
    const { data } = await supabase
      .from('custom_formats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (data) {
      setFormats(data)
    }
    setLoading(false)
  }

  // --- 4. LÓGICA DE LÍMITES DINÁMICOS ---
  const LIMITS: Record<string, number> = {
      FREE: 2,
      PRO: 8,        // Límite aumentado para PRO
      CORPORATE: 999 // Virtualmente ilimitado
  }

  const maxFormats = LIMITS[currentPlan] || 2
  const isLimitReached = formats.length >= maxFormats

  // Abrir Modal de Edición/Creación
  const openModal = (format?: VideoFormat) => {
    // Si intenta crear (no editar) y llegó al límite del plan actual
    if (!format && isLimitReached) {
        // Bloqueo silencioso (el botón ya estará deshabilitado visualmente)
        return
    }

    if (format) {
      setEditingId(format.id)
      setInputName(format.label)
      setInputW(format.width.toString())
      setInputH(format.height.toString())
    } else {
      setEditingId(null)
      setInputName('')
      setInputW('')
      setInputH('')
    }
    setIsModalOpen(true)
  }

  const openDeleteModal = (id: string) => {
    setFormatToDelete(id)
    setIsDeleteModalOpen(true)
    setIsModalOpen(false) 
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !inputW || !inputH) return

    const rawW = parseInt(inputW)
    const rawH = parseInt(inputH)
    
    // --- CAMBIO IMPORTANTE: NO CORREGIMOS AQUI ---
    // Guardamos el número exacto que puso el usuario (aunque sea impar).
    // La corrección -1px se hace silenciosamente en el motor de conversión.
    
    const displayName = inputName.trim() !== '' 
        ? inputName.trim() 
        : `Formato ${rawW}x${rawH}` // Usamos rawW/rawH para el nombre

    if (editingId) {
      await supabase
        .from('custom_formats')
        .update({ width: rawW, height: rawH, label: displayName }) // Guardamos valor crudo
        .eq('id', editingId)
    } else {
      await supabase
        .from('custom_formats')
        .insert({
          user_id: user.id,
          width: rawW, // Guardamos valor crudo
          height: rawH, 
          label: displayName
        })
    }

    setIsModalOpen(false)
    fetchFormats()
  }

  const confirmDelete = async () => {
    if (!formatToDelete) return
    await supabase.from('custom_formats').delete().eq('id', formatToDelete)
    setIsDeleteModalOpen(false)
    setFormatToDelete(null)
    fetchFormats()
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20 md:pb-8 relative">
      
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Mis Formatos</h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
                Gestiona tus pantallas 
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isLimitReached ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                    {formats.length} / {currentPlan === 'CORPORATE' ? '∞' : maxFormats} utilizados
                </span>
            </p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
           <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="animate-spin" size={16}/> Cargando...
           </div>
        ) : formats.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-[#151921]/50">
                <p className="text-slate-500 mb-4">No tienes formatos configurados.</p>
                <button onClick={() => openModal()} className="px-4 py-2 bg-vidiooh text-black font-bold rounded-lg text-sm">
                    Crear mi primer formato
                </button>
            </div>
        ) : (
          formats.map((fmt) => {
            const isHorizontal = fmt.width >= fmt.height
            
            return (
            <div 
              key={fmt.id} 
              className="bg-[#151921] border border-slate-800 rounded-xl px-4 py-4 flex items-center justify-between group hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Icono basado en orientación */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-emerald-500 border border-slate-700`}>
                  {isHorizontal ? <RectangleHorizontal size={24} /> : <RectangleVertical size={24} />}
                </div>
                
                <div>
                  <h3 className="font-bold text-base md:text-lg text-white">
                    {fmt.label}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                    <span className={isHorizontal ? "text-vidiooh font-bold" : ""}>W: {fmt.width}</span>
                    <span className="text-slate-600">x</span>
                    <span className={!isHorizontal ? "text-vidiooh font-bold" : ""}>H: {fmt.height}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => openModal(fmt)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => openDeleteModal(fmt.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )})
        )}
      </div>

      {/* Botón Flotante (Deshabilitado si límite alcanzado) */}
      <button
        onClick={() => openModal()}
        disabled={isLimitReached}
        title={isLimitReached ? "Límite de formatos alcanzado" : "Crear nuevo formato"}
        className={`fixed bottom-24 right-6 md:absolute md:bottom-auto md:top-0 md:right-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all z-50 shadow-lg
            ${isLimitReached 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                : 'bg-vidiooh hover:bg-vidiooh-dark text-black hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            }`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* --- MODAL 1: CREAR / EDITAR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0f141c] w-full md:w-[450px] md:rounded-3xl rounded-t-3xl border border-slate-800 p-6 animate-in slide-in-from-bottom-10 duration-300 relative shadow-2xl">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Formato' : 'Nuevo Formato'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="space-y-5">
              
              {/* Previsualización Dinámica */}
              <div className="bg-[#151921] p-4 rounded-xl flex flex-col items-center justify-center border border-slate-800 h-28">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-2">Previsualización Orientación</span>
                {(!inputW || !inputH) ? (
                    <p className="text-slate-600 text-sm">Ingresa las medidas...</p>
                ) : (parseInt(inputW) >= parseInt(inputH)) ? (
                    <RectangleHorizontal size={48} className="text-vidiooh animate-pulse" />
                ) : (
                    <RectangleVertical size={48} className="text-vidiooh animate-pulse" />
                )}
                <p className="text-xs text-slate-400 mt-2 font-mono">
                    {parseInt(inputW) >= parseInt(inputH) ? 'Horizontal' : 'Vertical'}
                </p>
              </div>

              {/* Input Nombre */}
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">NOMBRE DEL FORMATO (OPCIONAL)</label>
                  <input 
                    type="text" 
                    value={inputName} 
                    onChange={(e) => setInputName(e.target.value)} 
                    placeholder={`Ej: Pantalla Principal (Se usará "Formato ${inputW||0}x${inputH||0}" si está vacío)`}
                    className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#F04E30] outline-none transition-all placeholder:text-slate-600" 
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">ANCHO (PX)</label>
                  <input type="number" value={inputW} onChange={(e) => setInputW(e.target.value)} placeholder="1920" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-4 text-lg text-white font-mono focus:ring-2 focus:ring-[#F04E30] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">ALTO (PX)</label>
                  <input type="number" value={inputH} onChange={(e) => setInputH(e.target.value)} placeholder="1080" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-4 text-lg text-white font-mono focus:ring-2 focus:ring-[#F04E30] outline-none transition-all" />
                </div>
              </div>

              <button onClick={handleSave} disabled={!inputW || !inputH} className="w-full bg-vidiooh hover:bg-vidiooh-dark text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {editingId ? 'Guardar Cambios' : 'Crear Formato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRMAR ELIMINACIÓN --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 px-4">
          <div className="bg-[#0f141c] w-full max-w-sm rounded-3xl border border-slate-800 p-6 animate-in zoom-in-95 duration-200 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Eliminar formato?</h2>
            <p className="text-slate-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}