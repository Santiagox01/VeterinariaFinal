import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createAccessory, updateAccessory, getAccessories, type Accessory } from "@/lib/accessories";
import { AlertCircle, Loader2 } from "lucide-react";

interface AccessoryFormProps {
  accessory?: Accessory;
  onSuccess: () => void;
}

export default function AccessoryForm({
  accessory,
  onSuccess,
}: AccessoryFormProps) {
  const [formData, setFormData] = useState({
    nombre: accessory?.nombre || "",
    tipo: accessory?.tipo || "",
    precio: accessory?.precio.toString() || "",
    stock: accessory?.stock.toString() || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commonTypes = [
    "Correa",
    "Bozal",
    "Comedero",
    "Bebedero",
    "Juguete",
    "Cama",
    "Collar",
    "Vacuna",
    "Medicamento",
    "Cuidado",
    "Otro",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.nombre ||
      !formData.tipo ||
      !formData.precio ||
      !formData.stock
    ) {
      setError("Todos los campos son requeridos");
      return;
    }

    const precio = parseFloat(formData.precio);
    const stock = parseInt(formData.stock);

    if (isNaN(precio) || precio < 0) {
      setError("El precio debe ser un número válido positivo");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError("El stock debe ser un número entero válido positivo");
      return;
    }

    try {
      setLoading(true);

      if (accessory) {
        await updateAccessory(accessory.id, {
          nombre: formData.nombre,
          tipo: formData.tipo,
          precio,
          stock,
        });
      } else {
        // Generate next ID
        const accessories = await getAccessories();
        const lastId = accessories.reduce((max, acc) => {
          const num = parseInt(acc.id.replace("ACC", ""));
          return num > max ? num : max;
        }, 0);
        const nextId = `ACC${String(lastId + 1).padStart(3, "0")}`;

        await createAccessory({
          id: nextId,
          nombre: formData.nombre,
          tipo: formData.tipo,
          precio,
          stock,
          activo: true,
        });
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el accesorio"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Nombre del Accesorio
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Collar de seguridad"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Tipo
        </label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          disabled={loading}
        >
          <option value="">Seleccionar tipo</option>
          {commonTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Precio (COP)
          </label>
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Stock (Unidades)
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
      >
        {loading && <Loader2 className="animate-spin mr-2" size={20} />}
        {accessory ? "Actualizar Accesorio" : "Crear Accesorio"}
      </Button>
    </form>
  );
}
