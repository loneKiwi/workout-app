"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getWorkouts() {
  const { data: workouts, error: workoutsError } = await supabase
    .from("Workout")
    .select("*")
    .order("date", { ascending: false });
  
  if (workoutsError) {
    throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);
  }
  
  if (!workouts || workouts.length === 0) {
    return [];
  }
  
  // Fetch all sets with exercises for these workouts
  const workoutIds = workouts.map((w) => w.id);
  const { data: sets, error: setsError } = await supabase
    .from("Set")
    .select(`
      *,
      Exercise (*)
    `)
    .in("workoutId", workoutIds)
    .order("createdAt", { ascending: true });
  
  if (setsError) {
    throw new Error(`Failed to fetch sets: ${setsError.message}`);
  }
  
  // Group sets by workout and normalize Exercise to exercise
  const setsByWorkout = (sets || []).reduce((acc, set) => {
    if (!acc[set.workoutId]) {
      acc[set.workoutId] = [];
    }
    // Normalize Exercise to exercise for consistency
    const normalizedSet = {
      ...set,
      exercise: set.Exercise || set.exercise,
      Exercise: set.Exercise || set.exercise,
    };
    acc[set.workoutId].push(normalizedSet);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Attach sets to workouts
  return workouts.map((workout) => ({
    ...workout,
    sets: setsByWorkout[workout.id] || [],
  }));
}

export async function getWorkout(id: string) {
  const { data: workout, error: workoutError } = await supabase
    .from("Workout")
    .select("*")
    .eq("id", id)
    .single();
  
  if (workoutError) {
    throw new Error(`Failed to fetch workout: ${workoutError.message}`);
  }
  
  if (!workout) {
    return null;
  }
  
  // Fetch sets with exercises
  const { data: sets, error: setsError } = await supabase
    .from("Set")
    .select(`
      *,
      Exercise (*)
    `)
    .eq("workoutId", id)
    .order("createdAt", { ascending: true });
  
  if (setsError) {
    throw new Error(`Failed to fetch sets: ${setsError.message}`);
  }
  
  // Normalize Exercise to exercise for consistency
  const normalizedSets = (sets || []).map((set: any) => ({
    ...set,
    exercise: set.Exercise || set.exercise,
    Exercise: set.Exercise || set.exercise,
  }));
  
  return {
    ...workout,
    sets: normalizedSets,
  };
}

export async function createWorkout(data: {
  date?: Date;
  notes?: string;
  sets: {
    exerciseId: string;
    reps: number;
    weight: number;
    rpe?: number;
  }[];
}) {
  // Create workout
  const { data: workout, error: workoutError } = await supabase
    .from("Workout")
    .insert({
      date: data.date?.toISOString() || new Date().toISOString(),
      notes: data.notes || null,
    })
    .select()
    .single();
  
  if (workoutError) {
    throw new Error(`Failed to create workout: ${workoutError.message}`);
  }
  
  // Create sets
  if (data.sets.length > 0) {
    const setsToInsert = data.sets.map((set) => ({
      workoutId: workout.id,
      exerciseId: set.exerciseId,
      reps: set.reps,
      weight: set.weight,
      rpe: set.rpe || null,
    }));
    
    const { data: sets, error: setsError } = await supabase
      .from("Set")
      .insert(setsToInsert)
      .select(`
        *,
        Exercise (*)
      `);
    
    if (setsError) {
      throw new Error(`Failed to create sets: ${setsError.message}`);
    }
    
    // Normalize Exercise to exercise for consistency
    workout.sets = (sets || []).map((set: any) => ({
      ...set,
      exercise: set.Exercise || set.exercise,
      Exercise: set.Exercise || set.exercise,
    }));
  } else {
    workout.sets = [];
  }
  
  revalidatePath("/workouts");
  revalidatePath("/");
  return workout;
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase
    .from("Workout")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw new Error(`Failed to delete workout: ${error.message}`);
  }
  
  revalidatePath("/workouts");
  revalidatePath("/");
}

export async function addSetToWorkout(
  workoutId: string,
  data: {
    exerciseId: string;
    reps: number;
    weight: number;
    rpe?: number;
  }
) {
  const { data: set, error } = await supabase
    .from("Set")
    .insert({
      workoutId,
      exerciseId: data.exerciseId,
      reps: data.reps,
      weight: data.weight,
      rpe: data.rpe || null,
    })
    .select(`
      *,
      Exercise (*)
    `)
    .single();
  
  if (error) {
    throw new Error(`Failed to add set: ${error.message}`);
  }
  
  // Normalize Exercise to exercise for consistency
  const normalizedSet = {
    ...set,
    exercise: set.Exercise || set.exercise,
    Exercise: set.Exercise || set.exercise,
  };
  
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/workouts");
  revalidatePath("/");
  return normalizedSet;
}

export async function deleteSet(setId: string) {
  const { error } = await supabase
    .from("Set")
    .delete()
    .eq("id", setId);
  
  if (error) {
    throw new Error(`Failed to delete set: ${error.message}`);
  }
  
  revalidatePath("/workouts");
  revalidatePath("/");
}
