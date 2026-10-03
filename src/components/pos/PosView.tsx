import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  CheckCircle,
  Tag,
  Warehouse as WarehouseIcon,
  Coins,
  Barcode
} from 'lucide-react';
import { SaleItem, PaymentMethod } from '../../types';

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    clients,
    warehouses,
    selectedBranchId,
    activeCashSession,
    createSale,
    companySettings,
    setCurrentModule,
    showToast
  } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouses.find(w => w.branchId === selectedBranchId)?.id || warehouses[0]?.id || ''
  );

  // Cart State
  const [cartItems, setCartItems] = useState<{
    productId: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    discountPercentage: number;
  }[]>([]);

  // Selected Client (default to Consumidor Final)
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.find(c => c.code === 'CLI-005')?.id || clients[0]?.id || ''
  );

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [creditDueDate, setCreditDueDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
  );

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Filtered Products
  const availableProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.barcode.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Cart Calculations
  const cartSummary = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    cartItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const gross = item.unitPrice * item.quantity;
      const itemDiscount = gross * (item.discountPercentage / 100);
      const net = gross - itemDiscount;
      const itemTax = net * ((prod?.taxRate || companySettings.defaultTaxRate) / 100);

      subtotal += net;
      tax += itemTax;
      discount += itemDiscount;
    });

    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }, [cartItems, products, companySettings]);

  // Cart actions
  const addToCart = (product: typeof products[0]) => {
    const currentStock = product.warehouseStock[selectedWarehouseId] || 0;
    const existingIndex = cartItems.findIndex(i => i.productId === product.id);

    if (existingIndex > -1) {
      const existing = cartItems[existingIndex];
      if (existing.quantity + 1 > currentStock) {
        showToast(`Stock insuficiente en este almacén (Disponible: ${currentStock})`, 'warning');
        return;
      }
      setCartItems(prev =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (currentStock < 1) {
        showToast('Producto sin existencias en el almacén seleccionado', 'error');
        return;
      }
      setCartItems(prev => [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
          unitPrice: product.sellingPrice,
          unitCost: product.costPrice,
          discountPercentage: selectedClient.discountPercentage || 0
        }
      ]);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    const prod = products.find(p => p.id === productId);
    const currentStock = prod?.warehouseStock[selectedWarehouseId] || 0;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (qty > currentStock) {
      showToast(`Stock máximo disponible en almacén: ${currentStock}`, 'warning');
      return;
    }

    setCartItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Open checkout modal
  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      showToast('El carrito de compras está vacío', 'warning');
      return;
    }
    setAmountReceived(cartSummary.total.toString());
    setIsPaymentModalOpen(true);
  };

  // Confirm Sale (RF-046 / RF-047 / RF-048)
  const handleProcessSale = () => {
    const total = cartSummary.total;
    const received = parseFloat(amountReceived) || 0;

    if (paymentMethod === 'Efectivo' && received < total) {
      showToast('El monto recibido no puede ser inferior al total de la venta', 'error');
      return;
    }

    if (paymentMethod === 'Crédito') {
      const pendingDebt = selectedClient.currentDebt + total;
      if (selectedClient.creditLimit > 0 && pendingDebt > selectedClient.creditLimit) {
        showToast(
          `Límite de crédito excedido. Disponible: $${(selectedClient.creditLimit - selectedClient.currentDebt).toFixed(2)}`,
          'error'
        );
        return;
      }
    }

    const change = paymentMethod === 'Efectivo' ? Math.max(0, received - total) : 0;

    createSale({
      clientId: selectedClientId,
      warehouseId: selectedWarehouseId,
      items: cartItems,
      paymentMethod,
      amountPaid: paymentMethod === 'Crédito' ? 0 : received,
      changeGiven: change,
      paymentStatus: paymentMethod === 'Crédito' ? 'PENDIENTE' : 'PAGADO',
      dueDate: paymentMethod === 'Crédito' ? creditDueDate : undefined
    });

    setIsPaymentModalOpen(false);
    clearCart();
  };

  const changeToGive = Math.max(0, (parseFloat(amountReceived) || 0) - cartSummary.total);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
      {/* LEFT: Product Catalog & Fast Search */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-xl p-4 shadow-xs overflow-hidden">
        {/* Top Controls: Search, Warehouse & Categories */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Punto de Venta / Terminal de Facturación (RF-046)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona productos o escanea el código de barras para registrar la venta.
              </p>
            </div>

            {/* Warehouse Dispatch Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <WarehouseIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Despachar de:</span>
              <select
                value={selectedWarehouseId}
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="py-1 px-2 font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar producto por nombre, código PRD o escaneo de código de barra..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs (Segmented control) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los productos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {availableProducts.map(product => {
              const currentStock = product.warehouseStock[selectedWarehouseId] || 0;
              const isOutOfStock = currentStock <= 0;
              const isLowStock = currentStock <= product.minStock;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`group flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>{product.code}</span>
                      <span className="text-slate-500 font-sans">{product.brand}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio</span>
                      <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        ${product.sellingPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-mono tabular-nums font-semibold block ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? 'Agotado' : `${currentStock} en stock`}
                      </span>
                      <span className="text-[9px] text-slate-400">+ {product.taxRate}% IVA</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {availableProducts.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Current Cart & Checkout Panel */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Cart Header & Client Selection */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Carrito de Venta</span>
              <span className="text-xs font-mono text-slate-500">
                ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                title="Vaciar carrito"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Client Selector (RF-023 / RF-027) */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                <span>Cliente:</span>
              </span>
              {selectedClient.discountPercentage > 0 && (
                <span className="text-emerald-700 font-semibold text-[10px]">
                  Desc. fidelidad {selectedClient.discountPercentage}%
                </span>
              )}
            </div>
            <select
              value={selectedClientId}
              onChange={e => {
                const nextId = e.target.value;
                setSelectedClientId(nextId);
                const nextClient = clients.find(c => c.id === nextId);
                if (nextClient && nextClient.discountPercentage > 0) {
                  // Apply client loyalty discount to cart items
                  setCartItems(prev =>
                    prev.map(item => ({
                      ...item,
                      discountPercentage: nextClient.discountPercentage
                    }))
                  );
                }
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {cartItems.map(item => {
            const prod = products.find(p => p.id === item.productId);
            const lineTotal = item.unitPrice * item.quantity * (1 - item.discountPercentage / 100);

            return (
              <div key={item.productId} className="py-2.5 first:pt-0 last:pb-0 space-y-1 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{prod?.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ${item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ${lineTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2.5 text-xs font-mono font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {cartItems.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-xs">El carrito está vacío</p>
              <p className="text-[11px] text-slate-400 mt-1">Haz clic en un producto para agregarlo.</p>
            </div>
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal neto:</span>
            <span className="font-mono tabular-nums">${cartSummary.subtotal.toFixed(2)}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Descuento aplicado:</span>
              <span className="font-mono tabular-nums">-${cartSummary.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>{companySettings.taxName} ({companySettings.defaultTaxRate}%):</span>
            <span className="font-mono tabular-nums">${cartSummary.tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">TOTAL:</span>
            <span className="text-xl font-bold font-mono text-slate-950 tabular-nums">
              ${cartSummary.total.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleOpenCheckout}
            disabled={cartItems.length === 0}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
              cartItems.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>Cobrar Venta (RF-047)</span>
            <span className="font-mono tabular-nums">${cartSummary.total.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL (RF-047, RF-050) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Finalizar Cobro y Emisión</h3>
                <p className="text-[11px] text-slate-500">Total a pagar: ${cartSummary.total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method);
                        if (method !== 'Efectivo') {
                          setAmountReceived(cartSummary.total.toString());
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-left font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Denominations and Change calculation */}
              {paymentMethod === 'Efectivo' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Efectivo Recibido ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountReceived}
                      onChange={e => setAmountReceived(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Quick bill selectors */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[cartSummary.total, 10, 20, 50, 100].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAmountReceived(amt.toFixed(2))}
                        className="px-2.5 py-1 text-[11px] font-mono font-medium bg-white border border-slate-200 rounded hover:bg-slate-100"
                      >
                        ${amt.toFixed(2)}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-700">Cambio a entregar:</span>
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        changeToGive >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      ${changeToGive.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Credit details */}
              {paymentMethod === 'Crédito' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-900 font-medium">Límite de crédito cliente:</span>
                    <span className="font-mono font-bold">${selectedClient.creditLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-900 font-medium">Deuda acumulada actual:</span>
                    <span className="font-mono font-bold text-rose-600">${selectedClient.currentDebt.toFixed(2)}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Fecha límite de pago acordada
                    </label>
                    <input
                      type="date"
                      value={creditDueDate}
                      onChange={e => setCreditDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Final Process Button */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessSale}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Emitir Ticket & Facturar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
