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

  // Inicializar y escuchar cambios
  init: function() {
    console.log('[AppDataManager] Inicializando sistema de persistencia...');
    
    // Cargar datos al iniciar (esperar a que el DOM esté listo)
    setTimeout(() => {
      this.loadFromParent();
    }, 500);
    
    // Auto-guardar cada 2 segundos (más frecuente para datos críticos)
    this._autoSaveInterval = setInterval(() => {
      this.captureAndSave();
    }, 2000);

    // Guardar antes de descargar
    window.addEventListener('beforeunload', () => {
      this.captureAndSave(true);
    });

    // Guardar en intervalos del usuario (cambios en inputs)
    document.addEventListener('change', () => {
      this.captureAndSave();
    }, true);

    console.log('[AppDataManager] Sistema inicializado y escuchando cambios');
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
          // Para file inputs, guardar lista de nombres (no los archivos mismos)
          if (el.files && el.files.length > 0) {
            formData[el.id + '_files'] = Array.from(el.files).map(f => ({
              name: f.name,
              size: f.size,
              type: f.type,
              lastModified: f.lastModified,
            }));
          }
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

  // Guardar estado
  captureAndSave: function(isUnload = false) {
    try {
      const state = this.captureState();
      this._appState = state;
      this._savedCount++;
      
      // Enviar al parent
      window.parent.postMessage(
        {
          type: 'SAVE_DATA',
          data: JSON.stringify(state),
          count: this._savedCount,
          isUnload: isUnload,
        },
        '*'
      );

      if (isUnload) {
        console.log('[AppDataManager] Datos guardados antes de descargar');
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

