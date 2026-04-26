"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CONDITIONS, CONDITION_LABELS, LANGUAGES, LANGUAGE_LABELS, GAMES } from "@/types";
import type { Condition, Language } from "@/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  cardNumber: string;
  expansion: string;
  game: string;
  condition: Condition;
  language: Language;
  quantity: number;
  foil: boolean;
  imageUrl: string;
  cardmarketId: string;
}

const EMPTY: FormState = {
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

const GAME_SLUG_MAP: Record<string, string> = {
  OnePiece: "One Piece",
  Magic: "Magic: The Gathering",
  YuGiOh: "Yu-Gi-Oh!",
  Pokemon: "Pokemon",
  Digimon: "Digimon",
  Lorcana: "Lorcana",
};

function parseCardmarketUrl(raw: string): Partial<FormState> | null {
  try {
    const { pathname } = new URL(raw.trim());
    // /es/OnePiece/Products/Singles/Adventure-on-Kamis-Island/Roronoa-Zoro-EB04-007-V1
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 6 || parts[2] !== "Products" || parts[3] !== "Singles") return null;

    const gameSlug = parts[1];
    const expansionSlug = parts[4];
    const cardSlug = parts[5];

    const game = GAME_SLUG_MAP[gameSlug] ?? "One Piece";
    const expansion = expansionSlug.replace(/-/g, " ");

    // Match card number like OP01-001, EB04-007, ST01-001, P-001
    const numMatch = cardSlug.match(/([A-Z]{1,4}\d{0,4}-\d{2,4})/);
    const cardNumber = numMatch ? numMatch[1] : "";

    const namePart = cardNumber
      ? cardSlug.substring(0, cardSlug.indexOf(cardNumber)).replace(/-+$/, "")
      : cardSlug.replace(/-V\d+$/, "");
    const name = namePart.replace(/-/g, " ").trim();

    // Normalize to /en/ and store path only
    const cardmarketId = `/en/${gameSlug}/Products/Singles/${expansionSlug}/${cardSlug}`;

    return { game, expansion, cardNumber, name, cardmarketId };
  } catch {
    return null;
  }
}

export default function AddCardModal({ onClose, onSaved }: Props) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [parsed, setParsed] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUrlChange(value: string) {
    setUrl(value);
    setUrlError("");
    if (!value.trim()) {
      setForm(EMPTY);
      setParsed(false);
      return;
    }
    const result = parseCardmarketUrl(value);
    if (result) {
      setForm((f) => ({ ...f, ...result }));
      setParsed(true);

      // Auto-fetch card image from Cardmarket og:image
      setFetchingImage(true);
      try {
        const res = await fetch(`/api/card-info?url=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        if (data.imageUrl) setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
      } catch {
        // image fetch failing is non-critical
      } finally {
        setFetchingImage(false);
      }
    } else {
      setParsed(false);
      setUrlError("URL no reconocida. Debe ser una página de producto de Cardmarket.");
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.cardNumber || !form.expansion) {
      setError("Pega una URL de Cardmarket válida o rellena nombre, número y expansión.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* URL input */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              URL de Cardmarket
            </label>
            <input
              autoFocus
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                urlError
                  ? "border-red-600 focus:border-red-500"
                  : parsed
                  ? "border-emerald-700 focus:border-emerald-500"
                  : "border-gray-700 focus:border-red-500"
              }`}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.cardmarket.com/es/OnePiece/Products/Singles/..."
            />
            {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
            {parsed && (
              <p className="text-xs text-emerald-400 mt-1">
                {fetchingImage ? "Buscando imagen..." : "Carta detectada — revisa los campos y ajusta si hace falta"}
              </p>
            )}
          </div>

          {/* Auto-filled card info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Roronoa Zoro"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Número *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.cardNumber}
                onChange={(e) => set("cardNumber", e.target.value)}
                placeholder="EB04-007"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Expansión *</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.expansion}
                onChange={(e) => set("expansion", e.target.value)}
                placeholder="Adventure on Kamis Island"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Juego</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.game}
                onChange={(e) => set("game", e.target.value)}
              >
                {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Condición</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.condition}
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
                value={form.language}
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
                checked={form.foil}
                onChange={(e) => set("foil", e.target.checked)}
              />
              <label htmlFor="foil" className="text-sm">Foil / Alternate Art</label>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">URL de imagen (opcional)</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
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
