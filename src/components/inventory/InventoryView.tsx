import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  Warehouse as WarehouseIcon,
  Download,
  Filter,
  Package
} from 'lucide-react';

interface InventoryViewProps {
  onlyLowStock?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onlyLowStock = false }) => {
  const { products, warehouses, categories, setCurrentModule } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(onlyLowStock);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

      const totalStock = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
      const matchesLowStock = !filterLowStock || totalStock <= p.minStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchTerm, selectedCategory, filterLowStock]);

  const totalCostValue = filteredProducts.reduce((acc, p) => {
    const totalQty = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
    return acc + totalQty * p.costPrice;
  }, 0);

  const totalRetailValue = filteredProducts.reduce((acc, p) => {
    const totalQty = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
    return acc + totalQty * p.sellingPrice;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {filterLowStock ? 'Alerta de Bajo Inventario (RF-036)' : 'Control de Existencias en Inventario (RF-032)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta multidimensional de existencias por bodega, valorización y puntos de reorden.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentModule('inventory-adjustments')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Boxes className="h-3.5 w-3.5 text-slate-500" />
            <span>Ajuste de Stock (RF-033)</span>
          </button>
          <button
            onClick={() => setCurrentModule('inventory-transfers')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Transferir (RF-037)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Productos en Consulta</span>
          <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {filteredProducts.length}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Valorización al Costo (PEPS/Promedio)</span>
          <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            ${totalCostValue.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Valorización Proyectada a Venta</span>
          <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
            ${totalRetailValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre o código de barra..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`flex items-center justify-center gap-1.5 p-1.5 rounded-lg font-medium transition-colors ${
            filterLowStock
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span>Solo Bajo Stock (RF-036)</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentModule('inventory-warehouse-report')}
          className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
        >
          <WarehouseIcon className="h-3.5 w-3.5 text-slate-500" />
          <span>Ver Reporte de Bodega</span>
        </button>
      </div>

      {/* Inventory Multi-Warehouse Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3 text-center">Unidad</th>
                {warehouses.map(wh => (
                  <th key={wh.id} className="py-2.5 px-3 text-right">
                    {wh.name.replace('Bodega ', '').replace('Almacén ', '')}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right">Stock Total</th>
                <th className="py-2.5 px-3 text-center">Mínimo</th>
                <th className="py-2.5 px-3 text-right">Costo Prom.</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(prod => {
                const totalStock = Object.values(prod.warehouseStock || {}).reduce((a, b) => a + b, 0);
                const isUnderMin = totalStock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {prod.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 block">{prod.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Barras: {prod.barcode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {prod.unit}
                    </td>
                    {warehouses.map(wh => {
                      const qty = prod.warehouseStock[wh.id] || 0;
                      return (
                        <td key={wh.id} className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {qty}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {totalStock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                      {prod.minStock}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${prod.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ${(totalStock * prod.costPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isUnderMin
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isUnderMin ? 'Bajo Stock' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
