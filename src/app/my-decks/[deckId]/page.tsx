"use client";

import { use } from 'react';
import type { DeckEntry } from '@/types/card';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';

interface DeckDetail {
  id: string;
  name: string;
  createdAt: string;
  cards: DeckEntry[];
}

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { deckId } = use(params);
  const result = useAuthedFetch<DeckDetail>(`/api/decks/${deckId}`);

  if (result.status === 'loading') {
    return <main className="container mx-auto p-4"><p>Loading deck...</p></main>;
  }
  if (result.status === 'unauthenticated') {
    return <main className="container mx-auto p-4"><p>Please log in to see this deck.</p></main>;
  }
  if (result.status !== 'success') {
    return <main className="container mx-auto p-4"><p>Deck not found.</p></main>;
  }

  const deck = result.data;
  const totalCards = deck.cards.reduce((sum, entry) => sum + entry.count, 0);
  const sortedCards = [...deck.cards].sort(
    (a, b) => a.card.stats.cost - b.card.stats.cost || a.card.name.localeCompare(b.card.name)
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
      <p className="text-lg text-gray-400 mb-6">Total cards: {totalCards}</p>

      <ul className="max-w-md bg-gray-900 p-4 rounded-lg border border-gray-700">
        {sortedCards.map(({ card, count }) => (
          <li
            key={card.id}
            className="flex justify-between items-center p-2 border-b border-gray-700 last:border-b-0"
          >
            <div>
              <span className="font-semibold">{card.name}</span>
              <p className="text-xs text-gray-400">
                {card.type} · Cost: {card.stats.cost}
              </p>
            </div>
            <span className="font-bold">x{count}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
