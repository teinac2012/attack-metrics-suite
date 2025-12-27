/**
 * AppDataManager - Sistema de persistencia de datos para las apps
 * 
 * Uso en tus apps HTML:
 * <script src="/app-data-manager.js"></script>
 * 
 * // Para guardar datos automáticamente
 * AppDataManager.autoSave({ tusDatos });
 * 
 * // Para cargar datos guardados
 * window.addEventListener('message', (event) => {
 *   if (event.data.type === 'LOAD_DATA') {
 *     console.log('Datos cargados:', event.data.data);
 *   }
 * });
 */

window.AppDataManager = {
  // Guardar datos automáticamente cada X segundos
  autoSave: function(data, interval = 5000) {
    setInterval(() => {
      this.save(data);
    }, interval);
  },

  // Guardar datos una sola vez
  save: function(data) {
    window.parent.postMessage(
      {
        type: 'SAVE_DATA',
        data: JSON.stringify(data),
      },
      '*'
    );
  },

  // Solicitar datos guardados
  load: function(callback) {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'LOAD_DATA') {
        try {
          const parsedData = JSON.parse(event.data.data);
          callback(parsedData);
        } catch (e) {
          callback(event.data.data);
        }
      }
    });
  },

  // Log para debugging
  log: function(message) {
    window.parent.postMessage(
      {
        type: 'LOG',
        message: message,
      },
      '*'
    );
  },
};

// Cuando se cargue la app, enviar un log
AppDataManager.log('App cargada y lista para guardar datos');
