"""
API de Python para Vercel - Generación de PDF con heatmaps
"""
import json
import sys
import os
import tempfile
from datetime import datetime
import subprocess

def handler(request):
    """Handler para Vercel Python Functions"""
    
    try:
        # Procesar POST
        if request.method != 'POST':
            return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}
        
        # Leer body
        try:
            data = json.loads(request.body) if isinstance(request.body, str) else request.body
        except:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON'})}
        
        # Validar datos
        if 'actions' not in data or not data['actions']:
            return {'statusCode': 400, 'body': json.dumps({'error': 'No hay datos válidos'})}
        
        # Crear archivos temporales
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as json_file:
            json.dump(data, json_file)
            json_path = json_file.name
        
        pdf_path = tempfile.mktemp(suffix='.pdf')
        
        # Ejecutar script Python de generación
        script_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'generate-heatmap-report.py')
        
        result = subprocess.run(
            [sys.executable, script_path, json_path, pdf_path],
            capture_output=True,
            text=True,
            timeout=50
        )
        
        if result.returncode != 0:
            os.unlink(json_path)
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': 'Error al generar PDF',
                    'details': result.stderr
                })
            }
        
        # Leer el PDF
        with open(pdf_path, 'rb') as pdf_file:
            pdf_data = pdf_file.read()
        
        # Limpiar archivos
        try:
            os.unlink(json_path)
            os.unlink(pdf_path)
        except:
            pass
        
        # Retornar PDF
        home_team = data.get('config', {}).get('homeTeam', 'LOCAL')
        away_team = data.get('config', {}).get('awayTeam', 'VISITANTE')
        date_str = data.get('config', {}).get('date', datetime.now().strftime('%Y-%m-%d'))
        
        return {
            'statusCode': 200,
            'body': pdf_data,
            'headers': {
                'Content-Type': 'application/pdf',
                'Content-Disposition': f'attachment; filename="Informe_{home_team}_vs_{away_team}_{date_str}.pdf"'
            },
            'isBase64Encoded': True
        }
        
    except subprocess.TimeoutExpired:
        return {
            'statusCode': 504,
            'body': json.dumps({'error': 'Timeout generando PDF (>50s)'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Error interno',
                'details': str(e)
            })
        }
