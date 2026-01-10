
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
    
    Return output as strictly valid JSON.
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

  try {
    const resp = await fetch('/api/mistral/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction,
        prompt,
        model: 'mistral-large-latest'
      })
    });
    if (!resp.ok) throw new Error(`Mistral proxy error: ${resp.status}`);
    const data = await resp.json();
    const parsed = JSON.parse((data.text || '').trim());
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
