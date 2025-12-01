-- Create ventas (sales) table
CREATE TABLE IF NOT EXISTS ventas (
    id VARCHAR(20) PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create venta_items (sale items) table
CREATE TABLE IF NOT EXISTS venta_items (
    id VARCHAR(20) PRIMARY KEY,
    venta_id VARCHAR(20) NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    accesorio_id VARCHAR(20) NOT NULL REFERENCES accesorios(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT cantidad_positive CHECK (cantidad > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_ventas_cliente ON ventas(cliente);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX idx_venta_items_accesorio ON venta_items(accesorio_id);

-- Enable Row Level Security
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Permitir todas las operaciones en ventas" ON ventas
FOR ALL USING (true);

CREATE POLICY "Permitir todas las operaciones en venta_items" ON venta_items
FOR ALL USING (true);
