#!/usr/bin/env python3
"""
Generador de Informes PDF con Heatmaps para Attack Metrics
Genera mapas de calor de jugadores individuales, equipo y recuperaciones
"""

import sys
import json
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Backend sin GUI
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.patches import Rectangle, Circle
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configuración de estilo
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
sns.set_style("white")

def load_match_data(json_path):
    """Carga datos del partido desde JSON"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def draw_pitch(ax, line_color='black', pitch_color='white'):
    """Dibuja un campo de fútbol profesional"""
    ax.set_facecolor(pitch_color)
    
    # Configurar límites
    ax.set_xlim(-2, 102)
    ax.set_ylim(-2, 102)
    ax.set_aspect('auto')
    
    # Contorno del campo
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], 
            color=line_color, linewidth=2, zorder=10)
    
    # Línea de medio campo
    ax.plot([50, 50], [0, 100], color=line_color, linewidth=2, zorder=10)
    
    # Área grande izquierda (penalty area) - solo 3 líneas
    ax.plot([16.5, 16.5], [21.1, 78.9], color=line_color, linewidth=1.5, zorder=10)  # vertical
    ax.plot([0, 16.5], [21.1, 21.1], color=line_color, linewidth=1.5, zorder=10)     # horizontal inferior
    ax.plot([0, 16.5], [78.9, 78.9], color=line_color, linewidth=1.5, zorder=10)     # horizontal superior
    
    # Área grande derecha (penalty area) - solo 3 líneas
    ax.plot([83.5, 83.5], [21.1, 78.9], color=line_color, linewidth=1.5, zorder=10)  # vertical
    ax.plot([83.5, 100], [21.1, 21.1], color=line_color, linewidth=1.5, zorder=10)   # horizontal inferior
    ax.plot([83.5, 100], [78.9, 78.9], color=line_color, linewidth=1.5, zorder=10)   # horizontal superior
    
    # Área pequeña izquierda (goal area) - solo 3 líneas
    ax.plot([5.5, 5.5], [36.8, 63.2], color=line_color, linewidth=1.5, zorder=10)    # vertical
    ax.plot([0, 5.5], [36.8, 36.8], color=line_color, linewidth=1.5, zorder=10)      # horizontal inferior
    ax.plot([0, 5.5], [63.2, 63.2], color=line_color, linewidth=1.5, zorder=10)      # horizontal superior
    
    # Área pequeña derecha (goal area) - solo 3 líneas
    ax.plot([94.5, 94.5], [36.8, 63.2], color=line_color, linewidth=1.5, zorder=10)  # vertical
    ax.plot([94.5, 100], [36.8, 36.8], color=line_color, linewidth=1.5, zorder=10)   # horizontal inferior
    ax.plot([94.5, 100], [63.2, 63.2], color=line_color, linewidth=1.5, zorder=10)   # horizontal superior
    
    # Círculo central
    theta = np.linspace(0, 2*np.pi, 100)
    x_circle = 50 + 9.15 * np.cos(theta)
    y_circle = 50 + 9.15 * np.sin(theta)
    ax.plot(x_circle, y_circle, color=line_color, linewidth=1.5, zorder=10)
    
    # Punto central
    ax.plot(50, 50, 'o', color=line_color, markersize=3, zorder=11)
    
    # Puntos de penalty
    ax.plot(11, 50, 'o', color=line_color, markersize=3, zorder=11)
    ax.plot(89, 50, 'o', color=line_color, markersize=3, zorder=11)
    
    # Arcos de área de penalty - izquierda (mirando hacia el área)
    theta_left = np.linspace(-0.93, 0.93, 50)
    arc_x_left = 11 + 9.15 * np.cos(theta_left)
    arc_y_left = 50 + 9.15 * np.sin(theta_left)
    ax.plot(arc_x_left, arc_y_left, color=line_color, linewidth=1.5, zorder=10)
    
    # Arcos de área de penalty - derecha (mirando hacia el área)
    theta_right = np.linspace(np.pi - 0.93, np.pi + 0.93, 50)
    arc_x_right = 89 + 9.15 * np.cos(theta_right)
    arc_y_right = 50 + 9.15 * np.sin(theta_right)
    ax.plot(arc_x_right, arc_y_right, color=line_color, linewidth=1.5, zorder=10)
    
    ax.axis('off')

def generate_player_heatmaps(home_df, pdf_pages, home_team_name):
    """Genera heatmaps individuales para cada jugador"""
    player_counts = home_df['player'].value_counts()
    # Limitar a top 12 jugadores para optimizar velocidad
    players_sorted = player_counts.head(12).index.tolist()
    n_players = len(players_sorted)
    
    if n_players == 0:
        return
    
    cols = 4
    rows = (n_players // cols) + (1 if n_players % cols > 0 else 0)
    
    fig, axes = plt.subplots(rows, cols, figsize=(20, 5 * rows))
    if rows == 1 and cols == 1:
        axes = np.array([axes])
    axes = axes.flatten() if n_players > 1 else [axes]
    
    fig.suptitle(f'Mapas de Calor Individuales - {home_team_name}', 
                 fontsize=24, fontweight='bold', y=0.995)
    
    for i, player in enumerate(players_sorted):
        ax = axes[i]
        player_data = home_df[home_df['player'] == player]
        
        draw_pitch(ax)
        
        if not player_data.empty and len(player_data) > 3:
            try:
                sns.kdeplot(
                    x=player_data['x'],
                    y=player_data['y'],
                    ax=ax,
                    fill=True,
                    cmap='Reds',
                    alpha=0.6,
                    levels=10,
                    thresh=0.05,
                    zorder=2
                )
            except:
                # Si falla el KDE, mostrar scatter
                ax.scatter(player_data['x'], player_data['y'], 
                          color='red', s=30, alpha=0.6, zorder=2)
        
        ax.set_title(f"{player} ({len(player_data)} acciones)", 
                    fontsize=14, fontweight='bold', pad=10)
    
    # Ocultar ejes no usados
    for j in range(i + 1, len(axes)):
        axes[j].axis('off')
    
    plt.tight_layout()
    pdf_pages.savefig(fig, dpi=100, bbox_inches='tight')
    plt.close(fig)

def generate_team_heatmap(home_df, pdf_pages, home_team_name):
    """Genera mapa de calor del equipo completo"""
    fig, ax = plt.subplots(figsize=(14, 10))
    
    draw_pitch(ax)
    
    if not home_df.empty and len(home_df) > 10:
        try:
            sns.kdeplot(
                x=home_df['x'],
                y=home_df['y'],
                ax=ax,
                fill=True,
                cmap='Reds',
                alpha=0.6,
                levels=15,
                thresh=0.05,
                zorder=2
            )
        except:
            ax.scatter(home_df['x'], home_df['y'], 
                      color='red', s=20, alpha=0.4, zorder=2)
    
    ax.set_title(f'Mapa de Calor del Equipo - {home_team_name}', 
                fontsize=18, fontweight='bold', pad=15)
    
    plt.tight_layout()
    pdf_pages.savefig(fig, dpi=100, bbox_inches='tight')
    plt.close(fig)

def generate_recoveries_map(home_df, pdf_pages, home_team_name):
    """Genera mapa de recuperaciones por tercios"""
    rec_types = ['Recup', 'Intercep', 'Recuperación', 'Interceptación']
    recoveries = home_df[home_df['type'].isin(rec_types)].copy()
    
    if recoveries.empty:
        print("No hay recuperaciones para mostrar")
        return
    
    def get_third(x):
        if x < 100/3:
            return 'Defensivo'
        elif x < 200/3:
            return 'Medio'
        else:
            return 'Ofensivo'
    
    recoveries['third'] = recoveries['x'].apply(get_third)
    counts = recoveries['third'].value_counts()
    total = len(recoveries)
    
    fig, ax = plt.subplots(figsize=(14, 10))
    draw_pitch(ax)
    
    # Líneas de tercios
    ax.plot([33.3, 33.3], [0, 100], color="white", linestyle="--", 
            alpha=0.7, linewidth=2, zorder=1)
    ax.plot([66.6, 66.6], [0, 100], color="white", linestyle="--", 
            alpha=0.7, linewidth=2, zorder=1)
    
    # KDE de recuperaciones
    if len(recoveries) > 5:
        try:
            sns.kdeplot(
                x=recoveries['x'],
                y=recoveries['y'],
                ax=ax,
                fill=True,
                cmap='Greens',
                alpha=0.4,
                levels=10,
                thresh=0.05,
                zorder=2
            )
        except:
            pass
    
    # Scatter de recuperaciones
    colors = {'Recup': 'blue', 'Intercep': 'darkgreen', 
              'Recuperación': 'blue', 'Interceptación': 'darkgreen'}
    for rec_type in recoveries['type'].unique():
        type_data = recoveries[recoveries['type'] == rec_type]
        ax.scatter(
            type_data['x'], 
            type_data['y'],
            c=colors.get(rec_type, 'green'),
            s=80,
            alpha=0.9,
            edgecolor='white',
            linewidth=1,
            label=rec_type,
            zorder=3
        )
    
    # Estadísticas por tercios
    ax.text(16.6, 104, f"Defensivo: {counts.get('Defensivo', 0)}", 
            ha='center', fontsize=13, fontweight='bold', 
            color='white', bbox=dict(boxstyle='round', facecolor='#2d5016', alpha=0.8))
    ax.text(50, 104, f"Medio: {counts.get('Medio', 0)}", 
            ha='center', fontsize=13, fontweight='bold', 
            color='white', bbox=dict(boxstyle='round', facecolor='#2d5016', alpha=0.8))
    ax.text(83.3, 104, f"Ofensivo: {counts.get('Ofensivo', 0)}", 
            ha='center', fontsize=13, fontweight='bold', 
            color='white', bbox=dict(boxstyle='round', facecolor='#2d5016', alpha=0.8))
    
    ax.set_title(f"Mapa de Recuperaciones - {home_team_name} (Total: {total})", 
                fontsize=18, fontweight='bold', pad=20)
    
    if len(recoveries['type'].unique()) > 1:
        ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.05), 
                 ncol=len(recoveries['type'].unique()), fontsize=11, 
                 frameon=True, fancybox=True)
    
    plt.tight_layout()
    pdf_pages.savefig(fig, dpi=100, bbox_inches='tight')
    plt.close(fig)

def generate_statistics_page(home_df, pdf_pages, home_team_name, config):
    """Genera página con estadísticas del partido"""
    fig = plt.figure(figsize=(11, 14))
    fig.suptitle(f'Estadísticas del Partido', 
                 fontsize=22, fontweight='bold', y=0.98)
    
    # Información del partido
    ax_info = plt.subplot2grid((10, 2), (0, 0), colspan=2, rowspan=1)
    ax_info.axis('off')
    
    match_info = f"{config.get('homeTeam', 'LOCAL')} vs {config.get('awayTeam', 'VISITANTE')}\n"
    match_info += f"Fecha: {config.get('date', datetime.now().strftime('%Y-%m-%d'))}"
    
    ax_info.text(0.5, 0.5, match_info, ha='center', va='center', 
                fontsize=16, fontweight='bold')
    
    # Estadísticas generales
    ax_stats = plt.subplot2grid((10, 2), (1, 0), colspan=2, rowspan=3)
    ax_stats.axis('off')
    
    stats_text = f"Estadísticas de {home_team_name}\n\n"
    stats_text += f"Total de acciones: {len(home_df)}\n"
    stats_text += f"Número de jugadores: {home_df['player'].nunique()}\n\n"
    
    # Acciones por tipo
    type_counts = home_df['type'].value_counts().head(10)
    stats_text += "Acciones más frecuentes:\n"
    for action_type, count in type_counts.items():
        stats_text += f"  • {action_type}: {count}\n"
    
    ax_stats.text(0.1, 0.9, stats_text, ha='left', va='top', 
                 fontsize=12, family='monospace')
    
    # Top 5 jugadores más activos
    ax_players = plt.subplot2grid((10, 2), (4, 0), colspan=1, rowspan=3)
    player_counts = home_df['player'].value_counts().head(5)
    
    colors_gradient = plt.cm.Reds(np.linspace(0.4, 0.9, len(player_counts)))
    bars = ax_players.barh(range(len(player_counts)), player_counts.values, color=colors_gradient)
    ax_players.set_yticks(range(len(player_counts)))
    ax_players.set_yticklabels(player_counts.index, fontsize=11)
    ax_players.set_xlabel('Número de Acciones', fontsize=11)
    ax_players.set_title('Top 5 Jugadores Más Activos', fontsize=13, fontweight='bold', pad=10)
    ax_players.grid(axis='x', alpha=0.3)
    
    # Agregar valores en las barras
    for i, (bar, value) in enumerate(zip(bars, player_counts.values)):
        ax_players.text(value + 1, i, str(value), va='center', fontsize=10, fontweight='bold')
    
    # Distribución de acciones por periodo
    ax_periods = plt.subplot2grid((10, 2), (4, 1), colspan=1, rowspan=3)
    if 'period' in home_df.columns:
        period_counts = home_df['period'].value_counts().sort_index()
        colors_periods = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6'][:len(period_counts)]
        ax_periods.bar(range(len(period_counts)), period_counts.values, color=colors_periods)
        ax_periods.set_xticks(range(len(period_counts)))
        ax_periods.set_xticklabels(period_counts.index, fontsize=11)
        ax_periods.set_ylabel('Número de Acciones', fontsize=11)
        ax_periods.set_title('Acciones por Periodo', fontsize=13, fontweight='bold', pad=10)
        ax_periods.grid(axis='y', alpha=0.3)
        
        # Agregar valores encima de las barras
        for i, value in enumerate(period_counts.values):
            ax_periods.text(i, value + 1, str(value), ha='center', fontsize=10, fontweight='bold')
    
    # Distribución espacial (zonas del campo)
    ax_zones = plt.subplot2grid((10, 2), (7, 0), colspan=2, rowspan=3)
    
    def get_zone(row):
        x, y = row['x'], row['y']
        if x < 33.3:
            zone_h = 'Defensivo'
        elif x < 66.6:
            zone_h = 'Medio'
        else:
            zone_h = 'Ofensivo'
        
        if y < 33.3:
            zone_v = 'Izquierda'
        elif y < 66.6:
            zone_v = 'Centro'
        else:
            zone_v = 'Derecha'
        
        return f"{zone_h} - {zone_v}"
    
    home_df_zones = home_df.copy()
    home_df_zones['zone'] = home_df_zones.apply(get_zone, axis=1)
    zone_counts = home_df_zones['zone'].value_counts()
    
    # Ordenar por zona
    zone_order = []
    for h in ['Defensivo', 'Medio', 'Ofensivo']:
        for v in ['Izquierda', 'Centro', 'Derecha']:
            zone_name = f"{h} - {v}"
            if zone_name in zone_counts.index:
                zone_order.append(zone_name)
    
    zone_counts = zone_counts.reindex(zone_order)
    
    colors_zones = plt.cm.viridis(np.linspace(0.2, 0.9, len(zone_counts)))
    bars_zones = ax_zones.barh(range(len(zone_counts)), zone_counts.values, color=colors_zones)
    ax_zones.set_yticks(range(len(zone_counts)))
    ax_zones.set_yticklabels(zone_counts.index, fontsize=9)
    ax_zones.set_xlabel('Número de Acciones', fontsize=11)
    ax_zones.set_title('Distribución por Zonas del Campo', fontsize=13, fontweight='bold', pad=10)
    ax_zones.grid(axis='x', alpha=0.3)
    
    # Valores en barras
    for i, (bar, value) in enumerate(zip(bars_zones, zone_counts.values)):
        ax_zones.text(value + 1, i, str(value), va='center', fontsize=9, fontweight='bold')
    
    plt.tight_layout(rect=[0, 0.03, 1, 0.97])
    pdf_pages.savefig(fig, dpi=100, bbox_inches='tight')
    plt.close(fig)

def generate_pdf_report(json_path, pdf_path):
    """Función principal que genera el informe PDF completo para ambos equipos"""
    try:
        # Cargar datos
        data = load_match_data(json_path)
        
        # Validar estructura
        if 'actions' not in data or not data['actions']:
            print("Error: No hay acciones en los datos")
            return False
        
        df = pd.DataFrame(data['actions'])
        
        # Obtener configuración
        config = data.get('config', {})
        home_team_name = config.get('homeTeam', 'LOCAL')
        away_team_name = config.get('awayTeam', 'VISITANTE')
        
        # Filtrar equipos
        home_df = df[df['team'] == 'HOME'].copy()
        away_df = df[df['team'] == 'AWAY'].copy()
        
        # Invertir eje Y (según requerimiento del usuario)
        if not home_df.empty:
            home_df['y'] = 100 - home_df['y']
        if not away_df.empty:
            away_df['y'] = 100 - away_df['y']
        
        # Crear PDF con ambos equipos
        with PdfPages(pdf_path) as pdf:
            # ========== EQUIPO LOCAL (HOME) ==========
            if not home_df.empty:
                print(f"Generando informe para {home_team_name}...")
                
                # Página 1: Estadísticas generales
                print("Generando página de estadísticas LOCAL...")
                generate_statistics_page(home_df, pdf, home_team_name, config)
                
                # Página 2: Mapa de calor del equipo
                print("Generando mapa de calor del equipo LOCAL...")
                generate_team_heatmap(home_df, pdf, home_team_name)
                
                # Página 3+: Mapas de calor individuales
                print("Generando mapas de calor individuales LOCAL...")
                generate_player_heatmaps(home_df, pdf, home_team_name)
                
                # Última página: Mapa de recuperaciones
                print("Generando mapa de recuperaciones LOCAL...")
                generate_recoveries_map(home_df, pdf, home_team_name)
            
            # ========== EQUIPO VISITANTE (AWAY) ==========
            if not away_df.empty:
                print(f"\nGenerando informe para {away_team_name}...")
                
                # Página 1: Estadísticas generales
                print("Generando página de estadísticas VISITANTE...")
                generate_statistics_page(away_df, pdf, away_team_name, config)
                
                # Página 2: Mapa de calor del equipo
                print("Generando mapa de calor del equipo VISITANTE...")
                generate_team_heatmap(away_df, pdf, away_team_name)
                
                # Página 3+: Mapas de calor individuales
                print("Generando mapas de calor individuales VISITANTE...")
                generate_player_heatmaps(away_df, pdf, away_team_name)
                
                # Última página: Mapa de recuperaciones
                print("Generando mapa de recuperaciones VISITANTE...")
                generate_recoveries_map(away_df, pdf, away_team_name)
            
            # Metadata del PDF
            d = pdf.infodict()
            d['Title'] = f'Informe Completo: {home_team_name} vs {away_team_name}'
            d['Author'] = 'Attack Metrics Suite'
            d['Subject'] = 'Análisis de Partido'
            d['Keywords'] = 'Fútbol, Análisis, Heatmap'
            d['CreationDate'] = datetime.now()
        
        print(f"\n[OK] Informe PDF generado exitosamente: {pdf_path}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error generando informe: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python generate-heatmap-report.py <json_path> <pdf_output_path>")
        sys.exit(1)
    
    json_path = sys.argv[1]
    pdf_path = sys.argv[2]
    
    success = generate_pdf_report(json_path, pdf_path)
    sys.exit(0 if success else 1)
