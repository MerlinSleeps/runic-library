"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';

interface DeckSummary {
  id: string;
  name: string;
  createdAt: string;
  cardCount: number;
}

export default function MyDecksPage() {
  const result = useAuthedFetch<DeckSummary[]>('/api/decks');

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Decks</h1>

      {result.status === 'loading' && <p>Loading your decks...</p>}
      {result.status === 'unauthenticated' && <p>Please log in to see your saved decks.</p>}
      {(result.status === 'error' || result.status === 'not-found') && (
        <p className="text-red-400">Your decks could not be loaded. Please try again later.</p>
      )}

      {result.status === 'success' &&
        (result.data.length === 0 ? (
          <p>You haven&apos;t saved any decks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.data.map((deck) => (
              <Link href={`/my-decks/${deck.id}`} key={deck.id}>
                <Card className="hover:shadow-lg hover:shadow-cyan-500/30 h-full">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{deck.cardCount} cards</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(deck.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
    </main>
  );
}
