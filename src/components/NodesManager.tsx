import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Wifi,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { TelemanagementNode, Gateway } from '../types';

interface NodesManagerProps {
  nodes?: TelemanagementNode[];
  gateways?: Gateway[];
  onAddNode?: (node: TelemanagementNode) => void;
  onUpdateNode?: (node: TelemanagementNode) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const NodesManager: React.FC<NodesManagerProps> = ({
  nodes = [],
  gateways = [],
  onAddNode,
  onUpdateNode,
  onDeleteNode
}) => {
  const safeNodes = nodes || [];
  const safeGateways = gateways || [];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNode, setEditingNode] = useState<TelemanagementNode | null>(null);

  const [formData, setFormData] = useState<Partial<TelemanagementNode>>({
    serialNumber: `SKN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    model: 'SkyNode Pro NEMA 7-Pin ANSI C136.41',
    firmware: 'v3.5.2-rf',
    gatewayId: safeGateways[0]?.id || 'GW-01',
    status: 'online',
    signalRssi: -65,
    activationDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenAddModal = () => {
    setEditingNode(null);
    setFormData({
      serialNumber: `SKN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      model: 'SkyNode Pro NEMA 7-Pin ANSI C136.41',
      firmware: 'v3.5.2-rf',
      gatewayId: safeGateways[0]?.id || 'GW-01',
      status: 'online',
      signalRssi: -65,
      activationDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (node: TelemanagementNode) => {
    setEditingNode(node);
    setFormData({ ...node });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber) return;

    if (editingNode) {
      onUpdateNode?.({
        ...editingNode,
        ...formData
      } as TelemanagementNode);
    } else {
      const newNode: TelemanagementNode = {
        id: `ND-${Math.floor(500 + Math.random() * 500)}`,
        serialNumber: formData.serialNumber || `SKN-${Date.now()}`,
        model: formData.model || 'SkyNode Pro NEMA 7-Pin',
        firmware: formData.firmware || 'v3.5.2-rf',
        gatewayId: formData.gatewayId || safeGateways[0]?.id || 'GW-01',
        poleId: null,
        status: (formData.status as any) || 'online',
        signalRssi: Number(formData.signalRssi) || -65,
        activationDate: formData.activationDate || new Date().toISOString().split('T')[0],
        lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      onAddNode?.(newNode);
    }
    setIsModalOpen(false);
  };

  const filteredNodes = safeNodes.filter((n) => {
    const matchSearch =
      !searchQuery ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGateway = filterGateway === 'all' || n.gatewayId === filterGateway;

    return matchSearch && matchGateway;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-cyan-600" />
            <span>Nódulos de Telegestão (IoT Field Devices)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerenciamento de controladores NEMA/Zhaga instalados nos postes para telemetria e comando RF Mesh.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Nódulo</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por ID, número de série ou modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={filterGateway}
          onChange={(e) => setFilterGateway(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">Todos os Gateways</option>
          {safeGateways.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.id})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID / N° Série</th>
                <th className="py-3.5 px-4">Modelo / Firmware</th>
                <th className="py-3.5 px-4">Gateway Vinculado</th>
                <th className="py-3.5 px-4">Sinal RF (RSSI)</th>
                <th className="py-3.5 px-4">Status & Vínculo</th>
                <th className="py-3.5 px-4">Última Comms</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNodes.map((node) => {
                const gw = safeGateways.find((g) => g.id === node.gatewayId);
                return (
                  <tr key={node.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono rounded">
                          {node.id}
                        </span>
                        <span className="font-mono text-slate-700">{node.serialNumber}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">{node.model}</div>
                      <div className="text-[10px] font-mono text-slate-500">{node.firmware}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {gw?.name || node.gatewayId}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold flex items-center space-x-1 w-max">
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        <span>{node.signalRssi} dBm</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            node.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {node.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                        {node.poleId ? (
                          <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Poste: {node.poleId}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Livre</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {node.lastCommunication}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(node)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNode?.(node.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingNode ? `Editar Nódulo ${editingNode.id}` : 'Cadastrar Novo Nódulo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Série (SN)</label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modelo do Dispositivo</label>
                <input
                  type="text"
                  required
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gateway Concentrador Associado</label>
                <select
                  value={formData.gatewayId || ''}
                  onChange={(e) => setFormData({ ...formData, gatewayId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {safeGateways.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Firmware</label>
                  <input
                    type="text"
                    value={formData.firmware || 'v3.5.2-rf'}
                    onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sinal RSSI (dBm)</label>
                  <input
                    type="number"
                    value={formData.signalRssi || -65}
                    onChange={(e) => setFormData({ ...formData, signalRssi: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  className="px-5 py-2 rounded-xl text-white font-bold bg-cyan-600 hover:bg-cyan-500 shadow-md transition"
                >
                  {editingNode ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
