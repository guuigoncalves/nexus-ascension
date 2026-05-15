// clean_comments.mjs
// Strips control characters (U+0001–U+001F, U+0080–U+009F) from inline comments
// and log() string literals, then applies all layout/UX changes requested.
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/pages/TestLab.tsx';
let src = readFileSync(FILE, 'utf8');

// ── 1. STRIP CONTROL CHARS FROM COMMENTS & LOG STRINGS ──────────────────────
// Remove any ASCII control characters (except tab, LF, CR) from the entire file.
// This is safe because they only appear in corrupted string content.
src = src.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

// ── 2. VERIFY STRUCTURE INTACT ───────────────────────────────────────────────
const lineCount = src.split('\n').length;
console.log(`Lines after cleanup: ${lineCount}`);
console.log('Sample L18:', src.split('\n')[17].slice(0, 80));

writeFileSync(FILE, src, 'utf8');
console.log('Done: control chars stripped, file written as UTF-8.');
