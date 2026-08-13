import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Sliders,
  Power,
  PowerOff,
  CheckCircle2,
  Wrench,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { Pole, Gateway } from '../types';

interface BatchControlProps {
  poles?: Pole[];
  gateways?: Gateway[];
  onBatchUpdatePoles?: (targetIds: string[], changes: Partial<Pole>) => void;
}

export const BatchControl: React.FC<BatchControlProps> = ({
  poles = [],
  gateways = [],
  onBatchUpdatePoles
}) => {
  const safePoles = poles || [];
  const safeGateways = gateways || [];

  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [filterFixtureType, setFilterFixtureType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [selectedPoleIds, setSelectedPoleIds] = useState<string[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  // Filter matched poles
  const matchedPoles = safePoles.filter((p) => {
    const matchN = filterNeighborhood === 'all' || p.neighborhood === filterNeighborhood;
    const matchG = filterGateway === 'all' || p.gatewayId === filterGateway;
    const matchF = filterFixtureType === 'all' || p.fixtureType === filterFixtureType;
    const matchS = filterStatus === 'all' || p.status === filterStatus;
    return matchN && matchG && matchF && matchS;
  });

  const handleToggleSinglePole = (id: string) => {
    if (selectedPoleIds.includes(id)) {
      setSelectedPoleIds(selectedPoleIds.filter((pId) => pId !== id));
    } else {
      setSelectedPoleIds([...selectedPoleIds, id]);
    }
  };

  const handleSelectAllMatched = () => {
    if (selectedPoleIds.length === matchedPoles.length) {
      setSelectedPoleIds([]);
    } else {
      setSelectedPoleIds(matchedPoles.map((p) => p.id));
    }
  };

  const executeGroupAction = (actionName: string, changes: Partial<Pole>) => {
    const targetIds = selectedPoleIds.length > 0 ? selectedPoleIds : matchedPoles.map((p) => p.id);
    if (targetIds.length === 0) return;

    setExecuting(true);
    setExecutionMessage(null);

    setTimeout(() => {
      onBatchUpdatePoles?.(targetIds, changes);
      setExecuting(false);
      setExecutionMessage(
        `Ação "${actionName}" executada com sucesso via MQTT Mesh em ${targetIds.length} postes simultaneamente!`
      );
    }, 1000);
  };

  const neighborhoods = Array.from(new Set(safePoles.map((p) => p.neighborhood)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-cyan-600" />
          <span>Controle em Massa (Batch Commands)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Execute ações simultâneas de comutação, dimerização e manutenção para grupos inteiros de postes por região ou gateway.
        </p>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-600" />
          <span>Filtros de Agrupamento para Ação em Massa</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Bairro / Região</label>
            <select
              value={filterNeighborhood}
              onChange={(e) => setFilterNeighborhood(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todos os Bairros ({neighborhoods.length})</option>
              {neighborhoods.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Gateway Concentrador</label>
            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todos os Gateways</option>
              {safeGateways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Tipo da Luminária</label>
            <select
              value={filterFixtureType}
              onChange={(e) => setFilterFixtureType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="LED">LED</option>
              <option value="Sólido Inteligente">Sólido Inteligente</option>
              <option value="Vapor de Sódio">Vapor de Sódio</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Status Operacional</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active_100">100% Ativo</option>
              <option value="active_dimmed">Dimerizado</option>
              <option value="auto">Modo Auto</option>
              <option value="turned_off">Desligado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Action Buttons Panel */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Comandos para o Grupo Selecionado</h3>
            <p className="text-xs text-slate-500">
              {selectedPoleIds.length > 0
                ? `${selectedPoleIds.length} postes marcados manualmente`
                : `${matchedPoles.length} postes correspondem aos filtros`}
            </p>
          </div>

          <button
            onClick={handleSelectAllMatched}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            {selectedPoleIds.length === matchedPoles.length ? (
              <CheckSquare className="w-4 h-4 text-cyan-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Selecionar Todos ({matchedPoles.length})</span>
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() =>
              executeGroupAction('Ligar Todos em 100%', {
                dimmingLevel: 100,
                status: 'active_100',
                isAuto: false
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <Power className="w-5 h-5 text-blue-600" />
            <span>Ligar Todos 100%</span>
          </button>

          <button
            onClick={() =>
              executeGroupAction('Dimerizar para 50%', {
                dimmingLevel: 50,
                status: 'active_dimmed',
                isAuto: false
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>Dimerizar 50%</span>
          </button>

          <button
            onClick={() =>
              executeGroupAction('Dimerizar para 75%', {
                dimmingLevel: 75,
                status: 'active_dimmed',
                isAuto: false
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <Sliders className="w-5 h-5 text-cyan-600" />
            <span>Dimerizar 75%</span>
          </button>

          <button
            onClick={() =>
              executeGroupAction('Aplicar Modo Automático', {
                isAuto: true,
                status: 'auto'
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Modo Automático</span>
          </button>

          <button
            onClick={() =>
              executeGroupAction('Desligar Todos', {
                dimmingLevel: 0,
                status: 'turned_off',
                isAuto: false
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <PowerOff className="w-5 h-5 text-rose-600" />
            <span>Desligar Todos</span>
          </button>

          <button
            onClick={() =>
              executeGroupAction('Manutenção Programada', {
                status: 'maintenance',
                dimmingLevel: 0
              })
            }
            disabled={executing || matchedPoles.length === 0}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition disabled:opacity-50"
          >
            <Wrench className="w-5 h-5 text-slate-700" />
            <span>Modo Manutenção</span>
          </button>
        </div>

        {executing && (
          <div className="p-4 bg-cyan-50 border border-cyan-300 rounded-xl text-xs text-cyan-800 flex items-center space-x-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-cyan-600 animate-spin" />
            <span>Enviando transmissão multicast MQTT para a rede de gateways...</span>
          </div>
        )}

        {executionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{executionMessage}</span>
          </div>
        )}
      </div>

      {/* Matched Poles Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Postes no Agrupamento Atual ({matchedPoles.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4">Código / Nome</th>
                <th className="py-3 px-4">Bairro</th>
                <th className="py-3 px-4">Potência (W)</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status / Dimerização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matchedPoles.map((p) => {
                const isChecked = selectedPoleIds.includes(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggleSinglePole(p.id)}>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono rounded mr-2 border border-blue-200">
                        {p.code}
                      </span>
                      {p.name}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{p.neighborhood}</td>

                    <td className="py-3 px-4 font-mono text-amber-700 font-bold">{p.powerWattage}W</td>

                    <td className="py-3 px-4 font-mono text-slate-500">{p.gatewayId || 'Sem GW'}</td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{p.dimmingLevel}%</span>
                      {p.isAuto && <span className="text-[10px] text-emerald-600 ml-2 font-bold">(Auto)</span>}
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
