/**
 * GIS WQI - Main Application Controller & UI Utils
 */
const App = window.App || {};

App.State = {
  sources: [],
  pipes: []
};

App.UI = (function() {
  // ========================================
  // Toasts
  // ========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if(type === 'success') icon = 'check-circle';
    if(type === 'error') icon = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons({ root: toast });

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.4s ease forwards';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ========================================
  // Loading
  // ========================================
  function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  // ========================================
  // Confirm Dialog
  // ========================================
  let currentConfirmCb = null;
  function showConfirm(message, onConfirm) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-dialog').classList.remove('hidden');
    currentConfirmCb = onConfirm;
  }

  function hideConfirm() {
    document.getElementById('confirm-dialog').classList.add('hidden');
    currentConfirmCb = null;
  }

  document.getElementById('btn-confirm-cancel').addEventListener('click', hideConfirm);
  document.getElementById('btn-confirm-ok').addEventListener('click', () => {
    if (currentConfirmCb) currentConfirmCb();
    hideConfirm();
  });

  // ========================================
  // Map Picker Modal
  // ========================================
  let pickerMap = null;
  let pickerMarker = null;
  let onPickerConfirm = null;

  function openMapPicker(lat, lng, onConfirm) {
    document.getElementById('map-modal').classList.remove('hidden');
    onPickerConfirm = onConfirm;
    
    const initLat = parseFloat(lat) || App.CONFIG.DEFAULT_LAT;
    const initLng = parseFloat(lng) || App.CONFIG.DEFAULT_LNG;

    document.getElementById('modal-lat').textContent = initLat.toFixed(6);
    document.getElementById('modal-lng').textContent = initLng.toFixed(6);

    if (!pickerMap) {
      pickerMap = L.map('mini-map').setView([initLat, initLng], App.CONFIG.DEFAULT_ZOOM + 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(pickerMap);

      pickerMarker = L.marker([initLat, initLng], { draggable: true }).addTo(pickerMap);

      pickerMap.on('click', function(e) {
        pickerMarker.setLatLng(e.latlng);
        updateModalCoords(e.latlng);
      });

      pickerMarker.on('dragend', function(e) {
        updateModalCoords(pickerMarker.getLatLng());
      });
    } else {
      pickerMap.setView([initLat, initLng], App.CONFIG.DEFAULT_ZOOM + 2);
      pickerMarker.setLatLng([initLat, initLng]);
      // Prevent Leaflet rendering issue in modal
      setTimeout(() => pickerMap.invalidateSize(), 10);
    }
    document.getElementById('btn-confirm-location').disabled = false;
  }

  function updateModalCoords(latlng) {
    document.getElementById('modal-lat').textContent = latlng.lat.toFixed(6);
    document.getElementById('modal-lng').textContent = latlng.lng.toFixed(6);
  }

  function closeMapPicker() {
    document.getElementById('map-modal').classList.add('hidden');
  }

  document.getElementById('btn-modal-close').addEventListener('click', closeMapPicker);
  document.getElementById('btn-cancel-location').addEventListener('click', closeMapPicker);
  document.getElementById('btn-confirm-location').addEventListener('click', () => {
    if (onPickerConfirm && pickerMarker) {
      const pos = pickerMarker.getLatLng();
      onPickerConfirm(pos.lat.toFixed(6), pos.lng.toFixed(6));
    }
    closeMapPicker();
  });

  // ========================================
  // Tab Navigation
  // ========================================
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(c => {
          c.classList.remove('active');
          c.classList.add('hidden');
        });
        
        const content = document.getElementById(`tab-${target}`);
        content.classList.remove('hidden');
        content.classList.add('active');

        // Fix map size when tab becomes visible
        if (target === 'map' && App.Map && App.Map.invalidate) {
          App.Map.invalidate();
        }
      });
    });
  }

  // ========================================
  // Export Menu Dropdown
  // ========================================
  function initExportMenu() {
    const btn = document.getElementById('btn-export-menu');
    const menu = document.getElementById('export-dropdown');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
      }
    });
  }

  return { 
    showToast, showLoading, hideLoading, showConfirm, 
    openMapPicker, initTabs, initExportMenu 
  };
})();

// ========================================
// Bootstrap
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  App.UI.initTabs();
  App.UI.initExportMenu();

  if (App.Sources) App.Sources.init();
  if (App.Pipes) App.Pipes.init();
  if (App.Map) App.Map.init();
  if (App.Export) App.Export.init();
});
