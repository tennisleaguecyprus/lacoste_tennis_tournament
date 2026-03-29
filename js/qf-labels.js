/**
 * Quarter-final display names (per category, 8 slots = 4 matches × 2 players).
 * Stored locally and mirrored into lagoste_group_matches for cloud sync.
 */
(function (global) {
  var KEY = 'lagoste_qf_labels';
  var MATCHES_KEY = 'lagoste_group_matches';
  var CLOUD_NODE = '__qf_labels__';

  function defaults() {
    var a = [];
    for (var i = 0; i < 8; i++) a.push('Pending');
    return a;
  }

  function getAllFromLocal() {
    try {
      var s = localStorage.getItem(KEY);
      return s ? JSON.parse(s) : {};
    } catch (e) {
      return {};
    }
  }

  function getAllFromMatchesStore() {
    try {
      var s = localStorage.getItem(MATCHES_KEY);
      if (!s) return {};
      var data = JSON.parse(s);
      var node = data && data[CLOUD_NODE];
      return node && typeof node === 'object' ? node : {};
    } catch (e) {
      return {};
    }
  }

  function getAll() {
    // Prefer the cloud-backed store when present so public viewers see admin edits.
    var fromCloud = getAllFromMatchesStore();
    if (fromCloud && Object.keys(fromCloud).length) return fromCloud;
    return getAllFromLocal();
  }

  function getLabels(category) {
    var all = getAll();
    var arr = all[category];
    if (!Array.isArray(arr) || arr.length < 8) return defaults();
    var out = [];
    for (var i = 0; i < 8; i++) {
      var t = arr[i] != null && String(arr[i]).trim() !== '' ? String(arr[i]).trim() : 'Pending';
      out.push(t);
    }
    return out;
  }

  function setLabels(category, arr8) {
    var all = getAll();
    var next = [];
    for (var i = 0; i < 8; i++) {
      var t = arr8[i] != null && String(arr8[i]).trim() !== '' ? String(arr8[i]).trim() : 'Pending';
      next.push(t);
    }
    all[category] = next;
    localStorage.setItem(KEY, JSON.stringify(all));

    // Mirror into group_matches payload so LagosteCloud push/pull propagates it.
    try {
      var s = localStorage.getItem(MATCHES_KEY);
      var data = s ? JSON.parse(s) : {};
      if (!data || typeof data !== 'object') data = {};
      if (!data[CLOUD_NODE] || typeof data[CLOUD_NODE] !== 'object') data[CLOUD_NODE] = {};
      data[CLOUD_NODE][category] = next;
      localStorage.setItem(MATCHES_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  global.LagosteQfLabels = {
    KEY: KEY,
    getLabels: getLabels,
    setLabels: setLabels,
    defaults: defaults,
  };
})(window);
