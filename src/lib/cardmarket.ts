import OAuth from "oauth-1.0a";
import crypto from "crypto";

const BASE_URL = "https://api.cardmarket.com/ws/v2.0/output.json";

function getOAuthClient() {
  return new OAuth({
    consumer: {
      key: process.env.CARDMARKET_APP_TOKEN!,
      secret: process.env.CARDMARKET_APP_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64");
    },
  });
}

function getToken() {
  return {
    key: process.env.CARDMARKET_ACCESS_TOKEN!,
    secret: process.env.CARDMARKET_ACCESS_SECRET!,
  };
}

function isConfigured() {
  return (
    process.env.CARDMARKET_APP_TOKEN &&
    process.env.CARDMARKET_APP_SECRET &&
    process.env.CARDMARKET_ACCESS_TOKEN &&
    process.env.CARDMARKET_ACCESS_SECRET
  );
}

async function cardmarketFetch(endpoint: string) {
  if (!isConfigured()) {
    throw new Error("Cardmarket API credentials not configured");
  }

  const url = `${BASE_URL}/${endpoint}`;
  const oauth = getOAuthClient();
  const token = getToken();

  const requestData = { url, method: "GET" };
  const headers = oauth.toHeader(oauth.authorize(requestData, token));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Cardmarket API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function searchCardmarketProduct(name: string, game = "One Piece") {
  const gameId = getGameId(game);
  const encoded = encodeURIComponent(name);
  return cardmarketFetch(`products/find?search=${encoded}&idGame=${gameId}&idLanguage=1`);
}

export async function getCardmarketProductPrice(productId: string) {
  const data = await cardmarketFetch(`products/${productId}`);
  return data?.product?.priceGuide ?? null;
}

export async function getCardmarketProductById(productId: string) {
  return cardmarketFetch(`products/${productId}`);
}

function getGameId(game: string): number {
  const games: Record<string, number> = {
    "Magic: The Gathering": 1,
    "Yu-Gi-Oh!": 2,
    Pokemon: 3,
    "One Piece": 35,
    Digimon: 36,
    Lorcana: 42,
  };
  return games[game] ?? 35;
}

export { isConfigured };
