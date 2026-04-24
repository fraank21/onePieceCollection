"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CONDITIONS, CONDITION_LABELS, LANGUAGES, LANGUAGE_LABELS, GAMES } from "@/types";
import type { Condition, Language } from "@/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: Record<string, string | number | boolean> = {
  name: "",
  cardNumber: "",
  expansion: "",
  game: "One Piece",
  condition: "NM",
  language: "EN",
  quantity: 1,
  foil: false,
  imageUrl: "",
  cardmarketId: "",
};

export default function AddCardModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.cardNumber || !form.expansion) {
      setError("Nombre, número y expansión son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        imageUrl: form.imageUrl || null,
        cardmarketId: form.cardmarketId || null,
      };
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error guardando la carta");
      onSaved();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Añadir carta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.name)}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Monkey D. Luffy"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Número *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.cardNumber)}
                onChange={(e) => set("cardNumber", e.target.value)}
                placeholder="OP01-001"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Expansión *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.expansion)}
                onChange={(e) => set("expansion", e.target.value)}
                placeholder="Romance Dawn"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Juego</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.game)}
                onChange={(e) => set("game", e.target.value)}
              >
                {GAMES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={Number(form.quantity)}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Condición</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.condition)}
                onChange={(e) => set("condition", e.target.value as Condition)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c} — {CONDITION_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Idioma</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.language)}
                onChange={(e) => set("language", e.target.value as Language)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l} — {LANGUAGE_LABELS[l]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <input
                id="foil"
                type="checkbox"
                className="w-4 h-4 accent-red-500"
                checked={Boolean(form.foil)}
                onChange={(e) => set("foil", e.target.checked)}
              />
              <label htmlFor="foil" className="text-sm">Foil / Alternate Art</label>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">URL de imagen (opcional)</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.imageUrl)}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">ID de Cardmarket (opcional)</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={String(form.cardmarketId)}
                onChange={(e) => set("cardmarketId", e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Añadir carta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
