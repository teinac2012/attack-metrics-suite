# 🎯 Referencia Rápida - Match Data Hub v18.4.1

## 📋 Todos los Botones

### Barra de Herramientas (Header)

| Botón | Función | Atajo |
|-------|---------|-------|
| 📈 Timeline | Evolución xG en el tiempo | Ver análisis temporal |
| 🔥 Mapas | Mapas de calor de posiciones | Visualizar densidad |
| ⚡ Radar | Comparador de jugadores p90 | Análisis comparativo |
| 🔗 Buildup | xG por tipo de jugada | Análisis de construcción |
| 🔀 Pases | Red de pases del equipo | Patrones de juego |
| 📊 Field | Field Tilt (presión ofensiva) | Análisis del tercio |
| 🎯 Efectividad | Zonas de efectividad | Análisis por área |
| 🗺️ Táctica | Huella táctica del partido | Mapa de presión |
| 📊 Análisis | Análisis de temporada | Historial de jornadas |
| Guardar | Guardar jornada en historial | Registrar partido |
| Suelto | Guardar partido sin contexto | Amistosos/análisis |
| 📂 Archivo | Ver partidos guardados | Recuperar datos |
| CSV | Exportar todos los datos | Descargar reporte |

---

## 🎮 Registro de Tiro - Flujo Rápido

```
1. Minuto + Segundo
   ↓
2. Click en CANCHA (origen)
   ↓
3. Nombre + Dorsal
   ↓
4. Tipo: Abierto/Falta/Córner/Pénalti
   ↓
5. Cuerpo: Pie/Cabeza
   ↓
6. Portero: Colocado/Descolocado
   ↓
7. Click en PORTERÍA (destino)
   ↓
8. PROPIO o RIVAL
```

---

## 📊 Análisis Disponibles

### Por Tipo
| Análisis | Datos | Formato | Descarga |
|----------|-------|---------|----------|
| **Buildup** | xG por tipo jugada | Gráfico + Tabla | ✓ Excel |
| **Pases** | Densidad y conexiones | Mapa visual | ✓ Imagen |
| **Field Tilt** | Distribución de presión | Gráfico de tercios | ✓ Imagen |
| **Efectividad** | xG por zona | 3 zonas del campo | ✓ Imagen |
| **Táctica** | Mapa de calor | Heatmap dinámico | ✓ Imagen |

### Por Duración
| Análisis | Datos | Temporalidad |
|----------|-------|--------------|
| **Timeline** | xG acumulado | En partido |
| **Mapas Calor** | Posiciones | En partido |
| **Radar** | p90 normalizado | Acumulado |
| **Temporada** | xG vs Goles | Por jornada |

---

## 💾 Exportación de Datos

### CSV Principal
```
Secciones:
1. Datos de tiros (detallado)
2. Resumen de estadísticas
3. Estadísticas por jugador
```

### Excel Buildup
```
Análisis por tipo de jugada:
- Juego Abierto
- Faltas
- Córners
- Pénaltis
```

---

## 🎨 Interpretación de Colores

### Equipos
- 🔵 **Azul** = Equipo Propio
- 🔴 **Rojo** = Equipo Rival

### Resultados de Tiro
- 🟢 **Verde** = Gol
- 🟡 **Amarillo** = Parada
- 🔴 **Rojo** = Fuera
- ⚫ **Negro** = Bloqueado/Poste

### Zonas de Peligro
- 🔴 **Rojo** = Área pequeña (peligro máximo)
- 🟠 **Naranja** = Penalty (peligro alto)
- 🟢 **Verde** = Frontal (peligro medio)

### Intensidad de Calor
- Rojo oscuro = Máxima concentración
- Naranja = Alta concentración
- Amarillo = Concentración media
- Verde = Baja concentración

---

## 📐 Métricas Clave

### xG (Expected Goals)
- Probabilidad de que un tiro termine en gol
- Rango: 0.00 - 1.00
- Influenciado por: distancia, ángulo, contexto

### xGOT (Expected Goals on Target)
- xG de tiros dentro del arco
- Similar a xG pero solo tiros "a portería"
- Rango: 0.00 - 1.00

