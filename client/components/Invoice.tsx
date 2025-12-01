import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { jsPDF } from "jspdf";
import type { SaleWithItems } from "@/lib/sales";

interface InvoiceProps {
  sale: SaleWithItems;
  onClose?: () => void;
}

export default function Invoice({ sale, onClose }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(34, 197, 94); // Green color
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", pageWidth / 2, 22, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Accesorios Veterinaria", pageWidth / 2, 35, { align: "center" });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Invoice info section
    let yPos = 60;

    // Left side - Invoice number and date
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text("NÚMERO DE FACTURA", 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(sale.id, 20, yPos + 7);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("FECHA", 20, yPos + 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(formatDate(sale.fecha_venta), 20, yPos + 27);

    // Right side - Customer
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("CLIENTE", pageWidth - 20, yPos, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(sale.cliente, pageWidth - 20, yPos + 7, { align: "right" });

    // Divider line
    yPos = 105;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Table header
    yPos = 115;
    doc.setFillColor(249, 250, 251); // Light gray background
    doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Producto", 25, yPos + 3);
    doc.text("Cant.", 100, yPos + 3, { align: "center" });
    doc.text("Precio Unit.", 140, yPos + 3, { align: "right" });
    doc.text("Subtotal", pageWidth - 25, yPos + 3, { align: "right" });

    // Table rows
    yPos = 130;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    sale.items.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(249, 250, 251);
      }
      doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');

      doc.setFontSize(10);
      doc.text(item.accesorio_id.substring(0, 25), 25, yPos + 3);
      doc.text(item.cantidad.toString(), 100, yPos + 3, { align: "center" });
      doc.text(formatCurrency(item.precio_unitario), 140, yPos + 3, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(item.subtotal), pageWidth - 25, yPos + 3, { align: "right" });
      doc.setFont("helvetica", "normal");

      yPos += 12;
    });

    // Divider line before totals
    yPos += 5;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Totals section
    yPos += 15;
    const totalsX = pageWidth - 80;

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Subtotal:", totalsX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(sale.precio_total), pageWidth - 25, yPos, { align: "right" });

    yPos += 10;
    doc.setTextColor(107, 114, 128);
    doc.text("Impuesto:", totalsX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(0), pageWidth - 25, yPos, { align: "right" });

    // Total line
    yPos += 8;
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1);
    doc.line(totalsX - 5, yPos, pageWidth - 20, yPos);

    yPos += 12;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsX, yPos);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(formatCurrency(sale.precio_total), pageWidth - 25, yPos, { align: "right" });

    // Footer
    yPos = 260;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    yPos += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Gracias por su compra", pageWidth / 2, yPos, { align: "center" });
    doc.text("Accesorios Veterinaria", pageWidth / 2, yPos + 8, { align: "center" });

    // Save the PDF
    doc.save(`factura-${sale.id}.pdf`);
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
            Descargar PDF
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
