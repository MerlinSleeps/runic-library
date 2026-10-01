"use client";

import type { Card, DeckEntry } from '@/types/card';
import { CARD_TYPE } from '@/constants/card-type';
import React, { createContext, useContext, useState, useMemo } from 'react';
import { getCardTypes, RULES, validateDeck, type ValidationState } from '@/lib/deck-validation';

export { RULES, type ValidationState } from '@/lib/deck-validation';

// --- CONTEXT DEFINITION ---

interface DeckBuilderContextType {
  championLegend: Card | null;
  mainDeck: DeckEntry[];
  runeDeck: DeckEntry[];
  battlefieldDeck: DeckEntry[];

  addCard: (card: Card) => void;
  removeFromMainDeck: (cardId: string) => void;
  removeFromRuneDeck: (cardId: string) => void;
  removeFromBattlefieldDeck: (cardId: string) => void;
  setLegend: (card: Card) => void;
  removeLegend: () => void;

  validation: ValidationState;
}

const DeckBuilderContext = createContext<DeckBuilderContextType | undefined>(
  undefined
);

// --- PROVIDER COMPONENT ---

export const DeckBuilderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [championLegend, setChampionLegend] = useState<Card | null>(null);
  const [mainDeck, setMainDeck] = useState<DeckEntry[]>([]);
  const [runeDeck, setRuneDeck] = useState<DeckEntry[]>([]);
  const [battlefieldDeck, setBattlefieldDeck] = useState<DeckEntry[]>([]);

  // --- 1. CORE DECK LOGIC (ADD/REMOVE) ---

  const setLegend = (card: Card) => {
    setChampionLegend(card);
  };

  const removeLegend = () => {
    setChampionLegend(null);
  };

  const addCard = (cardToAdd: Card) => {
    const type = getCardTypes(cardToAdd);

    if (type.includes(CARD_TYPE.Legend)) {
      setLegend(cardToAdd);
    }
    else if (type.includes(CARD_TYPE.Rune)) {
      setRuneDeck((current) => {
        const entry = current.find((e) => e.card.id === cardToAdd.id);
        if (entry) {
          return current.map((e) =>
            e.card.id === cardToAdd.id
              ? { ...e, count: e.count + 1 }
              : e
          );
        }
        return [...current, { card: cardToAdd, count: 1 }];
      });
    }
    else if (type.includes(CARD_TYPE.Battlefield)) {
      setBattlefieldDeck((current) => {
        const exists = current.find((e) => e.card.id === cardToAdd.id);
        if (exists) return current;
        return [...current, { card: cardToAdd, count: 1 }];
      });
    }
    else {
      setMainDeck((current) => {
        const entry = current.find((e) => e.card.id === cardToAdd.id);
        if (entry) {
          return current.map((e) =>
            e.card.id === cardToAdd.id
              ? { ...e, count: Math.min(e.count + 1, RULES.MAIN_DECK_COPY_LIMIT) }
              : e
          );
        }
        return [...current, { card: cardToAdd, count: 1 }];
      });
    }
  };

  const removeFromMainDeck = (cardId: string) => {
    setMainDeck((current) => {
      const entry = current.find((e) => e.card.id === cardId);
      if (entry && entry.count > 1) {
        return current.map((e) =>
          e.card.id === cardId ? { ...e, count: e.count - 1 } : e
        );
      }
      return current.filter((e) => e.card.id !== cardId);
    });
  };

  const removeFromRuneDeck = (cardId: string) => {
    setRuneDeck((current) => {
      const entry = current.find((e) => e.card.id === cardId);
      if (entry && entry.count > 1) {
        return current.map((e) =>
          e.card.id === cardId ? { ...e, count: e.count - 1 } : e
        );
      }
      return current.filter((e) => e.card.id !== cardId);
    });
  };

  const removeFromBattlefieldDeck = (cardId: string) => {
    setBattlefieldDeck((current) => current.filter((e) => e.card.id !== cardId));
  };


  // --- 2. REAL-TIME VALIDATION LOGIC ---

  const validation = useMemo(
    () => validateDeck({ championLegend, mainDeck, runeDeck, battlefieldDeck }),
    [championLegend, mainDeck, runeDeck, battlefieldDeck]
  );


  // --- 3. FINAL CONTEXT VALUE ---

  const value = {
    championLegend,
    mainDeck,
    runeDeck,
    battlefieldDeck,
    addCard,
    removeFromMainDeck,
    removeFromRuneDeck,
    removeFromBattlefieldDeck,
    setLegend,
    removeLegend,
    validation,
  };

  return (
    <DeckBuilderContext.Provider value={value}>
      {children}
    </DeckBuilderContext.Provider>
  );
};

// Custom hook to easily use the context
export const useDeckBuilder = () => {
  const context = useContext(DeckBuilderContext);
  if (context === undefined) {
    throw new Error('useDeckBuilder must be used within a DeckBuilderProvider');
  }
  return context;
};