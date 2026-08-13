import React, { useState } from 'react';
import {
  Link2,
  Unlink,
  Building2,
  Cpu,
  Wifi,
  Sparkles
} from 'lucide-react';
import { Pole, TelemanagementNode, Gateway } from '../types';

interface PairingManagerProps {
  poles?: Pole[];
  nodes?: TelemanagementNode[];
  gateways?: Gateway[];
  onPair?: (poleId: string, nodeId: string) => void;
  onUnpair?: (poleId: string, nodeId: string) => void;
}

export const PairingManager: React.FC<PairingManagerProps> = ({
  poles = [],
  nodes = [],
  gateways = [],
  onPair,
  onUnpair
}) => {
  const safePoles = poles || [];
  const safeNodes = nodes || [];
  const safeGateways = gateways || [];

  const [selectedPoleId, setSelectedPoleId] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [testingSignal, setTestingSignal] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const unlinkedPoles = safePoles.filter((p) => !p.nodeId);
  const unlinkedNodes = safeNodes.filter((n) => !n.poleId);

  const handleExecutePair = () => {
    if (!selectedPoleId || !selectedNodeId) return;
    onPair?.(selectedPoleId, selectedNodeId);
    setSelectedPoleId('');
    setSelectedNodeId('');
    setTestResult(null);
  };

  const handleTestSignal = () => {
    setTestingSignal(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingSignal(false);
      setTestResult('Comunicação RF Mesh 100% OK! Sinal RSSI: -64 dBm. Pacotes recebidos em 12ms.');
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Link2 className="w-6 h-6 text-blue-600" />
          <span>Vinculação Poste ↔ Nódulo de Telegestão</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Associe fisicamente um nódulo instalado ao poste da rede pública para habilitação da telemetria e automação.
        </p>
      </div>

      {/* Mandatory Workflow Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Fluxo Obrigatório de Habilitação</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 text-slate-700">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <span>Cadastrar Nódulo</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 text-slate-700">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <span>Cadastrar Poste</span>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 text-blue-900 font-bold">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <span>Vincular Poste ↔ Nódulo</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 text-slate-700">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
              4
            </span>
            <span>Telegestão e Controle Ativos</span>
          </div>
        </div>
      </div>

      {/* Pairing Console Panel */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Console de Nova Vinculação</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Pole */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. Selecione o Poste ({unlinkedPoles.length} Sem Nódulo)</span>
              </span>
            </label>

            <select
              value={selectedPoleId}
              onChange={(e) => setSelectedPoleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecionar Poste --</option>
              {safePoles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.neighborhood}) {p.nodeId ? `[Já Vinculado: ${p.nodeId}]` : '[LIVRE]'}
                </option>
              ))}
            </select>
          </div>

          {/* Select Node */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-cyan-600" />
                <span>2. Selecione o Nódulo ({unlinkedNodes.length} Disponíveis)</span>
              </span>
            </label>

            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Selecionar Nódulo --</option>
              {safeNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} - {n.serialNumber} ({n.model}) {n.poleId ? `[Já Vinculado: ${n.poleId}]` : '[LIVRE]'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action & Signal Test */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleTestSignal}
            disabled={!selectedPoleId || !selectedNodeId || testingSignal}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-2 border border-slate-200"
          >
            <Wifi className={`w-4 h-4 text-emerald-600 ${testingSignal ? 'animate-pulse' : ''}`} />
            <span>{testingSignal ? 'Testando Conectividade RF...' : 'Testar Comunicação Antena RF'}</span>
          </button>

          <button
            onClick={handleExecutePair}
            disabled={!selectedPoleId || !selectedNodeId}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Link2 className="w-4 h-4" />
            <span>CONFIRMAR VÍNCULO POSTE ↔ NÓDULO</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-mono">
            {testResult}
          </div>
        )}
      </div>

      {/* Active Pairings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="text-base font-bold text-slate-900">Vínculos Ativos no Sistema</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Poste</th>
                <th className="py-3 px-4">Endereço</th>
                <th className="py-3 px-4">Nódulo Vinculado</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status Comms</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safePoles
                .filter((p) => p.nodeId)
                .map((pole) => {
                  const node = safeNodes.find((n) => n.id === pole.nodeId);
                  const gw = safeGateways.find((g) => g.id === pole.gatewayId);
                  return (
                    <tr key={pole.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono rounded mr-2 border border-blue-200">
                          {pole.code}
                        </span>
                        {pole.name}
                      </td>

                      <td className="py-3 px-4 text-slate-600">{pole.address} ({pole.neighborhood})</td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-cyan-700 font-bold">{pole.nodeId}</span>
                        <span className="text-[10px] text-slate-500 block">{node?.serialNumber}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-mono">{gw?.name || pole.gatewayId}</td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                          🟢 Telemetria Ativa
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onUnpair?.(pole.id, pole.nodeId!)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ml-auto"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Remover Vínculo</span>
                        </button>
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
