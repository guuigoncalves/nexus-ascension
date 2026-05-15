const fs = require('fs');
const lines = fs.readFileSync('src/pages/TestLab.tsx', 'utf-8').split('\n');

const newLines = `                                {/* Empty State */}
                                {cards.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery)).length === 0 && (
                                    <div className="text-center py-12 text-white/20 text-sm font-mono border-2 border-dashed border-white/5 rounded-xl">
                                        Nenhuma carta encontrada para "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🎭 POPUP CUSTOMIZADO DO MYSTERIO */}
            {
                mysterioBlockPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-2 border-purple-500/50 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.6)] p-6 max-w-sm animate-[scale-in_0.2s_ease-out]">`.split('\n');

lines.splice(4447, 18, ...newLines);
fs.writeFileSync('src/pages/TestLab.tsx', lines.join('\n'), 'utf-8');
console.log('Fixed block!');
