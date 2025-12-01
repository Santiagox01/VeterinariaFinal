import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccessories, getStatistics, type Accessory } from "@/lib/accessories";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  AlertCircle,
  Grid2X2,
  Plus,
  ArrowRight,
  ShoppingCart,
  History,
} from "lucide-react";

export default function Dashboard() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    types: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accessoriesData, statsData] = await Promise.all([
        getAccessories(),
        getStatistics(),
      ]);
      setAccessories(accessoriesData.slice(0, 5));
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" size={32} />
                Accesorios Veterinaria
              </h1>
              <p className="text-gray-600 mt-1">Gestión de inventario</p>
            </div>
            <div className="flex gap-3">
              <Link to="/sales">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart size={20} />
                  Nueva Venta
                </Button>
              </Link>
              <Link to="/sales-history">
                <Button variant="outline">
                  <History size={20} />
                  Historial
                </Button>
              </Link>
              <Link to="/accessories">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={20} />
                  Nuevo Accesorio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Products */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Productos Totales
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 border border-green-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Valor del Inventario
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 border border-orange-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Productos Bajos
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats.lowStockCount}
                </p>
                <p className="text-xs text-orange-600 mt-1">(menos de 5 unidades)</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 border border-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Categorías
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats.types}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Grid2X2 className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Productos Recientes
              </h2>
              <Link to="/accessories">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  Ver todos
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-8 py-12 text-center">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : accessories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-blue-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Tipo
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Precio
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accessories.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        index !== accessories.length - 1
                          ? "border-b border-blue-50"
                          : ""
                      }
                    >
                      <td className="px-8 py-4 text-sm font-medium text-gray-900">
                        {item.nombre}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(item.precio)}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.stock < 5
                              ? "bg-orange-100 text-orange-800"
                              : item.stock < 20
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.stock} unidades
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-4">No hay accesorios registrados</p>
              <Link to="/accessories">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Registrar Primer Accesorio
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
