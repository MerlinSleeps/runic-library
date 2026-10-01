"use client";

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { DeckEntry } from '@/types/card';
import { CARD_TYPE } from '@/constants/card-type';
import { CardImage } from '@/components/ui/CardImage';
import { DomainBadges } from '@/components/shared/DomainBadges';
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

const NON_MAIN_DECK_TYPES = new Set<string>([CARD_TYPE.Legend, CARD_TYPE.Rune, CARD_TYPE.Battlefield]);

const byCostThenName = (a: DeckEntry, b: DeckEntry) =>
  a.card.stats.cost - b.card.stats.cost || a.card.name.localeCompare(b.card.name);

function DeckSection({ title, entries, showCost = false }: { title: string; entries: DeckEntry[]; showCost?: boolean }) {
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <section aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`} className="flex justify-between text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title} <span>{total}</span>
      </h2>
      <ul className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
        {entries.map(({ card, count }) => (
          <li key={card.id}>
            <Link
              href={`/cards/${card.id}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-800/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              {showCost && (
                <span className="w-6 h-6 shrink-0 bg-gray-950 rounded flex items-center justify-center text-xs font-mono text-gray-400">
                  {card.stats.cost}
                </span>
              )}
              <span className="flex-1 truncate">{card.name}</span>
              <span className="text-xs text-gray-500">{card.type}</span>
              <span className="font-bold w-8 text-right">x{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
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
  const ofType = (type: string) => deck.cards.filter((entry) => entry.card.type === type);

  const legend = ofType(CARD_TYPE.Legend)[0]?.card;
  const runes = ofType(CARD_TYPE.Rune).sort(byCostThenName);
  const battlefields = ofType(CARD_TYPE.Battlefield).sort(byCostThenName);
  const mainDeck = deck.cards
    .filter((entry) => !NON_MAIN_DECK_TYPES.has(entry.card.type))
    .sort(byCostThenName);

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <Link href="/my-decks" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to My Decks
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Legend preview */}
        <aside className="space-y-3">
          <div className="relative aspect-[3/4] w-full max-w-[240px] rounded-xl overflow-hidden border border-purple-500/40 shadow-xl shadow-purple-900/20">
            <CardImage src={legend?.art?.thumbnailURL} alt={legend ? `Legend: ${legend.name}` : 'No Legend'} />
          </div>
          {legend && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-500">Legend</p>
              <p className="font-bold text-purple-200">{legend.name}</p>
              <DomainBadges faction={legend.faction} />
            </div>
          )}
        </aside>

        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Created <time dateTime={deck.createdAt}>{new Date(deck.createdAt).toLocaleDateString()}</time>
            </p>
          </header>

          <DeckSection title="Main Deck" entries={mainDeck} showCost />
          <DeckSection title="Rune Deck" entries={runes} />
          <DeckSection title="Battlefields" entries={battlefields} />
        </div>
      </div>
    </main>
  );
}
