import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Heading2 } from "@/components/ui/heading2";
import { Text } from "@/components/ui/text";
import { Plus, Dumbbell } from "lucide-react";
import { getCategoryLabel, getCategoryColor, MOVEMENT_CATEGORIES } from "@/lib/constants";
import { ExerciseFilters } from "./exercise-filters";
import { DeleteExerciseButton } from "./delete-exercise-button";

interface ExercisesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
  const { category } = await searchParams;
  
  const exercises = await db.exercise.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
  });

  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const cat = exercise.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exercise);
    return acc;
  }, {} as Record<string, typeof exercises>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading2>Exercise Library</Heading2>
          <Text className="text-muted-foreground">
            Manage your exercises by movement category
          </Text>
        </div>
        <Button asChild>
          <Link href="/exercises/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Link>
        </Button>
      </div>

      <ExerciseFilters currentCategory={category} />

      {exercises.length === 0 ? (
        <Empty
          title="No exercises yet"
          description="Add your first exercise to get started building your workout library."
          actions={
            <Button asChild>
              <Link href="/exercises/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {category ? (
            <div className="grid gap-3">
              {exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          ) : (
            MOVEMENT_CATEGORIES.map((cat) => {
              const categoryExercises = exercisesByCategory[cat.value];
              if (!categoryExercises?.length) return null;
              
              return (
                <div key={cat.value} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                    <h3 className="font-medium">{cat.label}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({categoryExercises.length})
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {categoryExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: { id: string; name: string; category: string; notes: string | null } }) {
  return (
    <Card className="group">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getCategoryColor(exercise.category)}`}>
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium">{exercise.name}</p>
            {exercise.notes && (
              <p className="text-sm text-muted-foreground">{exercise.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{getCategoryLabel(exercise.category)}</Badge>
          <DeleteExerciseButton exerciseId={exercise.id} exerciseName={exercise.name} />
        </div>
      </CardContent>
    </Card>
  );
}

