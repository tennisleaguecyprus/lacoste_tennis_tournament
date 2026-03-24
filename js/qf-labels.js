/**
 * Quarter-final display names (per category, 8 slots = 4 matches × 2 players).
 * Browser localStorage only (not synced to Supabase).
 */
(function (global) {
  var KEY = 'lagoste_qf_labels';

  function defaults() {
    var a = [];
    for (var i = 0; i < 8; i++) a.push('Pending');
    return a;
  }

  function getAll() {
    try {
      var s = localStorage.getItem(KEY);
      return s ? JSON.parse(s) : {};
    } catch (e) {
      return {};
    }
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
  }

  global.LagosteQfLabels = {
    KEY: KEY,
    getLabels: getLabels,
    setLabels: setLabels,
    defaults: defaults,
  };
})(window);
