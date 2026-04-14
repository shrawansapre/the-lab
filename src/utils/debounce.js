export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}

export function rafThrottle(fn) {
  let queued = false;
  return (...args) => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        fn(...args);
        queued = false;
      });
    }
  };
}
