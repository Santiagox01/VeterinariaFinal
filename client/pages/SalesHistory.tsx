import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSales, type SaleWithItems } from "@/lib/sales";
import { Button } from "@/components/ui/button";
import Invoice from "@/components/Invoice";
import { ArrowLeft, Eye, Loader2, History } from "lucide-react";

export default function SalesHistory() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedSale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSale(null)}
                className="text-gray-600"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Factura {selectedSale.id}</h1>
                <p className="text-gray-600 mt-1">{selectedSale.cliente}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
            <Invoice sale={selectedSale} onClose={() => setSelectedSale(null)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <History className="text-blue-600" size={32} />
                Historial de Ventas
              </h1>
              <p className="text-gray-600 mt-1">
                {sales.length} venta{sales.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Cargando ventas...</p>
          </div>
        ) : sales.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
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
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Productos
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Fecha
                    </th>
                    <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className={
                        index !== sales.length - 1 ? "border-b border-blue-50" : ""
                      }
                    >
                      <td className="px-8 py-4 text-sm font-semibold text-gray-900">
                        {sale.id}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        {sale.cliente}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        {sale.items.length} producto{sale.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-8 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.precio_total)}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        {formatDate(sale.fecha_venta)}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <Button
                          onClick={() => setSelectedSale(sale)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Eye size={16} />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No hay ventas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
