import React, { useState } from 'react';
import {
  Sliders,
  PowerOff,
  RotateCcw,
  Zap,
  Search,
  CheckCircle2,
  Cpu,
  History
} from 'lucide-react';
import { Pole, TelemanagementNode, Gateway } from '../types';

interface IndividualControlProps {
  poles?: Pole[];
  nodes?: TelemanagementNode[];
  gateways?: Gateway[];
  onUpdatePole?: (updated: Pole) => void;
  onSelectPoleForMap?: (poleId: string) => void;
}

export const IndividualControl: React.FC<IndividualControlProps> = ({
  poles = [],
  nodes = [],
  gateways = [],
  onUpdatePole,
  onSelectPoleForMap
}) => {
  const safePoles = poles || [];
  const safeNodes = nodes || [];
  const safeGateways = gateways || [];

  const [selectedPoleId, setSelectedPoleId] = useState<string>(safePoles[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedPole = safePoles.find((p) => p.id === selectedPoleId) || safePoles[0];
  const linkedNode = safeNodes.find((n) => n.id === selectedPole?.nodeId);
  const linkedGateway = safeGateways.find((g) => g.id === selectedPole?.gatewayId);

  const handleSetDimming = (level: number) => {
    if (!selectedPole) return;
    let newStatus = selectedPole.status;
    if (level === 0) newStatus = 'turned_off';
    else if (level === 100) newStatus = 'active_100';
    else newStatus = 'active_dimmed';

    const updated: Pole = {
      ...selectedPole,
      dimmingLevel: level,
      isAuto: false,
      status: newStatus,
      currentAmperes: Number(((selectedPole.powerWattage / 220) * (level / 100)).toFixed(2)),
      kwhToday: Number((selectedPole.kwhToday + 0.1).toFixed(2)),
      lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    onUpdatePole?.(updated);
  };

  const handleToggleAuto = () => {
    if (!selectedPole) return;
    const updated: Pole = {
      ...selectedPole,
      isAuto: !selectedPole.isAuto,
      status: !selectedPole.isAuto ? 'auto' : 'active_100',
      lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    onUpdatePole?.(updated);
  };

  const handleRebootDevice = () => {
    if (!selectedPole) return;
    alert(`Comando MQTT de reinicialização enviado para o dispositivo ${selectedPole.nodeId || 'N/A'}.`);
  };

  const filteredPoles = safePoles.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          <span>Controle Individual de Poste</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ajuste fino de potência, modos operacionais, comandos em tempo real e telemetria elétrica por luminária.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pole Selector List */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filtrar poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {filteredPoles.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPoleId(p.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  p.id === selectedPole?.id
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-blue-600 font-bold">{p.code}</span>
                    <span>{p.neighborhood}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{p.name}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'active_100'
                      ? 'bg-blue-100 text-blue-700'
                      : p.status === 'active_dimmed'
                      ? 'bg-amber-100 text-amber-700'
                      : p.status === 'auto'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {p.dimmingLevel}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2 Cols wide): Active Controls & Telemetry */}
        {selectedPole && (
          <div className="lg:col-span-2 space-y-6">
            {/* Top Pole Overview Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200/60">
                      {selectedPole.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{selectedPole.neighborhood} - {selectedPole.city}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedPole.name}</h2>
                  <p className="text-xs text-slate-500">{selectedPole.address}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectPoleForMap?.(selectedPole.id)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    Ver no Mapa
                  </button>
                </div>
              </div>

              {/* Primary Controls Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ajuste de Intensidade Luminosa
                  </span>
                  <span className="text-lg font-black text-blue-600">{selectedPole.dimmingLevel}% Potência</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[0, 25, 50, 75, 100].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleSetDimming(lvl)}
                      className={`py-3 text-xs font-bold rounded-xl transition border ${
                        selectedPole.dimmingLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}%
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={selectedPole.dimmingLevel}
                  onChange={(e) => handleSetDimming(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-100 rounded-lg cursor-pointer h-2.5 border border-slate-200"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleToggleAuto}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition border ${
                      selectedPole.isAuto
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedPole.isAuto ? 'Modo Auto Ativo' : 'Ativar Modo Automático'}</span>
                  </button>

                  <button
                    onClick={() => handleSetDimming(0)}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>Desligar (0%)</span>
                  </button>

                  <button
                    onClick={handleRebootDevice}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-cyan-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reiniciar Dispositivo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry & Device Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telemetry */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Telemetria Elétrica em Tempo Real</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Tensão (Volts)</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedPole.currentVoltage} V</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Corrente (Amperes)</span>
                    <span className="text-base font-extrabold text-cyan-700">{selectedPole.currentAmperes} A</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Fator de Potência</span>
                    <span className="text-base font-extrabold text-emerald-700">{selectedPole.powerFactor}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Consumo Diário</span>
                    <span className="text-base font-extrabold text-amber-700">{selectedPole.kwhToday} kWh</span>
                  </div>
                </div>
              </div>

              {/* Devices Linked */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-600" />
                  <span>Hardware & Rede Mesh</span>
                </h3>

                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span>Nódulo NEMA:</span>
                    <strong className="text-cyan-700 font-mono">{selectedPole.nodeId || 'Sem Vínculo'}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span>Gateway Associado:</span>
                    <strong className="text-blue-700 font-mono">{linkedGateway?.name || selectedPole.gatewayId}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span>Modelo Luminária:</span>
                    <strong className="text-slate-900">{selectedPole.fixtureType} {selectedPole.powerWattage}W</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* History Logs for this Pole */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Histórico Completo do Poste {selectedPole.code}</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
                  <span>Ajuste de Dimerização para {selectedPole.dimmingLevel}%</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedPole.lastCommunication}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
                  <span>Sincronização de Telemetria Elétrica OK</span>
                  <span className="text-[10px] font-mono text-slate-500">Há 15 minutos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
