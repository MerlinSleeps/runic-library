"use client";

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Card } from '@/types/card';
import { CardImage } from '@/components/ui/CardImage';
import { Card as ShadCard, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardToolBar } from '@/components/ui/CardToolBar';
import { CARD_TYPE } from '@/constants/card-type';
import type { Domain } from '@/constants/domains';
import { toURLSearchParams, type CardCategory, type SortDirection, type SortOption } from '@/lib/filter-utils';

interface CardGridProps {
  cards: Card[];
  totalPages: number;
  currentPage: number;
  initialCategory: CardCategory;
}

export default function CardGrid({ cards, totalPages, currentPage, initialCategory }: CardGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filter state is initialised from the URL, so links and the back button keep working.
  const [searchText, setSearchText] = useState(searchParams.get('name') ?? '');
  const [activeFilter, setActiveFilter] = useState<CardCategory>(initialCategory);
  const [sortOption, setSortOption] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'name');
  const [sortDirection, setSortDirection] = useState<SortDirection>((searchParams.get('order') as SortDirection) || 'asc');
  const [factionFilter, setFactionFilter] = useState<Domain[]>(searchParams.getAll('factions') as Domain[]);
  const [rarityFilter, setRarityFilter] = useState<string | null>(searchParams.get('rarity'));
  const [cardTypeFilter, setCardTypeFilter] = useState<string | null>(searchParams.get('type'));
  const [page, setPage] = useState(currentPage);

  // Sync filter state -> URL. The server component re-renders with the new results.
  useEffect(() => {
    const params = toURLSearchParams({
      name: searchText || undefined,
      category: activeFilter,
      sort: sortOption,
      order: sortDirection,
      factions: factionFilter,
      rarity: rarityFilter ?? undefined,
      type: activeFilter === 'MainDeck' ? cardTypeFilter ?? undefined : undefined,
      page,
    }).toString();

    if (params === searchParams.toString()) return;

    startTransition(() => {
      router.push(`?${params}`);
    });
  }, [searchText, activeFilter, sortOption, sortDirection, factionFilter, rarityFilter, cardTypeFilter, page, router, searchParams]);

  /** Wraps a setter so that changing a filter always jumps back to page 1. */
  function resetPageOn<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const gridColsClass = activeFilter === 'Battlefield'
    ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';

  return (
    <div>
      <CardToolBar
        searchValue={searchText}
        onSearchChange={resetPageOn(setSearchText)}
        activeFilter={activeFilter}
        onFilterChange={resetPageOn(setActiveFilter)}
        sortOption={sortOption}
        onSortChange={resetPageOn(setSortOption)}
        sortDirection={sortDirection}
        onSortDirectionChange={resetPageOn(setSortDirection)}
        factionFilter={factionFilter}
        onFactionChange={resetPageOn(setFactionFilter)}
        rarityFilter={rarityFilter}
        onRarityChange={resetPageOn(setRarityFilter)}
        cardTypeFilter={cardTypeFilter}
        onCardTypeChange={resetPageOn(setCardTypeFilter)}
      />

      <div className="flex flex-col gap-6">
        <div className={`grid ${gridColsClass} gap-4 ${isPending ? 'opacity-50' : ''}`}>
          {cards.map((card) => {
            const isBattlefield = card.type === CARD_TYPE.Battlefield;
            const aspectRatioClass = isBattlefield ? 'aspect-[4/3]' : 'aspect-[3/4]';

            return (
              <Link href={`/cards/${card.id}`} key={card.id}>
                <ShadCard className="flex flex-col justify-between overflow-hidden h-full hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow border-0 bg-transparent">
                  <CardContent className="p-0">
                    <div className={`${aspectRatioClass} w-full relative rounded-md overflow-hidden`}>
                      <CardImage src={card.art?.thumbnailURL} alt={card.name} />
                    </div>
                  </CardContent>
                </ShadCard>
              </Link>
            );
          })}

          {cards.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No cards found matching your filters.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-center gap-4 py-8 border-t border-gray-800">
            <Button
              variant="outline"
              disabled={page <= 1 || isPending}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <span className="text-sm font-medium text-gray-400">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page >= totalPages || isPending}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
