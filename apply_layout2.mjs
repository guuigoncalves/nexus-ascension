// apply_layout2.mjs – versão corrigida (CRLF aware)
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/pages/TestLab.tsx';
let src = readFileSync(FILE, 'utf8');
const CRLF = src.includes('\r\n');
const NL = CRLF ? '\r\n' : '\n';

console.log('Line endings:', CRLF ? 'CRLF' : 'LF');

function nl(s) {
  // normalize the template literal newlines to match the file
  return CRLF ? s.replace(/\n/g, '\r\n') : s;
}

// ── 1. Adicionar função sanitize ─────────────────────────────────────────────
const AFTER_NORMALIZE = `    return nextValue.replace(/\\uFFFD/g, '');${NL}};${NL}${NL}export const TestLab`;
const WITH_SANITIZE   = `    return nextValue.replace(/\\uFFFD/g, '');${NL}};${NL}${NL}const sanitize = (t: string): string => normalizeDisplayText(t ?? '');${NL}${NL}export const TestLab`;

if (!src.includes(AFTER_NORMALIZE)) {
  // Already added?
  if (src.includes('const sanitize')) {
    console.log('sanitize already present, skipping step 1');
  } else {
    console.error('ERROR step1: anchor not found');
    process.exit(1);
  }
} else {
  src = src.replace(AFTER_NORMALIZE, WITH_SANITIZE);
  console.log('✓ sanitize() added');
}

// ── 2. Arena padding ─────────────────────────────────────────────────────────
src = src.replace(
  'justify-center p-8 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)]',
  'justify-center p-3 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)]'
);
src = src.replace('gap-4 mb-16 transition-all', 'gap-4 mb-8 transition-all');
src = src.replace('gap-4 mt-16 transition-all', 'gap-4 mt-8 transition-all');
console.log('✓ Arena padding reduced');

// ── 3. Card name no lado direito ─────────────────────────────────────────────
src = src.replace(
  '<span className="truncate">{card.name}</span>',
  '<span className="truncate">{sanitize(card.name)}</span>'
);
console.log('✓ Right-column card.name → sanitize()');

// ── 4. Reorder left column ───────────────────────────────────────────────────
// Step A: change gap-3 → gap-2 on the left column flex container
src = src.replace(
  nl(`                    <div className="flex h-full flex-col gap-3">`),
  nl(`                    <div className="flex h-full flex-col gap-2">`)
);

// Step B: Insert DETALHES (compact) before "MO DO JOGADOR" comment
const JOGADOR_COMMENT = nl(`                        {/* MO DO JOGADOR */}`);
const DETALHES_COMPACT = nl(`                        {/* 1. DETALHES DA CARTA (TOP, COMPACT) */}
                        <section className="shrink-0 rounded-xl border border-purple-500/20 bg-white/[0.03] p-2">
                            {cardPopup ? (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="flex-1 truncate text-[10px] font-black uppercase text-white">{sanitize(cardPopup.unit.card.name)}</span>
                                        <span className="shrink-0 text-[9px] font-bold text-red-400">{cardPopup.unit.currentAttack}</span>
                                        <span className="shrink-0 text-[9px] text-white/25">/</span>
                                        <span className="shrink-0 text-[9px] font-bold text-blue-400">{cardPopup.unit.currentHealth}</span>
                                    </div>
                                    <div className="line-clamp-4 text-[8px] leading-relaxed text-white/60">
                                        {cardPopup.unit.card.description || cardPopup.unit.card.habilidade || 'Sem habilidade especial'}
                                    </div>
                                    <button
                                        disabled={
                                            !!(cardPopup.unit as any).isStunned ||
                                            (((cardPopup.board === 'player' ? playerBoard : enemyBoard)[cardPopup.index] as TestUnit | null)?.id !== cardPopup.unit.id)
                                        }
                                        onClick={() => {
                                            if (!cardPopup) return;
                                            const source = cardPopup.unit;
                                            const requiresTarget = ['191', '136', '194'].includes(source.card.id);
                                            if (requiresTarget) {
                                                if (source.card.id === '191') setGoblinTargetsDestroyed(0);
                                                setEffectMode({ sourceId: source.id, sourceBoard: cardPopup.board });
                                                setAttackMode(null);
                                                log(\`\u269B \${source.card.name}: Clique em um alvo para usar a habilidade.\`);
                                                return;
                                            }
                                            executeEffect(cardPopup.board, cardPopup.index, source);
                                        }}
                                        className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-1.5 text-[9px] font-black uppercase tracking-wide transition-all hover:from-purple-500 hover:to-blue-500 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <Play size={9} />
                                        {'USAR EFEITO'}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-1 text-center text-[9px] text-white/25">{'Clique em uma carta.'}</div>
                            )}
                        </section>

                        {/* 2. MO DO JOGADOR */}`);

