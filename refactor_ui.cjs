const fs = require('fs');

let content = fs.readFileSync('src/pages/TestLab.tsx', 'utf-8');

// 1. Navigation Buttons
const navOld = `{/* BOTOES DE NAVEGACAO (Task 1) */}
                    <div className="flex flex-row gap-1.5 w-full">
                        <button onClick={() => navigate(-1)} className="flex-[0.5] py-1.5 text-[12px] font-black uppercase rounded border bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border-white/10 flex items-center justify-center" title="Voltar">
                            {'<-'}
                        </button>
                        <button onClick={undo} disabled={historyIndex <= 0} className={\`flex-[0.5] py-1.5 text-[12px] font-black uppercase rounded border transition-all flex items-center justify-center \${historyIndex > 0 ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20' : 'bg-black/20 text-white/20 border-white/5'}\`} title="Retroceder">
                            {'<'}
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className={\`flex-[0.5] py-1.5 text-[12px] font-black uppercase rounded border transition-all flex items-center justify-center \${historyIndex < history.length - 1 ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20' : 'bg-black/20 text-white/20 border-white/5'}\`} title="Avancar">
                            {'>'}
                        </button>
                        <button onClick={() => setSideBarOnRight(prev => !prev)} className="flex-[0.5] py-1.5 text-[12px] font-black uppercase rounded border bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border-white/10 flex items-center justify-center" title="Layout L/R">
                            L/R
                        </button>
                    </div>`;

const navNew = `{/* BOTOES DE NAVEGACAO (Task 1) */}
                    <div className="flex flex-row gap-1 w-full">
                        <button onClick={() => navigate(-1)} className="flex-[0.5] py-1 text-[10px] font-black uppercase rounded border bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border-white/10 flex items-center justify-center" title="Voltar">
                            {'<-'}
                        </button>
                        <button onClick={undo} disabled={historyIndex <= 0} className={\`flex-[0.5] py-1 text-[10px] font-black uppercase rounded-full border transition-all flex items-center justify-center \${historyIndex > 0 ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20' : 'bg-black/20 text-white/20 border-white/5'}\`} title="Retroceder">
                            {'<'}
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className={\`flex-[0.5] py-1 text-[10px] font-black uppercase rounded-full border transition-all flex items-center justify-center \${historyIndex < history.length - 1 ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20' : 'bg-black/20 text-white/20 border-white/5'}\`} title="Avancar">
                            {'>'}
                        </button>
                        <button onClick={() => setSideBarOnRight(prev => !prev)} className="flex-[0.5] py-1 text-[10px] font-black uppercase border border-white/10 bg-transparent text-white/50 hover:text-white transition-all rounded flex items-center justify-center" title="Layout L/R">
                            L/R
                        </button>
                    </div>`;

content = content.replace(navOld, navNew);

// 2. Search Toggle
const searchOld = `                            <button
                                onClick={() => setShowCardList(true)}
                                className="p-1 text-white/30 hover:text-purple-400 transition-colors"
                                title="Lista"
                            >
                                <Search size={14} />
                            </button>`;

const searchNew = `                            <button
                                onClick={() => setShowCardList(!showCardList)}
                                className="p-1 text-white/30 hover:text-purple-400 transition-colors"
                                title={showCardList ? "Fechar Lista" : "Lista"}
                            >
                                {showCardList ? <X size={14} /> : <Search size={14} />}
                            </button>`;

content = content.replace(searchOld, searchNew);

// 3. Remove "Lista de Personagens" and Header of List
const listHeaderOld = `<div className="flex-1 flex flex-col min-h-0 bg-black/40 z-50 overflow-hidden">
                        <div className="flex justify-between items-center p-3 border-b border-white/5 bg-black/20">
                            <span className="text-[10px] font-black text-purple-400 uppercase">Lista de Personagens ({cards.length})</span>
                            <button onClick={() => setShowCardList(false)} className="text-white/30 hover:text-white p-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">`;

const listHeaderNew = `<div className="flex-1 flex flex-col min-h-0 bg-black/40 z-50 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">`;

content = content.replace(listHeaderOld, listHeaderNew);

