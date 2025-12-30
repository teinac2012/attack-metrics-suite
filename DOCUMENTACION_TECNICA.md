# 🔧 Documentación Técnica - Match Data Hub v18.4.1

## 📋 Arquitectura

```
SHOOTING31.html (Aplicación SPA Standalone)
├── HTML (Structure)
│   ├── Header (40px)
│   ├── Layout Principal (2 columnas)
│   │   ├── Vis-Col (65%, Visualización)
│   │   │   ├── Pitch Canvas
│   │   │   └── Goal Canvas
│   │   └── Data-Col (35%, Control)
│   │       ├── Scoreboard
│   │       ├── Charts
│   │       ├── Controls
│   │       └── Log Area
│   └── Modales (5 nuevos)
│
├── CSS (Estilos, ~95KB)
│   ├── CSS Variables (root)
│   ├── Componentes Base
│   ├── Layout Flex
│   └── Media Queries
│
└── JavaScript (Lógica, ~250KB)
    ├── Global State (matchData, seasonHistory, archiveHistory)
    ├── Canvas Functions (pitch, goal, charts)
    ├── Calculations (xG, xGOT)
    ├── Nuevas Funciones Análisis
    ├── Export Functions
    └── Event Listeners
```

---

## 🔌 Variables Globales Principales

```javascript
// Estado del partido
let matchData = {
    jornada: String,
    shots: [{
        id: Number,
        minute: Number,
        second: Number,
        timeFloat: Number,
        timeStr: String,
        team: 'Propio' | 'Rival',
        type: 'abierto' | 'falta' | 'corner' | 'penalti',
        result: 'Gol' | 'Parada' | 'Fuera' | 'Bloqueado' | 'Poste',
        player: String,
        dorsal: String,
        xg: Number,
        xgot: Number,
        startX: Number,
        startY: Number,
        endY: Number,
        endZ: Number,
        gkX: Number,
        gkY: Number
    }],
    stats: {
        Propio: { xg, xgot, goals, count },
        Rival: { xg, xgot, goals, count }
    }
}

// Historial de temporada
let seasonHistory = [{
    jor: String,
    gf: Number,    // Goles a favor
    xg_f: Number,  // xG a favor
    ga: Number,    // Goles en contra
    xg_a: Number   // xG en contra
}]

// Historial de partidos sueltos
let archiveHistory = [{
    id: Number,
    date: String,
    title: String,
    stats: Object,
    shots: Array
}]

// Datos del radar
let radarDatasets = [{
    name: String,
    minutes: Number,
    raw: { shots, xg, xgot },
    stats: { shots90, xg90, xgot90 },
    color: String
}]
```

---

## 📐 Constantes de Campo

```javascript
const LOGICAL_W = 80;      // Ancho lógico del campo
const LOGICAL_H = 37;      // Alto lógico del campo
const VIEW_START_X = 85;   // Inicio de zona visible (85m)
const DATA_X_END = 122;    // Final de zona de ataque (120m real)

// Portería
const GOAL_WIDTH = 7.32;   // Ancho del arco (metros)
const GOAL_HEIGHT = 2.44;  // Alto del arco (metros)
const PENALTY_SPOT = 11;   // Distancia punto penal (metros)

// Posición inicial del portero
let gkPosition = {
    x: 118,  // Posición X (cerca del arco)
    y: 40    // Posición Y (centro)
}
```

---

## 🧮 Algoritmo de Cálculo xG (v18.4)

### Paso 1: Distancia
```javascript
const distX = 120 - startX;
const distY = Math.abs(40 - startY);
const dist = Math.sqrt(distX*distX + distY*distY);
```

### Paso 2: xG Base por Distancia
```javascript
const distCurve = [
    {d: 0, v: 0.95},
    {d: 5, v: 0.50},
    {d: 11, v: 0.17},
    {d: 16.5, v: 0.09},
    {d: 20, v: 0.05},
    {d: 25, v: 0.03},
    {d: 35, v: 0.01}
];
// Interpolación lineal entre puntos
```

### Paso 3: Factor de Ángulo
```javascript
const angle = Math.atan(7.32 * distX / (distX² + distY² - 26.79));
let angleFactor = Math.min(angle * 3.0, 1.0);
if(dist < 5) angleFactor = Math.max(angleFactor, 0.7);
```

### Paso 4: Aplicar Modificadores
```javascript
let modifier = 1.0;
if (cuerpo === 'cabeza') modifier *= 0.60;
if (tipo === 'falta') modifier *= 0.85;
if (tipo === 'corner') modifier *= 0.80;
if (tipo === 'penalti') xg = 0.78; // Valor fijo

let xg = baseXG * angleFactor;
xg = xg * modifier;

// Portero descolocado (máximo)
if (portero === 'descolocado') xg = Math.max(xg, 0.85);
```

---

## 📊 Nuevas Funciones por Análisis

### 1. Buildup Analysis
```javascript
toggleBuiltup(show: Boolean)
drawBuiltup()
downloadExcelBuiltup()
```

