/**
 * GIS WQI - Export Module
 * จัดการการดาวน์โหลดไฟล์ GeoJSON และ CSV
 */
App.Export = (function() {
  
  function init() {
    document.getElementById('btn-export-source-geojson').addEventListener('click', () => exportGeoJSON('sources'));
    document.getElementById('btn-export-pipe-geojson').addEventListener('click', () => exportGeoJSON('pipes'));
    document.getElementById('btn-export-source-csv').addEventListener('click', () => exportCSV('sources'));
    document.getElementById('btn-export-pipe-csv').addEventListener('click', () => exportCSV('pipes'));
  }

  // ========================================
  // Export GeoJSON
  // ========================================
  function exportGeoJSON(type) {
    const data = type === 'sources' ? App.State.sources : App.State.pipes;
    if (!data || data.length === 0) {
      App.UI.showToast('ไม่มีข้อมูลสำหรับ Export', 'error');
      return;
    }

    const features = data.map(item => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      
      // ลบ lat, lng ออกจาก properties เพราะถูกใช้เป็น geometry แล้ว
      const properties = { ...item };
      delete properties.latitude;
      delete properties.longitude;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat] // GeoJSON ใช้ [longitude, latitude]
        },
        properties: properties
      };
    });

    const geojson = {
      type: "FeatureCollection",
      name: type === 'sources' ? "Wastewater_Sources" : "Drainage_Pipes",
      crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      features: features
    };

    downloadFile(JSON.stringify(geojson, null, 2), `GIS_WQI_${type}_${formatDate()}.geojson`, 'application/geo+json');
  }

  // ========================================
  // Export CSV
  // ========================================
  function exportCSV(type) {
    const data = type === 'sources' ? App.State.sources : App.State.pipes;
    if (!data || data.length === 0) {
      App.UI.showToast('ไม่มีข้อมูลสำหรับ Export', 'error');
      return;
    }

    // เอา Header จาก object ตัวแรก
    const headers = Object.keys(data[0]);
    
    // แปลงข้อมูลให้อยู่ในรูปแบบ CSV
    const csvContent = [
      headers.join(','), // แถว Header
      ...data.map(row => headers.map(header => {
        // จัดการกับข้อมูลที่มีลูกน้ำ (,) หรือขึ้นบรรทัดใหม่
        let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    // ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง (UTF-8)
    const bom = '\uFEFF';
    downloadFile(bom + csvContent, `GIS_WQI_${type}_${formatDate()}.csv`, 'text/csv;charset=utf-8;');
  }

  // ========================================
  // Utilities
  // ========================================
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    App.UI.showToast(`ส่งออกไฟล์ ${fileName} สำเร็จ`, 'success');
  }

  function formatDate() {
    const d = new Date();
    return `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}`;
  }

  return { init };
})();
