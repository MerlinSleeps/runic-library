"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Card } from '@/types/card';
import { useDeckBuilder } from '@/context/DeckBuilderContext';
import { CardImage } from '@/components/ui/CardImage';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Card as ShadCard,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CARD_TYPE } from '@/constants/card-type';
import { CardToolBar, FilterType, SortOption, SortDirection } from '@/components/ui/CardToolBar';
import { Domain } from '@/constants/domains';
import { toURLSearchParams, CardFilters, parseSearchQuery } from '@/lib/filter-utils';
import { useDebounce } from '@/hooks/useDebounce';

function DraggableCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `grid-${card.id}`,
    data: { source: 'grid', card: card },
  });

  const {
    addCard,
    mainDeck,
    runeDeck,
    battlefieldDeck,
    removeFromMainDeck,
    removeFromRuneDeck,
    removeFromBattlefieldDeck
  } = useDeckBuilder();

  const count = useMemo(() => {
    const inMain = mainDeck.find(e => e.card.id === card.id);
    if (inMain) return inMain.count;
    const inRune = runeDeck.find(e => e.card.id === card.id);
    if (inRune) return inRune.count;
    const inBattlefield = battlefieldDeck.find(e => e.card.id === card.id);
    if (inBattlefield) return inBattlefield.count;
    return 0;
  }, [mainDeck, runeDeck, battlefieldDeck, card.id]);

  const handleRemove = () => {
    if (mainDeck.some(e => e.card.id === card.id)) removeFromMainDeck(card.id);
    else if (runeDeck.some(e => e.card.id === card.id)) removeFromRuneDeck(card.id);
    else if (battlefieldDeck.some(e => e.card.id === card.id)) removeFromBattlefieldDeck(card.id);
  };

  const isBattlefield = card.type.includes(CARD_TYPE.Battlefield);
  const aspectRatioClass = isBattlefield ? 'aspect-[4/3]' : 'aspect-[3/4]';

  return (
    <div ref={setNodeRef} className="h-full group relative">
      <ShadCard className="flex flex-col justify-between overflow-hidden h-full border-0 bg-transparent">
        <CardContent className="p-0 relative">
          <div
            {...listeners}
            {...attributes}
            className={`${aspectRatioClass} w-full relative rounded-md overflow-hidden cursor-grab active:cursor-grabbing group-hover:ring-2 group-hover:ring-purple-500 transition-all`}
          >
            <CardImage
              src={card.art?.thumbnailURL}
              alt={card.name}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              disabled={count === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-white font-bold min-w-[1.5rem] text-center">{count}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); addCard(card); }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </ShadCard>
    </div>
  );
}

interface BuilderCardGridProps {
  initialCards?: Card[];
}

export default function BuilderCardGrid({ initialCards = [] }: BuilderCardGridProps) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('Legend'); // Default tab
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [factionFilter, setFactionFilter] = useState<Domain[]>([]);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [cardTypeFilter, setCardTypeFilter] = useState<string | null>(null);

  const [cards, setCards] = useState<Card[]>(initialCards);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchText, 300);



  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const { name, tags } = parseSearchQuery(debouncedSearch);

        const filters: CardFilters = {
          name: name || undefined,
          tags: tags.length > 0 ? tags : undefined,
          category: activeFilter,
          sort: sortOption,
          order: sortDirection,
          factions: factionFilter,
          rarity: rarityFilter || undefined,
          type: (cardTypeFilter && activeFilter === 'MainDeck') ? cardTypeFilter : undefined,
          page,
          limit: 40
        };

        const queryString = toURLSearchParams(filters).toString();

        const res = await fetch(`/api/cards?${queryString}`);
        if (!res.ok) throw new Error('Failed to fetch cards');

        const data = await res.json();
        if (data.data) {
          setCards(data.data);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          // Fallback if API changes back or behaves simpler
          setCards(data);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching filtered cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [
    debouncedSearch,
    activeFilter,
    sortOption,
    sortDirection,
    factionFilter,
    rarityFilter,
    cardTypeFilter,
    page
  ]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter, factionFilter, rarityFilter, cardTypeFilter]);

  const { setNodeRef } = useDroppable({ id: 'card-grid' });

  const gridColsClass = activeFilter === 'Battlefield'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="space-y-4">
      <CardToolBar
        searchValue={searchText}
        onSearchChange={setSearchText}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        factionFilter={factionFilter}
        onFactionChange={setFactionFilter}
        rarityFilter={rarityFilter}
        onRarityChange={setRarityFilter}
        cardTypeFilter={cardTypeFilter}
        onCardTypeChange={setCardTypeFilter}
      />

      <div id="builder-grid-top" ref={setNodeRef} className="relative min-h-[500px]">

        {isLoading && (
          <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
            <div className="bg-popover border p-4 rounded-full shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div className={`grid ${gridColsClass} gap-4 transition-opacity duration-200 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
          {cards.length > 0 ? (
            cards.map((card) => (
              <DraggableCard key={card.id} card={card} />
            ))
          ) : (
            !isLoading && (
              <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-lg">No cards found matching your filters.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchText('');
                    setFactionFilter([]);
                    setRarityFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-border">
          <Button
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
              document.getElementById('builder-grid-top')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
              document.getElementById('builder-grid-top')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}