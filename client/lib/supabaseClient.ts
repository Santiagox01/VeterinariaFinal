import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rrivaukfnustpzottcsi.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaXZhdWtmbnVzdHB6b3R0Y3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDIxNTEsImV4cCI6MjA4MDExODE1MX0.xSzHV0L_NLR8xKC1Y56YMThmj7qhIqMI_O5NgeoU550";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Accessory = {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
};
