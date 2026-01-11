# Generación de Informes PDF en AttackMetrics

## Descripción
Esta funcionalidad permite generar informes PDF completos con mapas de calor y estadísticas del partido desde AttackMetrics.

## Archivos Implementados

### 1. Frontend - AttackMetrics.html
**Ubicación:** `public/AttackMetrics.html`

**Cambios realizados:**
- ✅ Botón "📄 PDF" añadido en el header junto a los botones de descarga
- ✅ Función `generatePDFReport()` que:
  - Valida que haya datos
  - Prepara el JSON con configuración y acciones
  - Envía POST a `/api/reports/generate-pdf`
  - Descarga automáticamente el PDF generado
  - Muestra notificaciones (toast) al usuario

### 2. Backend - API Endpoint
**Ubicación:** `app/api/reports/generate-pdf/route.ts`

**Funcionalidad:**
- ✅ Recibe JSON con datos del partido
- ✅ Valida la estructura de datos
- ✅ Crea archivo temporal con el JSON
- ✅ Ejecuta el script Python `generate-heatmap-report.py`
- ✅ Detecta automáticamente el entorno virtual Python (.venv)
- ✅ Devuelve el PDF generado al cliente
- ✅ Limpia archivos temporales automáticamente

### 3. Script Python - Generador de Heatmaps
**Ubicación:** `scripts/generate-heatmap-report.py`

**Características:**
- ✅ Carga y procesa datos del JSON
- ✅ Invierte el eje Y (según requerimiento)
- ✅ Genera múltiples páginas en un solo PDF:

  **Página 1 - Estadísticas Generales:**
  - Información del partido (equipos, fecha)
  - Total de acciones y jugadores
  - Acciones más frecuentes
  - Top 5 jugadores más activos (gráfico de barras)
  - Distribución por periodos (gráfico de barras)
  - Distribución espacial por zonas del campo

  **Página 2 - Mapa de Calor del Equipo:**
  - Heatmap completo con todas las acciones del equipo
  - KDE (Kernel Density Estimation) para suavizado
  - Campo de fútbol profesional con líneas reglamentarias

  **Páginas 3+ - Mapas de Calor Individuales:**
  - Grid de 4 columnas con todos los jugadores
  - Cada jugador tiene su propio heatmap
  - Muestra número de acciones por jugador

  **Última Página - Mapa de Recuperaciones:**
  - Heatmap específico de recuperaciones e intercepciones
  - División por tercios (Defensivo, Medio, Ofensivo)
  - Contador de recuperaciones por tercio
  - Leyenda con tipos de recuperación

## Uso

### Para el Usuario Final
1. Abre AttackMetrics y registra acciones del partido normalmente
2. Cuando quieras generar el informe, haz clic en el botón **"📄 PDF"** en el header
3. Espera a que se genere el informe (aparecerá un toast "🔄 Generando informe PDF...")
4. El PDF se descargará automáticamente con el nombre:
   ```
   Informe_NOMBRELOCAL_vs_NOMBREVISITANTE_FECHA.pdf
   ```

### Requisitos Técnicos
- Python 3.x con entorno virtual activado
- Dependencias instaladas:
  ```bash
  pip install pandas matplotlib seaborn numpy
  ```
- Entorno virtual en `.venv` (detección automática)

## Formato de Datos

El frontend envía un JSON con esta estructura:
```json
{
  "config": {
    "homeTeam": "RINCONADA",
    "awayTeam": "ALCALA",
    "date": "2026-01-09"
  },
  "actions": [
    {
      "id": 1,
      "min": "00:15",
      "period": "1T",
      "team": "HOME",
      "player": "PEREZ",
      "type": "Pase",
      "res": "Completado",
      "x": 45.5,
      "y": 32.1,
      "endX": 55.2,
      "endY": 38.4,
      "xg": 0,
      "xt": 0.02
    }
    // ... más acciones
  ]
}
```

## Características Técnicas

### Campo de Fútbol Profesional
El script dibuja un campo con:
- Dimensiones normalizadas 0-100 (x) por 0-100 (y)
- Áreas grandes y pequeñas reglamentarias
- Círculo central con punto
- Puntos de penalti
- Arcos de área de penalti
- Color verde césped profesional (#2d5016)

### Inversión del Eje Y
Según el requerimiento, el eje Y se invierte con la fórmula:
```python
home_df['y'] = 100 - home_df['y']
```

Esto asegura que:
- Los extremos izquierdos (ej: Bellido, Segura) aparezcan correctamente a la izquierda
- La orientación del campo sea consistente con la vista del usuario

### Heatmaps (KDE)
- Usa `seaborn.kdeplot` con suavizado gaussiano
- 10-15 niveles de contorno para detalle
- Threshold de 0.05 para eliminar ruido
- Fallback a scatter plot si hay pocos datos

### Recuperaciones por Tercios
División del campo:
- **Defensivo:** x < 33.3
- **Medio:** 33.3 ≤ x < 66.6
- **Ofensivo:** x ≥ 66.6

Tipos reconocidos: `Recup`, `Intercep`, `Recuperación`, `Interceptación`

## Troubleshooting

### Error: "No hay datos para generar informe"
- Verifica que hay acciones registradas en AttackMetrics
- Comprueba que al menos algunas pertenecen al equipo HOME

### Error: "Error al generar el informe PDF"
- Revisa que Python esté instalado y accesible
- Verifica que las dependencias estén instaladas:
  ```bash
  cd attack-metrics-suite
  .venv\Scripts\activate  # Windows
  pip install -r requirements.txt
  ```

### Error: "Python stderr: ModuleNotFoundError"
- Instala la dependencia faltante:
  ```bash
  pip install pandas matplotlib seaborn numpy
  ```

### El PDF está vacío o incompleto
- Revisa los logs del servidor (consola donde corre npm run dev)
- Verifica que el JSON tenga el formato correcto
- Comprueba que hay suficientes acciones del equipo HOME

## Mejoras Futuras Posibles

1. **Informes para ambos equipos:** Generar páginas para LOCAL y VISITANTE
2. **Personalización:** Permitir elegir qué páginas incluir
3. **Comparativa:** Gráficos de comparación entre equipos
4. **Análisis temporal:** Evolución de estadísticas por periodos
5. **xG detallado:** Mapa de tiros con valores xG
6. **Pases progresivos:** Visualización de líneas de pase
7. **Marcas de agua:** Logo del equipo o analista

## Autor
Implementado para Attack Metrics Suite v3.1

## Licencia
Parte del proyecto Attack Metrics Suite
