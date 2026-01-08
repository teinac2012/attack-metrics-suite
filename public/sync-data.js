// Utilidad de persistencia de datos entre apps (JS puro)

// Sincronizar progreso de análisis entre las 3 apps
window.AnalysisDataSync = {
  // Guardar progreso desde una app
  saveProgress: function (appId, data) {
    const key = `app_${appId}_progress`;
    localStorage.setItem(
      key,
      JSON.stringify({
        appId: appId,
        timestamp: new Date().toISOString(),
        data: data,
      })
    );
    // Notificar a otras tabs/iframes (usar localStorage para disparar 'storage')
    try {
      localStorage.setItem(
        'sync_update',
        JSON.stringify({ appId, timestamp: Date.now() })
      );
    } catch {}
  },

  // Cargar progreso
  loadProgress: function (appId) {
    const key = `app_${appId}_progress`;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved).data : null;
    } catch (e) {
      console.error('Error cargando progreso:', e);
      return null;
    }
  },

  // Limpiar progreso
  clearProgress: function (appId) {
    localStorage.removeItem(`app_${appId}_progress`);
  },

  // Ver último partido analizado
  getLastMatch: function () {
    const key = 'last_match_context';
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  },

  // Guardar contexto del partido
  saveMatchContext: function (matchId, context) {
    localStorage.setItem(
      'last_match_context',
      JSON.stringify({
        matchId: matchId,
        context: context,
        timestamp: new Date().toISOString(),
      })
    );
  },

  // ===== NUEVAS FUNCIONES PARA ATTACKMETRICS =====
  // Guardar BD completa de AttackMetrics (con timestamp)
  saveAttackMetricsDB: function (dbObject) {
    try {
      const key = 'am_sync_latest';
      localStorage.setItem(
        key,
        JSON.stringify({
          db: dbObject,
          timestamp: new Date().toISOString(),
          version: dbObject.version || '3.1',
        })
      );
      console.log('[AnalysisDataSync] BD de AttackMetrics guardada');
      // Notificar cambio
      localStorage.setItem('sync_update', JSON.stringify({ appId: 'attackmetrics', timestamp: Date.now() }));
    } catch (e) {
      console.error('[AnalysisDataSync] Error guardando AttackMetrics:', e);
    }
  },

  // Cargar BD de AttackMetrics
  loadAttackMetricsDB: function () {
    try {
      const key = 'am_sync_latest';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[AnalysisDataSync] BD de AttackMetrics cargada:', parsed.timestamp);
        return parsed.db;
      }
      return null;
    } catch (e) {
      console.error('[AnalysisDataSync] Error cargando AttackMetrics:', e);
      return null;
    }
  },

  // Limpiar BD de AttackMetrics
  clearAttackMetricsDB: function () {
    try {
      localStorage.removeItem('am_sync_latest');
      console.log('[AnalysisDataSync] BD de AttackMetrics limpiada');
    } catch (e) {
      console.error('[AnalysisDataSync] Error limpiando AttackMetrics:', e);
    }
  },

  // Obtener información del último análisis
  getLastAnalysisInfo: function () {
    try {
      const amDb = this.loadAttackMetricsDB();
      if (!amDb) return null;
      
      return {
        homeName: amDb.config?.homeName || 'LOCAL',
        awayName: amDb.config?.awayName || 'RIVAL',
        totalActions: amDb.actions?.length || 0,
        possession: amDb.possession || { home: 0, away: 0, out: 0 },
        lastUpdated: new Date(localStorage.getItem('am_sync_latest') ? JSON.parse(localStorage.getItem('am_sync_latest')).timestamp : Date.now())
      };
    } catch (e) {
      return null;
    }
  }
};

// Detectar cambios en otras tabs/ventanas
window.addEventListener('storage', function (e) {
  if (e.key === 'sync_update') {
    try {
      const update = JSON.parse(e.newValue);
      console.log(`Sincronización detectada desde app ${update.appId}`);
      // Aquí pueden reaccionar las apps si es necesario
      if (typeof window.onDataSyncUpdate === 'function') {
        window.onDataSyncUpdate(update);
      }
    } catch (err) {
      console.error('Error en sincronización:', err);
    }
  }
});

// Fallback: BroadcastChannel si está disponible
try {
  const bc = new BroadcastChannel('analysis_sync');
  bc.onmessage = (ev) => {
    const update = ev.data;
    if (typeof window.onDataSyncUpdate === 'function') {
      window.onDataSyncUpdate(update);
    }
  };
  // Sobrescribir saveProgress para emitir por canal
  const origSave = window.AnalysisDataSync.saveProgress;
  window.AnalysisDataSync.saveProgress = function(appId, data) {
    origSave(appId, data);
    try { bc.postMessage({ appId, timestamp: Date.now() }); } catch {}
  };
} catch {}
