const _handlers = {};

function on(event, fn) {
  if (!_handlers[event]) _handlers[event] = [];
  _handlers[event].push(fn);
  return () => off(event, fn);
}

function off(event, fn) {
  if (!_handlers[event]) return;
  _handlers[event] = _handlers[event].filter(h => h !== fn);
}

function emit(event, data) {
  (_handlers[event] || []).forEach(fn => fn(data));
  (_handlers['*'] || []).forEach(fn => fn(data, event));
}

function once(event, fn) {
  const unsub = on(event, (data) => {
    fn(data);
    unsub();
  });
  return unsub;
}

export const Events = { on, off, emit, once };
