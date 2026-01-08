/**
 * API Sync Manager - Sincroniza datos con la base de datos
 * 
 * Funcionalidad:
 * - Detecta si hay usuario logueado (NextAuth)
 * - Guarda en localStorage (local)
 * - Sincroniza con API /api/analyses (cloud)
 * - Carga datos desde API al iniciar
 * - Maneja conflictos (local vs cloud)
 */

window.APISyncManager = {
  _syncInterval: null,
  _lastSync: 0,
  _syncDelay: 10000, // Sincronizar cada 10 segundos
  _currentAnalysisId: null,
  _isSyncing: false,

  /**
   * Inicializar sistema de sincronización
   */
  init: async function(appName = 'AttackMetrics') {
    console.log(`[APISyncManager] Inicializando para ${appName}...`);
    this.appName = appName;

    // Verificar si hay sesión
    const hasSession = await this.checkSession();
    
    if (hasSession) {
      console.log('[APISyncManager] Usuario logueado - sincronización habilitada');
      
      // Cargar datos desde la nube
      await this.loadFromCloud();
      
      // Sincronizar cada 10 segundos
      this._syncInterval = setInterval(() => {
        this.syncToCloud();
      }, this._syncDelay);

      // Guardar al salir
      window.addEventListener('beforeunload', () => {
        this.syncToCloud(true);
      });
    } else {
      console.log('[APISyncManager] Sin sesión - solo modo local');
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  checkSession: async function() {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      return !!session?.user;
    } catch (error) {
      console.error('[APISyncManager] Error verificando sesión:', error);
      return false;
    }
  },

  /**
   * Cargar datos desde la nube
   */
  loadFromCloud: async function() {
    try {
      const response = await fetch(`/api/analyses?appName=${this.appName}&limit=1`);
      
      if (!response.ok) {
        console.log('[APISyncManager] No hay datos en la nube o error al cargar');
        return null;
      }

      const { analyses } = await response.json();
      
      if (analyses && analyses.length > 0) {
        const latest = analyses[0];
        this._currentAnalysisId = latest.id;
        
        const cloudData = JSON.parse(latest.data);
        const localData = this.getLocalData();

        // Comparar timestamps
        const cloudTime = new Date(latest.updatedAt).getTime();
        const localTime = localData?._lastModified || 0;

        if (cloudTime > localTime) {
          console.log('[APISyncManager] Datos cloud más recientes - cargando...');
          return cloudData;
        } else {
          console.log('[APISyncManager] Datos locales más recientes - manteniendo');
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('[APISyncManager] Error cargando desde cloud:', error);
      return null;
    }
  },

  /**
   * Sincronizar datos con la nube
   */
  syncToCloud: async function(force = false) {
    // Evitar sincronización simultánea
    if (this._isSyncing && !force) return;

    // Verificar si han pasado suficientes segundos
    const now = Date.now();
    if (!force && (now - this._lastSync < this._syncDelay)) return;

    this._isSyncing = true;

    try {
      const data = this.getLocalData();
      
      if (!data) {
        this._isSyncing = false;
        return;
      }

      // Agregar timestamp
      data._lastModified = Date.now();

      const method = this._currentAnalysisId ? 'PUT' : 'POST';
      const url = '/api/analyses';

      const body = this._currentAnalysisId
        ? {
            id: this._currentAnalysisId,
            data: data,
          }
        : {
            appName: this.appName,
            title: `${this.appName} - ${new Date().toLocaleString()}`,
            data: data,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Guardar ID si es nuevo
        if (!this._currentAnalysisId && result.analysis?.id) {
          this._currentAnalysisId = result.analysis.id;
        }

        this._lastSync = Date.now();
        console.log(`[APISyncManager] ✓ Sincronizado (${method}) - ${new Date().toLocaleTimeString()}`);
      } else {
        console.error('[APISyncManager] Error al sincronizar:', await response.text());
      }
    } catch (error) {
      console.error('[APISyncManager] Error en syncToCloud:', error);
    } finally {
      this._isSyncing = false;
    }
  },

  /**
   * Obtener datos locales (debe ser implementado por cada app)
   */
  getLocalData: function() {
    // AttackMetrics.html usa DB global
    if (typeof DB !== 'undefined') {
      return DB;
    }
    
    // Fallback a localStorage
    const stored = localStorage.getItem('am_v22_6');
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Aplicar datos cargados (debe ser implementado por cada app)
   */
  applyLoadedData: function(data) {
    if (typeof DB !== 'undefined') {
      Object.assign(DB, data);
      
      // Notificar a la app que los datos cambiaron
      if (typeof updateDash === 'function') updateDash();
      if (typeof drawPitch === 'function') drawPitch();
      
      console.log('[APISyncManager] Datos aplicados desde cloud');
    }
  },

  /**
   * Detener sincronización
   */
  stop: function() {
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
      this._syncInterval = null;
    }
    console.log('[APISyncManager] Sincronización detenida');
  }
};
