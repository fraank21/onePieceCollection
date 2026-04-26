import * as cheerio from "cheerio";

const BASE = "https://www.cardmarket.com";
const SPAIN_COUNTRY = 9;

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
};

function parseEuroPrice(text: string): number | null {
  const clean = text.replace(/\s/g, "").replace(",", ".");
  const m = clean.match(/(\d+\.\d{1,2})/);
  return m ? parseFloat(m[1]) : null;
}

async function cmFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

// productId is the URL path stored when the card was added, e.g.
// /en/OnePiece/Products/Singles/Adventure-on-Kamis-Island/Roronoa-Zoro-EB04-007-V1
export async function getCardmarketProductPrice(productId: string) {
  const url = `${BASE}${productId}?sellerCountry=${SPAIN_COUNTRY}`;
  const html = await cmFetch(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  let low: number | null = null;
  let trend: number | null = null;

  // Try dt/dd definition lists (Cardmarket desktop layout)
  $("dt").each((_, dt) => {
    const label = $(dt).text().toLowerCase().trim();
    const value = $(dt).next("dd").text().trim();
    if (!value) return;
    if (label.includes("trend")) trend = parseEuroPrice(value);
    if (label.includes("low") || label.includes("mínimo") || label.includes("desde") || label.includes("from")) {
      low = parseEuroPrice(value);
    }
  });

  // Try table rows as fallback
  if (!low && !trend) {
    $("tr").each((_, tr) => {
      const cells = $(tr).find("td, th");
      if (cells.length < 2) return;
      const label = $(cells[0]).text().toLowerCase().trim();
      const value = $(cells[1]).text().trim();
      if (label.includes("trend")) trend = parseEuroPrice(value);
      if (label.includes("low") || label.includes("mínimo") || label.includes("from")) {
        low = parseEuroPrice(value);
      }
    });
  }

  // Regex fallback: scan raw HTML for price patterns near keywords
  if (!low && !trend) {
    const lowMatch = html.match(/(?:low|m[ií]nimo|desde|from)[^€\d]{0,30}(\d+[,.]\d{1,2})\s*€/i);
    if (lowMatch) low = parseEuroPrice(lowMatch[1]);
    const trendMatch = html.match(/trend[^€\d]{0,30}(\d+[,.]\d{1,2})\s*€/i);
    if (trendMatch) trend = parseEuroPrice(trendMatch[1]);
  }

  return { priceGuide: { LOW: low, TREND: trend } };
}

// Not used when cardmarketId is pre-set via URL, kept as fallback
export async function searchCardmarketProduct(name: string, game = "One Piece") {
  const slugMap: Record<string, string> = {
    "One Piece": "OnePiece",
    "Magic: The Gathering": "Magic",
    "Yu-Gi-Oh!": "YuGiOh",
    Pokemon: "Pokemon",
    Digimon: "Digimon",
    Lorcana: "Lorcana",
  };
  const gameSlug = slugMap[game] ?? "OnePiece";
  const url = `${BASE}/en/${gameSlug}/Products/Search?searchString=${encodeURIComponent(name)}&sellerCountry=${SPAIN_COUNTRY}`;

  const html = await cmFetch(url);
  if (!html) return { products: [] };

  const $ = cheerio.load(html);
  let productHref: string | null = null;
  $("a[href]").each((_, el) => {
    if (productHref) return;
    const href = $(el).attr("href") ?? "";
    if (href.includes("/Products/Singles/")) productHref = href;
  });

  return { products: productHref ? [{ idProduct: productHref }] : [] };
}

export function isConfigured(): boolean {
  return true;
}
