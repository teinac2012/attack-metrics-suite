#!/usr/bin/env python3
"""
Script de prueba para verificar el generador de informes PDF
Crea un JSON de prueba y genera un PDF de ejemplo
"""

import json
import os
import sys

# Datos de prueba
test_data = {
    "config": {
        "homeTeam": "RINCONADA",
        "awayTeam": "ALCALA",
        "date": "2026-01-09"
    },
    "actions": [
        {"id": 1, "min": "00:15", "period": "1T", "team": "HOME", "player": "PEREZ", 
         "type": "Pase", "res": "Completado", "x": 45.5, "y": 32.1, 
         "endX": 55.2, "endY": 38.4, "xg": 0, "xt": 0.02},
        {"id": 2, "min": "00:30", "period": "1T", "team": "HOME", "player": "GARCIA", 
         "type": "Conducción", "res": "Completado", "x": 55.2, "y": 38.4, 
         "endX": 65.8, "endY": 45.2, "xg": 0, "xt": 0.05},
        {"id": 3, "min": "00:45", "period": "1T", "team": "HOME", "player": "LOPEZ", 
         "type": "Disparo", "res": "Fuera", "x": 88.5, "y": 48.5, 
         "endX": 100, "endY": 50, "xg": 0.15, "xt": 0},
        {"id": 4, "min": "01:20", "period": "1T", "team": "HOME", "player": "PEREZ", 
         "type": "Recup", "res": "Completado", "x": 35.2, "y": 25.8, 
         "endX": None, "endY": None, "xg": 0, "xt": 0},
        {"id": 5, "min": "01:45", "period": "1T", "team": "HOME", "player": "MARTINEZ", 
         "type": "Intercep", "res": "Completado", "x": 42.1, "y": 68.3, 
         "endX": None, "endY": None, "xg": 0, "xt": 0},
        {"id": 6, "min": "02:10", "period": "1T", "team": "HOME", "player": "GARCIA", 
         "type": "Pase", "res": "Completado", "x": 60.3, "y": 52.1, 
         "endX": 72.5, "endY": 48.9, "xg": 0, "xt": 0.03},
        {"id": 7, "min": "02:35", "period": "1T", "team": "HOME", "player": "BELLIDO", 
         "type": "Centro", "res": "Completado", "x": 85.2, "y": 15.3, 
         "endX": 92.1, "endY": 50, "xg": 0, "xt": 0.08},
        {"id": 8, "min": "03:00", "period": "1T", "team": "HOME", "player": "SEGURA", 
         "type": "Conducción", "res": "Completado", "x": 50.5, "y": 85.2, 
         "endX": 68.3, "endY": 88.7, "xg": 0, "xt": 0.04},
        {"id": 9, "min": "03:25", "period": "1T", "team": "HOME", "player": "LOPEZ", 
         "type": "Disparo", "res": "Gol", "x": 91.5, "y": 52.3, 
         "endX": 100, "endY": 50, "xg": 0.35, "xt": 0},
        {"id": 10, "min": "03:50", "period": "1T", "team": "HOME", "player": "PEREZ", 
         "type": "Pase", "res": "Completado", "x": 55.8, "y": 45.2, 
         "endX": 68.9, "endY": 52.1, "xg": 0, "xt": 0.025},
        # Añadir más acciones para tener datos suficientes
        {"id": 11, "min": "04:15", "period": "1T", "team": "HOME", "player": "GARCIA", 
         "type": "Recup", "res": "Completado", "x": 28.5, "y": 55.2, 
         "endX": None, "endY": None, "xg": 0, "xt": 0},
        {"id": 12, "min": "04:40", "period": "1T", "team": "HOME", "player": "MARTINEZ", 
         "type": "Pase", "res": "Completado", "x": 40.2, "y": 60.8, 
         "endX": 52.3, "endY": 58.5, "xg": 0, "xt": 0.015},
        {"id": 13, "min": "05:05", "period": "1T", "team": "HOME", "player": "BELLIDO", 
         "type": "Regate", "res": "Completado", "x": 72.8, "y": 18.5, 
         "endX": 78.5, "endY": 22.3, "xg": 0, "xt": 0.06},
        {"id": 14, "min": "05:30", "period": "1T", "team": "HOME", "player": "SEGURA", 
         "type": "Centro", "res": "Completado", "x": 82.3, "y": 92.5, 
         "endX": 88.7, "endY": 50, "xg": 0, "xt": 0.07},
        {"id": 15, "min": "05:55", "period": "1T", "team": "HOME", "player": "LOPEZ", 
         "type": "Remate", "res": "Bloqueado", "x": 89.2, "y": 50, 
         "endX": 100, "endY": 50, "xg": 0.25, "xt": 0},
        {"id": 16, "min": "06:20", "period": "1T", "team": "HOME", "player": "PEREZ", 
         "type": "Intercep", "res": "Completado", "x": 68.5, "y": 42.3, 
         "endX": None, "endY": None, "xg": 0, "xt": 0},
        {"id": 17, "min": "06:45", "period": "2T", "team": "HOME", "player": "GARCIA", 
         "type": "Conducción", "res": "Completado", "x": 45.2, "y": 50, 
         "endX": 58.7, "endY": 48.5, "xg": 0, "xt": 0.04},
        {"id": 18, "min": "07:10", "period": "2T", "team": "HOME", "player": "MARTINEZ", 
         "type": "Pase", "res": "Completado", "x": 58.7, "y": 48.5, 
         "endX": 72.3, "endY": 55.2, "xg": 0, "xt": 0.035},
        {"id": 19, "min": "07:35", "period": "2T", "team": "HOME", "player": "BELLIDO", 
         "type": "Pase", "res": "Completado", "x": 75.8, "y": 12.8, 
         "endX": 85.2, "endY": 25.3, "xg": 0, "xt": 0.05},
        {"id": 20, "min": "08:00", "period": "2T", "team": "HOME", "player": "SEGURA", 
         "type": "Conducción", "res": "Completado", "x": 52.3, "y": 88.9, 
         "endX": 65.8, "endY": 85.2, "xg": 0, "xt": 0.045},
    ]
}

# Crear archivo de prueba
test_json_path = os.path.join(os.path.dirname(__file__), 'test_match_data.json')
with open(test_json_path, 'w', encoding='utf-8') as f:
    json.dump(test_data, f, indent=2, ensure_ascii=False)

print(f"✅ Archivo de prueba creado: {test_json_path}")

# Importar y ejecutar el generador
try:
    # Usar importación directa del archivo
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "generate_heatmap_report", 
        os.path.join(os.path.dirname(__file__), "generate-heatmap-report.py")
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    generate_pdf_report = module.generate_pdf_report
    
    test_pdf_path = os.path.join(os.path.dirname(__file__), 'test_report.pdf')
    
    print(f"🔄 Generando PDF de prueba...")
    success = generate_pdf_report(test_json_path, test_pdf_path)
    
    if success:
        print(f"✅ PDF de prueba generado exitosamente: {test_pdf_path}")
        print(f"📊 Tamaño del archivo: {os.path.getsize(test_pdf_path) / 1024:.2f} KB")
        sys.exit(0)
    else:
        print("❌ Error al generar el PDF de prueba")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
