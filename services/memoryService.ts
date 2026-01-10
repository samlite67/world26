import { SimulationState } from "../types";

const PROXY_URL = (import.meta as any)?.env?.VITE_PROXY_URL || '';

export async function saveSimulationState(state: SimulationState): Promise<void> {
  if (!PROXY_URL) return;
  try {
    await fetch(`${PROXY_URL}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
  } catch (err) {
    console.error("Failed to persist memory:", err);
  }
}

export async function loadSimulationState(): Promise<SimulationState | null> {
  if (!PROXY_URL) return null;
  try {
    const resp = await fetch(`${PROXY_URL}/state`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.state;
  } catch (err) {
    console.error("Failed to recall memory:", err);
    return null;
  }
}
