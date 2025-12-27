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
    // Notificar a otras tabs
    sessionStorage.setItem(
      'sync_update',
      JSON.stringify({ appId, timestamp: Date.now() })
    );
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
