import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchCardmarketProduct, getCardmarketProductPrice } from "@/lib/cardmarket";

// Update prices for all cards that haven't been updated in the last hour
export async function POST(req: NextRequest) {
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
      let productId: string | null = card.cardmarketId;

      if (!productId) {
        const searchResult = await searchCardmarketProduct(card.name, card.game);
        productId = searchResult.products[0]?.idProduct ?? null;

        if (productId) {
          await prisma.card.update({
            where: { id: card.id },
            data: { cardmarketId: productId },
          });
        }
      }

      if (productId) {
        const result = await getCardmarketProductPrice(productId);
        const price = result?.priceGuide?.LOW ?? result?.priceGuide?.TREND ?? null;

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
