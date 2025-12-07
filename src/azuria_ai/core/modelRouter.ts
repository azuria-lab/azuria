export function selectModelForTask(task: string) {
  if (task === 'reasoning.long') return { model: 'llama-3.1-70b', engine: 'nim' };
  if (task === 'safety') return { model: 'nemotron-safety-guard', engine: 'nim' };
  if (task === 'truth') return { model: 'truth-ensemble-v1', engine: 'nim' };
  if (task === 'vision') return { model: 'nemotron-nano-12b-v2-vision', engine: 'nim' };

  return { model: 'llama-3.1-70b', engine: 'nim' };
}