// 4. Update the List Items to be Ultra-Compact
const listItemOld = `                                            <div
                                                key={card.id}
                                                className="bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-lg p-2 transition-all group flex flex-col gap-1.5"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div
                                                        className={\`w-3.5 h-3.5 border rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer mt-0.5 \${isTested ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/50 bg-black'}\`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTested(card.id);
                                                        }}
                                                        title="Marcar como testado"
                                                    >
                                                        {isTested && <Check size={8} className="text-black stroke-[3]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={\`text-[10px] font-bold leading-tight truncate \${isTested ? 'text-green-500 line-through' : 'text-white'}\`}>
                                                            {card.name} {isValidated && '✅'}
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-[8px] text-white/30">ID: {card.id}</span>
                                                            <div className="flex gap-1.5 text-[8px] opacity-60">
                                                                <span className="text-red-400">AT: {card.atk}</span>
                                                                <span className="text-blue-400">DF: {card.def}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-1 mt-1 pt-1 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToHand(card.id); setShowCardList(false); }} className="py-1 bg-purple-500/10 hover:bg-purple-500/30 text-[8px] font-black text-purple-300 rounded transition-all">MÃO</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToField(true, card.id); setShowCardList(false); }} className="py-1 bg-blue-500/10 hover:bg-blue-500/30 text-[8px] font-black text-blue-300 rounded transition-all">P1</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToField(false, card.id); setShowCardList(false); }} className="py-1 bg-red-500/10 hover:bg-red-500/30 text-[8px] font-black text-red-300 rounded transition-all">P2</button>
                                                </div>
                                            </div>`;

const listItemNew = `                                            <div
                                                key={card.id}
                                                className="bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 rounded px-2 py-1 transition-all group flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    <div
                                                        className={\`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 transition-colors cursor-pointer \${isTested ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/50 bg-black'}\`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTested(card.id);
                                                        }}
                                                        title="Marcar como testado"
                                                    >
                                                        {isTested && <Check size={8} className="text-black stroke-[3]" />}
                                                    </div>
                                                    <div className={\`text-[10px] font-mono whitespace-nowrap truncate \${isTested ? 'text-green-500 line-through' : 'text-white'}\`}>
                                                        <span className="opacity-50">[{card.id}]</span> {card.name} <span className="opacity-40">|</span> <span className="text-red-400">AT:{card.atk}</span> <span className="text-blue-400">DF:{card.def}</span> {isValidated && '✅'}
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToHand(card.id); }} className="px-1.5 py-0.5 bg-purple-500/10 hover:bg-purple-500/30 text-[8px] font-black text-purple-300 rounded transition-all">M</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToField(true, card.id); }} className="px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-500/30 text-[8px] font-black text-blue-300 rounded transition-all">P1</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); spawnToField(false, card.id); }} className="px-1.5 py-0.5 bg-red-500/10 hover:bg-red-500/30 text-[8px] font-black text-red-300 rounded transition-all">P2</button>
                                                </div>
                                            </div>`;

content = content.replace(listItemOld, listItemNew);

// 5. Update the Habilidades & Log layout
const habLogOld = `                 {!showCardList ? (
                    <>
                        {/* 🔄 SWITCHER (Habilidades vs Log) */}
                        <div className={\`flex px-4 pt-4 mb-2 gap-2 items-center \${sideBarOnRight ? 'flex-row-reverse' : 'flex-row'}\`}>
                            <button
                                onClick={() => setRightTab('log')}
                                onDoubleClick={() => navigator.clipboard.writeText(eventLog.join('\\n')).then(() => alert('Log copiado!'))}
                                className={\`flex-1 py-2 text-[9px] font-black uppercase rounded transition-all \${rightTab === 'log' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/30 border border-transparent hover:bg-white/10'}\`}
                            >
                                LOG
                            </button>
                            <button
                                onClick={() => setRightTab('habilidade')}
                                className={\`flex-1 py-2 text-[9px] font-black uppercase rounded transition-all \${rightTab === 'habilidade' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/30 border border-transparent hover:bg-white/10'}\`}
                            >
                                HABILIDADES
                            </button>
                        </div>
                        {/* 📜 ÁREA DE CONTEÚDO (Overflow) */}
                        <div className="flex-1 overflow-hidden p-4 flex flex-col">
                            {rightTab === 'habilidade' ? (
                                <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-lg border border-white/5 p-3">
                                    {cardPopup ? (
                                        <>
                                            <div className="flex flex-col items-center mb-3">
                                                <div className="text-[11px] font-bold text-white text-center">{cardPopup.unit.card.name}</div>
                                                <div className="flex gap-2 text-[9px] font-mono mt-1">
                                                    <span className="text-red-400 font-bold">AT: {initialCards.find(c => c.id === cardPopup.unit.card.id)?.atk || 0}</span>
                                                    <span className="text-blue-400 font-bold">DF: {initialCards.find(c => c.id === cardPopup.unit.card.id)?.def || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                                                <p className="text-[11px] text-white/70 leading-relaxed">
                                                    {cardPopup.unit.card.description || 'Sem habilidade especial'}
                                                    {cardPopup.unit.card.id === '152' && cardPopup.unit.customState?.hbActive && (
                                                        <span className="block mt-2 text-xs">HB Ativa</span>
                                                    )}
                                                    {cardPopup.unit.card.id === '152' && (
                                                        <span className="block mt-2">Limite: 2 ataques por turno</span>
                                                    )}
                                                </p>
                                            </div>
                                            {cardPopup.unit.card.id === '126' && cardPopup.unit.effectTurns !== undefined && cardPopup.unit.effectTurns > 0 && (
                                                <button
                                                    onClick={() => triggerIronManHb(cardPopup.unit)}
                                                    className="w-full mt-3 py-2 bg-orange-600/80 text-[9px] font-black text-white uppercase rounded-lg shadow-lg hover:bg-orange-500"
                                                >
                                                    [HB]
                                                </button>
                                            )}
                                            <button
                                                onClick={() => executeEffect(cardPopup.board, cardPopup.index, cardPopup.unit)}
                                                className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-[9px] font-black text-white uppercase rounded-lg shadow-lg hover:shadow-purple-500/50"
                                            >
                                                USAR EFEITO
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                                            <div className="text-3xl mb-2">🃏</div>
                                            <div className="text-[9px] text-center">Nenhuma carta selecionada</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 bg-black/20 rounded-lg border border-white/5 p-3">
                                    {eventLog.map((msg, i) => (
                                        <div key={i} className="text-[9px] text-white/50 leading-relaxed mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                                            {msg}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>`;

