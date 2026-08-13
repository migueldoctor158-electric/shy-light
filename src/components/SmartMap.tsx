import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Sliders,
  Power,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  Search,
  Filter,
  X,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Pole, TelemanagementNode, Gateway, EmergencyState } from '../types';

interface SmartMapProps {
  poles?: Pole[];
  nodes?: TelemanagementNode[];
  gateways?: Gateway[];
  emergencyState?: EmergencyState;
  onUpdatePole?: (updated: Pole) => void;
  selectedPoleIdFromParent?: string | null;
}

export const SmartMap: React.FC<SmartMapProps> = ({
  poles = [],
  nodes = [],
  gateways = [],
  emergencyState = { active: false },
  onUpdatePole,
  selectedPoleIdFromParent
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [poleId: string]: L.Marker }>({});

  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Determine marker color based on spec
  const getPoleColor = (pole: Pole): { hex: string; label: string; name: string } => {
    if (emergencyState.active || pole.status === 'emergency') {
      return { hex: '#ef4444', label: '🔴 Emergência Global', name: 'red' };
    }
    if (pole.status === 'turned_off' || pole.status === 'comm_fault' || pole.status === 'maintenance') {
      return { hex: '#ef4444', label: '🔴 Desligado / Falha', name: 'red' };
    }
    if (pole.isAuto || pole.status === 'auto') {
      return { hex: '#22c55e', label: '🟢 Modo Automático', name: 'green' };
    }
    if (pole.dimmingLevel === 50) {
      return { hex: '#eab308', label: '🟡 50% Potência', name: 'yellow' };
    }
    if (pole.dimmingLevel === 100) {
      return { hex: '#3b82f6', label: '🔵 100% Potência', name: 'blue' };
    }
    return { hex: '#eab308', label: '🟡 Dimerizado', name: 'yellow' };
  };

  // Helper to create custom HTML Icon for Leaflet
  const createCustomIcon = (pole: Pole) => {
    const color = getPoleColor(pole);
    const isEmergency = emergencyState.active || pole.status === 'emergency';

    const html = `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${color.hex};
          border: 2px solid #ffffff;
          box-shadow: 0 0 ${isEmergency ? '20px #ef4444' : '10px ' + color.hex};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: bold;
          font-size: 10px;
          animation: ${isEmergency ? 'pulse 1s infinite' : 'none'};
        ">
          💡
        </div>
        ${
          pole.isAuto
            ? `<div style="
                position: absolute;
                top: -3px;
                right: -3px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #22c55e;
                border: 1px solid #ffffff;
              "></div>`
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-pole-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: São Paulo Avenida Paulista
      const map = L.map(mapContainerRef.current, {
        center: [-23.5614, -46.6558],
        zoom: 14,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Mode Tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    const filtered = (poles || []).filter((pole) => {
      const matchNeighborhood =
        filterNeighborhood === 'all' || pole.neighborhood.toLowerCase() === filterNeighborhood.toLowerCase();
      const matchSearch =
        !searchQuery ||
        pole.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pole.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pole.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchNeighborhood && matchSearch;
    });

    filtered.forEach((pole) => {
      const icon = createCustomIcon(pole);
      const marker = L.marker([pole.lat, pole.lng], { icon }).addTo(map);

      marker.on('click', () => {
        setSelectedPole(pole);
      });

      markersRef.current[pole.id] = marker;
    });

    if (selectedPoleIdFromParent) {
      const parentSelected = (poles || []).find((p) => p.id === selectedPoleIdFromParent);
      if (parentSelected) {
        setSelectedPole(parentSelected);
        map.flyTo([parentSelected.lat, parentSelected.lng], 16);
      }
    }
  }, [poles, filterNeighborhood, filterStatus, searchQuery, emergencyState]);

  // Handle Dimming Change for Selected Pole
  const handleDimmingChange = (level: number) => {
    if (!selectedPole) return;

    let newStatus = selectedPole.status;
    if (level === 0) {
      newStatus = 'turned_off';
    } else if (level === 100) {
      newStatus = 'active_100';
    } else {
      newStatus = 'active_dimmed';
    }

    const updated: Pole = {
      ...selectedPole,
      dimmingLevel: level,
      isAuto: false,
      status: newStatus,
      currentAmperes: Number(((selectedPole.powerWattage / 220) * (level / 100)).toFixed(2)),
      kwhToday: Number((selectedPole.kwhToday + 0.1).toFixed(2)),
      lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setSelectedPole(updated);
    onUpdatePole(updated);
  };

  const handleToggleAuto = () => {
    if (!selectedPole) return;
    const updated: Pole = {
      ...selectedPole,
      isAuto: !selectedPole.isAuto,
      status: !selectedPole.isAuto ? 'auto' : 'active_100',
      lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setSelectedPole(updated);
    onUpdatePole(updated);
  };

  const handleRebootNode = () => {
    if (!selectedPole) return;
    alert(`Comando MQTT de reinicialização enviado para o Nódulo ${selectedPole.nodeId || 'N/A'}.`);
  };

  // Neighborhoods list for dropdown filter
  const neighborhoods = Array.from(new Set(poles.map((p) => p.neighborhood)));

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[600px] overflow-hidden bg-slate-950 flex flex-col">
      {/* Map Filter Controls Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        {/* Search & Neighborhood Filter */}
        <div className="flex items-center space-x-2 bg-slate-900/95 border border-slate-700/80 p-2 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, rua ou nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Bairros</option>
            {neighborhoods.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Color Legend Bar */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-900/95 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs text-slate-300 pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span>🔵 100% Potência</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
            <span>🟡 50% Potência</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>🟢 Modo Auto</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span>🔴 Desligado / Emergência</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Pole Control Flyout Drawer */}
      {selectedPole && (
        <div className="absolute top-4 right-4 bottom-4 z-30 w-full max-w-sm bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl p-5 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-300">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-mono font-bold text-xs rounded border border-blue-500/30">
                  {selectedPole.code}
                </span>
                <span className="text-xs font-semibold text-slate-400">{selectedPole.neighborhood}</span>
              </div>
              <h3 className="font-bold text-base text-white mt-1">{selectedPole.name}</h3>
              <p className="text-xs text-slate-400">{selectedPole.address}</p>
            </div>
            <button
              onClick={() => setSelectedPole(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Power Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Controle de Intensidade</span>
              </span>
              <span className="font-bold text-blue-400">{selectedPole.dimmingLevel}%</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[0, 25, 50, 75, 100].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleDimmingChange(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    selectedPole.dimmingLevel === lvl
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={selectedPole.dimmingLevel}
              onChange={(e) => handleDimmingChange(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Automatic Mode & Reboot Switches */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleToggleAuto}
              className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition border ${
                selectedPole.isAuto
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedPole.isAuto ? 'Modo Auto Ativo' : 'Ativar Modo Auto'}</span>
            </button>

            <button
              onClick={handleRebootNode}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex flex-col items-center justify-center space-y-1 transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reiniciar Nódulo</span>
            </button>
          </div>

          {/* Real-time Telemetry Gauges */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Telemetria Elétrica Instantânea</span>
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tensão Elétrica</span>
                <span className="text-sm font-extrabold text-white">{selectedPole.currentVoltage} V</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Corrente</span>
                <span className="text-sm font-extrabold text-cyan-400">{selectedPole.currentAmperes} A</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Fator de Potência</span>
                <span className="text-sm font-extrabold text-emerald-400">{selectedPole.powerFactor}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Consumo Hoje</span>
                <span className="text-sm font-extrabold text-yellow-400">{selectedPole.kwhToday} kWh</span>
              </div>
            </div>
          </div>

          {/* Linked Node & Gateway Details */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <p className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Dispositivos Vinculados</span>
            </p>
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>Nódulo de Telegestão:</span>
              <strong className="text-white font-mono">{selectedPole.nodeId || 'Sem Nódulo'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Gateway Vinculado:</span>
              <strong className="text-white font-mono">{selectedPole.gatewayId || 'Sem Gateway'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Tipo da Luminária:</span>
              <strong className="text-white">{selectedPole.fixtureType} ({selectedPole.powerWattage}W)</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Última Comunicação:</span>
              <strong className="text-cyan-400 text-[10px]">{selectedPole.lastCommunication}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
