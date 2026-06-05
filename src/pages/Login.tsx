import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const { signInAsGuest, signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-8 text-yellow-500">JC Card Wars</h1>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                    Entrar com Google
                </button>
                <button
                    onClick={signInAsGuest}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                    Entrar como Convidado
                </button>
            </div>
        </div>
    );
};
