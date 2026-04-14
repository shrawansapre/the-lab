const _state = {};
const _listeners = {};

function subscribe(key, fn) {
  if (!_listeners[key]) _listeners[key] = [];
  _listeners[key].push(fn);
  return () => {
    _listeners[key] = _listeners[key].filter(l => l !== fn);
  };
}

function set(key, value) {
  _state[key] = value;
  (_listeners[key] || []).forEach(fn => fn(value, key));
  (_listeners['*'] || []).forEach(fn => fn(value, key));
}

function get(key) {
  return key !== undefined ? _state[key] : { ..._state };
}

function setMany(updates) {
  Object.entries(updates).forEach(([k, v]) => set(k, v));
}

export const AppState = { subscribe, set, get, setMany };
