import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import base64
import io
import sys

def img_to_base64(fig):
    """Convierte una figura matplotlib a base64"""
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode()
    plt.close(fig)
    return img_base64

def draw_pitch():
    """Retorna axes con el campo dibujado"""
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Pitch outline
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], color="black", linewidth=2)
    
    # Center line
    ax.plot([50, 50], [0, 100], color="black", linewidth=1)
    
    # Penalty Areas
    ax.plot([0, 17, 17, 0], [21.1, 21.1, 78.9, 78.9], color="black", linewidth=1)
    ax.plot([100, 83, 83, 100], [21.1, 21.1, 78.9, 78.9], color="black", linewidth=1)
    
    # Goal Areas
    ax.plot([0, 5.8, 5.8, 0], [36.8, 36.8, 63.2, 63.2], color="black", linewidth=1)
    ax.plot([100, 94.2, 94.2, 100], [36.8, 36.8, 63.2, 63.2], color="black", linewidth=1)
    
    # Center Circle
    theta = np.linspace(0, 2*np.pi, 100)
    x_circle = 50 + 8.7 * np.cos(theta)
    y_circle = 50 + 13.4 * np.sin(theta)
    ax.plot(x_circle, y_circle, color="black", linewidth=1)
    
    ax.set_xlim(-5, 105)
    ax.set_ylim(-5, 105)
    ax.axis('off')
    
    return fig, ax

def generate_heatmaps(file_path, team='HOME'):
    """Genera los mapas de calor y retorna como base64"""
    
    # Cargar datos
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data['actions'])
    home_df = df[df['team'] == team].copy()
    
    # Invertir eje Y
    home_df['y'] = 100 - home_df['y']
    
    results = {
        'team_heatmap': None,
        'player_heatmaps': {},
        'player_stats': {}
    }
    
    # 1. Mapa de calor del equipo
    print("Generando mapa de calor del equipo...", file=sys.stderr)
    fig, ax = draw_pitch()
    
    try:
        sns.kdeplot(
            x=home_df['x'],
            y=home_df['y'],
            ax=ax,
            fill=True,
            cmap='Reds',
            alpha=0.6,
            levels=15,
            thresh=0.05
        )
        ax.set_title(f"Mapa de Calor - {team} (Eje Y Invertido)")
        results['team_heatmap'] = img_to_base64(fig)
    except Exception as e:
        print(f"Error en mapa de equipo: {e}", file=sys.stderr)
    
    # 2. Mapas de calor por jugador
    print("Generando mapas de calor por jugador...", file=sys.stderr)
    players_sorted = home_df['player'].value_counts().index.tolist()
    
    for player in players_sorted:
        player_data = home_df[home_df['player'] == player]
        
        fig, ax = draw_pitch()
        
        try:
            sns.kdeplot(
                x=player_data['x'],
                y=player_data['y'],
                ax=ax,
                fill=True,
                cmap='Reds',
                alpha=0.6,
                levels=10,
                thresh=0.05
            )
            ax.scatter(player_data['x'], player_data['y'], color='black', s=3, alpha=0.3)
            ax.set_title(f"{player} ({len(player_data)} actions)")
            
            results['player_heatmaps'][player] = img_to_base64(fig)
            results['player_stats'][player] = {
                'actions': len(player_data),
                'avg_x': float(player_data['x'].mean()),
                'avg_y': float(player_data['y'].mean()),
            }
        except Exception as e:
            print(f"Error en jugador {player}: {e}", file=sys.stderr)
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python script.py <json_file> [team]'}))
        sys.exit(1)
    
    json_file = sys.argv[1]
    team = sys.argv[2] if len(sys.argv) > 2 else 'HOME'
    
    try:
        results = generate_heatmaps(json_file, team)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
