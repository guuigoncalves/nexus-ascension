import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const DrawAnimation: React.FC<{ triggering: boolean, onComplete: () => void }> = ({ triggering, onComplete }) => {
    // We can simulate the draw by rendering a card moving from deck coordinates to center/hand
    // For simplicity, we'll animate from bottom-right (deck) to bottom-center (hand)

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {triggering && (
                <motion.div
                    initial={{
                        opacity: 1,
                        x: '40vw', // Approx Deck X (Right side)
                        y: '40vh', // Approx Deck Y (Bottom)
                        scale: 0.5,
                        rotate: 180
                    }}
                    animate={{
                        opacity: 0,
                        x: '0vw', // Center X
                        y: '30vh', // Slightly above bottom
                        scale: 1.0,
                        rotate: 0
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]"
                >
                    <div className="w-24 h-36 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg border-2 border-blue-400 shadow-2xl relative">
                        {/* Card Back Pattern */}
                        <div className="absolute inset-2 border border-blue-300/30 rounded-sm"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl">🌌</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