**Datos Procesados**:
- Agrupa shots por `type`
- Calcula xG promedio por tipo
- Grafica barras con colores

**Almacenamiento**: En memoria (no persiste)

### 2. Pass Network
```javascript
togglePassNetwork(show: Boolean)
drawPassNetwork()
```

**Datos Procesados**:
- Filtra por equipo (selector)
- Visualiza posiciones de tiro
- Dibuja conexiones entre zonas (estáticas)

**Zonas Predefinidas**:
```javascript
const zones = [
    [40, 20],   // Defensa izquierda
    [70, 30],   // Media
    [100, 35],  // Ataque izquierda
    [110, 40]   // Frontal
]
```

### 3. Field Tilt
```javascript
toggleFieldTilt(show: Boolean)
drawFieldTilt()
```

**Cálculos**:
```javascript
const third1 = shots.filter(s => s.startX < 100).length;
const third2 = shots.filter(s => s.startX >= 100 && s.startX < 110).length;
const third3 = shots.filter(s => s.startX >= 110).length;

const tiltRatio = third3 / Math.max(third1, 1);
```

**Colores por Intensidad**:
- Ratio > 0.6: Rojo (#e74c3c)
- Ratio > 0.3: Naranja (#f39c12)
- Ratio ≤ 0.3: Verde (#2ecc71)

### 4. Effectiveness Zones
```javascript
toggleEffectiveness(show: Boolean)
drawEffectiveness()
```

**Zonas Definidas**:
```javascript
const zones = [
    { x: 95, y: 40, r: 15, label: "Área Peq", color: "#e74c3c" },
    { x: 105, y: 40, r: 20, label: "Penalti", color: "#f39c12" },
    { x: 110, y: 40, r: 25, label: "Frontal", color: "#2ecc71" }
];
```

**Algoritmo de Zona**:
```javascript
const dist = Math.sqrt((s.startX - zone.x)² + (s.startY - zone.y)²);
if(dist < zone.r) { count++; xg += s.xg; }
```

### 5. Tactical Footprint
```javascript
toggleTactical(show: Boolean)
drawTactical()
```

**Procesamiento**:
- Divide campo en zones de 10m
- Calcula intensidad: count/5 (máx)
- Aplica heatmap con composición `lighter`

---

## 💾 Persistencia de Datos

### LocalStorage Keys
```javascript
'matchHub_v18'           // Partido actual
'seasonHistory_v1'       // Historial jornadas
'archiveHistory_v1'      // Archivo partidos sueltos
'radarData_v1'          // Datos radar (si se añade)
```

### Funciones de Persistencia
```javascript
saveData()              // Guarda matchData en localStorage
loadData()              // Carga en startup
saveToSeasonHistory()   // Guarda jornada completada
saveLooseMatch()        // Guarda partido sin contexto
```

---

## 🎨 Canvas Rendering

### Escalado y Transformación
```javascript
function drawPitch(d) {
    const w = canvas.width;
    const h = canvas.height;
    let scaleX = w / LOGICAL_W;
    let scaleY = h / LOGICAL_H;
    let scale = Math.min(scaleX, scaleY); // Mantiene aspecto
    
    const toC = (dx, dy) => ({
        x: offX + (dy * scale),
        y: offY + ((DATA_X_END - dx) * scale)
    });
}
```

### Optimización de Rendimiento
- Redibujo solo en cambios (input events)
- Canvas reset en cada frame
- Transformación 2D eficiente
- Composición `lighter` solo donde necesario

---

## 📈 Exportación de Datos

### Función: downloadExcel()
```
Archivo: Data_YYYY-MM-DD.csv
Codificación: UTF-8 con BOM
Separador: Punto y coma (;)

Secciones:
1. DATOS DE TIROS (13 columnas)
   Minuto, Segundo, Jugador, Dorsal, Equipo, Tipo, 
   Resultado, xG, xGOT, Pos X, Pos Y, Dest Y, Dest Z

2. RESUMEN DE ESTADÍSTICAS (6 columnas)
   Equipo, Total Tiros, Goles, xG Total, xGOT Total, xG Promedio

3. ESTADÍSTICAS POR JUGADOR (8 columnas)
   Jugador, Dorsal, Equipo, Tiros, Goles, xG, xGOT, Efectividad%
```

### Función: downloadExcelBuiltup()
```
Archivo: Buildup_Analysis.csv

Datos por Tipo:
- Juego Abierto: xG total, tiros, xG/tiro
- Faltas: idem
- Córners: idem
- Pénaltis: idem
```

---

## 🔍 Algoritmo de Edición

### editShotPlayer(id)
```javascript
1. Busca shot por id
2. Prompt nombre jugador
3. Si acepta:
   - Prompt dorsal
   - Si acepta:
     - Actualiza matchData
     - saveData()
     - updateUI()
     - updateRadarPlayerSelect()
```

### deleteShot(id)
```javascript
1. Confirmación
2. Filter matchData.shots
3. recalc()
4. saveData()
5. updateUI()
6. updateRadarPlayerSelect()
```

---

## 📊 Funciones de Recalcular

### recalc()
```javascript
// Resetea stats
matchData.stats = {
    Propio: {xg:0, xgot:0, goals:0, count:0},
    Rival: {xg:0, xgot:0, goals:0, count:0}
};

// Itera shots y suma
shots.forEach(s => {
    stats[s.team].xg += s.xg;
    stats[s.team].xgot += s.xgot;
    stats[s.team].count++;
    if(s.result === 'Gol') stats[s.team].goals++;
});
```

---

## 🎯 Interpolación (Función Utilitaria)

```javascript
function interpolate(dist, points) {
    for (let i = 0; i < points.length - 1; i++) {
        let p1 = points[i];
        let p2 = points[i+1];
        if (dist >= p1.d && dist <= p2.d) {
            let t = (dist - p1.d) / (p2.d - p1.d);
            return p1.v + t * (p2.v - p1.v);
        }
    }
    return points[points.length-1].v;
}
```

Usada para xG por distancia (curva suave).

---

## 🖱️ Event Listeners Principales

```javascript
// Cancha
pitchCanvas.addEventListener('mousedown/touchstart', handlePitchClick)
pitchCanvas.addEventListener('resize', redrawPitch)

// Portería
goalCanvas.addEventListener('mousedown/touchstart', handleGoalInteract)

// Inputs
inputs.forEach(input => {
    input.addEventListener('input', (e) => {
        if(e.target.id === 'jornadaInput') saveData();
        else draw();
    });
});

window.addEventListener('resize', () => {
    draw();
    updateUI();
});
```

---

## 📱 Responsive Design (CSS Media Queries)

```css
@media (max-width: 900px) {
    .layout { flex-direction: column; overflow-y: auto; }
    .vis-col { height: 450px; flex: none; border-right: none; border-bottom: 1px solid; }
    .data-col { height: auto; flex: 1; overflow: hidden; }
    .radar-grid { grid-template-columns: 1fr; grid-template-rows: auto 400px; }
}
```

---

## 🔐 Consideraciones de Seguridad

### Datos Guardados Localmente
- localStorage no está encriptado
- Solo datos públicos (resultados de partidos)
- Considera implementar IndexedDB para apps críticas

### Validación de Inputs
- Número/String validation manual
- Rango de valores (minutos 0-130, xG 0-1)
- Prevención de inyecciones en CSV

### CORS y APIs
- Aplicación standalone (sin dependencias externas)
- Todos los datos en cliente

---

## 🚀 Optimizaciones Implementadas

1. **Canvas Rendering**: Redibujo selectivo
2. **Event Throttling**: No implementado (considerar)
3. **Memoria**: Límite de 1000+ shots en memoria
4. **localStorage**: Limite de 5-10MB
5. **Cálculos**: Interpolación eficiente

---

## 🔧 Mantenimiento y Debugging

### Herramientas Recomendadas
- DevTools Console (F12)
- localStorage debugger
- Canvas inspector

### Verificación de Datos
```javascript
// En consola
console.log(matchData);           // Ver estado actual
console.log(seasonHistory);       // Ver historial
localStorage.getItem('matchHub_v18');  // Ver datos guardados
```

---

## 📝 Logs y Diagnósticos

No hay logging implementado actualmente. Para debugging:

```javascript
// Añadir en funciones críticas
console.log('Shot added:', shot);
console.log('Canvas size:', cv.width, cv.height);
console.log('Stats recalc:', matchData.stats);
```

---

## 🔄 Versionado

**v18.4.0**: Versión original
**v18.4.1**: 
- 5 nuevos análisis
- Exportación mejorada
- Layout optimizado
- +331 líneas código
- 1090 líneas totales

---

## 📦 Dependencias

**Externas**: Ninguna
**Internas**: 
- HTML5 Canvas API
- localStorage API
- Fetch API (no usada actualmente)

---

## 🎓 Extensibilidad

### Cómo Añadir Nuevo Análisis

1. **Crear Modal HTML**
```html
<div class="modal-overlay" id="newAnalysisModal">
    <div class="modal-content">...</div>
</div>
```

2. **Funciones Toggle y Draw**
```javascript
function toggleNewAnalysis(show) {
    document.getElementById('newAnalysisModal').style.display = show ? 'flex' : 'none';
    if(show) setTimeout(() => drawNewAnalysis(), 100);
}

function drawNewAnalysis() {
    // Lógica aquí
}
```

3. **Botón en Header**
```html
<button onclick="toggleNewAnalysis(true)" class="btn-brand">Nuevo</button>
```

4. **Función de Exportación (opcional)**
```javascript
function downloadExcelNewAnalysis() {
    // Generar CSV
}
```

---

**Documentación técnica v18.4.1**
**Última actualización**: 30/12/2025

