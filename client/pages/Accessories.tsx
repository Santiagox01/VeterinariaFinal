import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAccessories,
  searchAccessories,
  getAccessoryTypes,
  reduceStock,
  addStock,
  updateAccessory,
  type Accessory,
} from "@/lib/accessories";
import { Button } from "@/components/ui/button";
import AccessoryForm from "@/components/AccessoryForm";
import {
  Search,
  Plus,
  Edit2,
  ShoppingCart,
  ArrowLeft,
  X,
  Loader2,
  AlertCircle,
  History,
  Package,
} from "lucide-react";

export default function Accessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [filteredAccessories, setFilteredAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | undefined>();
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAccessoryId, setSellAccessoryId] = useState<string | null>(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellError, setSellError] = useState("");
  const [sellingLoading, setSellingLoading] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addStockAccessoryId, setAddStockAccessoryId] = useState<string | null>(null);
  const [addStockQuantity, setAddStockQuantity] = useState("");
  const [addStockError, setAddStockError] = useState("");
  const [addStockLoading, setAddStockLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accessoriesData, typesData] = await Promise.all([
        getAccessories(),
        getAccessoryTypes(),
      ]);
      setAccessories(accessoriesData);
      setFilteredAccessories(accessoriesData);
      setTypes(typesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      applyFilter(selectedType, accessories);
      return;
    }

    try {
      const results = await searchAccessories(query);
      applyFilter(selectedType, results);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    applyFilter(type, filteredAccessories);
  };

  const applyFilter = (type: string, sourceData: Accessory[]) => {
    if (!type) {
      setFilteredAccessories(sourceData);
    } else {
      setFilteredAccessories(sourceData.filter((a) => a.tipo === type));
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAccessory(undefined);
    loadData();
  };

  const handleSell = async () => {
    if (!sellAccessoryId || !sellQuantity) {
      setSellError("Ingrese la cantidad a vender");
      return;
    }

    const quantity = parseInt(sellQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setSellError("La cantidad debe ser un número positivo");
      return;
    }

    const accessory = accessories.find((a) => a.id === sellAccessoryId);
    if (!accessory || accessory.stock < quantity) {
      setSellError("No hay suficiente stock disponible");
      return;
    }

    try {
      setSellingLoading(true);
      await reduceStock(sellAccessoryId, quantity);
      setSellError("");
      setShowSellModal(false);
      setSellAccessoryId(null);
      setSellQuantity("");
      loadData();
    } catch (error) {
      setSellError(
        error instanceof Error ? error.message : "Error al procesar la venta"
      );
    } finally {
      setSellingLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!addStockAccessoryId || !addStockQuantity) {
      setAddStockError("Ingrese la cantidad a agregar");
      return;
    }

    const quantity = parseInt(addStockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setAddStockError("La cantidad debe ser un numero positivo");
      return;
    }

    try {
      setAddStockLoading(true);
      await addStock(addStockAccessoryId, quantity);
      setAddStockError("");
      setShowAddStockModal(false);
      setAddStockAccessoryId(null);
      setAddStockQuantity("");
      loadData();
    } catch (error) {
      setAddStockError(
        error instanceof Error ? error.message : "Error al agregar stock"
      );
    } finally {
      setAddStockLoading(false);
    }
  };

  const handleUpdatePrice = async (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      return;
    }

    try {
      await updateAccessory(id, { precio: price });
      loadData();
    } catch (error) {
      console.error("Error updating price:", error);
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
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accesorios</h1>
              <p className="text-gray-600 mt-1">
                {filteredAccessories.length} producto
                {filteredAccessories.length !== 1 ? "s" : ""} encontrado
                {filteredAccessories.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="ml-auto flex gap-3">
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
              <Button
                onClick={() => {
                  setEditingAccessory(undefined);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={20} />
                Nuevo Accesorio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAccessory ? "Editar Accesorio" : "Nuevo Accesorio"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAccessory(undefined);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <AccessoryForm
              accessory={editingAccessory}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Modal Venta */}
      {showSellModal && sellAccessoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registrar Venta
            </h2>

            {sellError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm">{sellError}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-700 mb-3">
                Producto:{" "}
                <span className="font-semibold">
                  {accessories.find((a) => a.id === sellAccessoryId)?.nombre}
                </span>
              </p>
              <p className="text-gray-600 mb-4">
                Stock actual:{" "}
                <span className="font-semibold">
                  {accessories.find((a) => a.id === sellAccessoryId)?.stock}{" "}
                  unidades
                </span>
              </p>

              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cantidad a Vender
              </label>
              <input
                type="number"
                value={sellQuantity}
                onChange={(e) => {
                  setSellQuantity(e.target.value);
                  setSellError("");
                }}
                min="1"
                placeholder="Ingrese cantidad"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={sellingLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSellModal(false);
                  setSellAccessoryId(null);
                  setSellQuantity("");
                  setSellError("");
                }}
                disabled={sellingLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSell}
                disabled={sellingLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {sellingLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                Confirmar Venta
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Stock */}
      {showAddStockModal && addStockAccessoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Agregar Stock
            </h2>

            {addStockError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm">{addStockError}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-700 mb-3">
                Producto:{" "}
                <span className="font-semibold">
                  {accessories.find((a) => a.id === addStockAccessoryId)?.nombre}
                </span>
              </p>
              <p className="text-gray-600 mb-4">
                Stock actual:{" "}
                <span className="font-semibold">
                  {accessories.find((a) => a.id === addStockAccessoryId)?.stock}{" "}
                  unidades
                </span>
              </p>

              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cantidad a Agregar
              </label>
              <input
                type="number"
                value={addStockQuantity}
                onChange={(e) => {
                  setAddStockQuantity(e.target.value);
                  setAddStockError("");
                }}
                min="1"
                placeholder="Ingrese cantidad"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={addStockLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddStockModal(false);
                  setAddStockAccessoryId(null);
                  setAddStockQuantity("");
                  setAddStockError("");
                }}
                disabled={addStockLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddStock}
                disabled={addStockLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {addStockLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                Agregar Stock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o tipo..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todos los tipos</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Cargando accesorios...</p>
          </div>
        ) : filteredAccessories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccessories.map((accessory) => (
              <Link
                key={accessory.id}
                to={`/accessory/${accessory.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-blue-100 overflow-hidden block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {accessory.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {accessory.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {accessory.tipo}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-gray-600 text-sm">Precio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(accessory.precio)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Stock</p>
                      <div className="flex items-center gap-2">
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
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                            accessory.stock < 5
                              ? "bg-orange-100 text-orange-800"
                              : accessory.stock < 20
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {accessory.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingAccessory(accessory);
                        setShowForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setAddStockAccessoryId(accessory.id);
                        setShowAddStockModal(true);
                        setAddStockQuantity("");
                        setAddStockError("");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 rounded-lg transition"
                    >
                      <Package size={16} />
                      Stock
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSellAccessoryId(accessory.id);
                        setShowSellModal(true);
                        setSellQuantity("");
                        setSellError("");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 rounded-lg transition"
                    >
                      <ShoppingCart size={16} />
                      Vender
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedType
                ? "No se encontraron accesorios con esos criterios"
                : "No hay accesorios registrados"}
            </p>
            {!searchQuery && !selectedType && (
              <Button
                onClick={() => {
                  setEditingAccessory(undefined);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={20} />
                Crear Primer Accesorio
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
