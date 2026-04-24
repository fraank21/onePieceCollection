import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game");

  const decks = await prisma.deck.findMany({
    where: game ? { game } : {},
    include: {
      deckCards: {
        include: { card: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const deck = await prisma.deck.create({ data: body });
  return NextResponse.json(deck, { status: 201 });
}
