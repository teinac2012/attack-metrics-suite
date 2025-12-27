/**
 * AppDataManager - Sistema de persistencia de datos para las apps
 * 
 * Automaticamente guarda y carga:
 * - FormData de todos los inputs, textareas, selects
 * - Datos de localStorage
 * - Estado de elementos visibles
 * - Posición de scrolls
 */

window.AppDataManager = {
  _autoSaveInterval: null,
  _appState: null,

  // Inicializar y escuchar cambios
  init: function() {
    // Cargar datos al iniciar
    this.loadFromParent();
    
    // Auto-guardar cada 3 segundos
    this._autoSaveInterval = setInterval(() => {
      this.captureAndSave();
    }, 3000);

    // Guardar antes de descargar
    window.addEventListener('beforeunload', () => {
      this.captureAndSave();
    });

    console.log('[AppDataManager] Inicializado y listo para guardar datos');
  },

  // Capturar estado actual de la página
  captureState: function() {
    const state = {
      timestamp: Date.now(),
      formData: this.captureFormData(),
      localStorage: this.captureLocalStorage(),
      scrollPosition: {
        x: window.scrollX || 0,
        y: window.scrollY || 0,
      },
      visibleElements: this.captureVisibleElements(),
    };
    return state;
  },

  // Capturar datos de formularios
  captureFormData: function() {
    const formData = {};
    
    // Inputs y textareas
    document.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.id) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          formData[el.id] = el.checked;
        } else {
          formData[el.id] = el.value;
        }
      }
    });

    // File inputs (almacenar información sobre archivos)
    document.querySelectorAll('input[type="file"]').forEach((el) => {
      if (el.id && el.files && el.files.length > 0) {
        formData[el.id + '_files'] = Array.from(el.files).map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
        }));
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
        data[key] = localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('No se puede acceder a localStorage:', e);
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
        innerHTML: el.innerHTML.substring(0, 500), // Limitar tamaño
      };
    });
    return visible;
  },

  // Guardar estado
  captureAndSave: function(data) {
    try {
      const state = data || this.captureState();
      this._appState = state;
      
      // Enviar al parent
      window.parent.postMessage(
        {
          type: 'SAVE_DATA',
          data: JSON.stringify(state),
        },
        '*'
      );
    } catch (e) {
      console.warn('Error capturando estado:', e);
    }
  },

  // Cargar datos del servidor
  loadFromParent: function() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'LOAD_DATA') {
        try {
          const data = typeof event.data.data === 'string' 
            ? JSON.parse(event.data.data)
            : event.data.data;
          
          if (data) {
            this.restoreState(data);
            console.log('[AppDataManager] Datos restaurados:', data);
          }
        } catch (e) {
          console.warn('Error restaurando datos:', e);
        }
      }
    });
  },

  // Restaurar estado
  restoreState: function(state) {
    if (!state) return;

    // Restaurar form data
    if (state.formData) {
      Object.keys(state.formData).forEach((key) => {
        const el = document.getElementById(key);
        if (el) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = state.formData[key];
          } else {
            el.value = state.formData[key];
          }
          // Trigger change event
          el.dispatchEvent(new Event('change', { bubbles: true }));
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

    // Restaurar scroll position (después de un delay)
    if (state.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(state.scrollPosition.x, state.scrollPosition.y);
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
};

// Auto-inicializar cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AppDataManager.init();
  });
} else {
  window.AppDataManager.init();
}

