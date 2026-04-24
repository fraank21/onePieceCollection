"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, BookOpen, ChevronRight } from "lucide-react";
import type { Deck, DeckCard } from "@/types";
import { GAMES } from "@/types";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [game, setGame] = useState("One Piece");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchDecks() {
    setLoading(true);
    const res = await fetch("/api/decks");
    const data = await res.json();
    setDecks(data);
    setLoading(false);
  }

  useEffect(() => { fetchDecks(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, game, description: description || null, format: format || null }),
    });
    setName(""); setGame("One Piece"); setDescription(""); setFormat("");
    setShowForm(false);
    setSaving(false);
    fetchDecks();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este deck?")) return;
    await fetch(`/api/decks/${id}`, { method: "DELETE" });
    fetchDecks();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mis Decks</h1>
          <p className="text-gray-400 text-sm mt-0.5">{decks.length} decks guardados</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          Nuevo deck
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 space-y-4"
        >
          <h2 className="font-semibold">Nuevo deck</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi deck de Luffy"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Juego</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              >
                {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Formato</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Standard, Block..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Descripción</label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas sobre el deck..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear deck"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-24 text-gray-500">Cargando...</div>
      ) : decks.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No tienes decks todavía</p>
          <p className="text-sm mt-1">Crea uno con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const cardCount = deck.deckCards.reduce((s: number, dc: DeckCard) => s + dc.quantity, 0);
            const value = deck.deckCards.reduce(
              (s: number, dc: DeckCard) => s + (dc.card.lastPrice ?? 0) * dc.quantity,
              0
            );
            return (
              <div
                key={deck.id}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{deck.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{deck.game}{deck.format ? ` · ${deck.format}` : ""}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(deck.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-2 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {deck.description && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{deck.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{cardCount} cartas</span>
                  {value > 0 && (
                    <span className="text-emerald-400 font-medium">{value.toFixed(2)} €</span>
                  )}
                </div>

                <Link
                  href={`/decks/${deck.id}`}
                  className="mt-4 flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
                >
                  Ver deck <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
