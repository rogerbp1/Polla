#!/bin/zsh -l

# Cargamos el entorno del usuario
source ~/.zshrc 2>/dev/null

cd "/Users/czr/Desktop/CLF"

echo "------------------------------------------------"
echo "🚀 INICIANDO POLLA FUTBOLERA - BINANCE TOUR"
echo "------------------------------------------------"

# Función para verificar si el servidor está listo
check_server() {
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
}

# 1. Iniciar servidores si no responden
if [[ "$(check_server)" != "200" ]]; then
  echo "📦 Iniciando servidores (esto tardará unos segundos)..."
  
  # Iniciar Backend
  (cd backend && python3 -m uvicorn main:app --port 8080 --host 127.0.0.1 --reload) > /tmp/clf_backend.log 2>&1 &
  
  # Iniciar Frontend
  (cd frontend && npm run dev -- --port 5173 --host 127.0.0.1) > /tmp/clf_frontend.log 2>&1 &
  
  # Esperar a que el frontend responda
  echo "⏳ Esperando respuesta de Vite..."
  for i in {1..20}; do
    if [[ "$(check_server)" == "200" ]]; then
      break
    fi
    sleep 1
  done
fi

# 2. Abrir la URL específica
echo "✅ Abriendo Dashboard..."
open "http://localhost:5173/#dashboard"

# Dejamos la terminal abierta un momento por si hay errores
sleep 3
exit
