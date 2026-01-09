#!/usr/bin/env python3
"""
Generador de Informes PDF para Attack Metrics
Genera mapas de calor y estadísticas de un partido
"""

import sys
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages
from datetime import datetime

def load_match_data(json_path):
    """Carga datos del partido desde JSON"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def draw_pitch(ax):
    """Dibuja un campo de fútbol en el eje proporcionado"""
    # Contorno del campo
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], color="white", linewidth=2)
    
    # Línea de medio campo
    ax.plot([50, 50], [0, 100], color="white", linewidth=2)
    
    # Áreas grandes (penalty area)
    ax.plot([0, 17, 17, 0], [21.1, 21.1, 78.9, 78.9], color="white", linewidth=2)
    ax.plot([100, 83, 83, 100], [21.1, 21.1, 78.9, 78.9], color="white", linewidth=2)
    
    # Áreas pequeñas (goal area)
    ax.plot([0, 5.8, 5.8, 0], [36.8, 36.8, 63.2, 63.2], color="white", linewidth=2)
    ax.plot([100, 94.2, 94.2, 100], [36.8, 36.8, 63.2, 63.2], color="white", linewidth=2)
    
    # Círculo central
    theta = np.linspace(0, 2*np.pi, 100)
    x_circle = 50 + 8.7 * np.cos(theta)
    y_circle = 50 + 13.4 * np.sin(theta)
    ax.plot(x_circle, y_circle, color="white", linewidth=2)
    
    # Puntos de penalti
    ax.plot(16, 50, 'wo', markersize=4)
    ax.plot(84, 50, 'wo', markersize=4)
    
    ax.set_xlim(-5, 105)
    ax.set_ylim(-5, 105)
    ax.set_facecolor('#2d5016')  # Verde césped oscuro
    ax.axis('off')

def generate_player_heatmaps(df, team_name, pdf):
    """Genera heatmaps individuales para cada jugador"""
    # IMPORTANTE: Invertir eje Y (100 - y)
    df = df.copy()
    df['y'] = 100 - df['y']
    
    players = df['player'].value_counts().index.tolist()
    
    # Configurar grid
    n_players = len(players)
    cols = 3
    rows = (n_players // cols) + (1 if n_players % cols > 0 else 0)
    
    fig, axes = plt.subplots(rows, cols, figsize=(15, 5 * rows))
    fig.suptitle(f'Mapas de Calor Individuales - {team_name}', fontsize=16, fontweight='bold')
    
    if rows == 1:
        axes = [axes] if cols == 1 else axes
    else:
        axes = axes.flatten()
    
    for i, player in enumerate(players):
        ax = axes[i]
        player_data = df[df['player'] == player]
        
        draw_pitch(ax)
        
        if len(player_data) >= 3:
            try:
                sns.kdeplot(
                    x=player_data['x'],
                    y=player_data['y'],
                    ax=ax,
                    fill=True,
                    cmap='YlOrRd',
                    alpha=0.7,
                    levels=8,
                    thresh=0.05
                )
                # Puntos individuales
                ax.scatter(player_data['x'], player_data['y'], 
                          color='white', s=10, alpha=0.4, edgecolors='black', linewidths=0.5)
            except:
                ax.text(50, 50, 'Datos Insuficientes', ha='center', color='white', fontsize=12)
        else:
            ax.text(50, 50, 'Datos Insuficientes', ha='center', color='white', fontsize=12)
        
        ax.set_title(f'{player}\n({len(player_data)} acciones)', fontsize=10, fontweight='bold', color='white')
    
    # Ocultar ejes no usados
    for j in range(i + 1, len(axes)):
        axes[j].axis('off')
    
    plt.tight_layout()
    pdf.savefig(fig, facecolor='#1a1a1a')
    plt.close()

def generate_team_heatmap(df, team_name, pdf):
    """Genera heatmap del equipo completo"""
    # IMPORTANTE: Invertir eje Y
    df = df.copy()
    df['y'] = 100 - df['y']
    
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor('#1a1a1a')
    
    draw_pitch(ax)
    
    if len(df) >= 3:
        sns.kdeplot(
            x=df['x'],
            y=df['y'],
            ax=ax,
            fill=True,
            cmap='YlOrRd',
            alpha=0.7,
            levels=15,
            thresh=0.05
        )
    
    ax.set_title(f'Mapa de Calor - {team_name}\n({len(df)} acciones totales)', 
                fontsize=14, fontweight='bold', color='white', pad=20)
    
    plt.tight_layout()
    pdf.savefig(fig, facecolor='#1a1a1a')
    plt.close()

def generate_statistics_page(df, team_name, config, pdf):
    """Genera página con estadísticas del equipo"""
    fig, ax = plt.subplots(figsize=(12, 10))
    fig.patch.set_facecolor('#1a1a1a')
    ax.axis('off')
    
    # Título
    ax.text(0.5, 0.95, f'Estadísticas del Partido', 
            ha='center', fontsize=18, fontweight='bold', color='white')
    ax.text(0.5, 0.90, f'{config["homeName"]} vs {config["awayName"]}', 
            ha='center', fontsize=14, color='#cccccc')
    
    # Estadísticas generales
    stats_text = f"""
