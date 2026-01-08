# Cambios Implementados - Correcciones AttackMetrics

## Resumen General
Se han implementado correcciones para los tres problemas reportados en AttackMetrics.html:
1. ✅ **Descargas de archivos** - Implementación de descargas a través de API
2. ✅ **Persistencia entre apps** - Sincronización de datos entre diferentes aplicaciones
3. ✅ **Conflictos de datos Voronoi** - Separación de bases de datos por equipo

---

## 1. DESCARGAS VÍA API (`/api/apps/download`)

### Funciones agregadas:
- **`downloadFileViaAPI(blob, filename, onSuccess)`** (línea ~1200)
  - Convierte blob a base64
  - Envía POST a `/api/apps/download`
  - Incluye fallback a descarga directa si API falla
  - Callback de éxito opcional

- **`fallbackDownload(blob, filename)`** (línea ~1220)
  - Descarga directa usando createElement + click
  - Se ejecuta si la API no está disponible

### Funciones modificadas:
- **`downloadBackup()`** 
  - Cambio: `XLSX.writeFile()` → `downloadFileViaAPI()`
  - Ahora incluye estado completo en export
  
- **`downloadExcel()`**
  - Cambio: `XLSX.writeFile()` → `downloadFileViaAPI()`
  - Genera 4 hojas: Resumen, Logs, Jugadores, Metricas_Liverpool
  - Convierte a blob antes de enviar a API

### Flujo:
```
Blob generado → Base64 → API POST → Servidor → Stream response → Descarga cliente
```

**Resultado**: Los archivos ahora se descargan de verdad al PC del usuario.

---

## 2. PERSISTENCIA ENTRE APPS

### Cambios en `sync-data.js`:
Se agregaron 4 nuevos métodos para AttackMetrics:

1. **`saveAttackMetricsDB(dbObject)`**
   - Guarda objeto DB completo en localStorage
   - Clave: `am_sync_latest`
   - Incluye timestamp de actualización

2. **`loadAttackMetricsDB()`**
   - Carga DB guardada desde localStorage
   - Retorna objeto o null si no existe

3. **`clearAttackMetricsDB()`**
   - Elimina datos sincronizados de AttackMetrics

4. **`getLastAnalysisInfo()`**
   - Retorna metadata: nombres de equipos, cantidad acciones, posesión

### Cambios en `AttackMetrics.html`:
- **`saveDB()`** (línea ~1180)
  - Ahora llama a `window.AnalysisDataSync.saveAttackMetricsDB(DB)`
  - Guarda en `am_sync_latest` además de `am_v22_6` local
  - Wrapped en try-catch para compatibilidad

### Flujo:
```
saveDB() → localStorage `am_v22_6` + `am_sync_latest` → Storage events → Otras apps cargan
```

**Resultado**: Al cambiar de app, los datos se cargan automáticamente desde `am_sync_latest`.

---

## 3. REFACTORIZACIÓN DE VORONOI - SEPARACIÓN POR EQUIPO

### Estructura anterior (problemática):
```javascript
voronoiState = {
    points: [],  // Mezclaba puntos rojos y azules
    ...
}
```

### Nueva estructura:
```javascript
voronoiState = {
    points_HOME: [],   // Puntos azules (equipo local)
    points_AWAY: [],   // Puntos rojos (equipo visitante)
    ball: null,        // Posición del balón (separado)
    dragTarget: null,
    currentMode: null
}
```

### Compatibilidad:
- Getter `voronoiState.points` combina dinámicamente `points_HOME + points_AWAY`
- Código antiguo que lee `voronoiState.points` continúa funcionando
- Setter rechaza asignaciones directas (imprime warning)

### Funciones actualizadas:

1. **`drawVoronoiDiagram()`**
   - Separa puntos por equipo al cargar acciones
   - Usa `voronoiState.points` (getter) para dibujar

2. **`voronoiClearAll()`**
   - Limpia `points_HOME` y `points_AWAY`

3. **`voronoiAnalyze()`**
   - Usa getter que combina ambas arrays
   - Análisis de Voronoi trabaja con todos los puntos

4. **`voronoiInputStart()`**
   - Agrega puntos a `points_HOME` o `points_AWAY` según modo
   - Detección correcta de equipos al arrastrar

5. **`voronoiInputMove()`**
   - Arrastra jugadores de su array respectiva
   - Rastreo de equipo mediante `dragTarget.team`

6. **`voronoiInputDblClick()`**
   - Elimina puntos desde su array correcta
   - Maneja índices por equipo

7. **`restoreBackup()`** (al cargar archivos)
   - Limpia `points_HOME` y `points_AWAY`
   - Evita conflictos con datos anteriores

**Resultado**: 
- Voronoi no se rompe al cargar archivos
- Puntos rojos no se mezclan con azules
- Cada equipo tiene su base de datos separada

---

## Archivos Modificados

1. **public/AttackMetrics.html**
   - Agregadas funciones: `downloadFileViaAPI()`, `fallbackDownload()`
   - Modificadas: `saveDB()`, `downloadBackup()`, `downloadExcel()`, `restoreBackup()`
   - Refactorizado: `voronoiState` + todas las funciones Voronoi

2. **public/sync-data.js**
   - Agregados 4 nuevos métodos de sincronización para AttackMetrics

3. **app/api/apps/download/route.ts**
   - Endpoint existente - recibe base64 y retorna blob al cliente

---

## Testing Recomendado

1. **Descargas**:
   - [ ] Hacer backup JSON
   - [ ] Descargar Excel
   - [ ] Verificar que los archivos están en Downloads

2. **Persistencia**:
   - [ ] Crear análisis en AttackMetrics
   - [ ] Cambiar a otra app
   - [ ] Volver a AttackMetrics
   - [ ] Verificar que los datos se mantienen

3. **Voronoi**:
   - [ ] Agregar puntos rojos (AWAY)
   - [ ] Agregar puntos azules (HOME)
   - [ ] Cargar archivo anterior
   - [ ] Verificar que no se mezclan datos

---

## Notas Técnicas

### localStorage keys:
- `am_v22_6` - Storage local de AttackMetrics
- `am_sync_latest` - Storage compartido entre apps

### API Endpoint:
- POST `/api/apps/download`
- Espera: `{ data: string (base64), filename: string, mimeType: string }`
- Retorna: blob al navegador

### Backward Compatibility:
- El getter de `voronoiState.points` mantiene compatibilidad con código antiguo
- Las nuevas funciones pueden leer `points_HOME/points_AWAY` directamente
- La lógica de sincronización no afecta las funciones existentes que no la usan
