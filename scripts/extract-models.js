#!/usr/bin/env node
const data = require('../models.json');

const filters = {
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini'],
  google: ['gemini-2.5-pro', 'gemini-2.5-flash'],
};

const results = [];

for (const [providerId, provider] of Object.entries(data)) {
  if (!provider.models) continue;
  for (const [modelId, model] of Object.entries(provider.models)) {
    for (const [filterProvider, filterModels] of Object.entries(filters)) {
      const match = filterModels.some(f => modelId.toLowerCase().includes(f.toLowerCase()));
      if (match) {
        results.push({
          provider: provider.name || providerId,
          model: model.name || modelId,
          id: modelId,
          input: model.cost?.input ?? '?',
          output: model.cost?.output ?? '?',
          cache_read: model.cost?.cache_read ?? '-',
          context: model.limit?.context ?? '?',
          reasoning: model.reasoning ?? false,
          tool_call: model.tool_call ?? false,
        });
      }
    }
  }
}

// Dedupe by model id (pick first-party provider when available)
const seen = new Map();
for (const r of results) {
  const key = r.id;
  if (!seen.has(key)) {
    seen.set(key, r);
  }
}

const unique = [...seen.values()].sort((a, b) => a.input - b.input);

console.log('\nModel Pricing ($ per 1M tokens)\n');
console.log(
  'Provider'.padEnd(14) +
  'Model'.padEnd(28) +
  'Input'.padStart(8) +
  'Output'.padStart(8) +
  'Cache'.padStart(8) +
  'Context'.padStart(10) +
  '  Flags'
);
console.log('-'.repeat(90));

for (const r of unique) {
  const flags = [r.reasoning ? 'reason' : '', r.tool_call ? 'tools' : ''].filter(Boolean).join(', ');
  console.log(
    r.provider.padEnd(14) +
    r.model.padEnd(28) +
    `$${r.input}`.padStart(8) +
    `$${r.output}`.padStart(8) +
    `${r.cache_read === '-' ? '-' : '$' + r.cache_read}`.padStart(8) +
    `${r.context}`.padStart(10) +
    `  ${flags}`
  );
}
