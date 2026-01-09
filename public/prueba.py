mport json
import pandas as pd

file_path = 'AttackMetrics_RINCONADA_vs_ALCALA_20260109.json'
with open(file_path, 'r') as f:
    data = json.load(f)

# Inspect config to confirm team names
print("Config:", data.get('config'))

# Load actions into DataFrame
df = pd.DataFrame(data['actions'])
print(df.head())
print(df['team'].unique())
print(df.columns)
# Filter for HOME team
home_df = df[df['team'] == 'HOME']

# Check coordinate ranges
print("X range:", home_df['x'].min(), home_df['x'].max())
print("Y range:", home_df['y'].min(), home_df['y'].max())

# Player event counts
player_counts = home_df['player'].value_counts()
print("Player event counts:")
print(player_counts)

# Identify unique players
players = player_counts.index.tolist()
print(f"Number of players: {len(players)}")
print(home_df.groupby('period')['x'].mean())
print(home_df.groupby('period')['x'].std())
print(df['period'].unique())
print(home_df['type'].unique())

# Check where shots/goals are
shots = home_df[home_df['type'].isin(['Tiro', 'Gol', 'Remate', 'Shot', 'Goal'])]
if not shots.empty:
    print("Shot X coordinates:", shots['x'].describe())
else:
    print("No shots found")
    
# Check where defensive actions are (e.g. 'Intercep', 'Recuperación')
defensive = home_df[home_df['type'].isin(['Intercep', 'Recuperación', 'Entrada'])]
if not defensive.empty:
    print("Defensive X coordinates:", defensive['x'].describe())
else:
    print("No defensive actions found")
    shots = home_df[home_df['type'] == 'Disparo']
print("Shot X coordinates:", shots['x'].describe())

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# List of players sorted by event count
players_sorted = home_df['player'].value_counts().index.tolist()

# Setup grid
n_players = len(players_sorted)
cols = 4
rows = (n_players // cols) + (1 if n_players % cols > 0 else 0)

fig, axes = plt.subplots(rows, cols, figsize=(20, 5 * rows))
axes = axes.flatten()

def draw_pitch(ax):
    # Pitch outline
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], color="black", linewidth=1)
    
    # Center line
    ax.plot([50, 50], [0, 100], color="black", linewidth=1)
    
    # Penalty Areas
    # Left
    ax.plot([0, 17, 17, 0], [21.1, 21.1, 78.9, 78.9], color="black", linewidth=1)
    # Right
    ax.plot([100, 83, 83, 100], [21.1, 21.1, 78.9, 78.9], color="black", linewidth=1)
    
    # Goal Areas (6 yard box)
    # Left
    ax.plot([0, 5.8, 5.8, 0], [36.8, 36.8, 63.2, 63.2], color="black", linewidth=1)
    # Right
    ax.plot([100, 94.2, 94.2, 100], [36.8, 36.8, 63.2, 63.2], color="black", linewidth=1)
    
    # Center Circle
    theta = np.linspace(0, 2*np.pi, 100)
    # Radius ~9.15m -> ~8.7 in X (100/105) and ~13 in Y (100/68)? 
    # Let's just use a circle of radius 10 for simplicity in normalized coords if we assume approx square aspect ratio for drawing
    # But usually pitch is rectangular.
    # Let's strictly scale it.
    # 9.15m radius.
    # X scale: 100 units = 105m -> 1 unit = 1.05m -> r = 9.15/1.05 = 8.7
    # Y scale: 100 units = 68m -> 1 unit = 0.68m -> r = 9.15/0.68 = 13.4
    x_circle = 50 + 8.7 * np.cos(theta)
    y_circle = 50 + 13.4 * np.sin(theta)
    ax.plot(x_circle, y_circle, color="black", linewidth=1)
    
    ax.set_xlim(-5, 105)
    ax.set_ylim(-5, 105)
    ax.set_aspect('equal') # This might distort normalized coords visually if we want 105x68 aspect.
    # If coords are 0-100, setting aspect 'equal' makes it a square.
    # Real pitch is 105x68. So Y should be compressed relative to X?
    # No, if data is normalized 0-100, plotting it on a square 0-100 axes makes the pitch look square.
    # To look like a pitch, we should set the aspect ratio.
    # If X is 0-100 representing 105m, and Y is 0-100 representing 68m.
    # Then 1 unit in X = 1.05m, 1 unit in Y = 0.68m.
    # To display "correctly", we want 105 visual units width and 68 visual units height.
    # But the axis range is 0-100.
    # So we shouldn't use aspect='equal'.
    # We can just leave it to fill the subplot, or manually set aspect.
    # Let's leave it mostly square-ish but usually 1.5:1 is better.
    # Actually, seaborn kdeplot will fill the axes.
    # Let's not force aspect='equal' but set the axis limits to 0-100 and let the figure size handle the aspect.
    # Subplots are likely rectangular.
    
    ax.axis('off')

