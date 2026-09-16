/**
 * GIS WQI - Google Apps Script REST API
 * ระบบเก็บข้อมูลน้ำเสียชุมชน
 * 
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่ ตั้งชื่อ "GIS WQI Database"
 * 2. ไปที่ Extensions > Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. คลิก Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. คลิก Deploy → คัดลอก URL ไปใส่ใน config.js
 */

// ========================================
// CONFIG
// ========================================
const SOURCES_SHEET_NAME = 'wastewater_sources';
const PIPES_SHEET_NAME = 'drainage_pipes';

const SOURCES_HEADERS = ['ws_id', 'ws_type', 'ws_type_name', 'latitude', 'longitude', 'pop_num', 'ww_q', 'created_at'];
const PIPES_HEADERS = ['wd_id', 'latitude', 'longitude', 'pip_area', 'wd_distance', 'ww_qav', 'created_at'];

const WS_TYPE_NAMES = {
  1: 'บ้านพักอาศัย',
  2: 'อาคารพาณิชย์',
  3: 'ตลาด',
  4: 'ร้านอาหาร',
  5: 'หอพัก',
  6: 'สถานประกอบกิจการอันตรายต่อสุขภาพ',
  7: 'อื่นๆ'
};

// ========================================
// INITIALIZATION
// ========================================

/**
 * สร้าง Sheets และ Headers อัตโนมัติ (รันครั้งแรกครั้งเดียว)
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // สร้าง Sheet wastewater_sources
  let sourcesSheet = ss.getSheetByName(SOURCES_SHEET_NAME);
  if (!sourcesSheet) {
    sourcesSheet = ss.insertSheet(SOURCES_SHEET_NAME);
    sourcesSheet.getRange(1, 1, 1, SOURCES_HEADERS.length).setValues([SOURCES_HEADERS]);
    sourcesSheet.getRange(1, 1, 1, SOURCES_HEADERS.length).setFontWeight('bold');
    sourcesSheet.setFrozenRows(1);
  }

  // สร้าง Sheet drainage_pipes
  let pipesSheet = ss.getSheetByName(PIPES_SHEET_NAME);
  if (!pipesSheet) {
    pipesSheet = ss.insertSheet(PIPES_SHEET_NAME);
    pipesSheet.getRange(1, 1, 1, PIPES_HEADERS.length).setValues([PIPES_HEADERS]);
    pipesSheet.getRange(1, 1, 1, PIPES_HEADERS.length).setFontWeight('bold');
    pipesSheet.setFrozenRows(1);
  }

  // ลบ Sheet1 เริ่มต้น (ถ้ามี)
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('✅ Sheets initialized successfully!');
}

// ========================================
// HTTP HANDLERS
// ========================================

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;

    switch (action) {
      case 'getSources':
        result = getSheetData(SOURCES_SHEET_NAME);
        break;
      case 'getPipes':
        result = getSheetData(PIPES_SHEET_NAME);
        break;
      case 'getNextSourceId':
        result = { id: generateNextId(SOURCES_SHEET_NAME, 'WS') };
        break;
      case 'getNextPipeId':
        result = { id: generateNextId(PIPES_SHEET_NAME, 'WD') };
        break;
      default:
        result = { error: 'Invalid action: ' + action };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    switch (action) {
      case 'addSource':
        result = addSource(data.payload);
        break;
      case 'addPipe':
        result = addPipe(data.payload);
        break;
      case 'updateSource':
        result = updateRow(SOURCES_SHEET_NAME, 'ws_id', data.id, data.payload);
        break;
      case 'updatePipe':
        result = updateRow(PIPES_SHEET_NAME, 'wd_id', data.id, data.payload);
        break;
      case 'deleteSource':
        result = deleteRow(SOURCES_SHEET_NAME, 'ws_id', data.id);
        break;
      case 'deletePipe':
        result = deleteRow(PIPES_SHEET_NAME, 'wd_id', data.id);
        break;
      default:
        result = { error: 'Invalid action: ' + action };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

// ========================================
// CRUD OPERATIONS
// ========================================

/**
 * ดึงข้อมูลทั้งหมดจาก Sheet
 */
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    initializeSheets();
    return { data: [] };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { data: [] };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length);
  const values = dataRange.getValues();

  const data = values.map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });

  return { data: data };
}

