/**
 * AppDataManager - Sistema de persistencia de datos para las apps
 * 
 * Automaticamente guarda y carga:
 * - FormData de todos los inputs, textareas, selects
 * - Datos de localStorage
 * - Estado de elementos visibles
 * - Posición de scrolls
 * - Estado global de la app (STATE variable)
 */

window.AppDataManager = {
  _autoSaveInterval: null,
  _appState: null,
  _savedCount: 0,
  _lastStateHash: null,
  _debounceTimer: null,
  _lastForceSave: 0,
  _forceSaveInterval: 15000, // Máximo 15s sin guardar por seguridad

  // Inicializar y escuchar cambios
  init: function() {
    console.log('[AppDataManager] Inicializando sistema de persistencia (OPTIMIZADO)...');
    
    // Cargar datos al iniciar (esperar a que el DOM esté listo)
    setTimeout(() => {
      this.loadFromParent();
    }, 500);
    
    // Guardar antes de descargar
    window.addEventListener('beforeunload', () => {
      this.debouncedSave(true);
    });

    // Debounce en cambios de usuario
    document.addEventListener('change', () => {
      this.debouncedSave();
    }, true);

    // Debounce en inputs
    document.addEventListener('input', () => {
      this.debouncedSave();
    }, true);

    // ⭐ CRÍTICO: Guardar cuando pierda focus (cambio de pestaña/app)
    window.addEventListener('blur', () => {
      console.log('[AppDataManager] Ventana perdió focus - guardando datos ahora');
      this.debouncedSave(true); // Force save inmediato
    });

    // ⭐ También guardar al recuperar focus (por si acaso)
    window.addEventListener('focus', () => {
      // No hacer nada, solo registrar
    });

    // Force save cada 15 segundos máximo (por seguridad)
    this._autoSaveInterval = setInterval(() => {
      const now = Date.now();
      if (now - this._lastForceSave > this._forceSaveInterval) {
        console.log('[AppDataManager] Force save (15s máximo)');
        this.debouncedSave(true);
      }
    }, 15000);

    console.log('[AppDataManager] Sistema optimizado: debounce + validación de cambios');
  },

  // Debounce inteligente: espera a que el usuario deje de escribir
  debouncedSave: function(force = false) {
    // Limpiar timer anterior
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    // Si es force save, guardar inmediatamente
    if (force) {
      this.captureAndSave(true);
      return;
    }

    // Si no hay cambios desde el último hash, no hacer nada
    const currentHash = this.getStateHash();
    if (currentHash === this._lastStateHash) {
      return; // Evitar guardar lo mismo
    }

    // Esperar 2 segundos sin cambios antes de guardar
    this._debounceTimer = setTimeout(() => {
      const newHash = this.getStateHash();
      if (newHash !== this._lastStateHash) {
        this.captureAndSave(false);
      }
    }, 2000);
  },

  // Generar hash del estado actual para detectar cambios
  getStateHash: function() {
    try {
      const state = {
        formData: this.captureFormData(),
        globalState: typeof STATE !== 'undefined' ? STATE : null,
      };
      const str = JSON.stringify(state);
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
    } catch (e) {
      return null;
    }
  },

  // Capturar estado actual de la página
  captureState: function() {
    const state = {
      timestamp: Date.now(),
      formData: this.captureFormData(),
      localStorage: this.captureLocalStorage(),
      sessionStorage: this.captureSessionStorage(),
      scrollPosition: {
        x: window.scrollX || 0,
        y: window.scrollY || 0,
      },
      visibleElements: this.captureVisibleElements(),
      // Capturar el STATE global si existe
      globalState: typeof STATE !== 'undefined' ? this.deepClone(STATE) : null,
    };
    return state;
  },

  // Deep clone para evitar referencias
  deepClone: function(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.warn('No se pudo clonar STATE:', e);
      return null;
    }
  },

  // Capturar datos de formularios
  captureFormData: function() {
    const formData = {};
    
    // Inputs y textareas
    document.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.id) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          formData[el.id] = el.checked;
        } else if (el.type === 'file') {
          // NO guardar file inputs (causaban restauración de archivo original)
          // Los datos procesados se guardan en el STATE global
          return;
        } else {
          formData[el.id] = el.value;
        }
      }
    });

    return formData;
  },

  // Capturar localStorage
  captureLocalStorage: function() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key.startsWith('_')) { // Ignorar claves privadas
          data[key] = localStorage.getItem(key);
        }
      }
    } catch (e) {
      console.warn('No se puede acceder a localStorage:', e);
    }
    return data;
  },

  // Capturar sessionStorage
  captureSessionStorage: function() {
    const data = {};
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data[key] = sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn('No se puede acceder a sessionStorage:', e);
    }
    return data;
  },

  // Capturar elementos visibles
  captureVisibleElements: function() {
    const visible = {};
    document.querySelectorAll('[data-persist]').forEach((el) => {
      const key = el.getAttribute('data-persist');
      visible[key] = {
        display: window.getComputedStyle(el).display,
        hidden: el.hidden,
        innerHTML: el.innerHTML.substring(0, 500),
      };
    });
    return visible;
  },

  // Guardar estado (solo si hay cambios reales)
  captureAndSave: function(isUnload = false) {
    try {
      const state = this.captureState();
      const newHash = this.getStateHash();
      
      // Si no hay cambios y no es un force save, no guardar
      if (newHash === this._lastStateHash && !isUnload) {
        return;
      }

      // Actualizar hash y estado
      this._lastStateHash = newHash;
      this._appState = state;
      this._savedCount++;
      this._lastForceSave = Date.now();
      
      // Enviar al parent solo formData y globalState (no localStorage/sessionStorage para ahorrar banda)
      const optimizedState = {
        timestamp: state.timestamp,
        formData: state.formData,
        globalState: state.globalState,
      };

      window.parent.postMessage(
        {
          type: 'SAVE_DATA',
          data: JSON.stringify(optimizedState),
          count: this._savedCount,
          isUnload: isUnload,
        },
        '*'
      );

      if (this._savedCount % 5 === 0) {
        console.log(`[AppDataManager] Guard. #${this._savedCount} (datos optimizados)`);
      }
    } catch (e) {
      console.warn('Error capturando estado:', e);
    }
  },

  // Cargar datos del servidor
  loadFromParent: function() {
    // Escuchar mensajes del parent (el contenedor Next.js)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'LOAD_DATA') {
        try {
          const data = typeof event.data.data === 'string' 
            ? JSON.parse(event.data.data)
            : event.data.data;
          
          if (data) {
            console.log('[AppDataManager] Restaurando datos guardados...');
            this.restoreState(data);
            console.log('[AppDataManager] Datos restaurados correctamente');
          }
        } catch (e) {
          console.warn('Error restaurando datos:', e);
        }
      }
    });

    // Notificar al parent que estamos listo
    window.parent.postMessage(
      {
        type: 'APP_READY',
        appId: window.location.pathname,
      },
      '*'
    );
  },

  // Restaurar estado
  restoreState: function(state) {
    if (!state) return;

    // Restaurar form data primero
    if (state.formData) {
      Object.keys(state.formData).forEach((key) => {
        if (key.endsWith('_files')) return; // Saltar metadata de archivos
        
        const el = document.getElementById(key);
        if (el) {
          try {
            if (el.type === 'checkbox' || el.type === 'radio') {
              el.checked = state.formData[key];
            } else {
              el.value = state.formData[key];
            }
            // Trigger change event para que JS detecte cambios
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
          } catch (e) {
            console.warn('Error restaurando elemento:', key, e);
          }
        }
      });
    }

    // Restaurar localStorage
    if (state.localStorage) {
      Object.keys(state.localStorage).forEach((key) => {
        try {
          localStorage.setItem(key, state.localStorage[key]);
        } catch (e) {
          console.warn('No se puede guardar en localStorage:', key, e);
        }
      });
    }

    // Restaurar sessionStorage
    if (state.sessionStorage) {
      Object.keys(state.sessionStorage).forEach((key) => {
        try {
          sessionStorage.setItem(key, state.sessionStorage[key]);
        } catch (e) {
          console.warn('No se puede guardar en sessionStorage:', key, e);
        }
      });
    }

    // Restaurar STATE global si la app lo usa
    if (state.globalState && typeof STATE !== 'undefined') {
      try {
        Object.assign(STATE, state.globalState);
        console.log('[AppDataManager] STATE global restaurado');
      } catch (e) {
        console.warn('Error restaurando STATE global:', e);
      }
    }

    // Restaurar scroll position (con delay)
    if (state.scrollPosition) {
      setTimeout(() => {
        try {
          window.scrollTo(state.scrollPosition.x, state.scrollPosition.y);
        } catch (e) {
          console.warn('Error restaurando scroll:', e);
        }
      }, 100);
    }

    // Restaurar visibility de elementos
    if (state.visibleElements) {
      Object.keys(state.visibleElements).forEach((key) => {
        const el = document.querySelector(`[data-persist="${key}"]`);
        if (el) {
          const vis = state.visibleElements[key];
          if (vis.display) el.style.display = vis.display;
          if (vis.hidden !== undefined) el.hidden = vis.hidden;
        }
      });
    }
  },

  // Limpiar datos
  clear: function() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      this._appState = null;
      console.log('[AppDataManager] Datos limpios');
    } catch (e) {
      console.warn('Error limpiando datos:', e);
    }
  },

  // Log para debugging
  log: function(message) {
    console.log('[App]:', message);
    window.parent.postMessage(
      {
        type: 'LOG',
        message: message,
      },
      '*'
    );
  },

  // Forzar guardado inmediato
  forceSave: function() {
    this.captureAndSave(true);
  }
};

// Auto-inicializar cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AppDataManager.init();
  });
} else {
  window.AppDataManager.init();
}

// También escuchar cuando se disparan cambios de tabs (para Analista Pro y similares)
window.addEventListener('focus', () => {
  if (typeof window.AppDataManager !== 'undefined') {
    window.AppDataManager.forceSave();
  }
});

