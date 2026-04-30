// apply_layout.mjs – aplica todas as mudanças de UX no TestLab.tsx
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/pages/TestLab.tsx';
let src = readFileSync(FILE, 'utf8');

// ── 1. Adicionar função sanitize após normalizeDisplayText ────────────────────
src = src.replace(
  "    return nextValue.replace(/\\uFFFD/g, '');\n};\n\nexport const TestLab",
  "    return nextValue.replace(/\\uFFFD/g, '');\n};\n\nconst sanitize = (t: string): string => normalizeDisplayText(t ?? '');\n\nexport const TestLab"
);

// ── 2. Arena: reduzir padding/margens excessivos ──────────────────────────────
// Centro: p-8 → p-3
src = src.replace(
  'flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)]',
  'flex flex-col items-center justify-center p-3 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)]'
);
// P2 area: mb-16 → mb-8
src = src.replace(
  '<div className="flex flex-col items-center gap-4 mb-16 transition-all">',
  '<div className="flex flex-col items-center gap-4 mb-8 transition-all">'
);
// P1 area: mt-16 → mt-8
src = src.replace(
  '<div className="flex flex-col items-center gap-4 mt-16 transition-all">',
  '<div className="flex flex-col items-center gap-4 mt-8 transition-all">'
);

// ── 3. Card names na lista direita: usar sanitize ─────────────────────────────
src = src.replace(
  '<span className="truncate">{card.name}</span>',
  '<span className="truncate">{sanitize(card.name)}</span>'
);

// ── 4. Reordenar coluna esquerda ──────────────────────────────────────────────
// A coluna esquerda atual: NavBar → MãoJogador → MãoAdversário → Log → Detalhes
// Nova ordem: NavBar → Detalhes (compact) → MãoJogador → MãoAdversário → Log (flex-1)

const OLD_LEFT = `                    <div className="flex h-full flex-col gap-3">
                        {/* NAV BAR */}
                        <div className="flex items-center justify-between shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <div className="flex gap-2">
                                <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 p-2 text-white/50 transition-all hover:bg-white/10" title="Voltar">
                                    <ArrowLeft size={16} />
                                </button>
                                <button onClick={undo} disabled={historyIndex <= 0} className={\`rounded-lg p-2 transition-all \${historyIndex > 0 ? 'bg-white/5 text-white/80 hover:bg-white/10' : 'bg-white/[0.02] text-white/10'}\`} title="Desfazer">
                                    <RotateCcw size={16} />
                                </button>
                                <button onClick={redo} disabled={historyIndex >= history.length - 1} className={\`rounded-lg p-2 transition-all \${historyIndex < history.length - 1 ? 'bg-white/5 text-white/80 hover:bg-white/10' : 'bg-white/[0.02] text-white/10'}\`} title="Refazer">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-400">TestLab</span>
                        </div>

                        {/* MO DO JOGADOR */}`;

const NEW_LEFT_START = `                    <div className="flex h-full flex-col gap-2">
                        {/* NAV BAR */}
                        <div className="flex items-center justify-between shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <div className="flex gap-2">
                                <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 p-2 text-white/50 transition-all hover:bg-white/10" title="Voltar">
                                    <ArrowLeft size={16} />
                                </button>
                                <button onClick={undo} disabled={historyIndex <= 0} className={\`rounded-lg p-2 transition-all \${historyIndex > 0 ? 'bg-white/5 text-white/80 hover:bg-white/10' : 'bg-white/[0.02] text-white/10'}\`} title="Desfazer">
                                    <RotateCcw size={16} />
                                </button>
                                <button onClick={redo} disabled={historyIndex >= history.length - 1} className={\`rounded-lg p-2 transition-all \${historyIndex < history.length - 1 ? 'bg-white/5 text-white/80 hover:bg-white/10' : 'bg-white/[0.02] text-white/10'}\`} title="Refazer">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-400">TestLab</span>
                        </div>

                        {/* 1. DETALHES DA CARTA (TOP, COMPACT) */}
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

                        {/* 2. MO DO JOGADOR */}`;

if (!src.includes(OLD_LEFT)) {
  console.error('ERROR: OLD_LEFT block not found – check whitespace/content');
  process.exit(1);
}
src = src.replace(OLD_LEFT, NEW_LEFT_START);
console.log('✓ Left column top replaced');

