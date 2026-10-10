/**
 * Mathematical normalization and comparison utility
 * Handles spaces, multiplication signs (·, *, x, \cdot), fractions, plus/minus,
 * and polynomial/algebra term equivalence (e.g., 5x+2y vs 2y+5x or 5x + 2y).
 */

export function normalizeMathString(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    // normalize unicode multiplication / minus / division
    .replace(/[\u00D7\u22C5\u2219*]/g, '·')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[\u00F7:]/g, '/')
    // remove redundant whitespaces around operators
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips all whitespaces
 */
export function stripSpaces(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Checks if user answer mathematically matches expected answer
 */
export function checkMathAnswer(userInput: string, expectedAnswer: string, alternateAnswers?: string[]): {
  isCorrect: boolean;
  matchType: 'exact' | 'algebraic' | 'numeric' | 'none';
} {
  const normUser = normalizeMathString(userInput);
  const normExpected = normalizeMathString(expectedAnswer);

  const cleanUser = stripSpaces(normUser);
  const cleanExpected = stripSpaces(normExpected);

  // 1. Exact string match without spaces
  if (cleanUser === cleanExpected) {
    return { isCorrect: true, matchType: 'exact' };
  }

  // 2. Check alternate answers if provided
  if (alternateAnswers && alternateAnswers.length > 0) {
    for (const alt of alternateAnswers) {
      const cleanAlt = stripSpaces(normalizeMathString(alt));
      if (cleanUser === cleanAlt) {
        return { isCorrect: true, matchType: 'exact' };
      }
    }
  }

  // 3. Decimal and Integer numeric equivalence check
  // e.g. "24" vs "+24", "1.25" vs "1,25" or "5/4" = 1.25
  const userNum = parseNumericOrFraction(cleanUser);
  const expNum = parseNumericOrFraction(cleanExpected);
  if (userNum !== null && expNum !== null && Math.abs(userNum - expNum) < 0.0001) {
    return { isCorrect: true, matchType: 'numeric' };
  }

  // 4. Algebraic polynomial comparison (e.g., 5x+2y vs 2y+5x, or -19 vs - 19)
  if (areAlgebraicExpressionsEqual(cleanUser, cleanExpected)) {
    return { isCorrect: true, matchType: 'algebraic' };
  }

  // Check algebra against alternate answers
  if (alternateAnswers) {
    for (const alt of alternateAnswers) {
      const cleanAlt = stripSpaces(normalizeMathString(alt));
      if (areAlgebraicExpressionsEqual(cleanUser, cleanAlt)) {
        return { isCorrect: true, matchType: 'algebraic' };
      }
    }
  }

  return { isCorrect: false, matchType: 'none' };
}

/**
 * Parses numbers and simple fractions like "5/4", "-3/2", "2.5", "-4"
 */
function parseNumericOrFraction(str: string): number | null {
  const sanitized = str.replace(',', '.');
  if (/^[+-]?\d+(\.\d+)?$/.test(sanitized)) {
    return parseFloat(sanitized);
  }
  const fracMatch = sanitized.match(/^([+-]?\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den !== 0) return num / den;
  }
  return null;
}

/**
 * Compares linear/polynomial combination of terms like "5x+2y" and "2y+5x" or "-4a+7" and "7-4a"
 */
function areAlgebraicExpressionsEqual(expr1: string, expr2: string): boolean {
  try {
    const terms1 = parseLinearTerms(expr1);
    const terms2 = parseLinearTerms(expr2);
    if (!terms1 || !terms2) return false;

    // Check if every variable key has equal coefficients
    const allKeys = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);
    for (const key of allKeys) {
      const c1 = terms1[key] || 0;
      const c2 = terms2[key] || 0;
      if (Math.abs(c1 - c2) > 0.0001) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses terms like "5x + 2y - 3" into { "x": 5, "y": 2, "": -3 }
 */
function parseLinearTerms(expr: string): Record<string, number> | null {
  if (!expr) return null;
  // If expression contains parentheses or division, skip simple linear parser
  if (/[()\/·^]/.test(expr)) return null;

  // Split into tokens keeping signs
  const termsMap: Record<string, number> = {};
  // Regular expression to match signed terms like +5x, -3y, 8, -x, +y
  const regex = /([+-]?[^+-]+)/g;
  const matches = expr.match(regex);
  if (!matches) return null;

  for (let rawTerm of matches) {
    rawTerm = rawTerm.trim();
    if (!rawTerm) continue;

    let sign = 1;
    if (rawTerm.startsWith('-')) {
      sign = -1;
      rawTerm = rawTerm.slice(1);
    } else if (rawTerm.startsWith('+')) {
      rawTerm = rawTerm.slice(1);
    }

    // Match coefficient and variable part (e.g., "5x", "x", "12")
    const match = rawTerm.match(/^(\d+(?:\.\d+)?)?([a-z]+)?$/i);
    if (!match) return null;

    const numPart = match[1];
    const varPart = match[2] || '';

    let coeff = 1;
    if (numPart !== undefined && numPart !== '') {
      coeff = parseFloat(numPart);
    } else if (varPart === '') {
      return null;
    }

    coeff = coeff * sign;
    termsMap[varPart] = (termsMap[varPart] || 0) + coeff;
  }

  return termsMap;
}
