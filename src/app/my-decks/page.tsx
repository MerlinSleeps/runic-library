"use client";

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import { Button } from '@/components/ui/button';
import { DomainBadges } from '@/components/shared/DomainBadges';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';

interface DeckSummary {
  id: string;
  name: string;
  createdAt: string;
  cardCount: number;
  legend: {
    id: string;
    name: string;
    faction: string;
    imageUrl: string | null;
  } | null;
}

function DeckTile({ deck }: { deck: DeckSummary }) {
  return (
    <Link
      href={`/my-decks/${deck.id}`}
      className="group block rounded-xl overflow-hidden border border-gray-800 bg-gray-900/60 transition-all hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
    >
      {/* Legend art: cropped to the upper part of the card, where the character is */}
      <div className="relative h-44 overflow-hidden bg-gray-950">
        <div className="absolute inset-x-0 top-0 aspect-[3/4] transition-transform duration-300 group-hover:scale-105">
          <CardImage src={deck.legend?.imageUrl ?? undefined} alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight truncate">{deck.name}</h2>
          <p className="text-sm text-purple-200 truncate">
            {deck.legend ? deck.legend.name : 'No Legend'}
          </p>
        </div>

        {deck.legend && <DomainBadges faction={deck.legend.faction} />}

        <div className="flex justify-between text-xs text-gray-400 pt-1 border-t border-gray-800">
          <span>{deck.cardCount} cards</span>
          <time dateTime={deck.createdAt}>{new Date(deck.createdAt).toLocaleDateString()}</time>
        </div>
      </div>
    </Link>
  );
}

export default function MyDecksPage() {
  const result = useAuthedFetch<DeckSummary[]>('/api/decks');

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Decks</h1>
        {result.status === 'success' && result.data.length > 0 && (
          <Button asChild>
            <Link href="/build">
              <Layers className="mr-2 h-4 w-4" /> New Deck
            </Link>
          </Button>
        )}
      </div>

      {result.status === 'loading' && <p>Loading your decks...</p>}
      {result.status === 'unauthenticated' && <p>Please log in to see your saved decks.</p>}
      {(result.status === 'error' || result.status === 'not-found') && (
        <p className="text-red-400">Your decks could not be loaded. Please try again later.</p>
      )}

      {result.status === 'success' &&
        (result.data.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-800 rounded-xl space-y-4">
            <p className="text-gray-400">You haven&apos;t saved any decks yet.</p>
            <Button asChild>
              <Link href="/build">
                <Layers className="mr-2 h-4 w-4" /> Build your first deck
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {result.data.map((deck) => (
              <li key={deck.id}>
                <DeckTile deck={deck} />
              </li>
            ))}
          </ul>
        ))}
    </main>
  );
}
