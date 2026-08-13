import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Package,
  X
} from 'lucide-react';
import { ServiceOrder, InventoryItem, Pole } from '../types';

interface MaintenanceManagerProps {
  orders?: ServiceOrder[];
  inventory?: InventoryItem[];
  poles?: Pole[];
  onAddOrder?: (order: ServiceOrder) => void;
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
  onUpdateInventoryQty?: (itemId: string, qtyDelta: number) => void;
}

export const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({
  orders = [],
  inventory = [],
  poles = [],
  onAddOrder,
  onUpdateOrderStatus,
  onUpdateInventoryQty
}) => {
  const safeOrders = orders || [];
  const safeInventory = inventory || [];
  const safePoles = poles || [];

  const [activeTab, setActiveTab] = useState<'os' | 'inventory'>('os');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    poleId: safePoles[0]?.id || 'PST-1001',
    title: '',
    description: '',
    priority: 'alta',
    technician: 'Eng. Carlos Eduardo (Equipe Alfa)',
    scheduledDate: new Date().toISOString().split('T')[0],
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
  });

  const handleOpenAddModal = () => {
    setFormData({
      poleId: safePoles[0]?.id || 'PST-1001',
      title: '',
      description: '',
      priority: 'alta',
      technician: 'Eng. Carlos Eduardo (Equipe Alfa)',
      scheduledDate: new Date().toISOString().split('T')[0],
      photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const pole = safePoles.find((p) => p.id === formData.poleId) || safePoles[0];

    const newOrder: ServiceOrder = {
      id: `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
      poleId: pole?.id || 'P-001',
      poleCode: pole?.code || 'P-001',
      title: formData.title || 'Manutenção Preventiva',
      description: formData.description || 'Intervenção técnica programada.',
      priority: (formData.priority as any) || 'alta',
      status: 'pendente',
      technician: formData.technician || 'Equipe Geral',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      scheduledDate: formData.scheduledDate || new Date().toISOString().split('T')[0],
      photoUrl: formData.photoUrl,
      partsUsed: [
        { name: 'Luminária LED Smart 150W', quantity: 1 }
      ]
    };

    onAddOrder?.(newOrder);
    setIsModalOpen(false);
  };

  const filteredOrders = safeOrders.filter(
    (o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.poleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.technician.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-amber-600" />
            <span>Gestão de Manutenção e Ordens de Serviço (OS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Abertura, atribuição de técnicos, registro fotográfico de campo e controle de estoque de reposição.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('os')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'os' ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ordens de Serviço ({safeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'inventory' ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Estoque de Equipamentos ({safeInventory.length})
        </button>
      </div>

      {/* View OS Tab */}
      {activeTab === 'os' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por título de OS, código do poste ou técnico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((os) => (
              <div
                key={os.id}
                className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-sm space-y-4 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-mono font-bold text-xs rounded border border-amber-200">
                      {os.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        os.priority === 'critica'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : os.priority === 'alta'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {os.priority.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">{os.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Poste: {os.poleCode}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{os.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div>
                      Técnico: <strong>{os.technician}</strong>
                    </div>
                    <div>
                      Agendado: <span className="font-mono">{os.scheduledDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      os.status === 'concluida'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : os.status === 'em_andamento'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {os.status === 'concluida'
                      ? 'CONCLUÍDA'
                      : os.status === 'em_andamento'
                      ? 'EM ANDAMENTO'
                      : 'PENDENTE'}
                  </span>

                  {os.status !== 'concluida' && (
                    <button
                      onClick={() => onUpdateOrderStatus?.(os.id, 'concluida')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir OS</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>Estoque e Almoxarifado de Peças de Reposição</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item / Equipamento</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Localização Estoque</th>
                  <th className="py-3 px-4">Qtd Disponível</th>
                  <th className="py-3 px-4">Mínimo Segurança</th>
                  <th className="py-3 px-4 text-right">Ações Ajuste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{item.location}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-slate-900">
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${
                          item.quantity <= item.minThreshold
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{item.minThreshold} {item.unit}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onUpdateInventoryQty?.(item.id, 1)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-700 font-extrabold rounded-lg border border-slate-200 transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onUpdateInventoryQty?.(item.id, -1)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-rose-700 font-extrabold rounded-lg border border-slate-200 transition"
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nova OS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Abrir Nova Ordem de Serviço (OS)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poste de Iluminação Alvo</label>
                <select
                  value={formData.poleId || ''}
                  onChange={(e) => setFormData({ ...formData, poleId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {safePoles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} ({p.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Ordem de Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de Driver LED com defeito"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Problema / Serviço</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={formData.priority || 'alta'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica (Urgência)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Técnico / Equipe Atribuída</label>
                  <input
                    type="text"
                    value={formData.technician || ''}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold bg-amber-600 hover:bg-amber-500 shadow-md transition"
                >
                  Confirmar Abertura da OS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
