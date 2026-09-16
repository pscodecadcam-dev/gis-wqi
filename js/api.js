/**
 * GIS WQI - API Client
 * จัดการการเรียก Google Apps Script REST API
 */
App.API = (function () {
  const getUrl = () => App.CONFIG.APPS_SCRIPT_URL;

  /**
   * GET request
   */
  async function get(action) {
    const url = `${getUrl()}?action=${action}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error: ' + response.status);
    return await response.json();
  }

  /**
   * POST request
   */
  async function post(body) {
    const response = await fetch(getUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Network error: ' + response.status);
    return await response.json();
  }

  // ========================================
  // Wastewater Sources
  // ========================================
  async function fetchSources() {
    return await get('getSources');
  }

  async function getNextSourceId() {
    return await get('getNextSourceId');
  }

  async function addSource(payload) {
    return await post({ action: 'addSource', payload });
  }

  async function updateSource(id, payload) {
    return await post({ action: 'updateSource', id, payload });
  }

  async function deleteSource(id) {
    return await post({ action: 'deleteSource', id });
  }

  // ========================================
  // Drainage Pipes
  // ========================================
  async function fetchPipes() {
    return await get('getPipes');
  }

  async function getNextPipeId() {
    return await get('getNextPipeId');
  }

  async function addPipe(payload) {
    return await post({ action: 'addPipe', payload });
  }

  async function updatePipe(id, payload) {
    return await post({ action: 'updatePipe', id, payload });
  }

  async function deletePipe(id) {
    return await post({ action: 'deletePipe', id });
  }

  return {
    fetchSources, getNextSourceId, addSource, updateSource, deleteSource,
    fetchPipes, getNextPipeId, addPipe, updatePipe, deletePipe
  };
})();