ESTADÍSTICAS DE {team_name}

Total de Acciones: {len(df)}
Jugadores Únicos: {df['player'].nunique()}

DISTRIBUCIÓN POR TIPO DE ACCIÓN:
"""
    
    y_pos = 0.75
    ax.text(0.1, y_pos, stats_text, fontsize=12, color='white', 
            verticalalignment='top', family='monospace')
    
    # Top acciones
    y_pos = 0.55
    action_counts = df['type'].value_counts().head(10)
    for action_type, count in action_counts.items():
        ax.text(0.15, y_pos, f'• {action_type}: {count}', 
               fontsize=10, color='#cccccc', family='monospace')
        y_pos -= 0.04
    
    # Top jugadores
    y_pos = 0.25
    ax.text(0.1, y_pos, 'TOP 5 JUGADORES POR ACTIVIDAD:', 
           fontsize=12, color='white', fontweight='bold')
    y_pos -= 0.04
    
    player_counts = df['player'].value_counts().head(5)
    for player, count in player_counts.items():
        ax.text(0.15, y_pos, f'• {player}: {count} acciones', 
               fontsize=10, color='#cccccc', family='monospace')
        y_pos -= 0.04
    
    plt.tight_layout()
    pdf.savefig(fig, facecolor='#1a1a1a')
    plt.close()

def generate_report(json_path, pdf_path):
    """Función principal que genera el informe completo"""
    try:
        # Cargar datos
        data = load_match_data(json_path)
        config = data['config']
        df = pd.DataFrame(data['actions'])
        
        # Filtrar equipo HOME
        home_df = df[df['team'] == 'HOME'].copy()
        
        # Crear PDF con múltiples páginas
        with PdfPages(pdf_path) as pdf:
            # Página 1: Portada con estadísticas
            generate_statistics_page(home_df, config['homeName'], config, pdf)
            
            # Página 2: Heatmap del equipo
            generate_team_heatmap(home_df, config['homeName'], pdf)
            
            # Páginas siguientes: Heatmaps individuales
            generate_player_heatmaps(home_df, config['homeName'], pdf)
            
            # Metadatos del PDF
            d = pdf.infodict()
            d['Title'] = f'Informe - {config["homeName"]} vs {config["awayName"]}'
            d['Author'] = 'Attack Metrics Suite'
            d['Subject'] = 'Análisis de Partido'
            d['Keywords'] = 'Football, Analytics, Heatmap'
            d['CreationDate'] = datetime.now()
        
        print(f"PDF generado exitosamente: {pdf_path}")
        return 0
        
    except Exception as e:
        print(f"Error generando informe: {str(e)}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python generate-report.py <json_path> <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    json_path = sys.argv[1]
    pdf_path = sys.argv[2]
    
    exit_code = generate_report(json_path, pdf_path)
    sys.exit(exit_code)
