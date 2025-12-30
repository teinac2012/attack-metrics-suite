# 📊 Guía de Uso - Match Data Hub v18.4

## 🎯 Introducción

Match Data Hub es una herramienta de análisis de métricas de fútbol diseñada para scouts, analistas y preparadores físicos. Permite registrar y analizar tiros, calcular xG/xGOT, y generar reportes detallados.

---

## 📱 Interfaz Principal

La pantalla se divide en 3 secciones:

### 1. Panel de Visualización (Izquierda - 65%)
- **Cancha**: Campo de fútbol interactivo
- **Portería**: Vista de arco (3D)
- **Métricas Activas**: xG, xGOT, zona actual

### 2. Panel de Control (Derecha - 35%)
- **Scoreboard**: Marcador en tiempo real
- **Gráficos**: xG vs Efectividad
- **Controles**: Entrada de datos
- **Registro**: Historial de tiros

---

## 🎮 Cómo Registrar un Tiro

### Paso 1: Datos del Evento
1. Ingresa el **Minuto** y **Segundo**
2. Escribe el **Nombre del Jugador**
3. Indica el **Dorsal (#)**

### Paso 2: Posición Inicial
1. **Haz click en la cancha** para marcar origen del tiro
2. El sistema mostrará **coordenadas automáticas**
3. Verás la distancia calculada en metros

### Paso 3: Contexto
1. Selecciona el **Tipo de Jugada**: Juego Abierto, Falta, Córner, Pénalti
2. Elige **Parte del Cuerpo**: Pie o Cabeza
3. Indica si el **Portero** estaba colocado o descolocado

### Paso 4: Destino (Portería)
1. **Haz click en la portería** para marcar el destino
2. El sistema calculará **xG y xGOT automáticamente**
3. Verifica el resultado mostrado

### Paso 5: Confirmar
1. Presiona **PROPIO** para equipo de casa
2. O presiona **RIVAL** para equipo visitante
3. El tiro aparecerá en el historial

---

## 📊 Nuevos Análisis Disponibles

### 🔗 xG Buildup & Chain
**Botón**: `🔗 Buildup`

Analiza el xG acumulado por tipo de jugada:
- **Juego Abierto**: Creación en movimiento
- **Faltas**: Tiros de falta (valor reducido)
- **Córners**: Jugadas de esquina
- **Pénaltis**: Tiros desde el punto

**Excel disponible**: Click en `📊 Excel` en el modal

---

### 🔀 Red de Pases
**Botón**: `🔀 Pases`

Visualiza los patrones de juego:
- Selector: Propio/Rival/Ambos
- Muestra conexiones entre zonas
- Densidad de tiros por área
- Identifica patrones ofensivos

---

### 📊 Field Tilt (Último Tercio)
**Botón**: `📊 Field`

Mide la presión ofensiva del equipo:
- **Tercio Defensivo**: Zona propia (0-40m aprox.)
- **Zona Media**: Centro del campo (40-70m)
- **Último Tercio**: Zona de ataque (70-120m)

**Métrica Clave**: **Tilt Ratio** = Tiros en ataque / Tiros en defensa
- Ratio alto = Mayor presión ofensiva
- Ratio bajo = Presión equilibrada

---

### 🎯 Zonas de Efectividad
**Botón**: `🎯 Efectividad`

Compara efectividad por área:
- **Área Pequeña**: Radio de 15m (mayor peligro)
- **Penalti**: Radio de 20m (zona de penalty)
- **Frontal**: Radio de 25m (zona ampliada)

Muestra xG por zona y patrones de juego.

---

### 🗺️ Huella Táctica
**Botón**: `🗺️ Táctica`

Mapa de calor de presión ofensiva:
- Intensidad de ataque por zona
- Líneas de presión visuales
- Patrón general de juego
- Identificar puntos fuertes y débiles

---

## 📈 Timeline de xG

**Botón**: `📈 Timeline`

Evolución acumulada de xG durante el partido:
- Eje X: Minutos del partido
- Eje Y: xG acumulado
- Área azul: xG equipo propio
- Área roja: xG equipo rival
- Puntos blancos: Goles marcados

---

## 🔥 Mapas de Calor

**Botón**: `🔥 Mapas`

Densidad de posiciones de tiro:
- Gradiente de temperatura
- Colores cálidos = mayor concentración
- Útil para identificar zonas favoritadas

---

## ⚡ Comparador Radar

**Botón**: `⚡ Radar`

Compara rendimiento de jugadores:
1. Selecciona jugadores de la lista
2. O añade manualmente con minutos jugados
3. Visualiza en radar los siguientes parámetros:
   - Tiros p90 (normalizados)
   - xG p90
   - xGOT p90

**Escalas ajustables**: Modifica max de tiros y xG según necesidad

---

## 📊 Análisis de Temporada

**Botón**: `📊 Análisis`

Histórico de rendimiento por jornada:

### Subir jornada
1. Ingresa número de jornada en campo "Jor"
2. Registra todos los tiros del partido
3. Presiona `Guardar` → `Guardar Jornada`

### Ver análisis
1. Abre modal Análisis
2. **Scatter Chart**: Relación xG favor vs contra
   - Verde = Victoria
   - Amarillo = Empate  
   - Rojo = Derrota

3. **Gráficos de Barras**: 
   - Ofensiva: Goles vs xG (azul vs naranja)
   - Defensiva: Goles concedidos vs xG rival

---

## 💾 Exportación de Datos

### Formato CSV Completo
**Botón**: `CSV`

Incluye 3 secciones:

#### 1️⃣ Datos de Tiros
```
Minuto;Seg;Jugador;Dorsal;Equipo;Tipo;Resultado;xG;xGOT;Pos X;Pos Y;Dest Y;Dest Z
```

#### 2️⃣ Resumen de Estadísticas
```
Equipo;Tiros;Goles;xG;xGOT;xG promedio
```

#### 3️⃣ Por Jugador
```
Jugador;Dorsal;Equipo;Tiros;Goles;xG;xGOT;Efectividad%
```

### Exportar Buildup
En modal `🔗 Buildup` → `📊 Excel`
Detalle por tipo de jugada

---

## 📂 Gestión de Partidos

### Guardar Jornada
- Para partidos de liga registrados
- Se guarda en historial de temporada
- Utiliza número de jornada como referencia

### Guardar Suelto
- Para amistosos o análisis sin contexto
- Permite nombrar personalizadamente
- Se archiva en base local

### Ver Archivo
- Visualiza todos los partidos guardados
- Recupera datos anteriores
- Elimina si es necesario

---

## ⌚ Cálculo de xG

El sistema utiliza un modelo calibrado (v18.4):

### Factores Considerados
1. **Distancia al portero**: Principal determinante
2. **Ángulo de disparo**: Tiros más centrados = mayor xG
3. **Parte del cuerpo**: Cabeza reduce ~40% vs pie
4. **Contexto**:
   - Penalti = 0.78 xG fijo
   - Falta = 85% del xG base
   - Córner = 80% del xG base
5. **Colocación portero**: Descolocado aumenta a 0.85 mín

### Zonas del Campo
- **Área pequeña** (< 7.5m): Máxima peligrosidad
- **Penalti** (7.5-13m): Alta peligrosidad
- **Frontal** (13-18m): Peligrosidad media
- **Semicírculo** (18-24m): Peligrosidad baja
- **Lejos** (> 24m): Muy baja peligrosidad

---

## 🎨 Características UI

### Editar Datos
- Cada tiro tiene botón **✎** para editar nombre del jugador
- Botón **×** para eliminar tiro

### Métricas en Vivo
Mientras configuras:
- xG se actualiza en tiempo real
- xGOT se recalcula
- Zona se indica automáticamente

### Colores de Resultado
- 🟢 Verde = Gol
- 🟡 Amarillo = Parada
- 🔴 Rojo = Fuera

---

## 💡 Consejos de Uso

1. **Precisión**: Registra detalles en directo si es posible
2. **Consistencia**: Mantén criterios iguales todo el partido
3. **Análisis**: Revisa cada modal para detectar patrones
4. **Backup**: Exporta CSV regularmente para seguridad
5. **Comparación**: Usa Radar para comparar con referentes

---

## 🐛 Solución de Problemas

### Datos no se guardan
- Verifica que localStorage esté habilitado en navegador
- Limpia caché si hay problemas

### Gráficos no se ven
- Recarga la página (F5)
- Abre modal después de cargar completamente

### Números incorrectos
- Verifica las coordenadas en cancha
- Comprueba posición del portero seleccionada

---

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

**Versión**: 18.4.1
**Última actualización**: 30/12/2025

---

**¡Que disfrutes analizando! 🎯**

