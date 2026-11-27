import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null && item !== undefined && item !== '') {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (writeErr) {
            console.warn(`Quota or write error on localStorage key "${key}":`, writeErr);
            // If quota exceeded, strip oversized base64 images so IDs, names, credentials are NEVER lost
            if (writeErr && (writeErr.name === 'QuotaExceededError' || writeErr.code === 22)) {
              try {
                const pruned = JSON.parse(
                  JSON.stringify(valueToStore, (k, v) => {
                    if (typeof v === 'string' && v.startsWith('data:image') && v.length > 50000) {
                      return ''; // strip heavy base64 to save data
                    }
                    return v;
                  })
                );
                window.localStorage.setItem(key, JSON.stringify(pruned));
                return pruned;
              } catch {
                // Ignore fallback error
              }
            }
          }
          return valueToStore;
        });
      } catch (err) {
        console.warn(`Error in setValue for key "${key}":`, err);
      }
    },
    [key]
  );

  // Sync to localStorage on storedValue changes as well
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}" in effect:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
