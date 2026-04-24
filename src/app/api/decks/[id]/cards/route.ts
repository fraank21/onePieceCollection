import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: deckId } = await params;
  const { cardId, quantity = 1 } = await req.json();

  const existing = await prisma.deckCard.findUnique({
    where: { deckId_cardId: { deckId, cardId } },
  });

  if (existing) {
    const updated = await prisma.deckCard.update({
      where: { deckId_cardId: { deckId, cardId } },
      data: { quantity: existing.quantity + quantity },
    });
    return NextResponse.json(updated);
  }

  const deckCard = await prisma.deckCard.create({ data: { deckId, cardId, quantity } });
  return NextResponse.json(deckCard, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: deckId } = await params;
  const { cardId } = await req.json();
  await prisma.deckCard.delete({ where: { deckId_cardId: { deckId, cardId } } });
  return NextResponse.json({ ok: true });
}
