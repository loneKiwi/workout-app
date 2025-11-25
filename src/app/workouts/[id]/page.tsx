import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading2 } from "@/components/ui/heading2";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, Dumbbell } from "lucide-react";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params;
  
  const workout = await db.workout.findUnique({
    where: { id },
    include: {
      sets: {
        include: {
          exercise: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Group sets by exercise
  const setsByExercise = workout.sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = {
        exercise: set.exercise,
        sets: [],
      };
    }
    acc[set.exerciseId].sets.push(set);
    return acc;
  }, {} as Record<string, { exercise: typeof workout.sets[0]["exercise"]; sets: typeof workout.sets }>);

  const exerciseGroups = Object.values(setsByExercise);
  const totalVolume = workout.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/workouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <Heading2>
              {workout.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Heading2>
            {workout.notes && (
              <Text className="text-muted-foreground mt-1">{workout.notes}</Text>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workout.sets.length}</div>
            <p className="text-sm text-muted-foreground">Total Sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{exerciseGroups.length}</div>
            <p className="text-sm text-muted-foreground">Exercises</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Volume (kg)</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercise breakdown */}
      <div className="space-y-4">
        {exerciseGroups.map(({ exercise, sets }) => (
          <Card key={exercise.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getCategoryColor(exercise.category)}`}>
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(exercise.category)} • {sets.length} sets
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sets.map((set, index) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      Set {index + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-semibold">{set.reps}</span>
                        <span className="text-sm text-muted-foreground ml-1">reps</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold">{set.weight}</span>
                        <span className="text-sm text-muted-foreground ml-1">kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