### Tilt Ratio
- Fórmula: Tiros en ataque / Tiros en defensa
- Mayor que 1.0 = Equipo atacante
- Menor que 1.0 = Equipo conservador

### Efectividad
- Fórmula: Goles / Tiros × 100%
- Complemento a xG para evaluación real

---

## 🔢 Coordenadas del Campo

### Eje X (Longitud)
- 0-40m: Tercio defensivo
- 40-70m: Zona media
- 70-120m: Tercio ofensivo (último tercio)

### Eje Y (Amplitud)
- 0-20m: Lado izquierdo
- 20-40m: Centro
- 40-80m: Lado derecho

### Portería
- Centro: Y=40 (centro de línea)
- Altura máxima: Z=2.44 (travesaño)
- Área grande: Y=36 a Y=44

---

## ⌨️ Atajos Útiles

| Acción | Atajo |
|--------|-------|
| Guardar dato | Enter (en inputs) |
| Click cancha | Click izquierdo |
| Click portería | Click izquierdo |
| Cerrar modal | Botón Cerrar o Esc |
| Limpiar datos | Botón Reset (si existe) |
| Descargar imagen | 📷 en modal |

---

## 🔧 Configuración por Modal

### Buildup
- Automático: Agrupa por tipo jugada
- Excel: Click en 📊 Excel

### Pases
- Selector: Propio/Rival/Ambos
- Automático: Dibuja red

### Field Tilt
- Selector: Propio/Rival
- Muestra: Tercio defensivo/media/ataque
- Calcula: Tilt ratio automático

### Efectividad
- Selector: Propio/Rival
- Zoom: 3 zonas definidas
- Muestra: xG por zona

### Táctica
- Sin selector: Ambos equipos
- Modo: Mapa de calor
- Intensidad: Proporcional a tiros

### Temporada
- Requiere: Jornada registrada
- Historial: Todos los datos guardados
- Limpieza: Botón 🗑️ Borrar

---

## 💡 Mejores Prácticas

✅ **HACER**
- Registrar detalles precisos
- Usar standares consistentes
- Exportar después de cada partido
- Revisar todos los análisis disponibles
- Documentar decisiones de xG

❌ **NO HACER**
- Registrar tiros duplicados
- Cambiar criterios a mitad del partido
- Cerrar sin guardar (datos en localStorage)
- Confiar solo en xG para evaluación
- Ignorar contexto del partido

---

## 🚀 Flujo de Trabajo Recomendado

```
INICIO PARTIDO
    ↓
Configurar número jornada
    ↓
DURANTE PARTIDO
    ↓
Para cada tiro:
  - Registrar datos
  - Marcar posición
  - Confirmar resultado
    ↓
FIN PRIMER TIEMPO
    ↓
Revisar: Timeline, Mapas, Radar
    ↓
FIN PARTIDO
    ↓
Guardar jornada
    ↓
Analizar: Buildup, Field Tilt, Táctica
    ↓
Exportar CSV
    ↓
Revisar: Temporada, Evolución
```

---

## 📞 Referencia de Cálculos

### Distancia
- Se calcula automáticamente en metros
- D = √[(X_portero - X_tiro)² + (Y_portero - Y_tiro)²]

### xG Penalti
- Fijo: 0.78 xG
- No varía por ángulo o distancia

### xG Cabeza
- Multiplica por 0.60
- Ejemplo: 0.10 × 0.60 = 0.06

### xG Falta
- Multiplica por 0.85
- Ejemplo: 0.15 × 0.85 = 0.1275

### xG Córner
- Multiplica por 0.80
- Ejemplo: 0.12 × 0.80 = 0.096

---

## 📈 Interpretación Rápida

| Estadística | Valor Bajo | Valor Medio | Valor Alto |
|------------|-----------|-----------|-----------|
| **xG Promedio** | < 0.08 | 0.08-0.15 | > 0.15 |
| **Efectividad** | < 10% | 10-25% | > 25% |
| **Tilt Ratio** | < 1.0 | 1.0-1.5 | > 1.5 |
| **Tiros p90** | < 3 | 3-6 | > 6 |
| **Diferencial xG** | Negativo | Cercano a 0 | Positivo |

---

**Versión**: 18.4.1  
**Última actualización**: 30/12/2025

