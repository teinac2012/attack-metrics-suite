"""
API de Python para Vercel - Generación de PDF con heatmaps
"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import tempfile
from datetime import datetime

# Agregar el directorio scripts al path
current_dir = os.path.dirname(os.path.abspath(__file__))
scripts_dir = os.path.join(os.path.dirname(current_dir), 'scripts')
sys.path.insert(0, scripts_dir)

try:
    from generate_heatmap_report import generate_pdf_report
    DEPENDENCIES_OK = True
except ImportError as e:
    DEPENDENCIES_OK = False
    IMPORT_ERROR = str(e)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Verificar dependencias
            if not DEPENDENCIES_OK:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Dependencias de Python no disponibles',
                    'details': IMPORT_ERROR
                }).encode())
                return
            
            # Leer el body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Validar datos
            if 'actions' not in data or not data['actions']:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'No hay datos válidos para generar el informe'
                }).encode())
                return
            
            # Crear archivos temporales
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as json_file:
                json.dump(data, json_file)
                json_path = json_file.name
            
            pdf_path = tempfile.mktemp(suffix='.pdf')
            
            # Generar PDF
            success = generate_pdf_report(json_path, pdf_path)
            
            if not success:
                os.unlink(json_path)
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Error al generar el informe PDF'
                }).encode())
                return
            
            # Leer el PDF
            with open(pdf_path, 'rb') as pdf_file:
                pdf_data = pdf_file.read()
            
            # Limpiar archivos temporales
            try:
                os.unlink(json_path)
                os.unlink(pdf_path)
            except:
                pass
            
            # Enviar PDF
            home_team = data.get('config', {}).get('homeTeam', 'LOCAL')
            away_team = data.get('config', {}).get('awayTeam', 'VISITANTE')
            date = data.get('config', {}).get('date', datetime.now().strftime('%Y-%m-%d'))
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition', 
                           f'attachment; filename="Informe_{home_team}_vs_{away_team}_{date}.pdf"')
            self.end_headers()
            self.wfile.write(pdf_data)
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Error interno del servidor',
                'details': str(e)
            }).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
