"use client";

import { useState } from 'react';
import { useDeckBuilder } from '@/context/DeckBuilderContext';
import { useAuth } from '@/context/AuthContext';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { Card } from '@/types/card';
import { CardImage } from '@/components/ui/CardImage';

import { Button } from '@/components/ui/button';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

function DraggableDeckItem({ id, children, deckType, card }: { id: string, children: React.ReactNode, deckType: string, card: Card }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      source: 'deck-list',
      deckType: deckType,
      card: card,
    },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default function DeckList() {
  const {
    championLegend,
    mainDeck,
    runeDeck,
    battlefieldDeck,
    removeFromMainDeck,
    removeFromRuneDeck,
    removeFromBattlefieldDeck,
    validation
  } = useDeckBuilder();

  const { user } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  const { setNodeRef } = useDroppable({
    id: 'deck-list',
  });

  const { setNodeRef: setChampionRef } = useDroppable({
    id: 'champion-slot',
    disabled: !championLegend,
  });

  const championCardEntry = mainDeck.find(entry =>
    entry.card.type.includes('Unit') &&
    championLegend &&
    entry.card.tags.some(tag => championLegend.tags.includes(tag))
  );
  const championCard = championCardEntry?.card;


  const displayMainDeck = mainDeck.map(entry => {
    if (championCard && entry.card.id === championCard.id) {
      return { ...entry, count: entry.count - 1 };
    }
    return entry;
  }).filter(entry => entry.count > 0);


  const handleSaveDeck = async () => {
    if (!user) {
      alert('You must be logged in to save a deck.');
      return;
    }
    try {
      const token = await user.getIdToken();

      const fullDeck = {
        legend: championLegend,
        mainDeck,
        runeDeck,
        battlefieldDeck
      };

      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: deckName, deck: fullDeck }),
      });
      if (!response.ok) throw new Error('Failed to save deck');
      alert('Deck saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Error saving deck.');
    }
  };

  return (
    <aside ref={setNodeRef} className="sticky top-24 bg-gray-900 p-4 rounded-lg border border-gray-700 h-[calc(100vh-8rem)] flex flex-col relative">
      {/* Hover Preview */}
      {hoveredCard && (
        <div className="fixed right-[24rem] top-32 z-50 pointer-events-none w-[240px] animate-in fade-in zoom-in-95 duration-150">
          <div className="rounded-xl overflow-hidden border-2 border-purple-500/50 bg-gray-900 shadow-2xl shadow-purple-900/20">
            <div className="aspect-[3/4] w-full relative">
              <CardImage src={hoveredCard.art?.thumbnailURL} alt={hoveredCard.name} />
            </div>
            <div className="p-3 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
              <p className="font-bold text-white text-lg leading-tight mb-1">{hoveredCard.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">{hoveredCard.type}</span>
                {hoveredCard.stats?.cost !== undefined && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-900/30 border border-blue-800 text-blue-200">Cost: {hoveredCard.stats.cost}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Deck</h2>
        <div className="flex items-center gap-2">
          {validation.isDeckValid ? (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-600 text-white hover:bg-green-700">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-600 text-white hover:bg-red-700">
              <AlertCircle className="w-3 h-3 mr-1" /> Invalid
            </span>
          )}
        </div>
      </div>

      <div className="flex-grow pr-4 overflow-y-auto">
        <div className="space-y-6">

          {/* LEGEND SECTION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Legend</h3>
            {championLegend ? (
              <DraggableDeckItem id={`legend-${championLegend.id}`} deckType="legend" card={championLegend}>
                <div
                  className="bg-purple-900/30 border border-purple-500/50 p-3 rounded flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-purple-900/40 transition-colors"
                  onMouseEnter={() => setHoveredCard(championLegend)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/*TODO: Create Gradient*/}
                  {/*<Image src={championLegend.art.thumbnailURL} alt={championLegend.name} width={48} height={48} className="w-12 h-12 rounded object-cover" />*/}                  <div>
                    <p className="font-bold text-purple-200">{championLegend.name}</p>
                    <p className="text-xs text-purple-300">{championLegend.faction}</p>
                  </div>
                </div>
              </DraggableDeckItem>
            ) : (
              <div className="border border-dashed border-gray-600 rounded p-4 text-center text-gray-500 text-sm">
                Select a Legend to start
              </div>
            )}
          </div>

          {/* CHAMPION SECTION */}
          <div ref={setChampionRef}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Champion</h3>
              {!championLegend && (
                <span className="text-xs text-red-400">Select Legend first</span>
              )}
            </div>

            {championCard ? (
              <DraggableDeckItem id={`champion-${championCard.id}`} deckType="main" card={championCard}>
                <div
                  className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-yellow-900/40 transition-colors"
                  onMouseEnter={() => setHoveredCard(championCard)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/*<Image src={championCard.art.thumbnailURL} alt={championCard.name} width={48} height={48} className="w-12 h-12 rounded object-cover" />*/}
                  <div>
                    <p className="font-bold text-yellow-200">{championCard.name}</p>
                    <p className="text-xs text-yellow-300">{championCard.type}</p>
                  </div>
                </div>
              </DraggableDeckItem>
            ) : (
              <div className={`border border-dashed rounded p-4 text-center text-sm transition-colors ${championLegend ? 'border-gray-600 text-gray-500' : 'border-gray-800 text-gray-700 bg-gray-900/50'}`}>
                {championLegend ? 'Drag Champion here' : 'Select Legend first'}
              </div>
            )}
          </div>

          {/* MAIN DECK SECTION */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Main Deck</h3>
              <span className={`text-xs font-bold ${validation.isMainDeckSizeValid ? 'text-green-400' : 'text-red-400'}`}>
                {validation.totalMainDeckCards} / 40
              </span>
            </div>

            {validation.mainDeckErrors.length > 0 && (
              <div className="mb-2 p-2 bg-red-900/20 border border-red-900 rounded text-xs text-red-300">
                {validation.mainDeckErrors.map((err, i) => <div key={i}>• {err}</div>)}
              </div>
            )}

            <div className="space-y-1">
              {displayMainDeck.map(({ card, count }) => (
                <DraggableDeckItem key={card.id} id={`main-${card.id}`} deckType="main" card={card}>
                  <div
                    className="group flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 p-2 rounded text-sm transition-colors cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center text-xs font-mono text-gray-400">{card.stats.cost}</div>
                      <span className="truncate">{card.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">x{count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent drag start when clicking remove
                          removeFromMainDeck(card.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </DraggableDeckItem>
              ))}
            </div>
          </div>

          {/* RUNE DECK SECTION */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rune Deck</h3>
              <span className={`text-xs font-bold ${validation.isRuneDeckSizeValid ? 'text-green-400' : 'text-red-400'}`}>
                {validation.totalRuneCards} / 12
              </span>
            </div>

            {validation.runeDeckErrors.length > 0 && (
              <div className="mb-2 p-2 bg-red-900/20 border border-red-900 rounded text-xs text-red-300">
                {validation.runeDeckErrors.map((err, i) => <div key={i}>• {err}</div>)}
              </div>
            )}

            <div className="space-y-1">
              {runeDeck.map(({ card, count }) => (
                <DraggableDeckItem key={card.id} id={`rune-${card.id}`} deckType="rune" card={card}>
                  <div
                    className="group flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 p-2 rounded text-sm transition-colors cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <span className="truncate text-blue-200">{card.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">x{count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRuneDeck(card.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </DraggableDeckItem>
              ))}
            </div>
          </div>

          {/* BATTLEFIELD DECK SECTION */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Battlefield</h3>
              <span className={`text-xs font-bold ${validation.isBattlefieldDeckSizeValid ? 'text-green-400' : 'text-red-400'}`}>
                {validation.totalBattlefieldCards} / 3
              </span>
            </div>

            {validation.battlefieldDeckErrors.length > 0 && (
              <div className="mb-2 p-2 bg-red-900/20 border border-red-900 rounded text-xs text-red-300">
                {validation.battlefieldDeckErrors.map((err, i) => <div key={i}>• {err}</div>)}
              </div>
            )}

            <div className="space-y-1">
              {battlefieldDeck.map(({ card }) => (
                <DraggableDeckItem key={card.id} id={`battlefield-${card.id}`} deckType="battlefield" card={card}>
                  <div
                    className="group flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 p-2 rounded text-sm transition-colors cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <span className="truncate text-orange-200">{card.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromBattlefieldDeck(card.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </DraggableDeckItem>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={!validation.isDeckValid || !user}>
              {user ? 'Save Deck' : 'Log in to save'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Your Deck</AlertDialogTitle>
              <AlertDialogDescription>
                Give your new deck a name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="My Awesome Deck"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveDeck}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}