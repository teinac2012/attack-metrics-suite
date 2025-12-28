/**
 * DownloadManager - Sistema de descargas para apps en iframe
 * Permite que los iframes descarguen archivos a través del servidor
 */

window.DownloadManager = {
  // Descargar archivo como blob
  downloadBlob: async function(blob, filename) {
    try {
      console.log('[DownloadManager] Descargando:', filename);
      const base64 = await this.blobToBase64(blob);

      // Enviar al parent para procesar la descarga
      window.parent.postMessage(
        {
          type: 'DOWNLOAD_FILE',
          filename: filename,
          data: base64,
          mimeType: blob.type || undefined,
        },
        '*'
      );
    } catch (err) {
      console.error('[DownloadManager] Error preparando la descarga:', err);
      window.parent.postMessage(
        {
          type: 'LOG',
          message: '[DownloadManager] Error preparando la descarga: ' + (err && err.message ? err.message : String(err)),
        },
        '*'
      );
    }
  },

  // Descargar JSON
  downloadJSON: function(data, filename) {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, filename || 'data.json');
  },

  // Descargar CSV
  downloadCSV: function(data, filename) {
    const csvString = typeof data === 'string' ? data : this.arrayToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename || 'data.csv');
  },

  // Descargar XLSX (necesita XLSX library)
  downloadXLSX: function(data, filename) {
    if (typeof XLSX === 'undefined') {
      alert('XLSX library no está disponible');
      return;
    }
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generar como blob
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, filename || 'data.xlsx');
  },

  // Descargar screenshot (canvas)
  downloadScreenshot: function(canvas, filename) {
    canvas.toBlob((blob) => {
      this.downloadBlob(blob, filename || 'screenshot.png');
    }, 'image/png');
  },

  // Convertir blob a base64
  blobToBase64: function(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove "data:...;base64," prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  },

  // Convertir array a CSV
  arrayToCSV: function(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar comillas y valores con comas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];
    
    return csv.join('\n');
  },

  // Log para debugging
  log: function(message) {
    console.log('[DownloadManager]:', message);
    window.parent.postMessage(
      {
        type: 'LOG',
        message: '[DownloadManager] ' + message,
      },
      '*'
    );
  }
};

console.log('[DownloadManager] Inicializado y listo para descargas');
