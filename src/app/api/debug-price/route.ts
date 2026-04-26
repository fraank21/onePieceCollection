import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BASE = "https://www.cardmarket.com";
const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
};

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") ?? "Roronoa Zoro";
  const searchUrl = `${BASE}/en/OnePiece/Products/Search?searchString=${encodeURIComponent(name)}&sellerCountry=9`;

  let searchStatus = 0;
  let searchHtmlSnippet = "";
  let productHref: string | null = null;
  let productStatus = 0;
  let productHtmlSnippet = "";
  let dts: string[] = [];
  let price: number | null = null;

  // Step 1: search
  try {
    const res = await fetch(searchUrl, { headers: HEADERS, redirect: "follow" });
    searchStatus = res.status;
    if (res.ok) {
      const html = await res.text();
      searchHtmlSnippet = html.slice(0, 2000);
      const $ = cheerio.load(html);
      $("a[href]").each((_, el) => {
        if (productHref) return;
        const href = $(el).attr("href") ?? "";
        if (href.includes("/Products/Singles/")) productHref = href;
      });
    }
  } catch (e) {
    searchHtmlSnippet = String(e);
  }

  // Step 2: product page
  if (productHref) {
    const productUrl = `${BASE}${productHref}?sellerCountry=9`;
    try {
      const res = await fetch(productUrl, { headers: HEADERS, redirect: "follow" });
      productStatus = res.status;
      if (res.ok) {
        const html = await res.text();
        productHtmlSnippet = html.slice(0, 3000);
        const $ = cheerio.load(html);
        $("dt").each((_, dt) => {
          const label = $(dt).text().trim();
          const value = $(dt).next("dd").text().trim();
          dts.push(`"${label}" → "${value}"`);
          const labelLower = label.toLowerCase();
          if (labelLower.includes("low") || labelLower.includes("mínimo") || labelLower.includes("desde")) {
            const clean = value.replace(/\s/g, "").replace(",", ".");
            const m = clean.match(/(\d+\.\d{1,2})/);
            if (m) price = parseFloat(m[1]);
          }
        });
      }
    } catch (e) {
      productHtmlSnippet = String(e);
    }
  }

  return NextResponse.json({
    searchUrl,
    searchStatus,
    productHref,
    productStatus,
    price,
    dts,
    searchHtmlSnippet,
    productHtmlSnippet,
  });
}
