"use client";

import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useDeckBuilder } from '@/context/DeckBuilderContext';
import { Card } from '@/types/card';
import { CardImage } from '@/components/ui/CardImage';

export default function DeckBuilderDragDropWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        addCard,
        removeLegend,
        removeFromMainDeck,
        removeFromRuneDeck,
        removeFromBattlefieldDeck,
        championLegend,
    } = useDeckBuilder();

    const [activeCard, setActiveCard] = useState<Card | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const card = active.data.current?.card as Card;
        if (card) {
            setActiveCard(card);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);


        // If dropped outside of any droppable area
        if (!over) {
            // Check if it was dragged from the deck list (removal)
            const source = active.data.current?.source;
            if (source === 'deck-list') {
                const deckType = active.data.current?.deckType;

                const card = active.data.current?.card as Card;
                if (!card) return;

                if (deckType === 'legend') {
                    removeLegend();
                } else if (deckType === 'main') {
                    removeFromMainDeck(card.id);
                } else if (deckType === 'rune') {
                    removeFromRuneDeck(card.id);
                } else if (deckType === 'battlefield') {
                    removeFromBattlefieldDeck(card.id);
                }
            }
            return;
        }

        if (over.id === 'deck-list') {
            const source = active.data.current?.source;

            if (source === 'grid') {
                const card = active.data.current?.card as Card;
                if (card) {
                    addCard(card);
                }
            }
        }

        if (over.id === 'champion-slot') {
            const source = active.data.current?.source;
            if (source === 'grid') {
                const card = active.data.current?.card as Card;
                if (card && championLegend) {
                    // Check if it's a Champion Unit and matches Legend tag
                    const isChampionUnit = card.type.includes('Unit');
                    const matchesLegend = card.tags.some(tag => championLegend.tags.includes(tag));
                    console.log(isChampionUnit, matchesLegend);

                    if (isChampionUnit && matchesLegend) {
                        addCard(card);
                    }
                }
            }
        }

        // If dropped on the grid (removal)
        if (over.id === 'card-grid') {
            const source = active.data.current?.source;
            if (source === 'deck-list') {
                const deckType = active.data.current?.deckType;
                const card = active.data.current?.card as Card;
                if (!card) return;

                if (deckType === 'legend') {
                    removeLegend();
                } else if (deckType === 'main') {
                    removeFromMainDeck(card.id);
                } else if (deckType === 'rune') {
                    removeFromRuneDeck(card.id);
                } else if (deckType === 'battlefield') {
                    removeFromBattlefieldDeck(card.id);
                }
            }
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
            {children}
            <DragOverlay modifiers={[snapCenterToCursor]} dropAnimation={null}>
                {activeCard ? (
                    <div className="w-[200px] pointer-events-none opacity-80">
                        {/* Simple preview card */}
                        <div className="rounded-lg overflow-hidden border border-gray-600 bg-gray-900 shadow-xl">
                            <div className="aspect-[3/4] w-full relative">
                                <CardImage src={activeCard.art?.thumbnailURL} alt={activeCard.name} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
