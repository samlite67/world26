import { SimulationState } from "../types";

// Use worker's state endpoint in production, local API in development
const getStateEndpoint = () => {
  const proxyUrl = (import.meta as any)?.env?.VITE_PROXY_URL;
  if (proxyUrl && proxyUrl.includes('workers.dev')) {
    // Extract base URL and add /state
    const baseUrl = proxyUrl.replace('/v1/chat/completions', '');
    return `${baseUrl}/state`;
  }
  return '/api/state';
};

const API_BASE = getStateEndpoint();
console.log('📍 State endpoint:', API_BASE);

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

