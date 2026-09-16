# 🌊 GIS WQI — ระบบข้อมูลน้ำเสียชุมชน

Web Application สำหรับบันทึกข้อมูลแหล่งกำเนิดน้ำเสียชุมชน ข้อมูลท่อระบายน้ำ และแสดงผลบนแผนที่แบบ Interactive ออกแบบมาเพื่อเป็นเครื่องมือจัดการข้อมูลภาคสนามและส่งออกข้อมูล (Export) นำไปวิเคราะห์ต่อในโปรแกรม QGIS ได้ทันที

ระบบนี้ **ฟรี 100%** ไม่มีค่าใช้จ่ายสำหรับ Server หรือ Database เพราะใช้ **Google Sheets** เป็นฐานข้อมูล และ **GitHub Pages** สำหรับรัน Web App

---

## ✨ ความสามารถของระบบ (Features)

1. **ระบบฐานข้อมูลแบบ Spreadsheet**: บันทึก แก้ไข ลบข้อมูล ผ่าน Web App โดยข้อมูลทั้งหมดจะถูกเก็บลงใน Google Sheets ของท่าน
2. **Auto-generate ID**: สร้างรหัส `WS-XXX` และ `WD-XXX` ให้โดยอัตโนมัติ
3. **Interactive Map Picker**: สามารถคลิกเลือกพิกัด Latitude, Longitude จากบนแผนที่ในฟอร์มกรอกข้อมูลได้โดยตรง
4. **Interactive Map View**: แสดงพิกัดของแหล่งกำเนิดน้ำเสียและท่อระบายน้ำแบบแยก Layer พร้อมคลิกดูรายละเอียด (Popup)
5. **Export to QGIS**: ดาวน์โหลดข้อมูลเป็นไฟล์ `GeoJSON` สำหรับเปิดใน QGIS หรือไฟล์ `CSV` สำหรับวิเคราะห์ต่อใน Excel

---

## 🚀 วิธีการติดตั้งใช้งาน (Installation & Setup)

การติดตั้งจะแบ่งเป็น 2 ส่วนหลักคือ **1. สร้างฐานข้อมูล API** และ **2. ตั้งค่า Web App**

### ส่วนที่ 1: สร้างฐานข้อมูล API (Google Apps Script)

1. เข้าไปที่ [Google Sheets](https://docs.google.com/spreadsheets) และสร้าง Spreadsheet ใหม่ ตั้งชื่อว่า `GIS WQI Database`
2. ที่เมนูด้านบน คลิก **Extensions (ส่วนขยาย) > Apps Script**
3. ลบโค้ดเดิมทิ้ง และ **คัดลอกโค้ดจากไฟล์ `apps-script/Code.gs`** ทั้งหมดไปวาง
4. บันทึก (กด `Ctrl+S` หรือสัญลักษณ์แผ่นดิสก์)
5. คลิกปุ่มสีน้ำเงินมุมขวาบน **Deploy > New deployment (การทำให้ใช้งานได้ใหม่)**
6. ตั้งค่าดังนี้:
   - **Select type**: Web app (เว็บแอปพลิเคชัน)
   - **Description**: API v1
   - **Execute as (ดำเนินการในฐานะ)**: Me (ฉัน)
   - **Who has access (ผู้มีสิทธิ์เข้าถึง)**: Anyone (ทุกคน)
7. คลิก **Deploy (ทำให้ใช้งานได้)**
8. ระบบอาจขออนุญาตเข้าถึงบัญชี ให้กด **Authorize access (ให้สิทธิ์การเข้าถึง)** > เลือกอีเมลของท่าน > **Advanced (ขั้นสูง)** > **Go to... (ไปที่...)**
9. เมื่อเสร็จสิ้น จะได้ **Web app URL** ให้นำ URL นี้ไปใช้ในขั้นตอนต่อไป

### ส่วนที่ 2: ตั้งค่า Web App

1. เปิดไฟล์ `js/config.js` ในโปรแกรมแก้ไขโค้ด (เช่น VS Code, Notepad)
2. นำ Web app URL ที่ได้จากขั้นตอนที่แล้ว มาใส่ในตัวแปร `APPS_SCRIPT_URL`
   ```javascript
   App.CONFIG = {
     // วาง URL ของท่านที่นี่
     APPS_SCRIPT_URL: 'https://script.google.com/macros/s/xxxxxxxxx/exec',
     ...
   };
   ```
3. บันทึกไฟล์

---

## 🌐 การนำขึ้นระบบ (Deployment)

ท่านสามารถใช้งานผ่านเครื่องตัวเองได้โดยตรง (เปิดไฟล์ `index.html`) หรือนำไปโฮสต์ออนไลน์ฟรีด้วย **GitHub Pages**:

1. สมัครใช้งาน [GitHub](https://github.com)
2. สร้าง Repository ใหม่ และอัพโหลดโฟลเดอร์โปรเจคนี้ทั้งหมดขึ้นไป
3. ไปที่แท็บ **Settings** ของ Repository
4. เมนูด้านซ้ายเลือก **Pages**
5. ส่วน **Build and deployment > Source** ให้เลือก `Deploy from a branch`
6. ส่วน **Branch** ให้เลือก `main` (หรือ `master`) แล้วกด **Save**
7. รอประมาณ 1-2 นาที ท่านจะได้รับ URL สำหรับเข้าใช้งานเว็บแอปพลิเคชันของท่าน เช่น `https://username.github.io/gis-wqi`

---

## 🛠️ โครงสร้างไฟล์ (File Structure)

```
GIS WQI/
├── index.html                 # หน้าหลัก SPA (Single Page Application)
├── css/
│   └── styles.css             # ไฟล์ CSS สำหรับตกแต่งหน้าตาเว็บไซต์
├── js/
│   ├── app.js                 # ระบบควบคุมหลัก (Tabs, Modals, Toasts)
│   ├── config.js              # ไฟล์ตั้งค่า URL และค่าเริ่มต้นต่างๆ
│   ├── api.js                 # จัดการการเชื่อมต่อ API ไปยัง Google Sheets
│   ├── wastewater-source.js   # โมดูลจัดการแหล่งกำเนิดน้ำเสีย (Tab 1)
│   ├── drainage-pipe.js       # โมดูลจัดการท่อระบายน้ำ (Tab 2)
│   ├── map-view.js            # โมดูลจัดการแผนที่ Interactive (Tab 3)
│   └── export.js              # โมดูลสร้างและดาวน์โหลดไฟล์ GeoJSON/CSV
└── apps-script/
    └── Code.gs                # โค้ดสำหรับทำ Google Apps Script
```

---
*ออกแบบและพัฒนาโดย AI Assistant*
