import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Card } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game");
  const search = searchParams.get("search");

  const cards = await prisma.card.findMany({
    where: {
      ...(game ? { game } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { cardNumber: { contains: search } },
              { expansion: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const totalValue = cards.reduce(
    (sum: number, c: Card) => sum + (c.lastPrice ?? 0) * c.quantity,
    0
  );

  return NextResponse.json({ cards, totalValue });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const card = await prisma.card.create({ data: body });
  return NextResponse.json(card, { status: 201 });
}
