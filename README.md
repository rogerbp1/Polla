# ⚽ Polla Futbolera - Binance Tour

Aplicación futurista para predicciones de fútbol en tiempo real, integrada con Google Sheets y API de fútbol profesional.

## 🚀 Características
- **Marcador en Vivo**: Conexión con API-Football para actualizaciones en tiempo real.
- **Persistencia**: Registro de datos en Google Sheets mediante cuenta de servicio.
- **UX Avanzada**: Protección contra duplicados por BUID y memoria local (LocalStorage).
- **Diseño Premium**: Interfaz oscura con estética Binance y animaciones fluidas.

## 🛠️ Tecnologías
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python), Google Sheets API.
- **API**: API-Football (RapidAPI).

## 📝 Configuración
1. Crea un archivo `.env` en la carpeta `backend` con:
   ```
   SPREADSHEET_ID=tu_hoja_id
   FOOTBALL_API_KEY=tu_rapidapi_key
   ```
2. Pon tu archivo `service_account.json` en la carpeta `backend`.
3. Instala dependencias: `pip install -r requirements.txt` (backend) y `npm install` (frontend).

---
Desarrollado para **Binance Tour x Cripto Latin Fest**.
