import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Shallow merge to ensure new fields in initialValue (migration) are present
                // Note: unique arrays or deep objects might need specific handling, 
                // but for 'currency' object this shallow merge of the root profile is a good start if currency is a top key?
                // Wait, profile has nested 'currency'. A shallow merge { ...initial, ...parsed } puts parsed.currency (undefined) over initial.currency IF parsed has the key as undefined? No, JSON doesn't store undefined.
                // But if parsed doesn't have 'currency', { ...initial, ...parsed } will keep initial.currency.
                // This works for missing keys!
                return { ...initialValue, ...parsed };
            }
            return initialValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    };

    return [storedValue, setValue] as const;
}
