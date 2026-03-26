import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("FOOTBALL_API_KEY", "")
API_HOST = "api-football-v1.p.rapidapi.com"

class FootballAPI:
    def __init__(self):
        self.headers = {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST
        }
        self.url = "https://api-football-v1.p.rapidapi.com/v3/fixtures"
        self.fixture_id = None

    def find_today_fixture(self):
        """Busca el fixture_id del partido Colombia vs Croacia de hoy."""
        if not API_KEY or "your_api_key" in API_KEY:
            return None
            
        today = datetime.now().strftime("%Y-%m-%d")
        params = {
            "date": today,
            "timezone": "America/New_York"
        }
        
        try:
            response = requests.get(self.url, headers=self.headers, params=params)
            data = response.json()
            
            for fixture in data.get("response", []):
                home = fixture["teams"]["home"]["name"].lower()
                away = fixture["teams"]["away"]["name"].lower()
                if ("colombia" in home and "croatia" in away) or ("croatia" in home and "colombia" in away):
                    self.fixture_id = fixture["fixture"]["id"]
                    return self.fixture_id
        except Exception as e:
            print(f"Error buscando el partido: {e}")
        return None

    def get_live_score(self):
        """Obtiene el marcador real en tiempo real."""
        if not self.fixture_id:
            self.find_today_fixture()
            
        if not self.fixture_id:
            # Si no hay API Key o no se encontró el partido, devuelve 0-0
            return 0, 0, "NS"

        try:
            response = requests.get(self.url, headers=self.headers, params={"id": self.fixture_id})
            data = response.json()
            if data["response"]:
                fixture = data["response"][0]
                goals_home = fixture["goals"]["home"] or 0
                goals_away = fixture["goals"]["away"] or 0
                status = fixture["fixture"]["status"]["short"]
                
                # Identificar cuál es Colombia y cuál es Croacia
                home_name = fixture["teams"]["home"]["name"].lower()
                if "colombia" in home_name:
                    return goals_home, goals_away, status
                else:
                    return goals_away, goals_home, status
        except Exception as e:
            print(f"Error al obtener marcador: {e}")
            
        return 0, 0, "NS"
