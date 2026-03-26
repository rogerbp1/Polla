import React, { useState, useEffect } from 'react'
import RegistrationForm from './components/RegistrationForm'
import Dashboard from './components/Dashboard'
import { Trophy, LayoutDashboard, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [view, setView] = React.useState('register') // 'register' or 'dashboard'

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'dashboard' || hash === 'register') {
        setView(hash)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-clf-purple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-clf-cyan/10 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-binance-yellow rounded-lg flex items-center justify-center">
            <Trophy className="text-binance-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              POLLA <span className="text-binance-yellow">FUTBOLERA</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">
              Binance Tour x Cripto Latin Fest
            </p>
          </div>
        </div>

        <nav className="flex gap-2">
          <button 
            onClick={() => setView('register')}
            className={`p-2 rounded-lg transition-all ${view === 'register' ? 'bg-white/10 text-binance-yellow' : 'text-gray-400 hover:text-white'}`}
          >
            <UserPlus size={20} />
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`p-2 rounded-lg transition-all ${view === 'dashboard' ? 'bg-white/10 text-binance-yellow' : 'text-gray-400 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl z-10">
        <AnimatePresence mode="wait">
          {view === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RegistrationForm onComplete={() => setView('dashboard')} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-xs border-t border-white/5">
        &copy; 2024 Cripto Latin Fest & Binance. All rights reserved.
      </footer>
    </div>
  )
}

export default App
