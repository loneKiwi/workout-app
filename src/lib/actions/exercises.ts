"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getExercises(category?: string) {
  let query = supabase.from("Exercise").select("*").order("name", { ascending: true });
  
  if (category) {
    query = query.eq("category", category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }
  
  return data || [];
}

export async function getExercise(id: string) {
  const { data, error } = await supabase
    .from("Exercise")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch exercise: ${error.message}`);
  }
  
  return data;
}

export async function createExercise(data: {
  name: string;
  category: string;
  notes?: string;
}) {
  const { data: exercise, error } = await supabase
    .from("Exercise")
    .insert({
      name: data.name,
      category: data.category,
      notes: data.notes || null,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create exercise: ${error.message}`);
  }
  
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
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.notes !== undefined) updateData.notes = data.notes;
  
  const { data: exercise, error } = await supabase
    .from("Exercise")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update exercise: ${error.message}`);
  }
  
  revalidatePath("/exercises");
  return exercise;
}

export async function deleteExercise(id: string) {
  const { error } = await supabase
    .from("Exercise")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw new Error(`Failed to delete exercise: ${error.message}`);
  }
  
  revalidatePath("/exercises");
}
