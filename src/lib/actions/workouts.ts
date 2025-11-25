"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getWorkouts() {
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
  return workouts;
}

export async function getWorkout(id: string) {
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
  return workout;
}

export async function createWorkout(data: {
  date?: Date;
  notes?: string;
  sets: {
    exerciseId: string;
    reps: number;
    weight: number;
  }[];
}) {
  const workout = await db.workout.create({
    data: {
      date: data.date || new Date(),
      notes: data.notes || null,
      sets: {
        create: data.sets.map((set) => ({
          exerciseId: set.exerciseId,
          reps: set.reps,
          weight: set.weight,
        })),
      },
    },
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
  });
  revalidatePath("/workouts");
  revalidatePath("/");
  return workout;
}

export async function deleteWorkout(id: string) {
  await db.workout.delete({
    where: { id },
  });
  revalidatePath("/workouts");
  revalidatePath("/");
}

export async function addSetToWorkout(
  workoutId: string,
  data: {
    exerciseId: string;
    reps: number;
    weight: number;
  }
) {
  const set = await db.set.create({
    data: {
      workoutId,
      exerciseId: data.exerciseId,
      reps: data.reps,
      weight: data.weight,
    },
    include: {
      exercise: true,
    },
  });
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/workouts");
  revalidatePath("/");
  return set;
}

export async function deleteSet(setId: string) {
  const set = await db.set.delete({
    where: { id: setId },
  });
  revalidatePath("/workouts");
  revalidatePath("/");
  return set;
}

