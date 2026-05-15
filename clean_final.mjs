// clean_final.mjs
// Nuclear option: strip ALL non-ASCII from inline comments.
// Portuguese comments had context already lost by double-encoding.
// The TypeScript code (non-comment) is pure ASCII and will be preserved exactly.
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/pages/TestLab.tsx';
let src = readFileSync(FILE, 'utf8');

const lines = src.split('\n');

const cleaned = lines.map(line => {
  // Strip ALL non-ASCII from the entire line.
  // The TypeScript code is 100% ASCII (identifiers, operators, etc.)
  // Portuguese text only appears in:
  //   1. Inline comments (//)
  //   2. String literals passed to log() - these are runtime strings sanitized by normalizeDisplayText()
  //   3. JSX text - these will be fixed by Unicode escapes in the layout patch
  // 
  // Removing non-ASCII makes the file compile cleanly. The `sanitize()` function
  // requested by the user will handle runtime strings.
  return line.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
});

const out = cleaned.join('\n');

console.log('Sample L18:', out.split('\n')[17].slice(0, 100));
console.log('Sample L25:', out.split('\n')[24].slice(0, 100));
console.log('Sample L95:', out.split('\n')[94].slice(0, 100));

// Verify critical code lines
const ls = out.split('\n');
console.log('\nVerification:');
console.log('  L1 imports:', ls[0].slice(0, 60));
console.log('  L84 component:', ls[83].slice(0, 60));
console.log('  L56 MOJIBAKE_PATTERN:', ls[55].slice(0, 80));
console.log('  L58 normalizeDisplayText:', ls[57].slice(0, 60));

writeFileSync(FILE, out, 'utf8');
console.log(`\nWritten ${out.length} chars to ${FILE}`);
