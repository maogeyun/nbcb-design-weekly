#!/usr/bin/env node
/**
 * Generate Tokens Studio JSON from manifest.json for manual Figma import.
 * Usage: node design-tokens/generate-tokens-studio.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dir, 'manifest.json'), 'utf8'));

const out = {};

for (const coll of manifest.collections) {
  const setKey = `${coll.name}/${coll.mode}`;
  out[setKey] = {};

  for (const v of coll.variables) {
    const parts = v.name.split('/');
    let cursor = out[setKey];
    for (let i = 0; i < parts.length - 1; i++) {
      cursor[parts[i]] = cursor[parts[i]] ?? {};
      cursor = cursor[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    if (v.alias) {
      const aliasParts = v.alias.split('/');
      cursor[leaf] = {
        $value: `{${aliasParts.join('.')}}`,
        $type: v.type === 'COLOR' ? 'color' : v.type === 'FLOAT' ? 'dimension' : 'text',
      };
    } else if (v.type === 'COLOR') {
      cursor[leaf] = { $value: v.value, $type: 'color' };
    } else if (v.type === 'FLOAT') {
      cursor[leaf] = { $value: `${v.value}px`, $type: 'dimension' };
    } else {
      cursor[leaf] = { $value: v.value, $type: 'text' };
    }
  }
}

out.$metadata = {
  tokenSetOrder: manifest.collections.map((c) => `${c.name}/${c.mode}`),
};

writeFileSync(join(__dir, 'tokens-studio.json'), JSON.stringify(out, null, 2));
console.log('Wrote tokens-studio.json');
