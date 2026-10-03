import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RotateCcw, Building2, Receipt, Shield, CheckCircle2 } from 'lucide-react';
import { CompanySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { companySettings, updateCompanySettings, restoreDemoData } = useApp();

  const [formData, setFormData] = useState<CompanySettings>({
    ...companySettings
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Configuración General del Sistema (RF-016)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza la identidad fiscal, parámetros de facturación, tickets y políticas de inventario.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Restaurar los datos de demostración a su estado inicial? Se reiniciarán las tablas locales.')) {
              restoreDemoData();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restablecer Datos Demo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Bloque 1: Datos de la Empresa */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Datos Fiscales y Comerciales de la Empresa</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial (Marca)</label>
              <input
                type="text"
                required
                value={formData.tradeName}
                onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIT / RUC / Doc. Fiscal</label>
              <input
                type="text"
                required
                value={formData.taxId}
                onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono PBX</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Dirección Fiscal</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ciudad / País</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Bloque 2: Parámetros Monetarios y Tributarios */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Parámetros Tributarios y de Moneda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Símbolo Moneda</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código Moneda</label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={e => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Impuesto</label>
              <input
                type="text"
                value={formData.taxName}
                onChange={e => setFormData({ ...formData, taxName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tasa Impositiva Defecto (%)</label>
              <input
                type="number"
                value={formData.defaultTaxRate}
                onChange={e => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Bloque 3: Formato de Comprobantes Térmicos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Receipt className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Mensajes de Encabezado y Pie de Ticket (POS)</h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Encabezado de Ticket (80mm)</label>
            <textarea
              rows={2}
              value={formData.ticketHeader}
              onChange={e => setFormData({ ...formData, ticketHeader: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pie de Ticket / Políticas de Garantía</label>
            <textarea
              rows={2}
              value={formData.ticketFooter}
              onChange={e => setFormData({ ...formData, ticketFooter: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Configuración General</span>
          </button>
        </div>
      </form>
    </div>
  );
};
