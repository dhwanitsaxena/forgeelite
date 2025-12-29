
import { ForgeData } from '../types';

const LOCAL_STORAGE_KEY = 'forge_app_data';

/**
 * Saves the entire application data to local storage.
 */
export const saveToLocalStorage = (data: ForgeData): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to local storage:', error);
  }
};

/**
 * Loads the application data from local storage.
 * @returns The loaded ForgeData or null if not found/parse error.
 */
export const loadFromLocalStorage = (): ForgeData | null => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data from local storage:', error);
    return null;
  }
};
