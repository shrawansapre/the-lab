import { Events } from './events.js';

const STORAGE_KEY = 'the-lab:progress';

let _progress = {};

export function initProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    _progress = stored ? JSON.parse(stored) : {};
  } catch {
    _progress = {};
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
  } catch {
    // storage quota exceeded — proceed silently
  }
}

export function markVisited(moduleId) {
  if (!_progress[moduleId]) _progress[moduleId] = {};
  _progress[moduleId].visited = true;
  _progress[moduleId].lastVisited = Date.now();
  save();
  Events.emit('progress:changed', { moduleId, state: _progress[moduleId] });
}

export function markCompleted(moduleId) {
  if (!_progress[moduleId]) _progress[moduleId] = {};
  _progress[moduleId].completed = true;
  _progress[moduleId].completedAt = Date.now();
  save();
  Events.emit('progress:changed', { moduleId, state: _progress[moduleId] });
}

export function getModuleProgress(moduleId) {
  return _progress[moduleId] || {};
}

export function getAllProgress() {
  return { ..._progress };
}

export function resetAll() {
  _progress = {};
  save();
  Events.emit('progress:reset', {});
}
