import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Hash, CheckCircle, Info, ShieldAlert, PartyPopper, AlertCircle } from 'lucide-react'
import axios from 'axios'

const RegistrationForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    buid: '',
    goals_col: 0,
    goals_cro: 0,
    checks: {
      binance: false,
      social: false,
      survey: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [buidError, setBuidError] = useState('')
  const [success, setSuccess] = useState(false)
  const [alreadyParticipated, setAlreadyParticipated] = useState(false)

  // Verificar si ya participó en este dispositivo
  React.useEffect(() => {
    const hasParticipated = localStorage.getItem('clf_polla_participated')
    if (hasParticipated) {
      setAlreadyParticipated(true)
      const timer = setTimeout(() => onComplete(), 3000)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  // Check if BUID is already registered when user finishes typing
  const checkBuid = async (buid) => {
    if (!/^\d{8,10}$/.test(buid)) return
    try {
      const res = await axios.get(`http://127.0.0.1:8080/check-buid/${buid}`)
      if (res.data.registered) {
        setBuidError('⚠️ Este BUID ya está registrado. Solo puedes participar una vez.')
      } else {
        setBuidError('')
      }
    } catch {
      // Silently fail - backend will catch duplicates anyway
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (buidError) return
    setLoading(true)
    setError('')
    try {
      await axios.post('http://127.0.0.1:8080/register', {
        name: formData.name.trim(),
        buid: formData.buid,
        goals_col: formData.goals_col,
        goals_cro: formData.goals_cro
      })
      
      // Marcar como participado
      localStorage.setItem('clf_polla_participated', 'true')
      
      setSuccess(true)
      setTimeout(() => onComplete(), 3000)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 409) {
        setBuidError('⚠️ Este BUID ya está registrado. Solo puedes participar una vez.')
        setError('Este BUID ya fue registrado.')
      } else if (err.response?.status === 422) {
        setError('Verifica que todos los campos estén correctos.')
      } else {
        setError('Error al registrar. Verifica la conexión con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = 
    formData.name.trim().length >= 2 && 
    /^\d{8,10}$/.test(formData.buid) && 
    !buidError &&
    formData.goals_col >= 0 &&
    formData.goals_cro >= 0 &&
    formData.checks.binance && 
    formData.checks.social && 
    formData.checks.survey


  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">¡Haz tu <span className="text-binance-yellow underline decoration-clf-purple underline-offset-8">Predicción</span>!</h2>
        <p className="text-gray-400">Participa por premios exclusivos en el Binance Tour.</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
        >
          <ShieldAlert size={20} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <User size={16} /> Nombre Completo <span className="text-red-400">*</span>
          </label>
          <input 
            type="text" 
            placeholder="Ej: Satoshi Nakamoto"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            minLength={2}
          />
          {formData.name && formData.name.trim().length < 2 && (
            <p className="text-red-400 text-xs mt-1">El nombre debe tener al menos 2 caracteres.</p>
          )}
        </div>

        {/* BUID Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Hash size={16} /> Binance UID (BUID) <span className="text-red-400">*</span>
          </label>
          <input 
            type="text" 
            placeholder="8 a 10 dígitos"
            className={`input-field ${buidError ? 'border-red-500/50 focus:border-red-500' : ''}`}
            value={formData.buid}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setFormData({...formData, buid: val})
              setBuidError('')
            }}
            onBlur={() => checkBuid(formData.buid)}
            maxLength={10}
            required
          />
          {formData.buid && !/^\d{8,10}$/.test(formData.buid) && (
            <p className="text-red-400 text-xs mt-1">Debe tener entre 8 y 10 dígitos.</p>
          )}
          {buidError && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs mt-1 font-semibold"
            >
              {buidError}
            </motion.p>
          )}
        </div>

        {/* Score Prediction */}
        <div className="glass-morphism rounded-2xl p-6 relative">
          <label className="text-sm font-bold text-gray-300 block mb-4 text-center">EL MARCADOR <span className="text-red-400">*</span></label>
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <span className="block text-2xl mb-2">🇨🇴</span>
              <p className="text-xs font-bold mb-3">COLOMBIA</p>
              <input 
                type="number" 
                min="0"
                max="20"
                className="w-16 h-16 text-2xl text-center bg-white/5 border border-white/10 rounded-xl focus:border-binance-yellow focus:outline-none [appearance:textfield]"
                value={formData.goals_col}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+/, '') || '0';
                  setFormData({...formData, goals_col: Math.max(0, Math.min(20, parseInt(val) || 0))})
                }}
                required
              />
            </div>
            <span className="text-2xl font-bold text-gray-500">VS</span>
            <div className="text-center">
              <span className="block text-2xl mb-2">🇭🇷</span>
              <p className="text-xs font-bold mb-3">CROACIA</p>
              <input 
                type="number" 
                min="0"
                max="20"
                className="w-16 h-16 text-2xl text-center bg-white/5 border border-white/10 rounded-xl focus:border-binance-yellow focus:outline-none [appearance:textfield]"
                value={formData.goals_cro}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+/, '') || '0';
                  setFormData({...formData, goals_cro: Math.max(0, Math.min(20, parseInt(val) || 0))})
                }}
                required
              />
            </div>
          </div>
        </div>

        {/* Validation Checkboxes */}
        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-widest">Requisitos obligatorios <span className="text-red-400">*</span></p>
          {[
            { id: 'binance', label: 'Tengo una cuenta de Binance activa.' },
            { id: 'social', label: 'Sigo a @criptolatinfest en redes sociales.' },
            { id: 'survey', label: 'Acepto llenar la encuesta de satisfacción.' }
          ].map((check) => (
            <label key={check.id} className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-1">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={formData.checks[check.id]}
                  onChange={() => setFormData({
                    ...formData, 
                    checks: { ...formData.checks, [check.id]: !formData.checks[check.id] }
                  })}
                />
                <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:bg-binance-yellow peer-checked:border-binance-yellow transition-all" />
                <CheckCircle className="absolute inset-0 text-binance-black scale-0 peer-checked:scale-75 transition-transform" size={20} />
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-tight leading-snug">
                {check.label}
              </span>
            </label>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid || loading}
          className="btn-primary w-full relative overflow-hidden group"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-binance-black/20 border-t-binance-black rounded-full animate-spin" />
              REGISTRANDO...
            </div>
          ) : (
            <span className="relative z-10">ENVIAR PREDICCIÓN</span>
          )}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>

        <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
          <Info size={10} /> Tus datos están protegidos y serán usados únicamente para el sorteo.
        </p>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {(success || alreadyParticipated) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-binance-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-morphism rounded-3xl p-8 max-w-sm w-full text-center border-binance-yellow/20"
            >
              <div className="w-20 h-20 bg-binance-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-binance-yellow w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">
                {alreadyParticipated ? "¡YA PARTICIPASTE!" : "¡PREDICCIÓN REGISTRADA!"}
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                {alreadyParticipated 
                  ? "Ya tienes una predicción activa para este evento." 
                  : "Buena suerte, estamos procesando tu participación."}
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-binance-yellow/60 uppercase tracking-widest font-bold">REDIRECCIONANDO AL DASHBOARD</p>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 3 }}
                    className="w-full h-full bg-binance-yellow"
                   />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already Registered Modal */}
      <AnimatePresence>
        {buidError && buidError.includes("ya está registrado") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-binance-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-morphism rounded-3xl p-8 max-w-sm w-full text-center border-red-500/30"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500 w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">¡ATENCIÓN!</h2>
              <p className="text-gray-300 mb-6 font-medium leading-relaxed">Este Binance UID ya ha registrado su predicción para este partido.</p>
              <p className="text-sm text-gray-400 mb-8 border-t border-white/5 pt-6">Solo se permite una participación por usuario.</p>
              <button 
                onClick={() => {
                  setFormData({...formData, buid: ""});
                  setBuidError("");
                }}
                className="btn-primary w-full py-4 text-lg font-black tracking-widest shadow-xl shadow-binance-yellow/20"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationForm;
