'use client'

import React from 'react'
import { Users, Video, DollarSign, TrendingUp, Activity, HardDrive } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-8 fade-in">
      
      {/* 1. Encabezado */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Panel Ejecutivo 📊</h1>
          <p className="text-slate-400 mt-1">Vista general del rendimiento de Vidiooh.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estado del Sistema</p>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operativo
          </div>
        </div>
      </div>

      {/* 2. KPIs Principales (Tarjetas Superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card Usuarios */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">2,543</div>
          <div className="text-sm text-slate-500 font-medium">Usuarios Activos</div>
        </div>

        {/* Card Videos */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Video size={22} />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+8%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">12.8k</div>
          <div className="text-sm text-slate-500 font-medium">Videos Procesados</div>
        </div>

        {/* Card Ingresos */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign size={22} />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+24%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">$45.2k</div>
          <div className="text-sm text-slate-500 font-medium">Ingresos Mensuales</div>
        </div>

        {/* Card Almacenamiento */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
              <HardDrive size={22} />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">85%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">4.2 TB</div>
          <div className="text-sm text-slate-500 font-medium">Espacio Usado</div>
        </div>
      </div>

      {/* 3. Sección Secundaria (Grid 2 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lista de Usuarios Recientes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-slate-400" /> Registros Recientes
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    U{i}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">usuario_nuevo_{i}@gmail.com</div>
                    <div className="text-xs text-slate-500">Plan Gratuito</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Hace {i * 5} min</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica Simulada (Barras CSS simples) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-400" /> Conversiones por Día
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {[40, 65, 30, 85, 55, 90, 45].map((h, i) => (
              <div key={i} className="w-full bg-slate-800 rounded-t-lg relative group overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-violet-600 group-hover:bg-violet-500 transition-all duration-500"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-4 px-2">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
        </div>

      </div>
    </div>
  )
}