/**
 * เพิ่มแหล่งกำเนิดน้ำเสีย (Auto-generate ws_id + ws_type_name)
 */
function addSource(payload) {
  const sheet = getOrCreateSheet(SOURCES_SHEET_NAME, SOURCES_HEADERS);
  const wsId = generateNextId(SOURCES_SHEET_NAME, 'WS');
  const wsTypeName = WS_TYPE_NAMES[payload.ws_type] || 'ไม่ระบุ';
  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  const row = [
    wsId,
    payload.ws_type,
    wsTypeName,
    payload.latitude,
    payload.longitude,
    payload.pop_num,
    payload.ww_q,
    now
  ];

  sheet.appendRow(row);
  return { success: true, id: wsId, message: 'เพิ่มข้อมูลแหล่งกำเนิดน้ำเสียสำเร็จ' };
}

/**
 * เพิ่มท่อระบายน้ำ (Auto-generate wd_id)
 */
function addPipe(payload) {
  const sheet = getOrCreateSheet(PIPES_SHEET_NAME, PIPES_HEADERS);
  const wdId = generateNextId(PIPES_SHEET_NAME, 'WD');
  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  const row = [
    wdId,
    payload.latitude,
    payload.longitude,
    payload.pip_area,
    payload.wd_distance,
    payload.ww_qav,
    now
  ];

  sheet.appendRow(row);
  return { success: true, id: wdId, message: 'เพิ่มข้อมูลท่อระบายน้ำสำเร็จ' };
}

/**
 * แก้ไขข้อมูล
 */
function updateRow(sheetName, idColumn, idValue, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { error: 'Sheet not found' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idColIndex = headers.indexOf(idColumn);
  if (idColIndex === -1) return { error: 'ID column not found' };

  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(idValue)) {
      const rowNum = i + 2;

      // อัพเดทแต่ละ field ที่ส่งมา
      for (const key in payload) {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(rowNum, colIndex + 1).setValue(payload[key]);
        }
      }

      // อัพเดท ws_type_name ถ้าเปลี่ยน ws_type
      if (sheetName === SOURCES_SHEET_NAME && payload.ws_type) {
        const typeNameCol = headers.indexOf('ws_type_name');
        if (typeNameCol !== -1) {
          sheet.getRange(rowNum, typeNameCol + 1).setValue(WS_TYPE_NAMES[payload.ws_type] || 'ไม่ระบุ');
        }
      }

      return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
    }
  }

  return { error: 'ไม่พบข้อมูล ID: ' + idValue };
}

/**
 * ลบข้อมูล
 */
function deleteRow(sheetName, idColumn, idValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { error: 'Sheet not found' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idColIndex = headers.indexOf(idColumn);
  if (idColIndex === -1) return { error: 'ID column not found' };

  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  for (let i = data.length - 1; i >= 0; i--) {
    if (String(data[i][idColIndex]) === String(idValue)) {
      sheet.deleteRow(i + 2);
      return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }
  }

  return { error: 'ไม่พบข้อมูล ID: ' + idValue };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * สร้าง Auto-generate ID (WS-001, WS-002, WD-001, ...)
 */
function generateNextId(sheetName, prefix) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) {
    return prefix + '-001';
  }

  const lastRow = sheet.getLastRow();
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();

  let maxNum = 0;
  ids.forEach(function(id) {
    if (id && String(id).startsWith(prefix + '-')) {
      const num = parseInt(String(id).replace(prefix + '-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return prefix + '-' + String(nextNum).padStart(3, '0');
}

/**
 * สร้างหรือดึง Sheet
 */
function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * สร้าง JSON Response
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
