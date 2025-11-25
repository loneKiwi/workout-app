"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MOVEMENT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ExerciseFiltersProps {
  currentCategory?: string;
}

export function ExerciseFilters({ currentCategory }: ExerciseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/exercises?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!currentCategory ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilter(null)}
      >
        All
      </Button>
      {MOVEMENT_CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={currentCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(category.value)}
          className={cn(
            currentCategory === category.value && category.color,
            currentCategory === category.value && "text-white border-transparent"
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

