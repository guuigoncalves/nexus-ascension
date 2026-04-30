import { useState } from 'react';

const STORAGE_PREFIX = 'nexus_v2_';

export const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

export function useLocalStorage<T>(key: string, initialValue: T) {
    const storageKey = getStorageKey(key);
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            if (item !== null) {
                const parsed = JSON.parse(item);

                if (parsed === null || typeof parsed === 'undefined') {
                    return initialValue;
                }

                if (Array.isArray(initialValue)) {
                    return (Array.isArray(parsed) ? parsed : initialValue) as T;
                }

                if (
                    typeof initialValue === 'object' &&
                    initialValue !== null &&
                    typeof parsed === 'object' &&
                    parsed !== null &&
                    !Array.isArray(parsed)
                ) {
                    // Shallow merge keeps new root fields from the current schema.
                    return { ...initialValue, ...parsed };
                }

                return parsed as T;
            }
            return initialValue;
        } catch (error) {
            console.error(`Error loading ${storageKey} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof valueToStore === 'undefined') {
                window.localStorage.removeItem(storageKey);
                return;
            }
            window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error saving ${storageKey} to localStorage:`, error);
        }
    };

    return [storedValue, setValue] as const;
}
