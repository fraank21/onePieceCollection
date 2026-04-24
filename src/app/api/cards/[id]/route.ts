import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const card = await prisma.card.update({ where: { id }, data: body });
  return NextResponse.json(card);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