if (!src.includes(JOGADOR_COMMENT)) {
  console.error('ERROR: JOGADOR_COMMENT not found');
  process.exit(1);
}
src = src.replace(JOGADOR_COMMENT, DETALHES_COMPACT);
console.log('✓ Detalhes compact inserted at top');

// Step C: fix adversário comment
src = src.replace(
  nl(`                        {/* MO DO ADVERSRIO */}`),
  nl(`                        {/* 3. MO DO ADVERSRIO */}`)
);

// Step D: Replace old LOG section (shrink-0 accordion) with flex-1 always-visible
const OLD_LOG_ANCHOR = nl(`                        {/* LOG / HISTRICO - ACORDEO */}`);
const LOG_END = nl(`                        </section>

                        {/* DETALHES DA CARTA - FLEX-1, USAR EFEITO FIXO NO FUNDO */}`);

if (!src.includes(OLD_LOG_ANCHOR)) {
  console.error('ERROR: OLD_LOG_ANCHOR not found');
  process.exit(1);
}
if (!src.includes(LOG_END)) {
  console.error('ERROR: LOG_END not found');
  process.exit(1);
}

const NEW_LOG = nl(`                        {/* 4. HISTRICO/LOG - flex-1, base da coluna */}
                        <section className="min-h-0 flex-1 flex flex-col rounded-xl border border-white/10 bg-black/40 p-2">
                            <div className="flex items-center justify-between shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">{'Hist\\u00F3rico'}</span>
                                <div className="flex items-center gap-0.5">
                                    <button onClick={copyLog} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-all hover:bg-white/10 hover:text-white" title={'Copiar hist\\u00F3rico'}>
                                        <Copy size={11} />
                                    </button>
                                    <button onClick={resetLogs} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-all hover:bg-white/10 hover:text-white" title={'Limpar hist\\u00F3rico'}>
                                        <Trash2 size={11} />
                                    </button>
                                    <button onClick={() => setLogsCollapsed(!logsCollapsed)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-all hover:bg-white/10 hover:text-white" title={logsCollapsed ? 'Expandir' : 'Minimizar'}>
                                        {logsCollapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                                    </button>
                                </div>
                            </div>
                            {logsCollapsed ? (
                                <div className="mt-1.5 flex items-center rounded-lg border border-white/5 bg-black/50 px-2 py-1 text-[8px] text-white/45">
                                    <span className="truncate">{latestLogEntry}</span>
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 overflow-y-auto mt-1.5 rounded-lg border border-white/5 bg-black/50 p-1.5 space-y-0.5">
                                    {eventLog.map((msg, i) => (
                                        <div key={i} className="rounded border border-white/5 bg-black/40 px-2 py-1 text-[8px] leading-relaxed text-white/55">
                                            {msg}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

`);

// Find and replace from OLD_LOG_ANCHOR to LOG_END (exclusive of the DETALHES header)
const logStart = src.indexOf(OLD_LOG_ANCHOR);
const logEnd   = src.indexOf(LOG_END) + LOG_END.length;
src = src.slice(0, logStart) + NEW_LOG + src.slice(logEnd);
console.log('✓ Log section replaced (flex-1)');

// Step E: Remove old DETALHES section (now replaced by compact version at top)
const OLD_DETAILS_START = nl(`                        {/* DETALHES DA CARTA - FLEX-1, USAR EFEITO FIXO NO FUNDO */}`);
const OLD_DETAILS_END   = nl(`                        </section>
                    </div>
                </div>

                {/* CENTRO */}`);

const dsIdx = src.indexOf(OLD_DETAILS_START);
const deIdx = src.indexOf(OLD_DETAILS_END, dsIdx);
if (dsIdx === -1) {
  console.log('Old DETALHES block already removed or not found, skipping');
} else {
  // Replace old DETALHES + close tags, keep the closing tags
  const KEEP_CLOSING = nl(`                    </div>
                </div>

                {/* CENTRO */}`);
  src = src.slice(0, dsIdx) + KEEP_CLOSING + src.slice(deIdx + OLD_DETAILS_END.length);
  console.log('✓ Old DETALHES section removed');
}

// ── Verify ────────────────────────────────────────────────────────────────────
console.log('\n=== Verification ===');
console.log('sanitize():', src.includes('const sanitize'));
console.log('USAR EFEITO at top:', src.indexOf('USAR EFEITO') < src.indexOf('MO DO JOGADOR'));
console.log('Log flex-1:', src.includes('min-h-0 flex-1 flex flex-col rounded-xl border border-white/10'));
console.log('Arena p-3:', src.includes('justify-center p-3'));
console.log('mb-8 P2:', src.includes('mb-8 transition-all'));
console.log('Lines:', src.split('\n').length);

writeFileSync(FILE, src, 'utf8');
console.log('\n✓ Done. File written.');
