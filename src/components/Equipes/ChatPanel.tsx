import React, { useState } from 'react';
import { Send, X, Users, Shield } from 'lucide-react';

type ChatMode = 'esquadrao' | 'guilda';

interface ChatPanelProps {
    onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
    const [activeChannel, setActiveChannel] = useState<ChatMode>('esquadrao');
    const [message, setMessage] = useState('');

    const mockMessages = {
        esquadrao: [
            { id: 1, user: 'DarkKnight#4521', message: 'Alguém para 2v2 ranked?', time: '14:32' },
            { id: 2, user: 'FireLord#2341', message: 'Vamos jogar!', time: '14:33' },
            { id: 3, user: 'IceQueen#9876', message: 'Preciso de aliados experientes', time: '14:35' },
        ],
        guilda: [
            { id: 1, user: 'Você', message: 'Como está o domínio do território?', time: '14:30' },
            { id: 2, user: 'GuildLeader', message: 'Estamos avançando no setor 7.', time: '14:31' },
            { id: 3, user: 'ShadowMage', message: 'Preciso de backup na defesa.', time: '14:35' },
        ],
    };

    const messages = mockMessages[activeChannel];

    const handleSend = () => {
        if (message.trim()) {
            console.log(`Enviando para ${activeChannel}:`, message);
            setMessage('');
        }
    };

    return (
        <div className="w-80 h-full bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col font-sans transition-all">
            {/* Header / Channel Selector */}
            <div className="flex items-center justify-between p-2 border-b border-white/5 bg-black/40">
                <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">CHAT</h3>
                </div>
                <div className="flex bg-black/50 rounded-lg p-0.5 border border-white/5">
                    <button
                        onClick={() => setActiveChannel('esquadrao')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeChannel === 'esquadrao' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Esquadrão
                    </button>
                    <button
                        onClick={() => setActiveChannel('guilda')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeChannel === 'guilda' ? 'bg-yellow-500 text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Guilda
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse"> {/* Reverse column to stick to bottom if needed, or normal */}
                {/* Rendering regular order here for simplicity, scroll auto */}
                <div className="flex-1 flex flex-col justify-end space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.user === 'Você' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-end gap-2 text-[9px]">
                                {msg.user !== 'Você' && <span className="font-bold text-gray-400">{msg.user}</span>}
                                <span className="font-mono text-gray-600">{msg.time}</span>
                            </div>
                            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed break-words border ${msg.user === 'Você'
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100 rounded-br-none'
                                : 'bg-black/40 border-white/10 text-gray-300 rounded-bl-none'
                                }`}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/40 border-t border-white/5 backdrop-blur-sm">
                <div className="flex gap-2 relative bg-black/20 border border-white/10 rounded-xl p-1 focus-within:border-white/20 transition-colors">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Transmistir para ${activeChannel}...`}
                        className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none font-medium"
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div >
    );
};
