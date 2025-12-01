import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAccessories, type Accessory } from "@/lib/accessories";
import { createSale } from "@/lib/sales";
import { AlertCircle, Loader2, Trash2, Plus } from "lucide-react";

interface CartItem {
  accesorio: Accessory;
  cantidad: number;
}

interface SalesFormProps {
  onSuccess: () => void;
}

export default function SalesForm({ onSuccess }: SalesFormProps) {
  const [cliente, setCliente] = useState("");
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = async () => {
    try {
      const data = await getAccessories();
      setAccessories(data);
    } catch (err) {
      setError("Error cargando accesorios");
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    setError("");

    if (!selectedAccessory) {
      setError("Selecciona un accesorio");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    const accessory = accessories.find((a) => a.id === selectedAccessory);
    if (!accessory) {
      setError("Accesorio no encontrado");
      return;
    }

    if (accessory.stock < qty) {
      setError(
        `No hay suficiente stock. Disponible: ${accessory.stock} unidades`
      );
      return;
    }

    // Check if already in cart
    const existingItem = cart.find((item) => item.accesorio.id === selectedAccessory);
    if (existingItem) {
      const newQty = existingItem.cantidad + qty;
      if (accessory.stock < newQty) {
        setError(
          `No hay suficiente stock para agregar más. Total en carrito: ${existingItem.cantidad}, disponible: ${accessory.stock}`
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.accesorio.id === selectedAccessory
            ? { ...item, cantidad: newQty }
            : item
        )
      );
    } else {
      setCart([...cart, { accesorio: accessory, cantidad: qty }]);
    }

    setSelectedAccessory("");
    setQuantity("1");
  };

  const handleRemoveFromCart = (accesorio_id: string) => {
    setCart(cart.filter((item) => item.accesorio.id !== accesorio_id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cliente.trim()) {
      setError("El nombre del cliente es requerido");
      return;
    }

    if (cart.length === 0) {
      setError("Agrega al menos un producto al carrito");
      return;
    }

    try {
      setLoading(true);

      const saleItems = cart.map((item) => ({
        accesorio_id: item.accesorio.id,
        cantidad: item.cantidad,
        precio_unitario: item.accesorio.precio,
      }));

      await createSale(cliente, saleItems);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la venta");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.accesorio.precio * item.cantidad,
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Nombre del Cliente
        </label>
        <input
          type="text"
          value={cliente}
          onChange={(e) => {
            setCliente(e.target.value);
            setError("");
          }}
          placeholder="Ej: Juan López"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          disabled={loading}
        />
      </div>

      {/* Agregar Productos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Agregar Productos</h3>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Selecciona un accesorio
          </label>
          <select
            value={selectedAccessory}
            onChange={(e) => setSelectedAccessory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          >
            <option value="">-- Seleccionar --</option>
            {accessories.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.nombre} - {formatCurrency(acc.precio)} (Stock: {acc.stock})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={20} />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      {/* Carrito */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          Carrito ({cart.length} producto{cart.length !== 1 ? "s" : ""})
        </h3>

        {cart.length > 0 ? (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.accesorio.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.accesorio.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {item.cantidad} x {formatCurrency(item.accesorio.precio)} ={" "}
                    {formatCurrency(item.cantidad * item.accesorio.precio)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.accesorio.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Carrito vacío</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading || cart.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
      >
        {loading && <Loader2 className="animate-spin mr-2" size={20} />}
        Registrar Venta
      </Button>
    </form>
  );
}
