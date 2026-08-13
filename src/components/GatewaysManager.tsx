import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  Cpu,
  Globe,
  X
} from 'lucide-react';
import { Gateway, TelemanagementNode } from '../types';

interface GatewaysManagerProps {
  gateways?: Gateway[];
  nodes?: TelemanagementNode[];
  onAddGateway?: (gw: Gateway) => void;
  onUpdateGateway?: (gw: Gateway) => void;
  onDeleteGateway?: (gwId: string) => void;
}

export const GatewaysManager: React.FC<GatewaysManagerProps> = ({
  gateways = [],
  nodes = [],
  onAddGateway,
  onUpdateGateway,
  onDeleteGateway
}) => {
  const safeGateways = gateways || [];
  const safeNodes = nodes || [];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);

  const [formData, setFormData] = useState<Partial<Gateway>>({
    name: '',
    location: '',
    ipAddress: '189.40.12.90',
    status: 'online',
    firmwareVersion: 'v2.8.4-mesh'
  });

  const handleOpenAddModal = () => {
    setEditingGateway(null);
    setFormData({
      name: '',
      location: '',
      ipAddress: `189.40.12.${Math.floor(10 + Math.random() * 80)}`,
      status: 'online',
      firmwareVersion: 'v2.8.4-mesh'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (gw: Gateway) => {
    setEditingGateway(gw);
    setFormData({ ...gw });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingGateway) {
      onUpdateGateway?.({
        ...editingGateway,
        ...formData
      } as Gateway);
    } else {
      const newGw: Gateway = {
        id: `GW-0${safeGateways.length + 1}`,
        name: formData.name || 'Gateway Central',
        location: formData.location || 'Subestação Central',
        ipAddress: formData.ipAddress || '189.40.12.90',
        status: (formData.status as any) || 'online',
        connectedNodesCount: 0,
        lastCommunication: 'Há 5 segundos',
        firmwareVersion: formData.firmwareVersion || 'v2.8.4-mesh'
      };
      onAddGateway?.(newGw);
    }
    setIsModalOpen(false);
  };

  const filteredGateways = safeGateways.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.ipAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePingTest = (ip: string) => {
    alert(`Ping para ${ip}: 4 pacotes transmitidos, 0% de perda. Latência média: 14ms.`);
  };

  const handleRebootGateway = (name: string) => {
    alert(`Comando de reinicialização enviado para o ${name}. Re-conexão LoRa/4G estimada em 45s.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Radio className="w-6 h-6 text-blue-600" />
            <span>Cadastro de Gateways de Campo</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Concentradores de comunicação Mesh/LoRa/4G que conectam os nódulos dos postes à nuvem Sky Light.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Gateway</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome do gateway, ID, localização ou endereço IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGateways.map((gw) => {
          const connectedCount = safeNodes.filter((n) => n.gatewayId === gw.id).length;
          return (
            <div
              key={gw.id}
              className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-2xl shadow-sm space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
                    {gw.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      gw.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {gw.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{gw.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{gw.location}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Endereço IP:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{gw.ipAddress}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Nódulos Conectados:</span>
                    </span>
                    <strong className="text-cyan-700 font-mono font-bold">{connectedCount} Nódulos</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Firmware:</span>
                    <span className="font-mono text-slate-500">{gw.firmwareVersion}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handlePingTest(gw.ipAddress)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    Ping Test
                  </button>
                  <button
                    onClick={() => handleRebootGateway(gw.name)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-cyan-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                    title="Reiniciar Gateway"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEditModal(gw)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteGateway?.(gw.id)}
                    className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingGateway ? `Editar Gateway ${editingGateway.id}` : 'Cadastrar Novo Gateway'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Gateway</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gateway Concentrador - Região Central"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Localização Física</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Subestação Bairro Centro, Poste GW-01"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endereço IP WAN</label>
                <input
                  type="text"
                  required
                  value={formData.ipAddress || ''}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Operacional</label>
                  <select
                    value={formData.status || 'online'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="warning">Aviso / Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Firmware</label>
                  <input
                    type="text"
                    value={formData.firmwareVersion || 'v2.8.4-mesh'}
                    onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-500 shadow-md transition"
                >
                  {editingGateway ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
