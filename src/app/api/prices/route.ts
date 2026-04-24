import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchCardmarketProduct, getCardmarketProductPrice, isConfigured } from "@/lib/cardmarket";

// Update prices for all cards that haven't been updated in the last hour
export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Cardmarket API credentials not configured. Add them to your .env file." },
      { status: 503 }
    );
  }

  const { cardIds } = await req.json().catch(() => ({ cardIds: null }));

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const cards = await prisma.card.findMany({
    where: {
      ...(cardIds ? { id: { in: cardIds } } : {}),
      OR: [{ lastPriceUpdate: null }, { lastPriceUpdate: { lt: oneHourAgo } }],
    },
  });

  const results: { id: string; name: string; price: number | null; error?: string }[] = [];

  for (const card of cards) {
    try {
      let productId = card.cardmarketId;

      if (!productId) {
        const searchResult = await searchCardmarketProduct(card.name, card.game);
        const products = searchResult?.products ?? searchResult?.product;
        const match = Array.isArray(products) ? products[0] : products;
        productId = match?.idProduct?.toString() ?? null;

        if (productId) {
          await prisma.card.update({
            where: { id: card.id },
            data: { cardmarketId: productId },
          });
        }
      }

      if (productId) {
        const priceGuide = await getCardmarketProductPrice(productId);
        const price = priceGuide?.TREND ?? priceGuide?.AVG ?? null;

        await prisma.card.update({
          where: { id: card.id },
          data: { lastPrice: price, lastPriceUpdate: new Date() },
        });

        results.push({ id: card.id, name: card.name, price });
      } else {
        results.push({ id: card.id, name: card.name, price: null, error: "Not found on Cardmarket" });
      }
    } catch (err) {
      results.push({ id: card.id, name: card.name, price: null, error: String(err) });
    }
  }

  return NextResponse.json({ updated: results.length, results });
}
