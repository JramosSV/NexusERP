import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';

export const TicketModal: React.FC = () => {
  const { selectedSaleForTicket, setSelectedSaleForTicket, companySettings } = useApp();

  if (!selectedSaleForTicket) return null;

  const sale = selectedSaleForTicket;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
=========================================
        ${companySettings.name}
        ${companySettings.tradeName}
NIT/RUC: ${companySettings.taxId}
Tel: ${companySettings.phone}
Dir: ${companySettings.address}, ${companySettings.city}
=========================================
TICKET: ${sale.ticketNumber}
FACTURA: ${sale.invoiceNumber || 'N/A'}
FECHA: ${sale.createdAt}
CAJERO: ${sale.sellerName}
CLIENTE: ${sale.clientName}
METODO PAGO: ${sale.paymentMethod}
=========================================
CANT  DESCRIPCION             TOTAL
-----------------------------------------
${sale.items
  .map(
    i =>
      `${i.quantity.toString().padEnd(4)}  ${i.productName.slice(0, 22).padEnd(23)} $${i.total.toFixed(2).padStart(7)}`
  )
  .join('\n')}
-----------------------------------------
SUBTOTAL:                    $${sale.subtotal.toFixed(2)}
IVA (${companySettings.defaultTaxRate}%):                     $${sale.taxAmount.toFixed(2)}
DESCUENTO:                   $${sale.discountAmount.toFixed(2)}
TOTAL A PAGAR:               $${sale.total.toFixed(2)}
-----------------------------------------
MONTO RECIBIDO:              $${sale.amountPaid.toFixed(2)}
CAMBIO / VUELTO:             $${sale.changeGiven.toFixed(2)}
ESTADO:                      ${sale.paymentStatus}
=========================================
${companySettings.ticketHeader}

${companySettings.ticketFooter}
=========================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${sale.ticketNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Comprobante de Venta</span>
          </div>
          <button
            onClick={() => setSelectedSaleForTicket(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs select-text" id="printable-ticket">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h3 className="font-bold text-sm tracking-tight text-slate-950 font-sans">{companySettings.tradeName}</h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">{companySettings.name}</p>
            <p className="text-[10px] text-slate-500 mt-1">NIT: {companySettings.taxId}</p>
            <p className="text-[10px] text-slate-500">{companySettings.address}, {companySettings.city}</p>
            <p className="text-[10px] text-slate-500">Tel: {companySettings.phone}</p>
          </div>

          {/* Ticket Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Ticket:</span>
              <span className="font-bold text-slate-900">{sale.ticketNumber}</span>
            </div>
            {sale.invoiceNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Factura:</span>
                <span className="text-slate-900">{sale.invoiceNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha/Hora:</span>
              <span className="tabular-nums text-slate-900">{sale.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cajero:</span>
              <span className="text-slate-900">{sale.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="text-slate-900 font-medium truncate max-w-[170px]">{sale.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Método de Pago:</span>
              <span className="text-slate-900 font-semibold">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
              <span>Cant. / Descripción</span>
              <span>Total</span>
            </div>
            <div className="space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <span className="font-semibold text-slate-900">{item.quantity}x</span>{' '}
                    <span className="text-slate-700">{item.productName}</span>
                    {item.discountPercentage > 0 && (
                      <span className="block text-[10px] text-emerald-600">
                        Desc. {item.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums font-semibold text-slate-900 shrink-0">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="tabular-nums font-medium">${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Descuento aplicado:</span>
                <span className="tabular-nums font-medium">-${sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{companySettings.taxName} ({companySettings.defaultTaxRate}%):</span>
              <span className="tabular-nums font-medium">${sale.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="tabular-nums font-sans">${sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Recibido:</span>
              <span className="tabular-nums font-medium">${sale.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cambio / Vuelto:</span>
              <span className="tabular-nums font-semibold text-emerald-700">${sale.changeGiven.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note & Barcode Simulation */}
          <div className="pt-4 text-center space-y-3">
            <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
              {companySettings.ticketHeader}
            </p>

            {/* Barcode Graphic */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="h-9 w-44 flex items-center justify-center gap-0.5 bg-slate-950 p-1">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${i % 3 === 0 ? 'w-1 bg-white' : i % 2 === 0 ? 'w-0.5 bg-white' : 'w-1.5 bg-white'}`}
                  />
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-slate-500 mt-1">{sale.ticketNumber}</span>
            </div>

            <p className="text-[9px] text-slate-400 whitespace-pre-line">
              {companySettings.ticketFooter}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-t border-slate-100 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            title="Descargar comprobante en texto plano"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
