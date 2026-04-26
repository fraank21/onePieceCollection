import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BASE = "https://www.cardmarket.com";

// Try several User-Agent strings to see which one Cloudflare lets through
const UA_LIST = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Googlebot/2.1 (+http://www.google.com/bot.html)",
  "",
];

async function tryFetch(url: string) {
  for (const ua of UA_LIST) {
    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9",
    };
    if (ua) headers["User-Agent"] = ua;

    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      if (res.ok) return { status: res.status, html: await res.text(), ua };
      if (res.status !== 403 && res.status !== 503) {
        return { status: res.status, html: "", ua };
      }
    } catch {
      // try next
    }
  }
  return { status: 403, html: "", ua: "all blocked" };
}

export async function GET(req: NextRequest) {
  // Test a direct product path if provided, otherwise fall back to search
  const path = req.nextUrl.searchParams.get("path");
  const name = req.nextUrl.searchParams.get("name") ?? "Roronoa Zoro";

  const results: Record<string, unknown> = {};

  if (path) {
    // Direct product page test
    const url = `${BASE}${path}?sellerCountry=9`;
    const { status, html, ua } = await tryFetch(url);
    results.productUrl = url;
    results.productStatus = status;
    results.workingUa = ua;
    results.htmlSnippet = html.slice(0, 3000);

    if (html) {
      const $ = cheerio.load(html);
      const dts: string[] = [];
      $("dt").each((_, dt) => {
        dts.push(`"${$(dt).text().trim()}" → "${$(dt).next("dd").text().trim()}"`);
      });
      results.dts = dts;

      // Also check og:image
      const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      results.ogImage = ogImg ? ogImg[1] : null;
    }
  } else {
    // Search test
    const url = `${BASE}/en/OnePiece/Products/Search?searchString=${encodeURIComponent(name)}&sellerCountry=9`;
    const { status, html, ua } = await tryFetch(url);
    results.searchUrl = url;
    results.searchStatus = status;
    results.workingUa = ua;
    results.htmlSnippet = html.slice(0, 2000);
  }

  return NextResponse.json(results);
}
