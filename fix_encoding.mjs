// fix_encoding.mjs - Fix triple-encoded UTF-8 mojibake in TestLab.tsx
import { readFileSync, writeFileSync } from 'fs';

const INPUT = 'src/pages/TestLab.tsx';

function fixMojibake(text, maxPasses = 5) {
  for (let i = 0; i < maxPasses; i++) {
    let candidate;
    try {
      // Re-encode as Latin-1 bytes, then decode as UTF-8
      // This reverses one level of double-encoding
      const bytes = Buffer.from(text, 'latin1');
      candidate = bytes.toString('utf8');
    } catch (e) {
      console.log(`  Pass ${i + 1} failed: ${e.message}`);
      break;
    }
    if (candidate === text) {
      console.log(`  Stable after ${i} passes.`);
      break;
    }
    console.log(`  Pass ${i + 1} applied (changed ${[...text].length - [...candidate].length} chars equivalent)`);
    text = candidate;
  }
  return text;
}

// Read as raw bytes
const rawBytes = readFileSync(INPUT);

// Strip BOM if present
const hasBom = rawBytes[0] === 0xEF && rawBytes[1] === 0xBB && rawBytes[2] === 0xBF;
const bytes = hasBom ? rawBytes.slice(3) : rawBytes;

// Decode as UTF-8 (how the OS stored it)
const text = bytes.toString('utf8');

console.log(`Original: ${text.length} chars, ${rawBytes.length} bytes`);

// Show sample of line 18 (the problematic area)
const lines = text.split('\n');
console.log('\nSample BEFORE fix (lines 17-21):');
lines.slice(16, 21).forEach((l, i) => console.log(`  L${i + 17}: ${l.slice(0, 100)}`));

console.log('\nApplying iterative fix...');
const fixed = fixMojibake(text);

console.log('\nSample AFTER fix (lines 17-21):');
const fixedLines = fixed.split('\n');
fixedLines.slice(16, 21).forEach((l, i) => console.log(`  L${i + 17}: ${l.slice(0, 100)}`));

// Check mojibake
const hasMojibake = /Ã|Ã†|â€™|ÃƒÂ/.test(fixed);
console.log(`\nMojibake still present: ${hasMojibake}`);

// Write back as UTF-8 (no BOM - Vite/TSC prefer no BOM)
writeFileSync(INPUT, Buffer.from(fixed, 'utf8'));
console.log(`\n✓ Written to ${INPUT}`);
