import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { deckCards: { include: { card: true } } },
  });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deck);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const deck = await prisma.deck.update({ where: { id }, data: body });
  return NextResponse.json(deck);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
