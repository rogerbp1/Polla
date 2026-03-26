#!/bin/bash

# Este script inicia el Backend y el Frontend, y abre el navegador automáticamente.

echo "🚀 Iniciando Polla Futbolera CLF x Binance Tour..."

# 1. Iniciar Backend en segundo plano
cd /Users/czr/Desktop/CLF/backend
python3 -m uvicorn main:app --reload --port 8080 &
BACKEND_PID=$!

# 2. Iniciar Frontend (Vite)
cd /Users/czr/Desktop/CLF/frontend
npm run dev &
FRONTEND_PID=$!

# 3. Esperar un momento y abrir el navegador
sleep 3
open http://localhost:5173

echo "✅ ¡Todo listo! Pulsa Ctrl+C para detener ambos servidores."

# Esperar a que terminen los procesos
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
