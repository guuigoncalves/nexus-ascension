import React from 'react';
import { useCards } from '../contexts/CardContext';
import { useNavigate } from 'react-router-dom';

export const Gallery: React.FC = () => {
    const navigate = useNavigate();
    const { cards } = useCards();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Galeria de Cartas ({cards.length})</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                    Voltar
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cards.map(card => (
                    <div key={card.id} className="bg-gray-800 p-2 rounded border border-gray-700 flex flex-col items-center">
                        <div className="relative w-full aspect-[2/3] mb-2">
                            <img
                                src={card.image}
                                alt={card.name}
                                className="w-full h-full object-contain bg-black"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x300?text=No+Image';
                                }}
                            />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-yellow-400">ID: {card.id}</div>
                            <div className="font-bold text-sm">{card.name}</div>
                            <div className="text-xs text-gray-400">{card.universe}</div>
                            <div className="text-xs text-gray-500 mt-1">{card.image}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