const habLogNew = `                 {!showCardList ? (
                    <div className="flex-1 overflow-hidden p-4 flex flex-col gap-2">
                        {/* Habilidades */}
                        <div className="flex-[0.6] flex flex-col min-h-0 bg-black/20 rounded-lg border border-white/5 p-2">
                            {cardPopup ? (
                                <>
                                    <div className="text-[11px] font-bold text-white mb-2 pb-1 border-b border-white/10 truncate">
                                        {cardPopup.unit.card.name} <span className="text-[9px] font-mono text-white/50 font-normal ml-1">(AT: {initialCards.find(c => c.id === cardPopup.unit.card.id)?.atk || 0} DF: {initialCards.find(c => c.id === cardPopup.unit.card.id)?.def || 0})</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                                        <p className="text-[10px] text-white/70 leading-relaxed">
                                            {cardPopup.unit.card.description || 'Sem habilidade especial'}
                                            {cardPopup.unit.card.id === '152' && cardPopup.unit.customState?.hbActive && (
                                                <span className="block mt-2 text-xs">HB Ativa</span>
                                            )}
                                            {cardPopup.unit.card.id === '152' && (
                                                <span className="block mt-2">Limite: 2 ataques por turno</span>
                                            )}
                                        </p>
                                    </div>
                                    {cardPopup.unit.card.id === '126' && cardPopup.unit.effectTurns !== undefined && cardPopup.unit.effectTurns > 0 && (
                                        <button onClick={() => triggerIronManHb(cardPopup.unit)} className="w-full mt-1 py-1 bg-orange-600/80 text-[9px] font-black text-white uppercase rounded shadow hover:bg-orange-500">
                                            [HB]
                                        </button>
                                    )}
                                    <button onClick={() => executeEffect(cardPopup.board, cardPopup.index, cardPopup.unit)} className="w-full mt-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-[9px] font-black text-white uppercase rounded shadow hover:shadow-purple-500/50">
                                        USAR EFEITO
                                    </button>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                                    <div className="text-3xl mb-2">🃏</div>
                                    <div className="text-[9px] text-center">Nenhuma carta selecionada</div>
                                </div>
                            )}
                        </div>

                        {/* Log */}
                        <div className="flex-[0.4] flex flex-col min-h-0 bg-black/20 rounded-lg border border-white/5">
                            <div className="flex justify-between items-center p-1.5 border-b border-white/5">
                                <span className="text-[9px] font-black text-white/30 uppercase pl-1">Histórico</span>
                                <button onClick={() => navigator.clipboard.writeText(eventLog.join('\\n')).then(() => alert('Log copiado!'))} className="text-[8px] px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-white/50 transition-colors">
                                    Copiar
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10" onDoubleClick={() => navigator.clipboard.writeText(eventLog.join('\\n')).then(() => alert('Log copiado!'))}>
                                {eventLog.map((msg, i) => (
                                    <div key={i} className="text-[9px] text-white/50 leading-relaxed mb-1.5 pb-1.5 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                                        {msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>`;

content = content.replace(habLogOld, habLogNew);

fs.writeFileSync('src/pages/TestLab.tsx', content);
console.log('Patch complete');
