import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import type { SaleWithItems } from "@/lib/sales";

interface InvoiceProps {
  sale: SaleWithItems;
  onClose?: () => void;
}

export default function Invoice({ sale, onClose }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow && invoiceRef.current) {
      printWindow.document.write(invoiceRef.current.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    if (!element) return;

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 800, 1000);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial";
      ctx.fillText("FACTURA", 50, 50);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `factura-${sale.id}.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Factura</h2>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
          >
            <Printer size={20} />
            Imprimir
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="gap-2"
          >
            <Download size={20} />
            Descargar
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white border-2 border-gray-200 rounded-lg p-8 space-y-6 text-gray-900"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-6">
          <h1 className="text-3xl font-bold">FACTURA</h1>
          <p className="text-gray-600">Accesorios Veterinaria</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600">NÚMERO DE FACTURA</p>
            <p className="text-lg font-semibold">{sale.id}</p>
            <p className="text-sm text-gray-600 mt-4">FECHA</p>
            <p className="text-base">{formatDate(sale.fecha_venta)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">CLIENTE</p>
            <p className="text-lg font-semibold">{sale.cliente}</p>
          </div>
        </div>

        {/* Table */}
        <div className="border-t-2 border-b-2 border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 font-semibold">Producto</th>
                <th className="text-center py-3 px-4 font-semibold">Cantidad</th>
                <th className="text-right py-3 px-4 font-semibold">Precio Unit.</th>
                <th className="text-right py-3 px-4 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.accesorio_id}</td>
                  <td className="text-center py-3 px-4">{item.cantidad}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(item.precio_unitario)}</td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.precio_total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Impuesto:</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t-2 border-gray-200 pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(sale.precio_total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-200 pt-6 text-sm text-gray-600">
          <p>Gracias por su compra</p>
          <p>Accesorios Veterinaria</p>
        </div>
      </div>
    </div>
  );
}
