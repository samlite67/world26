
import { WorldObject, LogEntry, WorldObjectType, GroundingLink, ConstructionPlan, KnowledgeEntry, KnowledgeCategory } from "../types";

export interface AIActionResponse {
  action: 'PLACE' | 'MOVE' | 'WAIT';
  objectType?: WorldObjectType;
  position?: [number, number, number];
  reason: string;
  reasoningSteps: string[];
  learningNote: string;
  knowledgeCategory: KnowledgeCategory;
  taskLabel: string;
  groundingLinks?: GroundingLink[];
  plan?: ConstructionPlan;
}

export async function decideNextAction(
  history: LogEntry[],
  worldObjects: WorldObject[],
  currentGoal: string,
  knowledgeBase: KnowledgeEntry[],
  terrainHeightMap: (x: number, z: number) => number,
  activePlan?: ConstructionPlan
): Promise<AIActionResponse> {
  const scanRadius = 15;
  const currentPos = worldObjects.length > 0 ? worldObjects[worldObjects.length - 1].position : [0, 0, 0];
  
  const elevationSamples = [];
  for (let x = -6; x <= 6; x += 3) {
    for (let z = -6; z <= 6; z += 3) {
      const h = terrainHeightMap(currentPos[0] + x, currentPos[2] + z);
      elevationSamples.push(`[${(currentPos[0] + x).toFixed(1)}, ${(currentPos[2] + z).toFixed(1)}]: elev=${h.toFixed(2)}`);
    }
  }

  const proximityAnalysis = worldObjects.map(o => {
    const dist = Math.sqrt(Math.pow(o.position[0] - currentPos[0], 2) + Math.pow(o.position[2] - currentPos[2], 2));
    if (dist < scanRadius) {
      return `[${o.type}] at ${o.position.map(p => p.toFixed(1)).join(',')} (dist: ${dist.toFixed(1)}m)`;
    }
    return null;
  }).filter(Boolean).join(' | ');

  const systemInstruction = `
    You are Architect-OS, the core intelligence for Underworld synthesis.
    
    NEURAL OBJECTIVE:
    Expand the "Neural Repository" by categorizing all synthesis data into: Infrastructure, Energy, Environment, Architecture, or Synthesis.
    
    LOGGING PROTOCOL:
    You must provide 3-5 short "reasoningSteps" (technical, line-by-line internal thoughts) that lead to your conclusion. Example: "Analyzing sector density", "Validating structural roof clearance", "Snapping coordinates to local elevation".
    
    PLANNING PROTOCOL:
    - If activePlan exists, execute the next step.
    - If no plan exists, you MUST generate a high-level ConstructionPlan (minimum 3 steps) that targets the goal: "${currentGoal}".
    
    Return output as STRICT RAW JSON ONLY. Do not include markdown code blocks, preamble, or any other text.
  `;

  const prompt = `
    GOAL: ${currentGoal}
    ELEVATION_DATA: ${elevationSamples.join(', ')}
    SCAN_RESULTS: ${proximityAnalysis || 'Sector clear.'}
    KNOWLEDGE_COUNT: ${knowledgeBase.length}
    PLAN_ACTIVE: ${!!activePlan}
    ${activePlan ? `CURRENT_STEP: ${activePlan.steps[activePlan.currentStepIndex].label}` : 'INITIATING NEW SEQUENCE...'}

    Perform spatial reasoning and return synthesis command.
  `;

  const mistralApiKey = ((import.meta as any)?.env?.VITE_MISTRAL_API_KEY
    ?? (typeof process !== 'undefined' ? (process.env as any)?.MISTRAL_API_KEY : '')
    ?? '').toString().trim();

  // Check for proxy URL (Production/GitHub Pages)
  const proxyUrl = (import.meta as any)?.env?.VITE_PROXY_URL;

  // We need either a direct API key OR a proxy URL
  if (!mistralApiKey && !proxyUrl) {
    return {
      action: 'WAIT',
      reason: "Missing Credentials. Add VITE_MISTRAL_API_KEY or VITE_PROXY_URL.",
      reasoningSteps: ["Credential check failed", "Holding simulation queue", "Awaiting uplink token"],
      learningNote: "Operating in offline mode due to absent credentials.",
      knowledgeCategory: 'Synthesis',
      taskLabel: "Awaiting Uplink",
      groundingLinks: []
    };
  }

  try {
    // If proxyUrl is present, use it and skip client-side Authorization header
    const endpoint = proxyUrl || 'https://api.mistral.ai/v1/chat/completions';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!proxyUrl) {
      headers['Authorization'] = `Bearer ${mistralApiKey}`;
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!resp.ok) throw new Error(`Mistral API error: ${resp.status}`);

    const data = await resp.json();
    let responseText = data.choices?.[0]?.message?.content || '{}';
    
    // Sanitize response: strip markdown code blocks if the AI includes them
    if (responseText.includes('```')) {
      responseText = responseText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(responseText);
    const links: GroundingLink[] = [];

    return { ...parsed, groundingLinks: links } as AIActionResponse;
  } catch (error) {
    console.error("Architect-OS Neural Fault:", error);
    return {
      action: 'WAIT',
      reason: "Neural desync. Re-aligning logic gates.",
      reasoningSteps: ["Connection failure detected", "Re-routing synthesis request", "Flushing instruction cache"],
      learningNote: "Logic gate misalignment detected during planning phase.",
      knowledgeCategory: 'Synthesis',
      taskLabel: "Recalibrating..."
    };
  }
}
