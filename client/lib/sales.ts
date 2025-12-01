import { supabase } from "./supabaseClient";
import { reduceStock } from "./accessories";

export type SaleItem = {
  id: string;
  venta_id: string;
  accesorio_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  fecha_creacion: string;
};

export type Sale = {
  id: string;
  cliente: string;
  precio_total: number;
  activo: boolean;
  fecha_venta: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  items?: SaleItem[];
};

export type SaleWithItems = Sale & {
  items: SaleItem[];
};

export async function createSale(
  cliente: string,
  items: Array<{
    accesorio_id: string;
    cantidad: number;
    precio_unitario: number;
  }>
): Promise<SaleWithItems> {
  // Calculate total
  const precio_total = items.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0
  );

  // Generate sale ID
  const saleIdNum = Date.now().toString().slice(-6);
  const saleId = `VTA${saleIdNum}`;

  // Insert sale
  const { data: saleData, error: saleError } = await supabase
    .from("ventas")
    .insert([
      {
        id: saleId,
        cliente,
        precio_total,
        activo: true,
      },
    ])
    .select()
    .single();

  if (saleError) throw saleError;

  // Insert sale items
  const saleItems = items.map((item, index) => ({
    id: `${saleId}-${String(index + 1).padStart(2, "0")}`,
    venta_id: saleId,
    accesorio_id: item.accesorio_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.precio_unitario * item.cantidad,
  }));

  const { data: itemsData, error: itemsError } = await supabase
    .from("venta_items")
    .insert(saleItems)
    .select();

  if (itemsError) throw itemsError;

  // Reduce stock for each sold item
  await Promise.all(
    items.map((item) => reduceStock(item.accesorio_id, item.cantidad))
  );

  return {
    ...saleData,
    items: itemsData || [],
  };
}

export async function getSales(): Promise<SaleWithItems[]> {
  const { data: sales, error: salesError } = await supabase
    .from("ventas")
    .select("*")
    .eq("activo", true)
    .order("fecha_venta", { ascending: false });

  if (salesError) throw salesError;

  // Get items for each sale
  const salesWithItems = await Promise.all(
    (sales || []).map(async (sale) => {
      const { data: items, error: itemsError } = await supabase
        .from("venta_items")
        .select("*")
        .eq("venta_id", sale.id);

      if (itemsError) throw itemsError;

      return {
        ...sale,
        items: items || [],
      };
    })
  );

  return salesWithItems;
}

export async function getSaleById(id: string): Promise<SaleWithItems> {
  const { data: sale, error: saleError } = await supabase
    .from("ventas")
    .select("*")
    .eq("id", id)
    .single();

  if (saleError) throw saleError;

  const { data: items, error: itemsError } = await supabase
    .from("venta_items")
    .select("*")
    .eq("venta_id", id);

  if (itemsError) throw itemsError;

  return {
    ...sale,
    items: items || [],
  };
}

export async function getSalesByAccessory(
  accesorio_id: string
): Promise<SaleWithItems[]> {
  const { data: items, error: itemsError } = await supabase
    .from("venta_items")
    .select("venta_id")
    .eq("accesorio_id", accesorio_id);

  if (itemsError) throw itemsError;

  const ventaIds = (items || []).map((item) => item.venta_id);

  if (ventaIds.length === 0) return [];

  const { data: sales, error: salesError } = await supabase
    .from("ventas")
    .select("*")
    .in("id", ventaIds)
    .order("fecha_venta", { ascending: false });

  if (salesError) throw salesError;

  // Get items for each sale
  const salesWithItems = await Promise.all(
    (sales || []).map(async (sale) => {
      const { data: saleItems, error: saleItemsError } = await supabase
        .from("venta_items")
        .select("*")
        .eq("venta_id", sale.id);

      if (saleItemsError) throw saleItemsError;

      return {
        ...sale,
        items: saleItems || [],
      };
    })
  );

  return salesWithItems;
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase
    .from("ventas")
    .update({ activo: false })
    .eq("id", id);

  if (error) throw error;
}
