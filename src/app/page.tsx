import Link from "next/link";
import { getExercises } from "@/lib/actions/exercises";
import { getWorkouts } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Heading1 } from "@/components/ui/heading1";
import { Heading3 } from "@/components/ui/heading3";
import { Text } from "@/components/ui/text";
import { Plus, Calendar, Dumbbell, TrendingUp, ChevronRight, Flame } from "lucide-react";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
  const [allWorkouts, allExercises] = await Promise.all([
    getWorkouts(),
    getExercises(),
  ]);

  const recentWorkouts = allWorkouts.slice(0, 5);
  const exerciseCount = allExercises.length;
  
  // Get total sets count
  const { count: totalSets } = await supabase
    .from("Set")
    .select("*", { count: "exact", head: true });

  // Calculate stats
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const workoutsThisWeek = allWorkouts.filter((w) => {
    const workoutDate = new Date(w.date);
    return workoutDate >= thisWeekStart;
  }).length;

  const totalVolume = recentWorkouts.reduce(
    (sum, w) => sum + (w.sets || []).reduce((s: number, set: any) => s + set.reps * set.weight, 0),
    0
  );

  // Calculate weekly streak (weeks with 3+ workouts)
  let weeklyStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get the start of the current week (Sunday)
  const getWeekStart = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };
  
  // Group workouts by week
  const workoutsByWeek = new Map<string, number>();
  allWorkouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);
    const weekStart = getWeekStart(workoutDate);
    const weekKey = weekStart.toISOString();
    workoutsByWeek.set(weekKey, (workoutsByWeek.get(weekKey) || 0) + 1);
  });
  
  // Count consecutive weeks with 3+ workouts, starting from current week
  const currentWeekStart = getWeekStart(today);
  for (let weekOffset = 0; weekOffset < 52; weekOffset++) {
    const checkWeek = new Date(currentWeekStart);
    checkWeek.setDate(checkWeek.getDate() - (weekOffset * 7));
    const weekKey = checkWeek.toISOString();
    const workoutCount = workoutsByWeek.get(weekKey) || 0;
    
    if (workoutCount >= 3) {
      weeklyStreak++;
    } else if (weekOffset > 0) {
      // Stop if we hit a past week with less than 3 workouts
      // (current week can still be in progress, so we don't break on weekOffset === 0)
      break;
    }
    // If current week has less than 3 workouts, don't count it but don't break the streak
    // (week isn't over yet)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading1>Dashboard</Heading1>
          <Text className="text-muted-foreground">
            Welcome back! Track your progress.
          </Text>
        </div>
        <Button asChild size="lg">
          <Link href="/workouts/new">
            <Plus className="mr-2 h-5 w-5" />
            Log Workout
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{workoutsThisWeek}</div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSets || 0}</div>
                <p className="text-xs text-muted-foreground">Total Sets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{weeklyStreak}</div>
                <p className="text-xs text-muted-foreground">Week Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <Dumbbell className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{exerciseCount}</div>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading3>Recent Workouts</Heading3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workouts">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentWorkouts.length === 0 ? (
          <Empty
            title="No workouts yet"
            description="Start your fitness journey by logging your first workout."
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
            {recentWorkouts.slice(0, 3).map((workout) => {
              const exerciseGroups = (workout.sets || []).reduce((acc: any, set: any) => {
                if (!acc[set.exerciseId]) {
                  acc[set.exerciseId] = {
                    exercise: set.Exercise,
                    count: 0,
                  };
                }
                acc[set.exerciseId].count++;
                return acc;
              }, {} as Record<string, { exercise: any; count: number }>);

              const exercises = Object.values(exerciseGroups);

              return (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {new Date(workout.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {exercises.slice(0, 3).map(({ exercise, count }: any) => (
                                <span
                                  key={exercise.id}
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${getCategoryColor(exercise.category)}`} />
                                  {exercise.name}
                                </span>
                              ))}
                              {exercises.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{exercises.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {workout.sets?.length || 0} sets
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {exerciseCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Dumbbell className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div>
                <p className="font-medium">Set up your exercise library</p>
                <p className="text-sm text-muted-foreground">
                  Add exercises to start logging your workouts
                </p>
              </div>
              <Button asChild>
                <Link href="/exercises/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
