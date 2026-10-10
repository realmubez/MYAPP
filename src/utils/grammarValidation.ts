/**
 * Tolerant, beginner-friendly answer validation for English learners.
 * Handles:
 * - Case insensitivity & whitespace trimming
 * - Trailing punctuation (. , ? !)
 * - Contraction equivalence (doesn't == doesnt == does not, isn't == is not, etc.)
 * - Flexible separators (/ vs , vs spaces in multi-blank answers)
 */

export function cleanText(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ');
}

export function normalizeGrammarForm(s: string): string {
  return cleanText(s)
    .replace(/[\u2018\u2019\x27`]/g, '') // strip all apostrophes: doesn't -> doesnt
    .replace(/\bdoes not\b/g, 'doesnt')
    .replace(/\bdo not\b/g, 'dont')
    .replace(/\bis not\b/g, 'isnt')
    .replace(/\bare not\b/g, 'arent')
    .replace(/\bam not\b/g, 'am not')
    .replace(/\bcannot\b/g, 'cant')
    .replace(/\bcan not\b/g, 'cant')
    .replace(/\bwill not\b/g, 'wont')
    .replace(/[\/,|;:_–—-]+/g, ' ') // treat slashes, commas, bars, dashes as space separators
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAnswerAcceptable(
  userAnswer: string,
  expectedAnswer: string,
  alternateAnswers: string[] = []
): boolean {
  if (!userAnswer || typeof userAnswer !== 'string') return false;

  const userClean = cleanText(userAnswer);
  if (!userClean) return false;

  const allExpected = [expectedAnswer, ...alternateAnswers];

  // 1. Exact clean match (case-insensitive & trimmed of trailing punct)
  if (allExpected.some((exp) => cleanText(exp) === userClean)) {
    return true;
  }

  // 2. Normalized grammar form (contractions & flexible separators like / , - or spaces)
  const userNorm = normalizeGrammarForm(userAnswer);
  if (allExpected.some((exp) => normalizeGrammarForm(exp) === userNorm)) {
    return true;
  }

  // 3. Compact alphanumeric match (ignores all spaces and separators completely: "doeslive" === "doeslive")
  const userAlpha = userNorm.replace(/[^a-z0-9]/g, '');
  if (userAlpha && allExpected.some((exp) => normalizeGrammarForm(exp).replace(/[^a-z0-9]/g, '') === userAlpha)) {
    return true;
  }

  return false;
}
