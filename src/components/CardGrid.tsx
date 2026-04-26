"use client";

import { useState } from "react";
import { Trash2, Sparkles, Minus, Plus } from "lucide-react";
import type { Card } from "@/types";

interface Props {
  cards: Card[];
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onPriceChange: (id: string, price: number) => void;
}

const CONDITION_COLOR: Record<string, string> = {
  M: "text-purple-400",
  NM: "text-green-400",
  EX: "text-blue-400",
  GD: "text-yellow-400",
  LP: "text-orange-400",
  PL: "text-red-400",
  PO: "text-gray-500",
};

export default function CardGrid({ cards, onDelete, onQuantityChange, onPriceChange }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  async function handlePriceSave(card: Card) {
    const price = parseFloat(priceInput.replace(",", "."));
    setEditingPrice(null);
    if (isNaN(price) || price < 0) return;
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastPrice: price }),
    });
    onPriceChange(card.id, price);
  }

  async function handleQuantity(card: Card, delta: number) {
    const next = Math.max(1, card.quantity + delta);
    if (next === card.quantity) return;
    setUpdating(card.id);
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next }),
    });
    onQuantityChange(card.id, next);
    setUpdating(null);
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p className="text-lg">Tu colección está vacía</p>
        <p className="text-sm mt-1">Añade tu primera carta con el botón de arriba</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
        >
          {/* Image */}
          <div className="aspect-[2.5/3.5] bg-gray-800 relative overflow-hidden">
            {card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center px-2">
                {card.name}
              </div>
            )}
            {card.foil && (
              <div className="absolute top-1 right-1 bg-yellow-500/20 border border-yellow-500/40 rounded px-1">
                <Sparkles size={10} className="text-yellow-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-2">
            <p className="text-xs font-medium truncate">{card.name}</p>
            <p className="text-xs text-gray-500 truncate">{card.cardNumber}</p>

            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs font-bold ${CONDITION_COLOR[card.condition] ?? "text-gray-400"}`}>
                {card.condition}
              </span>
              {editingPrice === card.id ? (
                <input
                  autoFocus
                  className="w-16 bg-gray-700 border border-emerald-600 rounded px-1 text-xs text-emerald-400 text-right focus:outline-none"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onBlur={() => handlePriceSave(card)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePriceSave(card);
                    if (e.key === "Escape") setEditingPrice(null);
                  }}
                  placeholder="0.00"
                />
              ) : (
                <button
                  onClick={() => { setEditingPrice(card.id); setPriceInput(card.lastPrice?.toFixed(2) ?? ""); }}
                  className="text-xs text-emerald-400 font-medium hover:text-emerald-300 hover:underline transition-colors"
                  title="Haz clic para editar el precio"
                >
                  {card.lastPrice != null ? `${card.lastPrice.toFixed(2)} €` : "— €"}
                </button>
              )}
            </div>

            {/* Quantity controls */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => handleQuantity(card, -1)}
                disabled={updating === card.id || card.quantity <= 1}
                className="w-5 h-5 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-colors"
              >
                <Minus size={10} />
              </button>
              <span className="text-xs font-bold text-gray-300">
                {updating === card.id ? "..." : card.quantity}
              </span>
              <button
                onClick={() => handleQuantity(card, +1)}
                disabled={updating === card.id}
                className="w-5 h-5 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-colors"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(card.id)}
            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-700 rounded-full p-1 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
