import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Heading2 } from "@/components/ui/heading2";
import { Text } from "@/components/ui/text";
import { Plus, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";
import { DeleteWorkoutButton } from "./delete-workout-button";

export default async function WorkoutsPage() {
  const workouts = await db.workout.findMany({
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading2>Workouts</Heading2>
          <Text className="text-muted-foreground">
            View and manage your training sessions
          </Text>
        </div>
        <Button asChild>
          <Link href="/workouts/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Workout
          </Link>
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Empty
          title="No workouts logged"
          description="Start tracking your progress by logging your first workout."
          actions={
            <Button asChild>
              <Link href="/workouts/new">
                <Plus className="mr-2 h-4 w-4" />
                Log Workout
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const exerciseGroups = workout.sets.reduce((acc, set) => {
              const exerciseId = set.exerciseId;
              if (!acc[exerciseId]) {
                acc[exerciseId] = {
                  exercise: set.exercise,
                  sets: [],
                };
              }
              acc[exerciseId].sets.push(set);
              return acc;
            }, {} as Record<string, { exercise: typeof workout.sets[0]["exercise"]; sets: typeof workout.sets }>);

            const uniqueExercises = Object.values(exerciseGroups);
            const totalSets = workout.sets.length;

            return (
              <Card key={workout.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <Link href={`/workouts/${workout.id}`} className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {workout.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <Badge variant="secondary">
                              {totalSets} {totalSets === 1 ? "set" : "sets"}
                            </Badge>
                          </div>
                          {workout.notes && (
                            <p className="text-sm text-muted-foreground">{workout.notes}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {uniqueExercises.slice(0, 4).map(({ exercise, sets }) => (
                              <div
                                key={exercise.id}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                              >
                                <div className={`h-2 w-2 rounded-full ${getCategoryColor(exercise.category)}`} />
                                <span>{exercise.name}</span>
                                <span className="text-xs">×{sets.length}</span>
                              </div>
                            ))}
                            {uniqueExercises.length > 4 && (
                              <span className="text-sm text-muted-foreground">
                                +{uniqueExercises.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                    <DeleteWorkoutButton workoutId={workout.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

