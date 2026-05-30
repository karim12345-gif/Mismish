export interface Allergen {
  id: string;
  label: string;
  emoji: string;
}

export const ALL_ALLERGENS: Allergen[] = [
  { id: "Gluten",    label: "Gluten",    emoji: "🌾" },
  { id: "Dairy",     label: "Dairy",     emoji: "🥛" },
  { id: "Nuts",      label: "Nuts",      emoji: "🥜" },
  { id: "Eggs",      label: "Eggs",      emoji: "🥚" },
  { id: "Fish",      label: "Fish",      emoji: "🐟" },
  { id: "Shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "Soy",       label: "Soy",       emoji: "🫘" },
  { id: "Sesame",    label: "Sesame",    emoji: "🌿" },
];
