import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Target, Clock, Trophy, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080'

const Dashboard = () => {
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`)
      setMatchData(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false) // Dejar de cargar aunque falle
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse">
      <Trophy className="text-binance-yellow w-12 h-12 mb-4" />
      <p className="text-gray-400 uppercase tracking-widest text-xs">Cargando datos en vivo...</p>
    </div>
  )

  if (!matchData) return (
    <div className="glass-morphism p-10 text-center rounded-2xl border-red-500/20">
      <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Error de Conexión</h3>
      <p className="text-gray-400 mb-6">No se pudo contactar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8080.</p>
      <button onClick={fetchData} className="btn-primary">REINTENTAR</button>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Live Match Card */}
      <div className="neon-border p-8 text-center bg-binance-dark/80 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">EN VIVO</span>
        </div>
        
        <div className="flex items-center justify-center gap-8 md:gap-16">
          <div className="text-center group">
            <div className="text-4xl md:text-6xl mb-2 transition-transform group-hover:scale-110">🇨🇴</div>
            <h3 className="font-bold text-gray-400">COLOMBIA</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-black flex gap-4">
              <span className="text-white">{matchData.live_score.col}</span>
              <span className="text-gray-600">-</span>
              <span className="text-white">{matchData.live_score.cro}</span>
            </div>
            <div className="mt-4 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-binance-yellow tracking-widest">
              {{'NS': 'NO INICIADO', '1H': 'PRIMER TIEMPO', 'HT': 'ENTRETIEMPO', '2H': 'SEGUNDO TIEMPO', 'FT': 'FINALIZADO', 'ET': 'TIEMPO EXTRA', 'PEN': 'PENALES'}[matchData.live_score.status] || matchData.live_score.status}
            </div>
          </div>

          <div className="text-center group">
            <div className="text-4xl md:text-6xl mb-2 transition-transform group-hover:scale-110">🇭🇷</div>
            <h3 className="font-bold text-gray-400">CROACIA</h3>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-clf-cyan/20 rounded-xl text-clf-cyan">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{matchData.stats.active}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">PARTICIPANTES ACTIVOS</p>
          </div>
        </div>
        <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-binance-yellow/20 rounded-xl text-binance-yellow">
            <Target size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{matchData.stats.total}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">TOTAL REGISTRADOS</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-morphism rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
            <Trophy size={14} className="text-binance-yellow" /> Ranking de Predictores
          </h3>
          <span className="text-[10px] text-gray-500 uppercase">Actualizado hace 2s</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Marcador</th>
                <th className="px-6 py-4">Diferencia</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {matchData.participants.map((p, idx) => {
                  const isEliminated = p.status === 'Eliminado'
                  return (
                    <motion.tr 
                      key={p.buid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`hover:bg-white/[0.02] transition-colors ${isEliminated ? 'opacity-40 grayscale' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-[10px] text-gray-500">BUID: {p.buid}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-lg font-bold text-binance-yellow">
                          {p.col} - {p.cro}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs">
                          {Math.abs(p.col - matchData.live_score.col) + Math.abs(p.cro - matchData.live_score.cro)} pts
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEliminated ? (
                          <div className="flex items-center gap-1 text-gray-500 font-bold text-[10px]">
                            <AlertTriangle size={12} /> ELIMINADO
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-500 font-bold text-[10px]">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> VIVO
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
