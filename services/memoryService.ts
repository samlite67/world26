import { SimulationState } from "../types";

import { SimulationState } from "../types";

// Using relative path to utilize Vite's dev server proxy to port 3001
const API_BASE = "/api/state";

export async function saveSimulationState(state: SimulationState): Promise<void> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }
  } catch (err) {
    console.error("Failed to persist memory:", err);
  }
}

export async function loadSimulationState(): Promise<SimulationState | null> {
  try {
    const resp = await fetch(API_BASE);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.state;
  } catch (err) {
    console.error("Failed to recall memory:", err);
    return null;
  }
}

