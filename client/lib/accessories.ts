import { supabase, type Accessory } from "./supabaseClient";

export async function getAccessories(): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from("accesorios")
    .select("*")
    .eq("activo", true)
    .order("fecha_creacion", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAccessoriesByType(tipo: string): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from("accesorios")
    .select("*")
    .eq("tipo", tipo)
    .eq("activo", true)
    .order("fecha_creacion", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function searchAccessories(query: string): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from("accesorios")
    .select("*")
    .eq("activo", true)
    .or(`nombre.ilike.%${query}%,tipo.ilike.%${query}%`)
    .order("fecha_creacion", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAccessory(
  accessory: Omit<Accessory, "fecha_creacion" | "fecha_actualizacion">
): Promise<Accessory> {
  const { data, error } = await supabase
    .from("accesorios")
    .insert([accessory])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccessory(
  id: string,
  updates: Partial<Omit<Accessory, "id" | "fecha_creacion" | "fecha_actualizacion">>
): Promise<Accessory> {
  const { data, error } = await supabase
    .from("accesorios")
    .update({
      ...updates,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reduceStock(id: string, quantity: number): Promise<Accessory> {
  const { data: accessory, error: fetchError } = await supabase
    .from("accesorios")
    .select("stock")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const newStock = Math.max(0, (accessory?.stock || 0) - quantity);

  const { data, error } = await supabase
    .from("accesorios")
    .update({
      stock: newStock,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAccessoryTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from("accesorios")
    .select("tipo")
    .eq("activo", true);

  if (error) throw error;

  const types = new Set(data?.map((item: { tipo: string }) => item.tipo) || []);
  return Array.from(types).sort();
}

export async function getStatistics(): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  types: number;
  averagePrice: number;
}> {
  const { data, error } = await supabase
    .from("accesorios")
    .select("precio, stock")
    .eq("activo", true);

  if (error) throw error;

  const products = data || [];
  const totalValue = products.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const lowStockCount = products.filter((p) => p.stock < 5).length;

  const { data: typeData, error: typeError } = await supabase
    .from("accesorios")
    .select("tipo", { count: "exact" })
    .eq("activo", true);

  if (typeError) throw typeError;

  const uniqueTypes = new Set(typeData?.map((item: { tipo: string }) => item.tipo) || []).size;

  return {
    totalProducts: products.length,
    totalValue,
    lowStockCount,
    types: uniqueTypes,
    averagePrice: products.length > 0 ? totalValue / products.length / (products.length) : 0,
  };
}
