import type { PrizeData } from "../types/wheel";
import { STORAGE_KEY, STORAGE_KEY_EMAIL } from "../constants/roulette";

export const readStorage = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const persistResult = (prize: PrizeData, email: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prize));
  localStorage.setItem(STORAGE_KEY_EMAIL, JSON.stringify({ email }));
};