# Loop
for i, player in enumerate(players_sorted):
    ax = axes[i]
    player_data = home_df[home_df['player'] == player]
    
    # Draw pitch
    draw_pitch(ax)
    
    # Plot KDE
    # Invert Y if necessary? Usually (0,0) is bottom-left. Football data often (0,0) top-left or bottom-left.
    # Let's assume standard cartesian.
    try:
        sns.kdeplot(
            x=player_data['x'],
            y=player_data['y'],
            ax=ax,
            shade=True,
            cmap='Reds',
            alpha=0.6,
            n_levels=10,
            thresh=0.05
        )
        # Scatter for individual points to see sparsity
        ax.scatter(player_data['x'], player_data['y'], color='black', s=5, alpha=0.5)
    except Exception as e:
        ax.text(50, 50, "Insufficient Data", ha='center')
    
    ax.set_title(f"{player} ({len(player_data)} actions)")

# Hide unused axes
for j in range(i + 1, len(axes)):
    axes[j].axis('off')

plt.tight_layout()
plt.savefig('heatmap_jugadores_rinconada.png', dpi=300, bbox_inches='tight')
print("Plot saved")

fig, ax = plt.subplots(figsize=(10, 7))

# Draw pitch
draw_pitch(ax)

# Plot Team KDE
sns.kdeplot(
    x=home_df['x'],
    y=home_df['y'],
    ax=ax,
    shade=True,
    cmap='Reds',
    alpha=0.6,
    n_levels=15,
    thresh=0.05
)

# Optional: Scatter
# ax.scatter(home_df['x'], home_df['y'], color='black', s=1, alpha=0.3)

ax.set_title("Mapa de Calor - Equipo Rinconada")
plt.savefig('heatmap_equipo_rinconada.png', dpi=300, bbox_inches='tight')
print("Team plot saved")

import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Load data
file_path = 'AttackMetrics_RINCONADA_vs_ALCALA_20260109.json'
with open(file_path, 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data['actions'])
home_df = df[df['team'] == 'HOME'].copy()

# User feedback: "Inverted axis for players on the wing... Segura and Bellido were on the left".
# This implies the current Y coordinate needs to be flipped (100 - y).
# Let's verify where they were before flipping (just for log purposes)
print("Before flip:")
print("Bellido mean Y:", home_df[home_df['player'] == 'BELLIDO']['y'].mean())
print("Segura mean Y:", home_df[home_df['player'] == 'SEGURA']['y'].mean())

# Apply Flip
home_df['y'] = 100 - home_df['y']

print("After flip:")
print("Bellido mean Y:", home_df[home_df['player'] == 'BELLIDO']['y'].mean())
print("Segura mean Y:", home_df[home_df['player'] == 'SEGURA']['y'].mean())

# List of players sorted by event count
players_sorted = home_df['player'].value_counts().index.tolist()

# Setup grid for individual players
n_players = len(players_sorted)
cols = 4
rows = (n_players // cols) + (1 if n_players % cols > 0 else 0)

fig, axes = plt.subplots(rows, cols, figsize=(20, 5 * rows))
axes = axes.flatten()

def draw_pitch(ax):
    # Pitch outline
    ax.plot([0, 0, 100, 100, 0], [0, 100, 100, 0, 0], color="black", linewidth=1)
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

# Plot individual players
for i, player in enumerate(players_sorted):
    ax = axes[i]
    player_data = home_df[home_df['player'] == player]
    
    draw_pitch(ax)
    
    if not player_data.empty:
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
            # Add scatter for detail
            # ax.scatter(player_data['x'], player_data['y'], color='black', s=5, alpha=0.3)
        except:
            ax.text(50, 50, "Insufficient Data", ha='center')
    
    ax.set_title(f"{player} ({len(player_data)} actions)")

# Hide unused axes
for j in range(i + 1, len(axes)):
    axes[j].axis('off')

plt.tight_layout()
plt.savefig('heatmap_jugadores_rinconada_flipped.png', dpi=300, bbox_inches='tight')

# Plot Team Heatmap
fig_team, ax_team = plt.subplots(figsize=(10, 7))
draw_pitch(ax_team)
sns.kdeplot(
    x=home_df['x'],
    y=home_df['y'],
    ax=ax_team,
    fill=True,
    cmap='Reds',
    alpha=0.6,
    levels=15,
    thresh=0.05
)
ax_team.set_title("Mapa de Calor - Equipo Rinconada (Eje Y Invertido)")
plt.savefig('heatmap_equipo_rinconada_flipped.png', dpi=300, bbox_inches='tight')

print("Flipped plots saved")