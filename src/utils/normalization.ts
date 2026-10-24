export const normalize = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD") // Split accents from their base letters
    .replace(/[\u0300-\u036f]/g, "") // Remove the accent marks
    .replace(/[^a-z0-9]/g, "") // Remove spaces, punctuation, special chars
    .trim();
};

export const validateAnswer = (
  input: string,
  correct: string,
  alternatives: string[] = []
): boolean => {
  const normalizedInput = normalize(input);
  const possibleAnswers = [correct, ...alternatives].map(normalize);
  
  // Also check if they included common prefixes/suffixes like "de ", "het ", "zee ", "oceaan"
  // but only if the user forgot it. We can check simple substrings or exact match
  if (possibleAnswers.includes(normalizedInput)) {
    return true;
  }

  // Support typical spelling variants
  return false;
};
