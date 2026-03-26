import os
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime

# Scopes required for Google Sheets and Drive
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

class SheetsConnector:
    def __init__(self, credentials_path: str, spreadsheet_id: str):
        self.credentials_path = credentials_path
        self.spreadsheet_id = spreadsheet_id
        self.client = self._authenticate()
        self.sheet = self.client.open_by_key(spreadsheet_id).sheet1

    def _authenticate(self):
        if not os.path.exists(self.credentials_path):
            raise FileNotFoundError(f"Credentials file not found at {self.credentials_path}")
        
        credentials = Credentials.from_service_account_file(
            self.credentials_path, scopes=SCOPES
        )
        return gspread.authorize(credentials)

    def register_user(self, name: str, buid: str, goals_col: int, goals_cro: int):
        """
        Registers a new user prediction in the Google Sheet.
        Columns: Timestamp, Nombre, BUID, Goles Col, Goles Cro, Estado (Activo/Eliminado)
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row = [timestamp, name, buid, goals_col, goals_cro, "Activo"]
        self.sheet.append_row(row)

    def get_all_predictions(self):
        """
        Fetches all prediction records from the Google Sheet.
        """
        return self.sheet.get_all_records()

    def update_user_status(self, row_index: int, status: str):
        """
        Updates the 'Estado' column for a specific user.
        Assuming 'Estado' is the 6th column (F).
        """
        # +2 because row_index is 0-based and we have a header row
        self.sheet.update_cell(row_index + 2, 6, status)
