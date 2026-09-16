/**
 * GIS WQI - Configuration
 * แก้ไข APPS_SCRIPT_URL เป็น URL ที่ได้จากการ Deploy Google Apps Script
 */
const App = window.App || {};

App.CONFIG = {
  // ========================================
  // ⚠️ แก้ไข URL นี้เป็น URL จาก Google Apps Script Deployment ของท่าน
  // ========================================
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbytLGTBk39HdpL0CDP0yj1W0W_LFs7oLxh7ANFryutKhZbJ0Bnd81qRMTWFl0iTy-ft/exec',

  // ประเภทแหล่งกำเนิดน้ำเสีย
  WS_TYPES: {
    1: 'บ้านพักอาศัย',
    2: 'อาคารพาณิชย์',
    3: 'ตลาด',
    4: 'ร้านอาหาร',
    5: 'หอพัก',
    6: 'สถานประกอบกิจการอันตรายต่อสุขภาพ',
    7: 'อื่นๆ'
  },

  // สี Marker ตาม ws_type
  MARKER_COLORS: {
    1: '#3B82F6', // น้ำเงิน - บ้านพักอาศัย
    2: '#22C55E', // เขียว  - อาคารพาณิชย์
    3: '#EAB308', // เหลือง - ตลาด
    4: '#F97316', // ส้ม    - ร้านอาหาร
    5: '#A855F7', // ม่วง   - หอพัก
    6: '#EF4444', // แดง   - สถานประกอบกิจการฯ
    7: '#6B7280'  // เทา   - อื่นๆ
  },

  // สี Marker ท่อระบายน้ำ
  PIPE_MARKER_COLOR: '#92400E',

  // Default map center (กรุงเทพฯ)
  DEFAULT_LAT: 13.7563,
  DEFAULT_LNG: 100.5018,
  DEFAULT_ZOOM: 10
};

window.App = App;
