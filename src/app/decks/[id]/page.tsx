"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import Link from "next/link";
import type { Deck, Card, DeckCard } from "@/types";

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchDeck = useCallback(async () => {
    const res = await fetch(`/api/decks/${id}`);
    if (!res.ok) { router.push("/decks"); return; }
    const data = await res.json();
    setDeck(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchDeck(); }, [fetchDeck]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/cards?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSearchResults(data.cards);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleAddCard(cardId: string) {
    await fetch(`/api/decks/${id}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, quantity: 1 }),
    });
    fetchDeck();
  }

  async function handleRemoveCard(cardId: string) {
    await fetch(`/api/decks/${id}/cards`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    fetchDeck();
  }

  if (loading) return <div className="text-center py-24 text-gray-500">Cargando...</div>;
  if (!deck) return null;

  const totalCards = deck.deckCards.reduce((s: number, dc: DeckCard) => s + dc.quantity, 0);
  const totalValue = deck.deckCards.reduce((s: number, dc: DeckCard) => s + (dc.card.lastPrice ?? 0) * dc.quantity, 0);

  // Cards already in deck
  const deckCardIds = new Set(deck.deckCards.map((dc) => dc.cardId));
  const filteredResults = searchResults.filter((c) => !deckCardIds.has(c.id));

  return (
    <>
      <div className="mb-6">
        <Link href="/decks" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4">
          <ArrowLeft size={16} /> Mis Decks
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {deck.game}{deck.format ? ` · ${deck.format}` : ""} · {totalCards} cartas
            </p>
            {deck.description && (
              <p className="text-gray-400 text-sm mt-1">{deck.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Valor estimado</p>
            <p className="text-xl font-bold text-emerald-400">{totalValue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* Add card panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <button
          onClick={() => setShowAddCard((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
        >
          <Plus size={16} />
          {showAddCard ? "Cerrar búsqueda" : "Añadir carta al deck"}
        </button>

        {showAddCard && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-red-500"
                placeholder="Busca una carta de tu colección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {searching && <p className="text-xs text-gray-500">Buscando...</p>}

            {filteredResults.length > 0 && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {filteredResults.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleAddCard(card.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 text-left transition-colors"
                  >
                    <span className="text-sm">
                      {card.name}
                      <span className="text-gray-500 ml-2 text-xs">{card.cardNumber} · {card.expansion}</span>
                    </span>
                    <Plus size={14} className="text-gray-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {search && !searching && filteredResults.length === 0 && (
              <p className="text-xs text-gray-500">
                No hay resultados. Asegúrate de tener la carta en tu colección.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Deck card list */}
      {deck.deckCards.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          El deck está vacío. Añade cartas desde tu colección.
        </div>
      ) : (
        <div className="space-y-2">
          {deck.deckCards.map((dc) => (
            <div
              key={dc.id}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors group"
            >
              {dc.card.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dc.card.imageUrl}
                  alt={dc.card.name}
                  className="w-10 h-14 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{dc.card.name}</p>
                <p className="text-xs text-gray-500">{dc.card.cardNumber} · {dc.card.expansion}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-400">x{dc.quantity}</span>
                {dc.card.lastPrice != null && (
                  <span className="text-sm text-emerald-400">
                    {(dc.card.lastPrice * dc.quantity).toFixed(2)} €
                  </span>
                )}
                <button
                  onClick={() => handleRemoveCard(dc.cardId)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
