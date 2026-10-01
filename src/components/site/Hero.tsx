"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Layers, Library } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CardSearch } from "@/components/shared/CardSearch"

export function Hero() {
    const router = useRouter()
    const [query, setQuery] = React.useState("")

    const handleSearch = (val: string) => {
        if (val.trim()) {
            router.push(`/cards?name=${encodeURIComponent(val)}`)
        }
    }

    return (
        <section className="flex flex-col items-center justify-center pt-32 pb-12 md:pt-48 md:pb-24 px-4 text-center">

            <div className="container max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* Title Section */}
                <div className="space-y-4">
                    <h1 className="font-arcane text-7xl md:text-9xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">
                        RUNIC LIBRARY
                    </h1>
                    <p className="font-arcane text-xl md:text-2xl text-cyan-400 tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        The Premier Riftbound Deckbuilder
                    </p>
                </div>

                {/* Search Section - Centered & Wide */}
                <div className="w-full max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
                    <CardSearch
                        value={query}
                        onChange={setQuery}
                        onSearch={handleSearch}
                        variant="hero"
                        placeholder="Search by name or tag (e.g. &quot;Sett&quot; )"
                        className="shadow-2xl"
                    />
                </div>

                {/* Subtext */}
                <p className="max-w-xl mx-auto text-lg text-gray-300 font-medium drop-shadow-md">
                    Craft your theory. Master the magic. Share your legacy.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                    <Link href="/build">
                        <Button
                            size="lg"
                            className="h-14 px-10 text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 hover:-translate-y-1"
                        >
                            <Layers className="mr-2 h-5 w-5" />
                            Build a Deck
                        </Button>
                    </Link>

                    <Link href="/cards">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-10 text-lg font-bold tracking-wide uppercase border-white/10 bg-black/40 hover:bg-black/60 text-cyan-100 backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-400/50"
                        >
                            <Library className="mr-2 h-5 w-5" />
                            Browse Cards
                        </Button>
                    </Link>
                </div>

            </div>
        </section>
    )
}