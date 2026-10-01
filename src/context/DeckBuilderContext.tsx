"use client";

import type { Card, Domain } from '@/types/card';
import type { DeckEntry } from '@/types/card';
import { CARD_TYPE } from '@/constants/card-type';
import React, { createContext, useContext, useState, useMemo } from 'react';

// --- DECK BUILDING RULES (Riftbound deck construction) ---
export const RULES = {
  MAIN_DECK_SIZE: 40,
  RUNE_DECK_SIZE: 12,
  BATTLEFIELD_DECK_SIZE: 3,
  MAIN_DECK_COPY_LIMIT: 3,
  SIGNATURE_CARD_LIMIT: 3,
};


// --- HELPER FUNCTIONS FOR DATA NORMALIZATION ---

function getCardTypes(card: Card): string[] {
  return card.type ? card.type.split(' ') : [];
}

function getDomains(card: Card): Domain[] {
  return card.faction ? card.faction.split(' ') : [];
}

function getChampionTag(card: Card): string | null {
  const ignore = ['Signature', 'Elite', 'Bird', 'Pirate', 'Ionia', 'Demacia', 'Noxus', 'Freljord', 'Piltover', 'Zaun', 'Bilgewater', 'Targon', 'Shurima', 'Shadow Isles', 'Bandle City', 'Runeterra'];
  return card.tags.find(t => !ignore.includes(t)) || null;
}

function isSignature(card: Card): boolean {
  return card.tags.includes('Signature');
}

// --- VALIDATION LOGIC ---

const COLORLESS = 'Colorless';

/** Colorless cards fit every deck; all other domains of a card must be part of the Legend's identity. */
function isCardInDomain(card: Card, identity: Domain[]): boolean {
  if (identity.length === 0) return false;
  return getDomains(card)
    .filter((domain) => domain !== COLORLESS)
    .every((domain) => identity.includes(domain));
}

// --- CONTEXT DEFINITION ---

export interface ValidationState {
  domainIdentity: Domain[];
  championTag: string | null;

  totalMainDeckCards: number;
  isMainDeckSizeValid: boolean;
  mainDeckErrors: string[];

  totalSignatureCards: number;
  isSignatureCardCountValid: boolean;

  totalRuneCards: number;
  isRuneDeckSizeValid: boolean;
  runeDeckErrors: string[];

  totalBattlefieldCards: number;
  isBattlefieldDeckSizeValid: boolean;
  isBattlefieldDeckUnique: boolean;
  battlefieldDeckErrors: string[];

  isDeckValid: boolean;
}

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

  const validation = useMemo((): ValidationState => {
    const state: ValidationState = {
      domainIdentity: championLegend ? getDomains(championLegend) : [],
      championTag: championLegend ? getChampionTag(championLegend) : null,

      totalMainDeckCards: 0,
      isMainDeckSizeValid: false,
      mainDeckErrors: [],

      totalSignatureCards: 0,
      isSignatureCardCountValid: false,

      totalRuneCards: 0,
      isRuneDeckSizeValid: false,
      runeDeckErrors: [],

      totalBattlefieldCards: 0,
      isBattlefieldDeckSizeValid: false,
      isBattlefieldDeckUnique: true,
      battlefieldDeckErrors: [],

      isDeckValid: false,
    };

    if (!championLegend) {
      state.isDeckValid = false;
      return state; // No legend, nothing is valid
    }

    // --- Main Deck Validation ---
    state.totalMainDeckCards = mainDeck.reduce((sum, e) => sum + e.count, 0);
    state.isMainDeckSizeValid = state.totalMainDeckCards === RULES.MAIN_DECK_SIZE;

    mainDeck.forEach((entry) => {
      if (entry.count > RULES.MAIN_DECK_COPY_LIMIT) {
        state.mainDeckErrors.push(`${entry.card.name}: Max ${RULES.MAIN_DECK_COPY_LIMIT} copies allowed.`);
      }
      if (!isCardInDomain(entry.card, state.domainIdentity)) {
        state.mainDeckErrors.push(`${entry.card.name}: Not in your Domain Identity.`);
      }
      if (isSignature(entry.card)) {
        const tag = getChampionTag(entry.card);
        if (tag !== state.championTag) {
          state.mainDeckErrors.push(`${entry.card.name}: Signature card does not match Legend.`);
        }
      }
    });

    state.totalSignatureCards = mainDeck
      .filter((e) => getCardTypes(e.card).includes(CARD_TYPE.Signature))
      .reduce((sum, e) => sum + e.count, 0);
    state.isSignatureCardCountValid = state.totalSignatureCards <= RULES.SIGNATURE_CARD_LIMIT;


    // --- Rune Deck Validation ---
    state.totalRuneCards = runeDeck.reduce((sum, e) => sum + e.count, 0);
    state.isRuneDeckSizeValid = state.totalRuneCards === RULES.RUNE_DECK_SIZE;

    runeDeck.forEach((entry) => {
      if (!isCardInDomain(entry.card, state.domainIdentity)) {
        state.runeDeckErrors.push(`${entry.card.name}: Not in your Domain Identity.`);
      }
    });

    // --- Battlefield Deck Validation ---
    state.totalBattlefieldCards = battlefieldDeck.length;
    state.isBattlefieldDeckSizeValid = state.totalBattlefieldCards === RULES.BATTLEFIELD_DECK_SIZE;

    const battlefieldNames = new Set(battlefieldDeck.map(e => e.card.name));
    state.isBattlefieldDeckUnique = battlefieldNames.size === battlefieldDeck.length;
    if (!state.isBattlefieldDeckUnique) {
      state.battlefieldDeckErrors.push("Battlefield deck cannot have duplicate cards.");
    }

    // --- Overall Validation ---
    state.isDeckValid =
      championLegend !== null &&
      state.isMainDeckSizeValid &&
      state.isSignatureCardCountValid &&
      state.isRuneDeckSizeValid &&
      state.isBattlefieldDeckSizeValid &&
      state.isBattlefieldDeckUnique &&
      state.mainDeckErrors.length === 0 &&
      state.runeDeckErrors.length === 0 &&
      state.battlefieldDeckErrors.length === 0;

    return state;
  }, [championLegend, mainDeck, runeDeck, battlefieldDeck]);


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