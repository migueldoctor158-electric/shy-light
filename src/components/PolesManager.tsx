import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { Pole } from '../types';

interface PolesManagerProps {
  poles?: Pole[];
  gateways?: any[];
  nodes?: any[];
  onAddPole?: (pole: Pole) => void;
  onUpdatePole?: (pole: Pole) => void;
  onDeletePole?: (poleId: string) => void;
  onSelectPoleForMap?: (poleId: string) => void;
}

export const PolesManager: React.FC<PolesManagerProps> = ({
  poles = [],
  onAddPole,
  onUpdatePole,
  onDeletePole,
  onSelectPoleForMap
}) => {
  const safePoles = poles || [];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPole, setEditingPole] = useState<Pole | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pole>>({
    code: `P-${Math.floor(10000 + Math.random() * 90000)}`,
    name: '',
    address: '',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    lat: -23.5614,
    lng: -46.6558,
    powerWattage: 150,
    fixtureType: 'LED',
    status: 'auto',
    dimmingLevel: 100,
    isAuto: true,
    installDate: new Date().toISOString().split('T')[0],
    notes: 'Poste inteligente recém cadastrado na infraestrutura municipal.'
  });

  const handleOpenAddModal = () => {
    setEditingPole(null);
    setFormData({
      code: `P-00${safePoles.length + 101}`,
      name: '',
      address: '',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      lat: -23.5614 + (Math.random() - 0.5) * 0.02,
      lng: -46.6558 + (Math.random() - 0.5) * 0.02,
      powerWattage: 150,
      fixtureType: 'LED',
      status: 'auto',
      dimmingLevel: 100,
      isAuto: true,
      installDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pole: Pole) => {
    setEditingPole(pole);
    setFormData({ ...pole });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    if (editingPole) {
      onUpdatePole?.({
        ...editingPole,
        ...formData
      } as Pole);
    } else {
      const newPole: Pole = {
        id: `pole-${Math.floor(100 + Math.random() * 900)}`,
        code: formData.code || 'P-000',
        name: formData.name || 'Novo Poste',
        address: formData.address || 'Rua sem Nome',
        neighborhood: formData.neighborhood || 'Centro',
        city: formData.city || 'São Paulo',
        state: formData.state || 'SP',
        lat: formData.lat || -23.5505,
        lng: formData.lng || -46.6333,
        powerWattage: formData.powerWattage || 150,
        fixtureType: formData.fixtureType || 'LED',
        status: formData.status || 'auto',
        dimmingLevel: formData.dimmingLevel || 100,
        isAuto: formData.isAuto ?? true,
        nodeId: null,
        gatewayId: null,
        installDate: formData.installDate || new Date().toISOString().split('T')[0],
        notes: formData.notes || '',
        currentVoltage: 220,
        currentAmperes: Number((((formData.powerWattage || 150) / 220) * 0.95).toFixed(2)),
        powerFactor: 0.98,
        kwhToday: 1.2,
        kwhMonth: 36.0,
        lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      onAddPole?.(newPole);
    }
    setIsModalOpen(false);
  };

  // Filtered Poles
  const filteredPoles = safePoles.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchNeighborhood = filterNeighborhood === 'all' || p.neighborhood === filterNeighborhood;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchSearch && matchNeighborhood && matchStatus;
  });

  const neighborhoods = Array.from(new Set(safePoles.map((p) => p.neighborhood)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Cadastro de Postes de Iluminação</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie as informações físicas, localização geográfica e especificações técnicas das luminárias.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Poste</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por código, nome da via ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Bairros</option>
            {neighborhoods.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active_100">100% Ativo</option>
            <option value="active_dimmed">Dimerizado</option>
            <option value="auto">Modo Auto</option>
            <option value="turned_off">Desligado</option>
            <option value="maintenance">Manutenção</option>
            <option value="comm_fault">Falha Comunicação</option>
          </select>
        </div>
      </div>

      {/* Poles Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código / Nome</th>
                <th className="py-3.5 px-4">Localização & Bairro</th>
                <th className="py-3.5 px-4">Luminária</th>
                <th className="py-3.5 px-4">Nódulo / Gateway</th>
                <th className="py-3.5 px-4">Status / Dimerização</th>
                <th className="py-3.5 px-4">Última Telemetria</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPoles.map((pole) => (
                <tr key={pole.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono rounded border border-blue-200 mr-2">
                      {pole.code}
                    </span>
                    {pole.name}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-medium">{pole.address}</div>
                    <div className="text-[11px] text-slate-500">{pole.neighborhood} - {pole.city}</div>
                  </td>

                  <td className="py-3.5 px-4 font-medium">
                    <span className="text-slate-900">{pole.fixtureType}</span>
                    <span className="text-[11px] font-mono text-amber-700 ml-1 font-bold">({pole.powerWattage}W)</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-cyan-700 font-bold">{pole.nodeId || 'Sem Nódulo'}</div>
                    <div className="text-slate-500">{pole.gatewayId || 'Sem Gateway'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center space-x-1 ${
                        pole.status === 'active_100'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : pole.status === 'active_dimmed'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : pole.status === 'auto'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pole.status === 'turned_off'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span>{pole.dimmingLevel}%</span>
                      {pole.isAuto && <span className="ml-1 text-[9px]">(AUTO)</span>}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {pole.lastCommunication || 'Recente'}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => onSelectPoleForMap?.(pole.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 transition border border-slate-200"
                      title="Ver no Mapa"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(pole)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                      title="Editar Poste"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePole?.(pole.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200"
                      title="Excluir Poste"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPoles.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum poste encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Pole Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                {editingPole ? `Editar Poste ${editingPole.code}` : 'Cadastrar Novo Poste'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código do Poste</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome / Identificação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista - Frente ao MASP"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista, 1500"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    required
                    value={formData.neighborhood || ''}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade / Estado</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      required
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 uppercase text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potência da Luminária (W)</label>
                  <input
                    type="number"
                    required
                    step={10}
                    value={formData.powerWattage || 150}
                    onChange={(e) => setFormData({ ...formData, powerWattage: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Luminária</label>
                  <select
                    value={formData.fixtureType || 'LED'}
                    onChange={(e) => setFormData({ ...formData, fixtureType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LED">LED Alta Eficiência</option>
                    <option value="Sólido Inteligente">Sólido Inteligente</option>
                    <option value="Vapor de Sódio">Vapor de Sódio</option>
                    <option value="Vapor Metálico">Vapor Metálico</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Instalação</label>
                  <input
                    type="date"
                    value={formData.installDate || ''}
                    onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Geo Location section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Coordenadas Geográficas (Latitude e Longitude)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.lat || 0}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.lng || 0}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
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
                  {editingPole ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
