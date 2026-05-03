import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedCard {
  id: string;
  name: string;
  last4: string;
  expiry: string;
  brand: "visa" | "mastercard" | "other";
}

interface CardsContextType {
  cards: SavedCard[];
  selectedCardId: string | null;
  addCard: (card: Omit<SavedCard, "id">) => SavedCard;
  removeCard: (id: string) => void;
  selectCard: (id: string | null) => void;
}

const CardsContext = createContext<CardsContextType>({
  cards: [],
  selectedCardId: null,
  addCard: () => ({ id: "", name: "", last4: "", expiry: "", brand: "other" }),
  removeCard: () => {},
  selectCard: () => {},
});

const STORAGE_KEY = "savedCards";

export function detectBrand(cardNumber: string): SavedCard["brand"] {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  return "other";
}

export const CardsProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setCards(JSON.parse(raw));
    });
  }, []);

  const persist = (next: SavedCard[]) => {
    setCards(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addCard = (card: Omit<SavedCard, "id">): SavedCard => {
    const newCard: SavedCard = { ...card, id: Date.now().toString() };
    persist([...cards, newCard]);
    setSelectedCardId(newCard.id);
    return newCard;
  };

  const removeCard = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    persist(next);
    if (selectedCardId === id) setSelectedCardId(next[0]?.id ?? null);
  };

  const selectCard = (id: string | null) => setSelectedCardId(id);

  return (
    <CardsContext.Provider value={{ cards, selectedCardId, addCard, removeCard, selectCard }}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => useContext(CardsContext);
