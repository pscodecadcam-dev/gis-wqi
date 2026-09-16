/**
 * GIS WQI - Drainage Pipe Module
 */
App.Pipes = (function() {
  
  async function init() {
    bindEvents();
    await loadData();
  }

  function bindEvents() {
    // Form submit
    document.getElementById('pipe-form').addEventListener('submit', handleSave);
    
    // Clear form
    document.getElementById('btn-clear-pipe').addEventListener('click', resetForm);
    
    // Refresh button
    document.getElementById('btn-refresh-pipes').addEventListener('click', loadData);
    
    // Cancel Edit
    document.getElementById('btn-cancel-pipe-edit').addEventListener('click', resetForm);
    
    // Map Pick Button
    document.getElementById('btn-pick-pipe-loc').addEventListener('click', () => {
      const lat = document.getElementById('wd-lat').value;
      const lng = document.getElementById('wd-lng').value;
      App.UI.openMapPicker(lat, lng, (newLat, newLng) => {
        document.getElementById('wd-lat').value = newLat;
        document.getElementById('wd-lng').value = newLng;
      });
    });
  }

  async function loadData() {
    App.UI.showLoading();
    try {
      const res = await App.API.fetchPipes();
      App.State.pipes = res.data || [];
      renderTable();
      await fetchNextId();
      if(App.Map) App.Map.refreshPipes();
    } catch (error) {
      App.UI.showToast('ไม่สามารถโหลดข้อมูลท่อระบายน้ำได้: ' + error.message, 'error');
    } finally {
      App.UI.hideLoading();
    }
  }

  async function fetchNextId() {
    if (document.getElementById('wd-edit-mode').value !== '') return;
    try {
      const res = await App.API.getNextPipeId();
      document.getElementById('wd-id').value = res.id;
    } catch (error) {
      console.error('Fetch next ID error:', error);
    }
  }

  function renderTable() {
    const tbody = document.getElementById('pipe-tbody');
    const countEl = document.getElementById('pipe-count');
    
    countEl.textContent = `(${App.State.pipes.length} รายการ)`;
    
    if (App.State.pipes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-400 py-8">ไม่พบข้อมูล</td></tr>';
      return;
    }

    tbody.innerHTML = App.State.pipes.map(p => {
      return `
        <tr>
          <td class="font-medium text-amber-700">${p.wd_id}</td>
          <td>${parseFloat(p.latitude).toFixed(6)}</td>
          <td>${parseFloat(p.longitude).toFixed(6)}</td>
          <td>${p.pip_area}</td>
          <td>${p.wd_distance}</td>
          <td>${p.ww_qav}</td>
          <td class="text-xs text-gray-500">${new Date(p.created_at).toLocaleDateString('th-TH')}</td>
          <td class="text-center space-x-1">
            <button class="btn-edit" onclick="App.Pipes.edit('${p.wd_id}')" title="แก้ไข">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete" onclick="App.Pipes.remove('${p.wd_id}')" title="ลบ">
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
    
    const id = document.getElementById('wd-id').value;
    const isEdit = document.getElementById('wd-edit-mode').value === 'true';
    
    const payload = {
      latitude: parseFloat(document.getElementById('wd-lat').value),
      longitude: parseFloat(document.getElementById('wd-lng').value),
      pip_area: parseFloat(document.getElementById('wd-area').value),
      wd_distance: parseFloat(document.getElementById('wd-distance').value),
      ww_qav: parseFloat(document.getElementById('wd-qav').value)
    };

    App.UI.showLoading();
    try {
      if (isEdit) {
        await App.API.updatePipe(id, payload);
        App.UI.showToast('แก้ไขข้อมูลสำเร็จ', 'success');
      } else {
        await App.API.addPipe(payload);
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
    const item = App.State.pipes.find(p => String(p.wd_id) === String(id));
    if (!item) return;

    document.getElementById('wd-id').value = item.wd_id;
    document.getElementById('wd-lat').value = item.latitude;
    document.getElementById('wd-lng').value = item.longitude;
    document.getElementById('wd-area').value = item.pip_area;
    document.getElementById('wd-distance').value = item.wd_distance;
    document.getElementById('wd-qav').value = item.ww_qav;
    
    document.getElementById('wd-edit-mode').value = 'true';
    document.getElementById('pipe-form-title').textContent = 'แก้ไขข้อมูลท่อระบายน้ำ: ' + id;
    document.getElementById('btn-cancel-pipe-edit').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function remove(id) {
    App.UI.showConfirm(`ยืนยันการลบข้อมูลรหัส ${id} ใช่หรือไม่?`, async () => {
      App.UI.showLoading();
      try {
        await App.API.deletePipe(id);
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
    document.getElementById('pipe-form').reset();
    document.getElementById('wd-edit-mode').value = '';
    document.getElementById('pipe-form-title').textContent = 'เพิ่มข้อมูลท่อระบายน้ำ';
    document.getElementById('btn-cancel-pipe-edit').classList.add('hidden');
    fetchNextId();
  }

  return { init, edit, remove, loadData };
})();
