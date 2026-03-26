import requests
from datetime import datetime

API_KEY = "be15212e5cmshe300bafb378fc69p1fbaf5jsn1631d72191a3"
API_HOST = "api-football-v1.p.rapidapi.com"
url = "https://api-football-v1.p.rapidapi.com/v3/fixtures"

today = "2026-03-27"
params = {"date": today, "timezone": "America/New_York"}
headers = {"X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST}

try:
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    print(f"Respuesta completa: {data}")
    print(f"Buscando partidos para hoy ({today}):")
    found = False
    for fixture in data.get("response", []):
        home = fixture["teams"]["home"]["name"]
        away = fixture["teams"]["away"]["name"]
        fid = fixture["fixture"]["id"]
        status = fixture["fixture"]["status"]["long"]
        score = f"{fixture['goals']['home']} - {fixture['goals']['away']}"
        print(f"ID: {fid} | {home} vs {away} | Status: {status} | Score: {score}")
        if "colombia" in home.lower() or "colombia" in away.lower() or "croa" in home.lower() or "croa" in away.lower():
            found = True
            print(f">>> MATCH FOUND: {fid}")
    if not found:
        print("No se encontró ningún partido de Colombia hoy.")
except Exception as e:
    print(f"Error: {e}")
