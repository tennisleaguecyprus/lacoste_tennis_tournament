/**
 * LagosteCloud — pull from Supabase (anon), push via Netlify function (password).
 */
(function (global) {
  var KEYS = {
    players: 'lagoste_tennis_players',
    matches: 'lagoste_group_matches',
    tiebreak: 'lagoste_third_tiebreak',
  };
  var SESSION_PW = 'lagoste_cloud_admin_pw';
  var DEBOUNCE_MS = 1800;

  function cfg() {
    return global.LAGOSTE_CLOUD || {};
  }

  function cloudEnabled() {
    var c = cfg();
    return !!(c.enabled && c.supabaseUrl && c.supabaseAnonKey);
  }

  function restHeaders(anonKey) {
    return {
      apikey: anonKey,
      Authorization: 'Bearer ' + anonKey,
    };
  }

  function getSaveUrl() {
    var c = cfg();
    if (c.saveTournamentUrl) return c.saveTournamentUrl;
    var path = c.saveFunctionPath || '/.netlify/functions/save-tournament';
    if (path.indexOf('http') === 0) return path;
    return path;
  }

  function applyRowToLocalStorage(row) {
    if (!row) return false;
    var changed = false;
    if (row.players != null) {
      var ps =
        typeof row.players === 'string' ? row.players : JSON.stringify(row.players);
      if (localStorage.getItem(KEYS.players) !== ps) {
        localStorage.setItem(KEYS.players, ps);
        changed = true;
      }
    }
    if (row.group_matches != null) {
      var ms =
        typeof row.group_matches === 'string'
          ? row.group_matches
          : JSON.stringify(row.group_matches);
      if (localStorage.getItem(KEYS.matches) !== ms) {
        localStorage.setItem(KEYS.matches, ms);
        changed = true;
      }
    }
    if (row.third_tiebreak != null) {
      var ts =
        typeof row.third_tiebreak === 'string'
          ? row.third_tiebreak
          : JSON.stringify(row.third_tiebreak);
      if (localStorage.getItem(KEYS.tiebreak) !== ts) {
        localStorage.setItem(KEYS.tiebreak, ts);
        changed = true;
      }
    }
    return changed;
  }

  function pullFromCloud() {
    if (!cloudEnabled()) return Promise.resolve(false);
    var c = cfg();
    var url =
      c.supabaseUrl.replace(/\/$/, '') +
      '/rest/v1/tournament_state?select=players,group_matches,third_tiebreak,updated_at&id=eq.singleton';
    return fetch(url, { headers: restHeaders(c.supabaseAnonKey) })
      .then(function (r) {
        if (!r.ok) return false;
        return r.json();
      })
      .then(function (rows) {
        if (!rows || !rows.length) return false;
        var row = rows[0];
        var changed = applyRowToLocalStorage(row);
        if (changed) {
          try {
            global.dispatchEvent(new CustomEvent('lagoste-cloud-updated'));
          } catch (e) {}
        }
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function getAdminPassword() {
    try {
      return sessionStorage.getItem(SESSION_PW) || '';
    } catch (e) {
      return '';
    }
  }

  function setAdminPassword(pw) {
    try {
      if (pw) sessionStorage.setItem(SESSION_PW, pw);
      else sessionStorage.removeItem(SESSION_PW);
    } catch (e) {}
  }

  function getLocalPayloadObjects() {
    var players = {};
    var group_matches = {};
    var third_tiebreak = {};
    try {
      var p = localStorage.getItem(KEYS.players);
      if (p) players = JSON.parse(p);
    } catch (e) {}
    try {
      var m = localStorage.getItem(KEYS.matches);
      if (m) group_matches = JSON.parse(m);
    } catch (e) {}
    try {
      var t = localStorage.getItem(KEYS.tiebreak);
      if (t) third_tiebreak = JSON.parse(t);
    } catch (e) {}
    return {
      players: players,
      group_matches: group_matches,
      third_tiebreak: third_tiebreak,
    };
  }

  function pushToCloud(adminPassword) {
    if (!cloudEnabled()) {
      return Promise.resolve({ ok: false, error: 'Cloud disabled' });
    }
    var pw = adminPassword != null ? adminPassword : getAdminPassword();
    if (!pw) {
      return Promise.resolve({ ok: false, error: 'No admin password' });
    }
    var payload = getLocalPayloadObjects();
    return fetch(getSaveUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminPassword: pw,
        players: payload.players,
        group_matches: payload.group_matches,
        third_tiebreak: payload.third_tiebreak,
      }),
    })
      .then(function (r) {
        if (r.status === 204 || r.ok) return { ok: true };
        return r.json().then(
          function (j) {
            var msg = j.error || r.statusText;
            if (j.detail) msg += ': ' + j.detail;
            if (j.hint) msg += ' — ' + j.hint;
            return { ok: false, error: msg, raw: j };
          },
          function () {
            return { ok: false, error: r.statusText };
          }
        );
      })
      .catch(function (err) {
        return { ok: false, error: err.message || 'Network error' };
      });
  }

  var debounceTimer = null;
  function schedulePush(passwordGetter) {
    if (!cloudEnabled()) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      var pw =
        typeof passwordGetter === 'function' ? passwordGetter() : getAdminPassword();
      if (!pw) return;
      pushToCloud(pw).then(function (res) {
        try {
          global.dispatchEvent(
            new CustomEvent('lagoste-cloud-push', { detail: res })
          );
        } catch (e) {}
      });
    }, DEBOUNCE_MS);
  }

  var pollId = null;
  function startPolling(onUpdate, intervalMs) {
    if (!cloudEnabled()) return;
    var ms = intervalMs || 10000;
    stopPolling();
    pollId = setInterval(function () {
      pullFromCloud().then(function () {
        if (onUpdate) onUpdate();
      });
    }, ms);
  }

  function stopPolling() {
    if (pollId != null) {
      clearInterval(pollId);
      pollId = null;
    }
  }

  global.LagosteCloud = {
    cloudEnabled: cloudEnabled,
    pullFromCloud: pullFromCloud,
    pushToCloud: pushToCloud,
    schedulePush: schedulePush,
    getAdminPassword: getAdminPassword,
    setAdminPassword: setAdminPassword,
    startPolling: startPolling,
    stopPolling: stopPolling,
    KEYS: KEYS,
  };
})(window);
