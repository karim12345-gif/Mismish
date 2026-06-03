/**
 * Returns true only when:
 *  - userAllergens is non-empty AND
 *  - allergenId (case-insensitive) exists in userAllergens
 *
 * "Gluten" vs "gluten" → still matches.
 * Empty / null userAllergens → never matches (no warnings shown).
 */
export function isUserAllergicTo(
  allergenId: string,
  userAllergens: string[],
): boolean {
  if (!userAllergens || userAllergens.length === 0) return false;
  const needle = allergenId.toLowerCase();
  return userAllergens.some((ua) => ua.toLowerCase() === needle);
}

/**
 * Returns true if ANY allergen in itemAllergens matches the user's list.
 * Used to decide whether to show the warning chip on a card.
 */
export function hasAllergenWarning(
  itemAllergens: string[],
  userAllergens: string[],
): boolean {
  if (!userAllergens || userAllergens.length === 0) return false;
  return itemAllergens.some((a) => isUserAllergicTo(a, userAllergens));
}
