'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, Edit2, X, LayoutTemplate, Lock, AlertTriangle } from 'lucide-react'

// --- DEFAULTS ---
const DEFAULT_FORMATS = [
  { id: 'default_1', label: '1280 x 720', width: 1280, height: 720, isSystem: true },
  { id: 'default_2', label: '1280 x 616', width: 1280, height: 616, isSystem: true },
  { id: 'default_3', label: '1280 x 654', width: 1280, height: 654, isSystem: true },
  { id: 'default_4', label: '1280 x 672', width: 1280, height: 672, isSystem: true },
]

type VideoFormat = {
  id: string
  label: string
  width: number
  height: number
  isSystem?: boolean
}

export default function FormatsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formats, setFormats] = useState<VideoFormat[]>(DEFAULT_FORMATS)
  const [loading, setLoading] = useState(true)
  
  // Modal Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inputW, setInputW] = useState('')
  const [inputH, setInputH] = useState('')

  // Modal Eliminar (NUEVO)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formatToDelete, setFormatToDelete] = useState<string | null>(null)

  useEffect(() => { fetchFormats() }, [])

  const fetchFormats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('custom_formats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (data) {
      const myFormats = data.map(f => ({ ...f, isSystem: false }))
      setFormats([...DEFAULT_FORMATS, ...myFormats])
    }
    setLoading(false)
  }

  // Abrir Modal de Edición/Creación
  const openModal = (format?: VideoFormat) => {
    if (format?.isSystem) return 

    if (format) {
      setEditingId(format.id)
      const [w, h] = format.label.split(' x ')
      setInputW(w || format.width.toString())
      setInputH(h || format.height.toString())
    } else {
      setEditingId(null)
      setInputW('')
      setInputH('')
    }
    setIsModalOpen(true)
  }

  // Abrir Modal de Eliminación (NUEVO)
  const openDeleteModal = (id: string) => {
    setFormatToDelete(id)
    setIsDeleteModalOpen(true)
    // Si estaba abierto el de edición, lo cerramos para evitar conflictos visuales
    setIsModalOpen(false) 
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !inputW || !inputH) return

    const rawW = parseInt(inputW)
    const rawH = parseInt(inputH)
    const safeW = rawW % 2 === 0 ? rawW : rawW - 1
    const safeH = rawH % 2 === 0 ? rawH : rawH - 1
    const displayLabel = `${rawW} x ${rawH}`

    if (editingId) {
      await supabase
        .from('custom_formats')
        .update({ width: safeW, height: safeH, label: displayLabel })
        .eq('id', editingId)
    } else {
      await supabase
        .from('custom_formats')
        .insert({
          user_id: user.id,
          width: safeW,
          height: safeH,
          label: displayLabel
        })
    }

    setIsModalOpen(false)
    fetchFormats()
  }

  // Ejecutar Eliminación Real
  const confirmDelete = async () => {
    if (!formatToDelete) return

    await supabase.from('custom_formats').delete().eq('id', formatToDelete)
    
    setIsDeleteModalOpen(false)
    setFormatToDelete(null)
    fetchFormats()
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20 md:pb-8 relative">
      
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Configuración de Formatos</h1>
        <p className="text-slate-400 text-sm">Gestiona tus medidas de pantalla personalizadas.</p>
      </div>

      <div className="space-y-2">
        {loading ? (
           <p className="text-slate-500 text-sm animate-pulse">Cargando formatos...</p>
        ) : (
          formats.map((fmt) => (
            <div 
              key={fmt.id} 
              className={`bg-[#151921] border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between group transition-colors ${!fmt.isSystem && 'hover:border-slate-600'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${fmt.isSystem ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-800 text-emerald-500'}`}>
                  {fmt.isSystem ? <Lock size={14} /> : <LayoutTemplate size={16} />}
                </div>
                <div>
                  <h3 className={`font-bold text-base md:text-lg ${fmt.isSystem ? 'text-slate-400' : 'text-white'}`}>
                    {fmt.label} px
                  </h3>
                  {fmt.isSystem && <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Por Defecto</span>}
                </div>
              </div>

              {!fmt.isSystem && (
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(fmt)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  {/* Botón Eliminar Lista */}
                  <button onClick={() => openDeleteModal(fmt.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => openModal()}
        className="fixed bottom-24 right-6 md:absolute md:bottom-auto md:top-0 md:right-0 w-12 h-12 md:w-14 md:h-14 bg-[#22c55e] hover:bg-[#1db954] text-black rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* --- MODAL 1: CREAR / EDITAR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0f141c] w-full md:w-[450px] md:rounded-3xl rounded-t-3xl border border-slate-800 p-6 animate-in slide-in-from-bottom-10 duration-300 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Medida' : 'Nueva Medida'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-[#151921] p-4 rounded-xl text-center border border-slate-800">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block mb-1">Previsualización</span>
                <span className="text-2xl font-mono text-[#22c55e] font-bold">
                  {inputW || '0'} <span className="text-slate-600">x</span> {inputH || '0'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">ANCHO (PX)</label>
                  <input type="number" value={inputW} onChange={(e) => setInputW(e.target.value)} placeholder="1920" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-4 text-lg text-white font-mono focus:ring-2 focus:ring-[#22c55e] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">ALTO (PX)</label>
                  <input type="number" value={inputH} onChange={(e) => setInputH(e.target.value)} placeholder="1080" className="w-full bg-[#1A202C] border border-slate-700 rounded-xl px-4 py-4 text-lg text-white font-mono focus:ring-2 focus:ring-[#22c55e] outline-none transition-all" />
                </div>
              </div>
              <button onClick={handleSave} disabled={!inputW || !inputH} className="w-full bg-[#22c55e] hover:bg-[#1db954] text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                {editingId ? 'Guardar Cambios' : 'Crear Formato'}
              </button>
              
              {/* Botón Eliminar dentro del modal de edición */}
              {editingId && (
                <button 
                  onClick={() => openDeleteModal(editingId)}
                  className="w-full text-red-500 text-sm font-medium py-2 hover:underline opacity-80 hover:opacity-100 transition-opacity"
                >
                  Eliminar este formato
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRMAR ELIMINACIÓN (NUEVO) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 px-4">
          <div className="bg-[#0f141c] w-full max-w-sm rounded-3xl border border-slate-800 p-6 animate-in zoom-in-95 duration-200 text-center shadow-2xl">
            
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">¿Estás seguro?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Esta acción eliminará el formato permanentemente. No podrás recuperarlo.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Sí, eliminar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}