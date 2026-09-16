/**
 * GIS WQI - Map View Module
 * จัดการแสดงผลแผนที่ Interactive ด้วย Leaflet
 */
App.Map = (function() {
  let map = null;
  let sourceLayer = null;
  let pipeLayer = null;

  function init() {
    // Initialize map
    map = L.map('main-map').setView([App.CONFIG.DEFAULT_LAT, App.CONFIG.DEFAULT_LNG], App.CONFIG.DEFAULT_ZOOM);
    
    // Add Base Map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create Layer Groups
    sourceLayer = L.layerGroup().addTo(map);
    pipeLayer = L.layerGroup().addTo(map);

    // Layer Control
    const overlays = {
      "<span class='text-sky-600 font-medium'>📍 แหล่งกำเนิดน้ำเสีย</span>": sourceLayer,
      "<span class='text-amber-700 font-medium'>🚧 ท่อระบายน้ำ</span>": pipeLayer
    };
    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // Fit All Button
    document.getElementById('btn-fit-all').addEventListener('click', fitAll);
  }

  function refreshSources() {
    if (!sourceLayer) return;
    sourceLayer.clearLayers();

    App.State.sources.forEach(s => {
      const lat = parseFloat(s.latitude);
      const lng = parseFloat(s.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = App.CONFIG.MARKER_COLORS[s.ws_type] || '#6B7280';
      
      // Custom HTML Marker
      const icon = L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="custom-marker" style="background-color: ${color}; width: 20px; height: 20px;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lat, lng], { icon: icon });

      // Tooltip (Hover)
      marker.bindTooltip(`
        <strong>${s.ws_id}</strong><br>
        ประเภท: ${s.ws_type_name}<br>
        น้ำเสีย: ${s.ww_q} ล./วัน
      `);

      // Popup (Click)
      marker.bindPopup(`
        <div class="font-prompt min-w-[200px]">
          <h3 class="font-bold text-sky-700 border-b pb-2 mb-2">${s.ws_id}</h3>
          <p class="mb-1"><strong>ประเภท:</strong> ${s.ws_type_name}</p>
          <p class="mb-1"><strong>พิกัด:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          <p class="mb-1"><strong>จำนวนคน:</strong> ${s.pop_num}</p>
          <p class="mb-2"><strong>น้ำเสีย:</strong> ${s.ww_q} ล./วัน</p>
          <div class="text-xs text-gray-400 text-right mt-2 pt-2 border-t">
            อัพเดท: ${new Date(s.created_at).toLocaleDateString('th-TH')}
          </div>
        </div>
      `);

      sourceLayer.addLayer(marker);
    });
  }

  function refreshPipes() {
    if (!pipeLayer) return;
    pipeLayer.clearLayers();

    App.State.pipes.forEach(p => {
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      // Custom Square Marker for Pipe
      const icon = L.divIcon({
        className: 'pipe-marker-wrapper',
        html: `<div class="pipe-marker"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: icon });

      // Tooltip
      marker.bindTooltip(`
        <strong>${p.wd_id}</strong><br>
        น้ำเสีย: ${p.ww_qav} ล./วัน
      `);

      // Popup
      marker.bindPopup(`
        <div class="font-prompt min-w-[200px]">
          <h3 class="font-bold text-amber-700 border-b pb-2 mb-2">${p.wd_id}</h3>
          <p class="mb-1"><strong>พิกัด:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          <p class="mb-1"><strong>พท.หน้าตัด:</strong> ${p.pip_area} ตร.ม.</p>
          <p class="mb-1"><strong>ความยาว:</strong> ${p.wd_distance} ม.</p>
          <p class="mb-2"><strong>น้ำเสียเฉลี่ย:</strong> ${p.ww_qav} ล./วัน</p>
          <div class="text-xs text-gray-400 text-right mt-2 pt-2 border-t">
            อัพเดท: ${new Date(p.created_at).toLocaleDateString('th-TH')}
          </div>
        </div>
      `);

      pipeLayer.addLayer(marker);
    });
  }

  function fitAll() {
    const bounds = L.latLngBounds();
    let hasPoint = false;

    if (sourceLayer) {
      sourceLayer.eachLayer(layer => {
        bounds.extend(layer.getLatLng());
        hasPoint = true;
      });
    }

    if (pipeLayer) {
      pipeLayer.eachLayer(layer => {
        bounds.extend(layer.getLatLng());
        hasPoint = true;
      });
    }

    if (hasPoint) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }

  function invalidate() {
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }

  return { init, refreshSources, refreshPipes, fitAll, invalidate };
})();