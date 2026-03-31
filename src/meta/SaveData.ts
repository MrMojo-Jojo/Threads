const SAVE_KEY = 'thread_save';

export interface SaveState {
  silk: number;
  upgrades: Record<string, number>;
  bestHeight: number;
  totalRuns: number;
}

function defaultSave(): SaveState {
  return {
    silk: 0,
    upgrades: {},
    bestHeight: 0,
    totalRuns: 0,
  };
}

export function loadSave(): SaveState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return { ...defaultSave(), ...JSON.parse(raw) };
    }
  } catch {
    // corrupted save, reset
  }
  return defaultSave();
}

export function saveSave(state: SaveState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}
