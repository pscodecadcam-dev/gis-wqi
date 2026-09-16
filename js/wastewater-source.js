/**
 * GIS WQI - Wastewater Source Module
 */
App.Sources = (function() {
  
  async function init() {
    bindEvents();
    await loadData();
  }

  function bindEvents() {
    // Form submit
    document.getElementById('source-form').addEventListener('submit', handleSave);
    
    // Clear form
    document.getElementById('btn-clear-source').addEventListener('click', resetForm);
    
    // Refresh button
    document.getElementById('btn-refresh-sources').addEventListener('click', loadData);
    
    // Cancel Edit
    document.getElementById('btn-cancel-source-edit').addEventListener('click', resetForm);
    
    // Map Pick Button
    document.getElementById('btn-pick-source-loc').addEventListener('click', () => {
      const lat = document.getElementById('ws-lat').value;
      const lng = document.getElementById('ws-lng').value;
      App.UI.openMapPicker(lat, lng, (newLat, newLng) => {
        document.getElementById('ws-lat').value = newLat;
        document.getElementById('ws-lng').value = newLng;
      });
    });
  }

  async function loadData() {
    App.UI.showLoading();
    try {
      const res = await App.API.fetchSources();
      App.State.sources = res.data || [];
      renderTable();
      await fetchNextId();
      if(App.Map) App.Map.refreshSources();
    } catch (error) {
      App.UI.showToast('ไม่สามารถโหลดข้อมูลแหล่งกำเนิดได้: ' + error.message, 'error');
    } finally {
      App.UI.hideLoading();
    }
  }

  async function fetchNextId() {
    if (document.getElementById('ws-edit-mode').value !== '') return;
    try {
      const res = await App.API.getNextSourceId();
      document.getElementById('ws-id').value = res.id;
    } catch (error) {
      console.error('Fetch next ID error:', error);
    }
  }

  function renderTable() {
    const tbody = document.getElementById('source-tbody');
    const countEl = document.getElementById('source-count');
    
    countEl.textContent = `(${App.State.sources.length} รายการ)`;
    
    if (App.State.sources.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-400 py-8">ไม่พบข้อมูล</td></tr>';
      return;
    }

    tbody.innerHTML = App.State.sources.map(s => {
      const color = App.CONFIG.MARKER_COLORS[s.ws_type] || '#6B7280';
      return `
        <tr>
          <td class="font-medium">${s.ws_id}</td>
          <td>
            <span class="type-badge text-white" style="background-color: ${color}">
              ${s.ws_type_name}
            </span>
          </td>
          <td>${parseFloat(s.latitude).toFixed(6)}</td>
          <td>${parseFloat(s.longitude).toFixed(6)}</td>
          <td>${s.pop_num}</td>
          <td>${s.ww_q}</td>
          <td class="text-xs text-gray-500">${new Date(s.created_at).toLocaleDateString('th-TH')}</td>
          <td class="text-center space-x-1">
            <button class="btn-edit" onclick="App.Sources.edit('${s.ws_id}')" title="แก้ไข">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete" onclick="App.Sources.remove('${s.ws_id}')" title="ลบ">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    lucide.createIcons();
  }

  async function handleSave(e) {
    e.preventDefault();
    
    const id = document.getElementById('ws-id').value;
    const isEdit = document.getElementById('ws-edit-mode').value === 'true';
    
    const payload = {
      ws_type: parseInt(document.getElementById('ws-type').value),
      latitude: parseFloat(document.getElementById('ws-lat').value),
      longitude: parseFloat(document.getElementById('ws-lng').value),
      pop_num: parseInt(document.getElementById('ws-pop').value),
      ww_q: parseFloat(document.getElementById('ws-wwq').value)
    };

    App.UI.showLoading();
    try {
      if (isEdit) {
        await App.API.updateSource(id, payload);
        App.UI.showToast('แก้ไขข้อมูลสำเร็จ', 'success');
      } else {
        await App.API.addSource(payload);
        App.UI.showToast('เพิ่มข้อมูลสำเร็จ', 'success');
      }
      resetForm();
      await loadData();
    } catch (error) {
      App.UI.showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      App.UI.hideLoading();
    }
  }

  function edit(id) {
    const item = App.State.sources.find(s => String(s.ws_id) === String(id));
    if (!item) return;

    document.getElementById('ws-id').value = item.ws_id;
    document.getElementById('ws-type').value = item.ws_type;
    document.getElementById('ws-lat').value = item.latitude;
    document.getElementById('ws-lng').value = item.longitude;
    document.getElementById('ws-pop').value = item.pop_num;
    document.getElementById('ws-wwq').value = item.ww_q;
    
    document.getElementById('ws-edit-mode').value = 'true';
    document.getElementById('source-form-title').textContent = 'แก้ไขข้อมูลแหล่งกำเนิดน้ำเสีย: ' + id;
    document.getElementById('btn-cancel-source-edit').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function remove(id) {
    App.UI.showConfirm(`ยืนยันการลบข้อมูลรหัส ${id} ใช่หรือไม่?`, async () => {
      App.UI.showLoading();
      try {
        await App.API.deleteSource(id);
        App.UI.showToast('ลบข้อมูลสำเร็จ', 'success');
        await loadData();
      } catch (error) {
        App.UI.showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
      } finally {
        App.UI.hideLoading();
      }
    });
  }

  function resetForm() {
    document.getElementById('source-form').reset();
    document.getElementById('ws-edit-mode').value = '';
    document.getElementById('source-form-title').textContent = 'เพิ่มข้อมูลแหล่งกำเนิดน้ำเสีย';
    document.getElementById('btn-cancel-source-edit').classList.add('hidden');
    fetchNextId();
  }

  return { init, edit, remove, loadData };
})();
