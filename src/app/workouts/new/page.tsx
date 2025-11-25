"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading2 } from "@/components/ui/heading2";
import { Text } from "@/components/ui/text";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Dumbbell } from "lucide-react";
import { createWorkout } from "@/lib/actions/workouts";
import { getExercises } from "@/lib/actions/exercises";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  category: string;
  notes: string | null;
}

interface SetEntry {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  rpe?: number;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState("");
  const [currentReps, setCurrentReps] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentRpe, setCurrentRpe] = useState("");
  const [numberOfSets, setNumberOfSets] = useState("1");

  useEffect(() => {
    async function loadExercises() {
      const data = await getExercises();
      setExercises(data);
    }
    loadExercises();
  }, []);

  const selectedExercise = exercises.find((e) => e.id === currentExerciseId);

  const addSet = () => {
    if (!currentExerciseId || !currentReps || !currentWeight) {
      toast.error("Please fill in exercise, reps, and weight");
      return;
    }

    const setsToAdd = parseInt(numberOfSets) || 1;
    const newSets: SetEntry[] = Array.from({ length: setsToAdd }, () => ({
      id: crypto.randomUUID(),
      exerciseId: currentExerciseId,
      reps: parseInt(currentReps),
      weight: parseFloat(currentWeight),
      rpe: currentRpe ? parseFloat(currentRpe) : undefined,
    }));

    setSets([...sets, ...newSets]);
    // Keep the same exercise selected for convenience, just clear reps/weight/rpe
    setCurrentReps("");
    setCurrentWeight("");
    setCurrentRpe("");
    setNumberOfSets("1");
  };

  const removeSet = (setId: string) => {
    setSets(sets.filter((s) => s.id !== setId));
  };

  const handleSubmit = async () => {
    if (sets.length === 0) {
      toast.error("Add at least one set to your workout");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkout({
        notes: notes.trim() || undefined,
        sets: sets.map((s) => ({
          exerciseId: s.exerciseId,
          reps: s.reps,
          weight: s.weight,
          rpe: s.rpe,
        })),
      });
      toast.success("Workout logged successfully!");
      router.push("/workouts");
    } catch (error) {
      toast.error("Failed to save workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group sets by exercise for display
  const setsByExercise = sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = [];
    }
    acc[set.exerciseId].push(set);
    return acc;
  }, {} as Record<string, SetEntry[]>);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/workouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Link>
        </Button>
        <Heading2>Log Workout</Heading2>
        <Text className="text-muted-foreground">
          Record your sets, reps, and weights
        </Text>
      </div>

      {/* Add Set Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Set</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Exercise</Label>
            {exercises.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No exercises yet.{" "}
                <Link href="/exercises/new" className="text-primary underline">
                  Add your first exercise
                </Link>
              </div>
            ) : (
              <Select value={currentExerciseId} onValueChange={setCurrentExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getCategoryColor(exercise.category)}`} />
                        {exercise.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="10"
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="60"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rpe">RPE</Label>
              <Input
                id="rpe"
                type="number"
                placeholder="8.5"
                value={currentRpe}
                onChange={(e) => setCurrentRpe(e.target.value)}
                min="1"
                max="10"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sets">Number of Sets</Label>
              <Input
                id="sets"
                type="number"
                placeholder="1"
                value={numberOfSets}
                onChange={(e) => setNumberOfSets(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addSet}
            className="w-full"
            disabled={!currentExerciseId || !currentReps || !currentWeight}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </CardContent>
      </Card>

      {/* Sets Summary */}
      {sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Workout Summary ({sets.length} {sets.length === 1 ? "set" : "sets"})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(setsByExercise).map(([exerciseId, exerciseSets]) => {
              const exercise = exercises.find((e) => e.id === exerciseId);
              if (!exercise) return null;

              return (
                <div key={exerciseId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getCategoryColor(exercise.category)}`} />
                    <span className="font-medium">{exercise.name}</span>
                    <Badge variant="secondary">{exerciseSets.length} sets</Badge>
                  </div>
                  <div className="ml-5 space-y-1">
                    {exerciseSets.map((set, index) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span>
                          Set {index + 1}: {set.reps} reps × {set.weight} kg
                          {set.rpe && ` @ ${set.rpe}`}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSet(set.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Notes and Submit */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any PRs?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || sets.length === 0}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Workout"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/workouts">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

