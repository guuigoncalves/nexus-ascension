const fs = require('fs');
const lines = fs.readFileSync('src/pages/TestLab.tsx', 'utf-8').split('\n');

const newLines = `                                                    <div
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
                                            </div>
                                        );
                                    })}`.split('\n');

// The original lines at 4415 (index 4415) to 4424 (index 4424) inclusive is 10 lines.
lines.splice(4415, 10, ...newLines);
fs.writeFileSync('src/pages/TestLab.tsx', lines.join('\n'), 'utf-8');
console.log("Replaced successfully!");
