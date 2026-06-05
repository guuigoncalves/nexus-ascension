import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInAsGuest: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    console.log('=== AUTH PROVIDER STATE ===', { user: user?.uid, loading });

    useEffect(() => {
        console.log('=== AUTH PROVIDER MOUNTING ===');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('=== AUTH STATE CHANGED ===', { user: user?.uid });
            setUser(user);
            setLoading(false);
        }, (error) => {
            console.error('=== AUTH ERROR ===', error);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInAsGuest = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error signing in anonymously:", error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInAsGuest, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