// ── 5. LOG: de shrink-0 accordion para flex-1 sempre visível ─────────────────
const OLD_LOG = `                        {/* LOG / HISTRICO - ACORDEO */}
                        <section className="shrink-0 rounded-xl border border-white/10 bg-black/40 p-2 transition-all">
                            <div className="flex items-center justify-between">
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
                            <div className={\`overflow-hidden transition-all duration-300 mt-1.5 rounded-lg border border-white/5 bg-black/50 \${logsCollapsed ? 'h-7' : 'h-32'}\`}>
                                {!logsCollapsed ? (
                                    <div className="h-full overflow-y-auto space-y-0.5 p-1.5">
                                        {eventLog.map((msg, i) => (
                                            <div key={i} className="rounded border border-white/5 bg-black/40 px-2 py-1 text-[8px] leading-relaxed text-white/55">
                                                {msg}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center px-2 text-[8px] text-white/45">
                                        <span className="truncate">{latestLogEntry}</span>
                                    </div>
                                )}
                            </div>
                        </section>`;

const NEW_LOG = `                        {/* 4. HISTRICO/LOG - flex-1, base da coluna */}
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
                        </section>`;

if (!src.includes(OLD_LOG)) {
  console.error('ERROR: OLD_LOG block not found');
  process.exit(1);
}
src = src.replace(OLD_LOG, NEW_LOG);
console.log('✓ Log section replaced (flex-1 at bottom)');

// ── 6. Remover o bloco antigo DETALHES (agora movido para o topo) ─────────────
const OLD_DETAILS = `
                        {/* DETALHES DA CARTA - FLEX-1, USAR EFEITO FIXO NO FUNDO */}
                        <section className="flex flex-col min-h-0 flex-1 overflow-hidden rounded-xl border border-purple-500/20 bg-white/[0.03] p-2.5">
                            <div className="mb-2 flex items-center justify-between shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300">{'Detalhes da Carta'}</span>
                                {cardPopup && (
                                    <span className="text-[9px] text-white/35">
                                        {cardPopup.board === 'player' ? 'P1' : 'P2'} | ID {cardPopup.unit.card.id}
                                    </span>
                                )}
                            </div>
                            {cardPopup ? (
                                <div className="flex flex-col min-h-0 flex-1">
                                    {/* Card name + ATK/DEF inline */}
                                    <div className="shrink-0 mb-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
                                        <div className="text-[11px] font-black uppercase text-white truncate">{normalizeDisplayText(cardPopup.unit.card.name)}</div>
                                        <div className="flex items-center gap-2 mt-0.5 text-[8px] font-black uppercase">
                                            <span className="text-red-400">ATK {cardPopup.unit.currentAttack}</span>
                                            <span className="text-white/20">|</span>
                                            <span className="text-blue-400">DEF {cardPopup.unit.currentHealth}</span>
                                        </div>
                                    </div>
                                    {/* Description scrollable */}
                                    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 text-[10px] leading-relaxed text-white/75 mb-2">
                                        <div className="mb-1 text-[8px] font-black uppercase tracking-[0.15em] text-white/30">{'Descri\\u00E7\\u00E3o'}</div>
                                        {cardPopup.unit.card.description || cardPopup.unit.card.habilidade || 'Sem habilidade especial'}
                                    </div>
                                    {/* USAR EFEITO - always visible at bottom */}
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
                                        className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-[10px] font-black uppercase tracking-wide transition-all hover:from-purple-500 hover:to-blue-500 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <Play size={11} />
                                        {'USAR EFEITO'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-1 items-center justify-center text-center text-[10px] text-white/20 px-2">
                                    {'Clique em uma carta para inspecionar.'}
                                </div>
                            )}
                        </section>`;

if (!src.includes(OLD_DETAILS)) {
  console.error('ERROR: OLD_DETAILS block not found');
  process.exit(1);
}
src = src.replace(OLD_DETAILS, '');
console.log('✓ Old DETALHES section removed (now at top)');

// ── 7. Atualizar comentários MÃO (texto limpo após encoding fix) ──────────────
src = src.replace(
  '{/* MO DO JOGADOR */}',
  '{/* 2. MO DO JOGADOR */}'
);
src = src.replace(
  '{/* MO DO ADVERSRIO */}',
  '{/* 3. MO DO ADVERSRIO */}'
);

// ── 8. Verificar resultado ───────────────────────────────────────────────────
const lines = src.split('\n');
console.log(`\nTotal lines: ${lines.length}`);
console.log('sanitize present:', src.includes('const sanitize'));
console.log('USAR EFEITO at top:', src.indexOf('USAR EFEITO') < src.indexOf('MO DO JOGADOR') ? 'YES' : 'NO (check!)');
console.log('Log flex-1:', src.includes('min-h-0 flex-1 flex flex-col rounded-xl border border-white/10'));
console.log('Arena p-3:', src.includes('justify-center p-3 bg-[radial-gradient'));
console.log('mb-8 P2:', src.includes('gap-4 mb-8 transition-all'));

writeFileSync(FILE, src, 'utf8');
console.log('\n✓ All changes written to TestLab.tsx');
