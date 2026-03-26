from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from sheets import SheetsConnector
from football_api import FootballAPI
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Polla Futbolera API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration (should be in .env)
CREDENTIALS_PATH = "service_account.json"
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "YOUR_SPREADSHEET_ID_HERE")

# Initialize components
try:
    sheets = SheetsConnector(CREDENTIALS_PATH, SPREADSHEET_ID)
except Exception:
    sheets = None  # Handle gracefully if no credentials yet

football = FootballAPI()

# In-memory storage for when Google Sheets is not configured
local_predictions: list = []
# Track registered BUIDs to prevent duplicates
registered_buids: set = set()

class Prediction(BaseModel):
    name: str = Field(..., min_length=2, description="Nombre completo del participante")
    buid: str = Field(..., pattern=r"^\d{8,10}$", description="Binance UID de 8 a 10 dígitos")
    goals_col: int = Field(..., ge=0, le=20, description="Goles predichos para Colombia")
    goals_cro: int = Field(..., ge=0, le=20, description="Goles predichos para Croacia")

@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.options("/register")
async def options_register():
    return {}

@app.get("/check-buid/{buid}")
async def check_buid(buid: str):
    """Check if a BUID is already registered."""
    # Check local set first
    if buid in registered_buids:
        return {"registered": True}
    # Check Google Sheets if available
    if sheets:
        try:
            all_records = sheets.get_all_predictions()
            for record in all_records:
                if str(record.get("BUID", "")) == buid:
                    registered_buids.add(buid)  # Cache it
                    return {"registered": True}
        except Exception:
            pass
    return {"registered": False}

@app.post("/register")
async def register(prediction: Prediction):
    # Check for duplicate BUID
    if prediction.buid in registered_buids:
        raise HTTPException(status_code=409, detail="Este BUID ya fue registrado. Solo puedes participar una vez.")
    
    # Also check Google Sheets if available
    if sheets:
        try:
            all_records = sheets.get_all_predictions()
            for record in all_records:
                if str(record.get("BUID", "")) == prediction.buid:
                    registered_buids.add(prediction.buid)
                    raise HTTPException(status_code=409, detail="Este BUID ya fue registrado. Solo puedes participar una vez.")
            sheets.register_user(
                prediction.name, 
                prediction.buid, 
                prediction.goals_col, 
                prediction.goals_cro
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Check local predictions too
        for p in local_predictions:
            if str(p.get("BUID", "")) == prediction.buid:
                registered_buids.add(prediction.buid)
                raise HTTPException(status_code=409, detail="Este BUID ya fue registrado. Solo puedes participar una vez.")
        # Store locally
        local_predictions.append({
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Nombre": prediction.name,
            "BUID": prediction.buid,
            "Goles Col": prediction.goals_col,
            "Goles Cro": prediction.goals_cro,
            "Estado": "Activo"
        })
    
    # Cache the BUID as registered
    registered_buids.add(prediction.buid)
    return {"status": "success", "message": "Predicción registrada correctamente"}

@app.get("/dashboard")
async def get_dashboard():
    if not sheets:
        # Use local predictions + seed data for development
        seed_data = [
            {"Timestamp": "2024-03-24 10:00:00", "Nombre": "Juan Perez", "BUID": "12345678", "Goles Col": 2, "Goles Cro": 1, "Estado": "Activo"},
            {"Timestamp": "2024-03-24 10:05:00", "Nombre": "Maria Lopez", "BUID": "87654321", "Goles Col": 0, "Goles Cro": 1, "Estado": "Activo"},
        ]
        all_data = seed_data + local_predictions
        live_score = (0, 0, "NS")
    else:
        all_data = sheets.get_all_predictions()
        live_score = football.get_live_score()

    real_col_raw, real_cro_raw, match_status = live_score
    real_col = int(real_col_raw)
    real_cro = int(real_cro_raw)
    
    processed_participants = []
    for p in all_data:
        try:
            p_col = int(p.get("Goles Col") or p.get("col", 0))
            p_cro = int(p.get("Goles Cro") or p.get("cro", 0))
            p_name = p.get("Nombre") or p.get("name", "Anónimo")
            p_buid = p.get("BUID") or p.get("buid", "00000000")
        except (ValueError, TypeError):
            p_col, p_cro = 0, 0
            p_name = "Error"
            p_buid = "00000000"
            
        is_eliminated = p_col < real_col or p_cro < real_cro
        status = "Eliminado" if is_eliminated else "Activo"
        
        diff = abs(p_col - real_col) + abs(p_cro - real_cro)
        
        processed_participants.append({
            "name": p_name,
            "buid": p_buid,
            "col": p_col,
            "cro": p_cro,
            "status": status,
            "diff": diff
        })

    processed_participants.sort(key=lambda x: (x["status"] == "Eliminado", x["diff"]))

    return {
        "live_score": {"col": real_col, "cro": real_cro, "status": match_status},
        "stats": {
            "total": len(processed_participants),
            "active": len([p for p in processed_participants if p["status"] == "Activo"])
        },
        "participants": processed_participants
    }
