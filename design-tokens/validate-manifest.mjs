#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'manifest.json'), 'utf8'),
);

let total = 0;
const summary = [];

for (const coll of manifest.collections) {
  const count = coll.variables.length;
  total += count;
  summary.push({ collection: coll.name, mode: coll.mode, count });
}

const expected = { collections: 4, variables: 100, textStyles: 4 };
const ok = summary.length === expected.collections && total === expected.variables;

console.log(JSON.stringify({ summary, totalVariables: total, textStyles: manifest.textStyles.length, ok }, null, 2));
if (!ok) process.exit(1);
