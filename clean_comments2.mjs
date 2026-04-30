// clean_comments2.mjs
// More aggressive cleanup: strip everything outside printable ASCII + valid accented chars
// Only COMMENTS and LOG STRINGS have garbage - TypeScript code is ASCII-clean.
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/pages/TestLab.tsx';
let src = readFileSync(FILE, 'utf8');

// Strategy: process line by line.
// For each line, find the comment position (// not inside a string)
// and sanitize only the comment portion.
// For log() strings, the log() function already calls normalizeDisplayText() at runtime,
// so we just need the source to compile. We can replace garbage log strings with
// their sanitized ASCII-only equivalents.

const lines = src.split('\n');
const cleaned = lines.map(line => {
  // Remove any character that is:
  // - a control character (0x00–0x1F except 0x09 tab)
  // - a private-use or unassigned Unicode above U+017E (Latin Extended-B end)
  //   that is NOT a common emoji or arrow
  // We allow: ASCII printable (0x20–0x7E), plus Portuguese accents (0xC0–0x017E range useful chars)
  // But since the corruption produces garbage sequences, we strip anything >= 0x80 that 
  // appears in patterns of 3+ consecutive non-ASCII chars (the mojibake signature).

  // First: strip raw control chars (always safe)
  let result = line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Second: replace runs of 2+ consecutive non-ASCII chars that look like mojibake
  // (sequences of chars in 0x80-0xBF range mixed with others - typical UTF-8 mojibake)
  // Pattern: any mix of chars 0x80–0xFF that doesn't look like valid Portuguese words
  // Simple heuristic: if we have 3+ consecutive non-ASCII chars, replace with ''
  result = result.replace(/[^\x00-\x7E\xA0-\xFF]{3,}/g, '');

  // Third: clean up remaining isolated high-byte garbage (0x80-0x9F = Windows-1252 ctrl)
  result = result.replace(/[\x80-\x9F]/g, '');

  return result;
});

const out = cleaned.join('\n');
const lineCount = out.split('\n').length;
console.log(`Lines: ${lineCount}`);
console.log('Sample L18:', out.split('\n')[17].slice(0, 100));
console.log('Sample L25:', out.split('\n')[24].slice(0, 100));

// Verify key code lines are intact
const sample = out.split('\n');
const importsOk = sample[0].includes('import React');
const interfaceOk = sample[7].includes('interface TestUnit');
console.log(`Imports OK: ${importsOk}, Interface OK: ${interfaceOk}`);

writeFileSync(FILE, out, 'utf8');
console.log('Written.');
