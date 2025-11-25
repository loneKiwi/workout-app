"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExercises(category?: string) {
  const exercises = await db.exercise.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
  });
  return exercises;
}

export async function getExercise(id: string) {
  const exercise = await db.exercise.findUnique({
    where: { id },
  });
  return exercise;
}

export async function createExercise(data: {
  name: string;
  category: string;
  notes?: string;
}) {
  const exercise = await db.exercise.create({
    data: {
      name: data.name,
      category: data.category,
      notes: data.notes || null,
    },
  });
  revalidatePath("/exercises");
  return exercise;
}

export async function updateExercise(
  id: string,
  data: {
    name?: string;
    category?: string;
    notes?: string;
  }
) {
  const exercise = await db.exercise.update({
    where: { id },
    data,
  });
  revalidatePath("/exercises");
  return exercise;
}

export async function deleteExercise(id: string) {
  await db.exercise.delete({
    where: { id },
  });
  revalidatePath("/exercises");
}

