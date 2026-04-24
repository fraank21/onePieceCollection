-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "expansion" TEXT NOT NULL,
    "game" TEXT NOT NULL DEFAULT 'One Piece',
    "condition" TEXT NOT NULL DEFAULT 'NM',
    "language" TEXT NOT NULL DEFAULT 'EN',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "foil" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "cardmarketId" TEXT,
    "lastPrice" REAL,
    "lastPriceUpdate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL DEFAULT 'One Piece',
    "description" TEXT,
    "format" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "cardId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_cardId_key" ON "DeckCard"("deckId", "cardId");
