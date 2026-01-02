import { BalanceItem } from '../types/enso';

/**
 * Filter function to identify legitimate tokens and filter out scam/spam tokens
 * @param balances Array of token balances to filter
 * @returns Array of legitimate token balances
 */
export function filterLegitimateTokens(balances: BalanceItem[]): BalanceItem[] {
  // Known scam patterns in symbols and names
  const scamPatterns = [
    // Website URLs and claim patterns
    /visit.*to\s*claim/i,
    /claim.*reward/i,
    /https?:\/\//i,
    /www\./i,
    /\.com/i,
    /\.org/i,
    /\.net/i,
    /\.io/i,
    /\.xyz/i,
    /\.gift/i,

    // Scam phrases
    /for\s*free/i,
    /bonus/i,
    /\$.*claim/i,
    /visit.*website/i,
    /special.*reward/i,
    /\d+\$.*visit/i,
    /claim.*at/i,

    // Suspicious symbols
    /^\$\s/,
    /^#\s/,
    /^!\s/,
    /^\+\s/,
    /\[.*\]/,
  ];

  return balances.filter((token) => {
    // Calculate actual balance
    const balance = Number(token.amount) / Math.pow(10, token.decimals);
    const usdValue = balance * token.price;

    // Filter 1: PRICE CHECK - Allow tokens with zero price but log them
    if (token.price <= 0) {
      console.log(`Token ${token.symbol} has zero price: ${token.price}, but keeping it for display`);
      // We'll keep tokens with zero price for display purposes
    }

    // Filter 2: Allow tokens with zero balance for selection purposes
    if (balance <= 0) {
      console.log(`Token ${token.symbol} has zero balance, but keeping it for selection`);
      // We'll keep tokens with zero balance for selection purposes
    }

    // Filter 3: Check for scam patterns in symbol
    const hasScamPatternInSymbol = scamPatterns.some((pattern) => pattern.test(token.symbol));
    if (hasScamPatternInSymbol) {
      console.log(`Filtering out token ${token.symbol} - scam pattern in symbol`);
      return false;
    }

    // Filter 4: Check for scam patterns in name
    const hasScamPatternInName = scamPatterns.some((pattern) => pattern.test(token.name));
    if (hasScamPatternInName) {
      console.log(`Filtering out token ${token.symbol} - scam pattern in name`);
      return false;
    }

    // Filter 5: Symbol length check (most legitimate tokens have reasonable symbol length)
    if (token.symbol.length > 25) {
      console.log(`Filtering out token ${token.symbol} - symbol too long`);
      return false;
    }

    // Filter 6: Name length check (avoid extremely long promotional names)
    if (token.name.length > 60) {
      console.log(`Filtering out token ${token.symbol} - name too long`);
      return false;
    }

    // Filter 7: Check for suspicious balance amounts (extremely large balances often indicate airdrops/scams)
    if (balance > 1e12) {
      console.log(`Filtering out token ${token.symbol} - suspicious large balance: ${balance}`);
      return false;
    }

    // Filter 8: Check if symbol contains only special characters or numbers
    if (/^[\d\s$#!+\-.()[\]]+$/.test(token.symbol)) {
      console.log(`Filtering out token ${token.symbol} - only special characters/numbers`);
      return false;
    }

    // Filter 9: Skip tokens with extremely small USD value (< $0.01)
    if (usdValue < 0.01) {
      console.log(`Filtering out token ${token.symbol} - USD value too small: $${usdValue.toFixed(6)}`);
      return false;
    }

    // Filter 10: Check for common spam token patterns
    const spamSymbolPatterns = [
      /^[A-Z]+\d+[A-Z]*$/, // Like "ABC123DEF"
      /^\d+[A-Z]+$/, // Like "123ABC"
      /^[A-Z]{1}[a-z]+\.[a-z]+$/, // Like "A68.net"
    ];

    const hasSpamPattern = spamSymbolPatterns.some((pattern) => pattern.test(token.symbol));
    if (hasSpamPattern) {
      console.log(`Filtering out token ${token.symbol} - spam pattern detected`);
      return false;
    }

    console.log(
      `✅ Keeping token ${token.symbol} - price: $${token.price}, balance: ${balance}, USD: $${usdValue.toFixed(2)}`,
    );
    return true;
  });
}
