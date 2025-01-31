import { useEffect } from 'react';

export const useAutoSave = <T,>(data: T, key: string) => {
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem(key, JSON.stringify(data));
    };

    // Save immediately when data changes
    saveData();

    // Also save when the window is about to unload
    window.addEventListener('beforeunload', saveData);

    return () => {
      window.removeEventListener('beforeunload', saveData);
    };
  }, [data, key]);

  return {
    loadSavedData: () => {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    }
  };
};