import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SalesForm from "@/components/SalesForm";
import { ArrowLeft, CheckCircle, ShoppingCart } from "lucide-react";

export default function Sales() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" size={32} />
                Nueva Venta
              </h1>
              <p className="text-gray-600 mt-1">Registra una nueva venta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 max-w-sm z-50 animate-slide-up">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-green-900">¡Venta registrada!</h3>
            <p className="text-green-700 text-sm">La venta se registró correctamente</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
          <SalesForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
