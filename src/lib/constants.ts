export const MOVEMENT_CATEGORIES = [
  { value: "upper_push", label: "Upper Push", color: "bg-blue-500" },
  { value: "upper_pull", label: "Upper Pull", color: "bg-indigo-500" },
  { value: "lower_push", label: "Lower Push", color: "bg-emerald-500" },
  { value: "lower_hinge", label: "Lower Hinge", color: "bg-amber-500" },
  { value: "core", label: "Core", color: "bg-rose-500" },
] as const;

export type MovementCategory = typeof MOVEMENT_CATEGORIES[number]["value"];

export function getCategoryLabel(category: string): string {
  return MOVEMENT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function getCategoryColor(category: string): string {
  return MOVEMENT_CATEGORIES.find((c) => c.value === category)?.color ?? "bg-gray-500";
}

