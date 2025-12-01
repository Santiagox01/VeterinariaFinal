-- Create accesorios table for veterinary accessories management
-- This SQL script should be executed in your Supabase SQL Editor

CREATE TABLE accesorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT precio_positive CHECK (precio >= 0),
  CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

-- Create index for better search performance
CREATE INDEX idx_accesorios_nombre ON accesorios USING GIN(to_tsvector('spanish', nombre));
CREATE INDEX idx_accesorios_tipo ON accesorios(tipo);
CREATE INDEX idx_accesorios_activo ON accesorios(activo);

-- Enable RLS (Row Level Security)
ALTER TABLE accesorios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can make it more restrictive later)
CREATE POLICY "Enable all operations for accesorios" ON accesorios
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_accesorios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accesorios_update_timestamp
BEFORE UPDATE ON accesorios
FOR EACH ROW
EXECUTE FUNCTION update_accesorios_timestamp();
