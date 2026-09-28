export interface LocalizedName {
  name?: string | null;
  nameArabic?: string | null;
}

export const getLocalizedName = (
  value: LocalizedName | null | undefined,
  language: string,
  fallback = "",
): string => {
  const preferredName = language.startsWith("ar")
    ? value?.nameArabic
    : value?.name;

  return preferredName?.trim() || value?.name?.trim() || fallback;
};
