"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { DOMAIN, Domain } from '@/constants/domains';
import { CARD_TYPE } from '@/constants/card-type';
import type { Card } from '@/types/card';
import { useDebounce } from '@/hooks/useDebounce';

import type { CardCategory, SortOption, SortDirection } from '@/lib/filter-utils';

export type FilterType = CardCategory;
export type { SortOption, SortDirection };

interface CardToolBarProps {
    // Search
    searchValue: string;
    onSearchChange: (value: string) => void;

    // Main Toggles
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;

    // Advanced Filters
    sortOption: SortOption;
    onSortChange: (sort: SortOption) => void;
    sortDirection: SortDirection;
    onSortDirectionChange: (dir: SortDirection) => void;

    factionFilter: Domain[];
    onFactionChange: (faction: Domain[]) => void;

    rarityFilter: string | null;
    onRarityChange: (rarity: string | null) => void;

    cardTypeFilter: string | null;
    onCardTypeChange: (type: string | null) => void;
}

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Showcase'];
const MAIN_DECK_TYPES = [CARD_TYPE.Unit, CARD_TYPE.Spell, CARD_TYPE.Gear];

export function CardToolBar({
    searchValue,
    onSearchChange,
    activeFilter,
    onFilterChange,
    sortOption,
    onSortChange,
    sortDirection,
    onSortDirectionChange,
    factionFilter,
    onFactionChange,
    rarityFilter,
    onRarityChange,
    cardTypeFilter,
    onCardTypeChange,
}: CardToolBarProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    // Local state gives immediate typing feedback; the parent is only updated on Enter/blur.
    const [localSearch, setLocalSearch] = useState(searchValue);

    const debouncedSearch = useDebounce(localSearch, 300);

    const [suggestions, setSuggestions] = useState<Card[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearch.length < 2) {
                setSuggestions([])
                return
            }

            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
                if (res.ok) {
                    const data = await res.json()
                    setSuggestions(data)
                }
            } catch (error) {
                console.error("Failed to fetch suggestions", error)
            }
        }

        const timeoutId = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timeoutId)
    }, [debouncedSearch])

    // Keep local state in sync when the parent value changes (e.g. browser back button).
    useEffect(() => {
        setLocalSearch(searchValue);
    }, [searchValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearchChange(debouncedSearch);
            setShowSuggestions(false);
        }
    };

    const handleFactionToggle = (domain: Domain) => {
        if (factionFilter.includes(domain)) {
            onFactionChange(factionFilter.filter(d => d !== domain));
        } else {
            const newFactions = [...factionFilter, domain];
            if (newFactions.length === Object.keys(DOMAIN).length) {
                onFactionChange([]);
            } else {
                onFactionChange(newFactions);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            {/* Top Row: Search and Toggles */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search card name... (Press Enter)"
                        value={localSearch}
                        onChange={(e) => {
                            setLocalSearch(e.target.value)
                            setShowSuggestions(true)
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            onSearchChange(localSearch)
                            setTimeout(() => setShowSuggestions(false), 200)
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="pl-8 bg-gray-800 border-gray-700"
                    />
                    {/* Typeahead Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                            {suggestions.map((card) => (
                                <div
                                    key={card.id}
                                    className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setLocalSearch(card.name)
                                        onSearchChange(card.name)
                                        setShowSuggestions(false)
                                    }}
                                >
                                    <span className="text-gray-200">{card.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={activeFilter === 'All' ? 'default' : 'outline'}
                        onClick={() => onFilterChange('All')}
                        className="transition-all"
                    >
                        All Cards
                    </Button>
                    <Button
                        variant={activeFilter === 'Legend' ? 'default' : 'outline'}
                        onClick={() => onFilterChange('Legend')}
                        className="transition-all"
                    >
                        Legends
                    </Button>
                    <Button
                        variant={activeFilter === 'MainDeck' ? 'default' : 'outline'}
                        onClick={() => onFilterChange('MainDeck')}
                        className="transition-all"
                    >
                        Main Deck
                    </Button>
                    <Button
                        variant={activeFilter === 'Battlefield' ? 'default' : 'outline'}
                        onClick={() => onFilterChange('Battlefield')}
                        className="transition-all"
                    >
                        Battlefield
                    </Button>
                    <Button
                        variant={activeFilter === 'Rune' ? 'default' : 'outline'}
                        onClick={() => onFilterChange('Rune')}
                        className="transition-all"
                    >
                        Runes
                    </Button>
                </div>
            </div>

            {/* Advanced Search Toggle */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                    {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {/* Advanced Filters Section */}
            {isAdvancedOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2">

                    {/* 1. Sort By */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Sort By</label>
                        <div className="flex gap-2">
                            <select
                                value={sortOption}
                                onChange={(e) => onSortChange(e.target.value as SortOption)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white focus:ring-offset-0"
                            >
                                <option value="name">Name</option>
                                <option value="cost">Cost</option>
                                <option value="might">Might</option>
                            </select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
                                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* 2. Faction Filter */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Faction</label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={factionFilter.length === 0 ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => onFactionChange([])}
                                className="text-xs"
                            >
                                All
                            </Button>
                            {Object.values(DOMAIN).map((domain) => (
                                <Button
                                    key={domain}
                                    variant={factionFilter.includes(domain) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFactionToggle(domain)}
                                    className="text-xs"
                                >
                                    {domain}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Rarity & Card Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Properties</label>
                        <div className="flex flex-col gap-2">
                            <select
                                value={rarityFilter || ''}
                                onChange={(e) => onRarityChange(e.target.value || null)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white focus:ring-offset-0"
                            >
                                <option value="">Any Rarity</option>
                                {RARITIES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>

                            <select
                                value={cardTypeFilter || ''}
                                onChange={(e) => onCardTypeChange(e.target.value || null)}
                                disabled={activeFilter !== 'MainDeck'}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white disabled:opacity-50 focus:ring-offset-0"
                            >
                                <option value="">Any Type</option>
                                {MAIN_DECK_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}