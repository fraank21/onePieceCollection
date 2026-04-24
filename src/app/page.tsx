"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Search, Euro } from "lucide-react";
import AddCardModal from "@/components/AddCardModal";
import CardGrid from "@/components/CardGrid";
import type { Card } from "@/types";
import { GAMES } from "@/types";

export default function CollectionPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (gameFilter) params.set("game", gameFilter);
    const res = await fetch(`/api/cards?${params}`);
    const data = await res.json();
    setCards(data.cards);
    setTotalValue(data.totalValue);
    setLoading(false);
  }, [search, gameFilter]);

  useEffect(() => {
    const t = setTimeout(fetchCards, 300);
    return () => clearTimeout(t);
  }, [fetchCards]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta carta?")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    fetchCards();
  }

  async function handleUpdatePrices() {
    setUpdatingPrices(true);
    setPriceMessage("");
    try {
      const res = await fetch("/api/prices", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPriceMessage(data.error ?? "Error actualizando precios");
      } else {
        setPriceMessage(`Actualizadas ${data.updated} cartas`);
        fetchCards();
      }
    } catch {
      setPriceMessage("Error de conexión");
    } finally {
      setUpdatingPrices(false);
      setTimeout(() => setPriceMessage(""), 4000);
    }
  }

  const totalCards = cards.reduce((s, c) => s + c.quantity, 0);

  return (
    <>
      {showAdd && (
        <AddCardModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchCards(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mi Colección</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {totalCards} cartas · {cards.length} referencias
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {priceMessage && (
            <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
              {priceMessage}
            </span>
          )}
          <button
            onClick={handleUpdatePrices}
            disabled={updatingPrices}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={updatingPrices ? "animate-spin" : ""} />
            Actualizar precios
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Añadir carta
          </button>
        </div>
      </div>

      {/* Value banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-gray-900 border border-emerald-800/50 rounded-xl p-5 mb-6 flex items-center gap-4">
        <div className="bg-emerald-500/20 p-3 rounded-full">
          <Euro className="text-emerald-400" size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-400">Valor total estimado</p>
          <p className="text-3xl font-bold text-emerald-400">{totalValue.toFixed(2)} €</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-red-500"
            placeholder="Buscar por nombre, número, expansión..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
        >
          <option value="">Todos los juegos</option>
          {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500">Cargando...</div>
      ) : (
        <CardGrid cards={cards} onDelete={handleDelete} />
      )}
    </>
  );
}
