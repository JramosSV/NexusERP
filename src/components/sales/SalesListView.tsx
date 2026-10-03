import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Printer,
  Ban,
  RotateCcw,
  Download,
  Calendar,
  Eye,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Sale } from '../../types';

export const SalesListView: React.FC = () => {
  const { sales, voidSale, processReturn, setSelectedSaleForTicket, companySettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  // Void modal
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Return modal
  const [returningSale, setReturningSale] = useState<Sale | null>(null);
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch =
        searchTerm === '' ||
        s.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesMethod = selectedMethod === 'all' || s.paymentMethod === selectedMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [sales, searchTerm, selectedStatus, selectedMethod]);

  const handleConfirmVoid = () => {
    if (!voidingSale) return;
    if (!voidReason.trim()) {
      alert('Debes ingresar un motivo de anulación');
      return;
    }
    voidSale(voidingSale.id, voidReason);
    setVoidingSale(null);
    setVoidReason('');
  };

  const handleConfirmReturn = () => {
    if (!returningSale || !returnProductId) return;
    processReturn(returningSale.id, returnProductId, returnQty, returnReason || 'Garantía / Devolución');
    setReturningSale(null);
    setReturnProductId('');
    setReturnQty(1);
    setReturnReason('');
  };

  const exportToCsv = () => {
    const headers = ['Ticket', 'Factura', 'Fecha', 'Cliente', 'Vendedor', 'Método', 'Estado', 'Total'];
    const rows = filteredSales.map(s => [
      s.ticketNumber,
      s.invoiceNumber || '',
      s.createdAt,
      `"${s.clientName}"`,
      `"${s.sellerName}"`,
      s.paymentMethod,
      s.status,
      s.total.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Consultar Ventas Procesadas (RF-048)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro histórico de tickets, reimpresión, anulaciones y gestión de devoluciones.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Exportar CSV (RF-069)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por ticket, cliente o factura..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">Todos los estados</option>
          <option value="Completada">Completada</option>
          <option value="Anulada">Anulada</option>
        </select>

        <select
          value={selectedMethod}
          onChange={e => setSelectedMethod(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">Todos los métodos de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Crédito">Crédito</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Cajero / Vendedor</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {sale.ticketNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    {sale.createdAt}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {sale.clientName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {sale.sellerName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-slate-600">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    ${sale.subtotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sale.status === 'Completada'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Ticket Reprint (RF-049) */}
                      <button
                        onClick={() => setSelectedSaleForTicket(sale)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Reimprimir o generar ticket (RF-049)"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>

                      {/* Return (RF-051) */}
                      {sale.status === 'Completada' && (
                        <button
                          onClick={() => {
                            setReturningSale(sale);
                            setReturnProductId(sale.items[0]?.productId || '');
                          }}
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                          title="Gestionar devolución de ítem (RF-051)"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Void Sale (RF-050) */}
                      {sale.status === 'Completada' && (
                        <button
                          onClick={() => setVoidingSale(sale)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          title="Anular venta y reponer inventario (RF-050)"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron ventas que coincidan con los criterios seleccionados.
          </div>
        )}
      </div>

      {/* VOID SALE MODAL (RF-050) */}
      {voidingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">Anular Venta {voidingSale.ticketNumber}</h3>
            </div>
            <p className="text-slate-600">
              Esta acción revertirá las existencias en inventario y anulará el comprobante por un monto de{' '}
              <strong className="text-slate-900">${voidingSale.total.toFixed(2)}</strong>.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo de la anulación (Obligatorio)
              </label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="Error de digitación, cancelación por el cliente, devolución..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVoidingSale(null)}
                className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="flex-1 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN MODAL (RF-051) */}
      {returningSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">
                Gestionar Devolución ({returningSale.ticketNumber})
              </h3>
            </div>
            <p className="text-slate-600">
              Selecciona el ítem que el cliente devuelve para reincorporarlo al stock del almacén.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Producto a Devolver</label>
              <select
                value={returnProductId}
                onChange={e => setReturnProductId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {returningSale.items.map(item => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName} ({item.quantity} unidades compradas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cantidad a Devolver</label>
              <input
                type="number"
                min="1"
                max={returningSale.items.find(i => i.productId === returnProductId)?.quantity || 1}
                value={returnQty}
                onChange={e => setReturnQty(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motivo</label>
              <input
                type="text"
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                placeholder="Falla técnica de fábrica, cambio de producto..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturningSale(null)}
                className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="flex-1 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Procesar Devolución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
