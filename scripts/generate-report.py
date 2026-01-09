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
from matplotlib.patches import Rectangle, Circle, FancyBboxPatch
from datetime import datetime

# Configuración de estilo
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']

def load_match_data(json_path):
    """Carga datos del partido desde JSON"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def draw_pitch(ax, line_color='white', pitch_color='#2d5016'):
    """Dibuja un campo de fútbol en el eje proporcionado con mejor estilo"""
    ax.set_facecolor(pitch_color)
    
    # Contorno del campo con sombra
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], 
            color=line_color, linewidth=3, zorder=1)
    
    # Línea de medio campo
    ax.plot([50, 50], [0, 100], color=line_color, linewidth=2.5, zorder=1)
    
    # Áreas grandes (penalty area)
    ax.add_patch(Rectangle((0, 21.1), 17, 57.8, 
                           fill=False, edgecolor=line_color, linewidth=2, zorder=1))
    ax.add_patch(Rectangle((83, 21.1), 17, 57.8, 
                           fill=False, edgecolor=line_color, linewidth=2, zorder=1))
    
    # Áreas pequeñas (goal area)
    ax.add_patch(Rectangle((0, 36.8), 5.8, 26.4, 
                           fill=False, edgecolor=line_color, linewidth=2, zorder=1))
    ax.add_patch(Rectangle((94.2, 36.8), 5.8, 26.4, 
                           fill=False, edgecolor=line_color, linewidth=2, zorder=1))
    
    # Círculo central con gradiente
    circle = Circle((50, 50), 8.7, fill=False, edgecolor=line_color, linewidth=2, zorder=1)
    ax.add_patch(circle)
    
    # Punto central
    ax.plot(50, 50, 'o', color=line_color, markersize=6, zorder=2)
    
    # Puntos de penalti
    ax.plot(11, 50, 'o', color=line_color, markersize=5, zorder=2)
    ax.plot(89, 50, 'o', color=line_color, markersize=5, zorder=2)
    
    # Arcos del área (semicírculos)
    arc_theta = np.linspace(-np.pi/2, np.pi/2, 50)
    arc_x1 = 17 + 9.15 * np.cos(arc_theta)
    arc_y1 = 50 + 9.15 * np.sin(arc_theta)
    ax.plot(arc_x1, arc_y1, color=line_color, linewidth=2, zorder=1)
    
    arc_x2 = 83 - 9.15 * np.cos(arc_theta)
    arc_y2 = 50 + 9.15 * np.sin(arc_theta)
    ax.plot(arc_x2, arc_y2, color=line_color, linewidth=2, zorder=1)
    
    # Esquinas
    corner_radius = 1
    for x, y in [(0, 0), (0, 100), (100, 0), (100, 100)]:
        if x == 0:
            theta = np.linspace(0, np.pi/2, 20)
            cx = x + corner_radius * np.cos(theta)
            cy = y + corner_radius * np.sin(theta) * (-1 if y == 0 else 1)
        else:
            theta = np.linspace(np.pi/2, np.pi, 20)
            cx = x + corner_radius * np.cos(theta)
            cy = y + corner_radius * np.sin(theta) * (-1 if y == 0 else 1)
        ax.plot(cx, cy, color=line_color, linewidth=1.5, zorder=1)
    
    ax.set_xlim(-5, 105)
    ax.set_ylim(-5, 105)
    ax.set_aspect('equal')
    ax.axis('off')

def generate_player_heatmaps(df, team_name, pdf):
    """Genera heatmaps individuales para cada jugador con diseño mejorado"""
    df = df.copy()
    df['y'] = 100 - df['y']
    
    players = df['player'].value_counts().index.tolist()
    n_players = len(players)
    cols = 3
    rows = (n_players // cols) + (1 if n_players % cols > 0 else 0)
    
    fig = plt.figure(figsize=(16, 5.5 * rows))
    fig.patch.set_facecolor('#0a0a0a')
    
    # Título principal con estilo
    fig.suptitle(f'🔥 MAPAS DE CALOR INDIVIDUALES - {team_name.upper()}', 
                fontsize=20, fontweight='bold', color='white', y=0.98)
    
    if rows == 1:
        gs = fig.add_gridspec(1, cols, hspace=0.3, wspace=0.3, 
                             left=0.05, right=0.95, top=0.92, bottom=0.05)
    else:
        gs = fig.add_gridspec(rows, cols, hspace=0.35, wspace=0.25, 
                             left=0.05, right=0.95, top=0.95, bottom=0.05)
    
    for i, player in enumerate(players):
        row, col = divmod(i, cols)
        ax = fig.add_subplot(gs[row, col])
        
        player_data = df[df['player'] == player]
        
        draw_pitch(ax, line_color='#4CAF50', pitch_color='#1a3a0f')
        
        if len(player_data) >= 3:
            try:
                # Heatmap con colores más vibrantes
                sns.kdeplot(
                    x=player_data['x'],
                    y=player_data['y'],
                    ax=ax,
                    fill=True,
                    cmap='hot',
                    alpha=0.8,
                    levels=10,
                    thresh=0.03
                )
                # Puntos con mejor visualización
                ax.scatter(player_data['x'], player_data['y'], 
                          color='yellow', s=25, alpha=0.6, 
                          edgecolors='white', linewidths=1, zorder=10)
            except:
                ax.text(50, 50, '⚠️ Datos Insuficientes', ha='center', 
                       color='#ffeb3b', fontsize=14, fontweight='bold')
        else:
            ax.text(50, 50, '⚠️ Datos Insuficientes', ha='center', 
                   color='#ffeb3b', fontsize=14, fontweight='bold')
        
        # Marco decorativo para el título
        bbox = FancyBboxPatch((0, 0), 1, 0.08, boxstyle="round,pad=0.005", 
                             transform=ax.transAxes, 
                             facecolor='#1e1e1e', edgecolor='#4CAF50', 
                             linewidth=2, zorder=15)
        ax.add_patch(bbox)
        
        ax.text(0.5, 0.04, f'⚽ {player}  •  {len(player_data)} acciones', 
               transform=ax.transAxes, ha='center', va='center',
               fontsize=11, fontweight='bold', color='white', zorder=16)
    
    plt.tight_layout()
    pdf.savefig(fig, facecolor='#0a0a0a', dpi=150)
    plt.close()

def generate_team_heatmap(df, team_name, pdf):
    """Genera heatmap del equipo completo con visualización mejorada"""
    df = df.copy()
    df['y'] = 100 - df['y']
    
    fig = plt.figure(figsize=(14, 10))
    fig.patch.set_facecolor('#0a0a0a')
    
    ax = fig.add_subplot(111)
    
    draw_pitch(ax, line_color='#4CAF50', pitch_color='#1a3a0f')
    
    if len(df) >= 3:
        # Heatmap con colores más intensos
        sns.kdeplot(
            x=df['x'],
            y=df['y'],
            ax=ax,
            fill=True,
            cmap='plasma',
            alpha=0.85,
            levels=20,
            thresh=0.02
        )
        
        # Agregar contornos
        sns.kdeplot(
            x=df['x'],
            y=df['y'],
            ax=ax,
            fill=False,
            cmap='viridis',
            levels=5,
            linewidths=2,
            alpha=0.5
        )
    
    # Título con decoración
    title_box = FancyBboxPatch((0.1, 0.94), 0.8, 0.055, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.01",
                               facecolor='#1e1e1e', 
                               edgecolor='#4CAF50', 
                               linewidth=3)
    fig.add_artist(title_box)
    
    fig.text(0.5, 0.97, f'🔥 MAPA DE CALOR DEL EQUIPO - {team_name.upper()}', 
            ha='center', fontsize=18, fontweight='bold', color='white')
    fig.text(0.5, 0.945, f'📊 {len(df)} acciones totales registradas', 
            ha='center', fontsize=12, color='#4CAF50')
    
    plt.tight_layout(rect=[0, 0, 1, 0.93])
    pdf.savefig(fig, facecolor='#0a0a0a', dpi=150)
    plt.close()

def generate_statistics_page(df, team_name, config, pdf):
    """Genera página con estadísticas del equipo con diseño moderno"""
    fig = plt.figure(figsize=(14, 11))
    fig.patch.set_facecolor('#0a0a0a')
    
    # Título principal con fondo degradado
    title_box = FancyBboxPatch((0.05, 0.88), 0.9, 0.1, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.02",
                               facecolor='#1e1e1e', 
                               edgecolor='#4CAF50', 
                               linewidth=4)
    fig.add_artist(title_box)
    
    fig.text(0.5, 0.945, '📊 INFORME DE ANÁLISIS DE PARTIDO', 
            ha='center', fontsize=24, fontweight='bold', color='white')
    fig.text(0.5, 0.91, f'{config["homeName"].upper()} vs {config["awayName"].upper()}', 
            ha='center', fontsize=18, color='#4CAF50', fontweight='bold')
    fig.text(0.5, 0.885, datetime.now().strftime('%d/%m/%Y - %H:%M'), 
            ha='center', fontsize=11, color='#888888')
    
    # Panel de estadísticas principales
    stats_box = FancyBboxPatch((0.05, 0.62), 0.9, 0.23, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.015",
                               facecolor='#1a1a1a', 
                               edgecolor='#2196F3', 
                               linewidth=2)
    fig.add_artist(stats_box)
    
    fig.text(0.5, 0.83, f'🏃 ESTADÍSTICAS DE {team_name.upper()}', 
            ha='center', fontsize=16, fontweight='bold', color='#2196F3')
    
    # Métricas destacadas
    total_actions = len(df)
    unique_players = df['player'].nunique()
    most_active = df['player'].value_counts().index[0] if len(df) > 0 else 'N/A'
    
    metrics = [
        ('📈 Total Acciones', total_actions, 0.25),
        ('👥 Jugadores Activos', unique_players, 0.5),
        ('⭐ Más Activo', most_active, 0.75)
    ]
    
    y_metrics = 0.74
    for label, value, x_pos in metrics:
        metric_box = FancyBboxPatch((x_pos - 0.11, y_metrics - 0.04), 0.22, 0.08, 
                                   transform=fig.transFigure,
                                   boxstyle="round,pad=0.01",
                                   facecolor='#2a2a2a', 
                                   edgecolor='#4CAF50', 
                                   linewidth=1.5)
        fig.add_artist(metric_box)
        
        fig.text(x_pos, y_metrics + 0.01, label, 
                ha='center', fontsize=11, color='#cccccc')
        fig.text(x_pos, y_metrics - 0.02, str(value), 
                ha='center', fontsize=16, fontweight='bold', color='#4CAF50')
    
    # Distribución de acciones (gráfico de barras)
    action_box = FancyBboxPatch((0.05, 0.32), 0.42, 0.27, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.015",
                               facecolor='#1a1a1a', 
                               edgecolor='#FF9800', 
                               linewidth=2)
    fig.add_artist(action_box)
    
    fig.text(0.26, 0.575, '📋 TIPOS DE ACCIONES', 
            ha='center', fontsize=14, fontweight='bold', color='#FF9800')
    
    ax1 = fig.add_axes([0.08, 0.36, 0.36, 0.18])
    action_counts = df['type'].value_counts().head(8)
    colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(action_counts)))
    bars = ax1.barh(range(len(action_counts)), action_counts.values, color=colors, edgecolor='white', linewidth=1.5)
    ax1.set_yticks(range(len(action_counts)))
    ax1.set_yticklabels(action_counts.index, fontsize=9, color='white')
    ax1.set_xlabel('Cantidad', fontsize=10, color='white')
    ax1.tick_params(colors='white', labelsize=9)
    ax1.set_facecolor('#0a0a0a')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.spines['left'].set_color('#444444')
    ax1.spines['bottom'].set_color('#444444')
    ax1.grid(axis='x', alpha=0.2, color='#444444')
    
    # Agregar valores en las barras
    for i, (bar, value) in enumerate(zip(bars, action_counts.values)):
        ax1.text(value + 0.5, i, str(value), va='center', fontsize=9, 
                color='white', fontweight='bold')
    
    # Top jugadores (tabla visual)
    player_box = FancyBboxPatch((0.53, 0.32), 0.42, 0.27, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.015",
                               facecolor='#1a1a1a', 
                               edgecolor='#E91E63', 
                               linewidth=2)
    fig.add_artist(player_box)
    
    fig.text(0.74, 0.575, '🏆 TOP 8 JUGADORES', 
            ha='center', fontsize=14, fontweight='bold', color='#E91E63')
    
    player_counts = df['player'].value_counts().head(8)
    y_start = 0.54
    for idx, (player, count) in enumerate(player_counts.items()):
        y_pos = y_start - (idx * 0.025)
        
        # Barra de progreso
        max_count = player_counts.max()
        bar_width = (count / max_count) * 0.3
        
        bar = FancyBboxPatch((0.56, y_pos - 0.008), bar_width, 0.018, 
                           transform=fig.transFigure,
                           boxstyle="round,pad=0.001",
                           facecolor=plt.cm.plasma(count / max_count), 
                           edgecolor='white', 
                           linewidth=0.5,
                           alpha=0.8)
        fig.add_artist(bar)
        
        fig.text(0.555, y_pos, f'{idx+1}. {player}', 
                fontsize=10, color='white', va='center')
        fig.text(0.89, y_pos, f'{count}', 
                fontsize=10, fontweight='bold', color='#4CAF50', 
                ha='right', va='center')
    
    # Pie de página
    footer_box = FancyBboxPatch((0.05, 0.05), 0.9, 0.22, 
                               transform=fig.transFigure,
                               boxstyle="round,pad=0.015",
                               facecolor='#1a1a1a', 
                               edgecolor='#9C27B0', 
                               linewidth=2)
    fig.add_artist(footer_box)
    
    fig.text(0.5, 0.245, '📍 ZONAS DE ACTIVIDAD', 
            ha='center', fontsize=14, fontweight='bold', color='#9C27B0')
    
    # Mini visualización de zonas
    ax2 = fig.add_axes([0.35, 0.08, 0.3, 0.14])
    draw_pitch(ax2, line_color='#666666', pitch_color='#1a1a1a')
    
    if len(df) >= 3:
        df_copy = df.copy()
        df_copy['y'] = 100 - df_copy['y']
        ax2.scatter(df_copy['x'], df_copy['y'], 
                   c='yellow', s=15, alpha=0.6, edgecolors='white', linewidths=0.5)
    
    fig.text(0.5, 0.06, 'Attack Metrics Suite © 2026', 
            ha='center', fontsize=9, color='#666666', style='italic')
    
    pdf.savefig(fig, facecolor='#0a0a0a', dpi=150)
    plt.close()

def generate_report(json_path, pdf_path):
    """Función principal que genera el informe completo"""
    try:
        print("📄 Cargando datos del partido...")
        data = load_match_data(json_path)
        config = data['config']
        df = pd.DataFrame(data['actions'])
        
        print(f"✓ Datos cargados: {len(df)} acciones")
        
        # Filtrar equipo HOME
        home_df = df[df['team'] == 'HOME'].copy()
        print(f"✓ Acciones del equipo local: {len(home_df)}")
        
        # Crear PDF con múltiples páginas
        print("📊 Generando informe PDF...")
        with PdfPages(pdf_path) as pdf:
            # Página 1: Portada con estadísticas
            print("  → Página 1: Estadísticas generales")
            generate_statistics_page(home_df, config['homeName'], config, pdf)
            
            # Página 2: Heatmap del equipo
            print("  → Página 2: Mapa de calor del equipo")
            generate_team_heatmap(home_df, config['homeName'], pdf)
            
            # Páginas siguientes: Heatmaps individuales
            print("  → Páginas siguientes: Mapas individuales de jugadores")
            generate_player_heatmaps(home_df, config['homeName'], pdf)
            
            # Metadatos del PDF
            d = pdf.infodict()
            d['Title'] = f'Informe - {config["homeName"]} vs {config["awayName"]}'
            d['Author'] = 'Attack Metrics Suite'
            d['Subject'] = 'Análisis de Partido de Fútbol'
            d['Keywords'] = 'Football, Analytics, Heatmap, Performance'
            d['CreationDate'] = datetime.now()
        
        print(f"✅ PDF generado exitosamente: {pdf_path}")
        return 0
        
    except Exception as e:
        print(f"❌ Error generando informe: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python generate-report.py <json_path> <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    json_path = sys.argv[1]
    pdf_path = sys.argv[2]
    
    exit_code = generate_report(json_path, pdf_path)
    sys.exit(exit_code)
