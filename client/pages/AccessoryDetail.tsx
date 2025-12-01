import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAccessories, type Accessory } from "@/lib/accessories";
import { getSalesByAccessory, type SaleWithItems } from "@/lib/sales";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, TrendingUp, Loader2 } from "lucide-react";

export default function AccessoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load accessory
      const accessories = await getAccessories();
      const acc = accessories.find((a) => a.id === id);
      setAccessory(acc || null);

      // Load sales history
      const salesData = await getSalesByAccessory(id);
      setSales(salesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Cargando accesorio...</p>
        </div>
      </div>
    );
  }

  if (!accessory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Link to="/accessories">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Accesorio no encontrado</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSold = sales.reduce(
    (sum, sale) =>
      sum +
      (sale.items.find((item) => item.accesorio_id === accessory.id)?.cantidad ||
        0),
    0
  );

  const totalRevenue = sales.reduce((sum, sale) => {
    const saleItem = sale.items.find(
      (item) => item.accesorio_id === accessory.id
    );
    return sum + (saleItem?.subtotal || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/accessories">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" size={32} />
                {accessory.nombre}
              </h1>
              <p className="text-gray-600 mt-1">ID: {accessory.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Información */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información</h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Tipo</p>
                <p className="text-lg font-semibold text-gray-900">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {accessory.tipo}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Precio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(accessory.precio)}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Stock Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessory.stock} unidades
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        accessory.stock < 5
                          ? "bg-orange-500"
                          : accessory.stock < 20
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (accessory.stock / 50) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Creado</p>
                <p className="text-gray-900">
                  {formatDate(accessory.fecha_creacion)}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} />
              Ventas
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm">Unidades Vendidas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalSold}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sales.length} venta{sales.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Ventas */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-blue-100">
            <h2 className="text-xl font-bold text-gray-900">
              Historial de Ventas ({sales.length})
            </h2>
          </div>

          {sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-blue-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Factura
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Cliente
                    </th>
                    <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700">
                      Cantidad
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700">
                      Subtotal
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => {
                    const item = sale.items.find(
                      (i) => i.accesorio_id === accessory.id
                    );
                    if (!item) return null;

                    return (
                      <tr
                        key={sale.id}
                        className={
                          index !== sales.length - 1
                            ? "border-b border-blue-50"
                            : ""
                        }
                      >
                        <td className="px-8 py-4 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                          {sale.id}
                        </td>
                        <td className="px-8 py-4 text-sm text-gray-600">
                          {sale.cliente}
                        </td>
                        <td className="px-8 py-4 text-center text-sm font-medium text-gray-900">
                          {item.cantidad}
                        </td>
                        <td className="px-8 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-8 py-4 text-sm text-gray-600">
                          {formatDate(sale.fecha_venta)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-12 text-center">
              <p className="text-gray-500">No hay ventas para este accesorio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
