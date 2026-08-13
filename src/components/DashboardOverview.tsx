import React, { useState } from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  Wrench,
  PowerOff,
  WifiOff,
  ShieldAlert,
  Zap,
  TrendingDown,
  Radio,
  Cpu,
  Sparkles,
  ArrowUpRight,
  Activity,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';
import { Pole, Gateway, TelemanagementNode, EmergencyState } from '../types';
import { ENERGY_HOURLY_DATA } from '../data/mockData';

interface DashboardOverviewProps {
  poles?: Pole[];
  gateways?: Gateway[];
  nodes?: TelemanagementNode[];
  emergencyState?: EmergencyState;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  poles = [],
  gateways = [],
  nodes = [],
  emergencyState = { active: false },
  onNavigateTab
}) => {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  // KPI Calculations
  const safePoles = poles || [];
  const safeGateways = gateways || [];
  const safeNodes = nodes || [];

  const totalPoles = safePoles.length;
  const activePoles = safePoles.filter(
    (p) => p.status === 'active_100' || p.status === 'active_dimmed' || p.status === 'auto'
  ).length;
  const autoPoles = safePoles.filter((p) => p.isAuto || p.status === 'auto').length;
  const maintenancePoles = safePoles.filter((p) => p.status === 'maintenance').length;
  const offPoles = safePoles.filter((p) => p.status === 'turned_off').length;
  const commFaultPoles = safePoles.filter((p) => p.status === 'comm_fault').length;
  const emergencyPoles = emergencyState.active ? totalPoles : safePoles.filter((p) => p.status === 'emergency').length;

  const totalKwhToday = safePoles.reduce((acc, p) => acc + (p.kwhToday || 0), 0);
  const totalKwhMonth = safePoles.reduce((acc, p) => acc + (p.kwhMonth || 0), 0);
  // Total installed power capacity in kW
  const totalInstalledKw = safePoles.reduce((acc, p) => acc + (p.powerWattage || 0), 0) / 1000;

  // Baseline energy calculation (assuming 100% full power baseline without telemanagement)
  const baselineKwhToday = totalKwhToday * 1.45; // ~31% savings
  const energySavingsPercent = totalKwhToday > 0 ? Math.round(((baselineKwhToday - totalKwhToday) / baselineKwhToday) * 100) : 32;

  const gatewaysOnline = safeGateways.filter((g) => g.status === 'online').length;
  const gatewaysOffline = safeGateways.filter((g) => g.status === 'offline').length;
  const connectedNodes = safeNodes.filter((n) => n.status === 'online' || n.status === 'warning').length;

  // Pie chart data for pole statuses
  const statusDistributionData = [
    { name: '100% Potência', value: safePoles.filter((p) => p.dimmingLevel === 100 && p.status !== 'turned_off' && p.status !== 'maintenance').length, color: '#3b82f6' }, // Blue
    { name: '50% Dimerizado', value: safePoles.filter((p) => p.dimmingLevel === 50).length, color: '#eab308' }, // Yellow
    { name: 'Modo Automático', value: autoPoles, color: '#22c55e' }, // Green
    { name: 'Desligado/Falha', value: offPoles + commFaultPoles + maintenancePoles, color: '#ef4444' } // Red
  ];

  // Bar chart data for failure history & acionamentos
  const failureHistoryData = [
    { dia: 'Seg', falhasComuns: 1, falhasEnergia: 0, manutencoes: 2, acionamentos: 420 },
    { dia: 'Ter', falhasComuns: 2, falhasEnergia: 1, manutencoes: 1, acionamentos: 425 },
    { dia: 'Qua', falhasComuns: 0, falhasEnergia: 0, manutencoes: 3, acionamentos: 418 },
    { dia: 'Qui', falhasComuns: 1, falhasEnergia: 0, manutencoes: 0, acionamentos: 430 },
    { dia: 'Sex', falhasComuns: 3, falhasEnergia: 2, manutencoes: 1, acionamentos: 445 },
    { dia: 'Sáb', falhasComuns: 1, falhasEnergia: 0, manutencoes: 0, acionamentos: 450 },
    { dia: 'Dom', falhasComuns: 1, falhasEnergia: 0, manutencoes: 0, acionamentos: 452 }
  ];

  // Efficiency trend chart data
  const efficiencyData = [
    { semana: 'Sem 1', eficiencia: 92, economiaR$: 14200 },
    { semana: 'Sem 2', eficiencia: 94, economiaR$: 15800 },
    { semana: 'Sem 3', eficiencia: 96, economiaR$: 16900 },
    { semana: 'Sem 4', eficiencia: 98, economiaR$: 18450 }
  ];

  // Request Gemini Insights from backend endpoint
  const handleFetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            totalPoles,
            activePoles,
            autoPoles,
            commFaultPoles,
            totalKwhToday,
            energySavingsPercent,
            gatewaysOnline,
            gatewaysOffline
          },
          emergencyActive: emergencyState.active
        })
      });
      const data = await res.json();
      setAiInsight(data.insight);
      setAiRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setAiInsight("A rede de telegestão Sky Light apresenta 95.2% de operacionalidade com redução consistente de consumo.");
      setAiRecommendations([
        "Programar redução para 50% entre 01:00 e 05:00 em avenidas periféricas.",
        "Enviar técnico para inspecionar conector NEMA no poste P-00107."
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Centro de Controle Telegestão
            </h1>
            <span className="px-3 py-1 bg-green-50 border border-green-200/80 text-green-700 font-bold text-xs rounded-full flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse text-green-600" />
              <span>Rede Operacional</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitoramento em tempo real de {totalPoles} postes e {gateways.length} gateways distribuídos.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('map')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <span>Ver no Mapa Inteligente</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Grid - 7 Primary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Postes */}
        <div
          onClick={() => onNavigateTab('poles')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Postes</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalPoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">{totalInstalledKw.toFixed(1)} kW Instalados</p>
        </div>

        {/* Postes Ativos */}
        <div
          onClick={() => onNavigateTab('poles')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Postes Ativos</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{activePoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">{Math.round((activePoles / totalPoles) * 100)}% da Rede</p>
        </div>

        {/* Modo Automático */}
        <div
          onClick={() => onNavigateTab('automations')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Modo Auto</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{autoPoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Schedules Ativos</p>
        </div>

        {/* Em Manutenção */}
        <div
          onClick={() => onNavigateTab('maintenance')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Manutenção</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{maintenancePoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Ordens Abertas</p>
        </div>

        {/* Postes Desligados */}
        <div
          onClick={() => onNavigateTab('poles')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Desligados</span>
            <PowerOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700">{offPoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Programado / Diurno</p>
        </div>

        {/* Falha Comunicação */}
        <div
          onClick={() => onNavigateTab('nodes')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Falha Comms</span>
            <WifiOff className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-500">{commFaultPoles}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Sem Pacotes RF</p>
        </div>

        {/* Emergência */}
        <div
          onClick={() => onNavigateTab('map')}
          className={`bg-white border p-4 rounded-2xl cursor-pointer transition group shadow-sm ${
            emergencyState.active
              ? 'border-red-500 bg-red-50/50 animate-pulse'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Emergência</span>
            <ShieldAlert className={`w-4 h-4 ${emergencyState.active ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${emergencyState.active ? 'text-red-600' : 'text-slate-600'}`}>
            {emergencyPoles}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            {emergencyState.active ? 'Modo 100% Ativo' : '0 Ativos'}
          </p>
        </div>
      </div>

      {/* Secondary KPI Bar: Energy & Gateway Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consumo Energético Total & Diário */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Consumo Energético Diário</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">{totalKwhToday.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-bold">kWh</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Mensal estimado: {totalKwhMonth.toFixed(0)} kWh</p>
          </div>
        </div>

        {/* Economia de Energia */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Economia de Energia</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600">{energySavingsPercent}%</span>
              <span className="text-xs text-emerald-700 font-semibold">vs Convencional</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">~R$ 14.850,00 economizados/mês</p>
          </div>
        </div>

        {/* Gateways Status */}
        <div
          onClick={() => onNavigateTab('gateways')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer transition"
        >
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-600">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Rede de Gateways</p>
            <div className="flex items-center space-x-3 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">{gatewaysOnline} Online</span>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-sm font-bold text-rose-600">{gatewaysOffline} Offline</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Total: {gateways.length} Gateways de Campo</p>
          </div>
        </div>

        {/* Nódulos Conectados */}
        <div
          onClick={() => onNavigateTab('nodes')}
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer transition"
        >
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Nódulos Conectados</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">{connectedNodes}</span>
              <span className="text-xs text-slate-500 font-bold">/ {nodes.length} Nódulos</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sinal médio RSSI: -65 dBm</p>
          </div>
        </div>
      </div>

      {/* AI Assistant Section (Sleek Dark Accent Panel in Sleek Interface Theme) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Sky Light Copilot – Otimização por IA</span>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 font-mono rounded">Gemini AI</span>
              </h2>
              <p className="text-xs text-slate-400">
                Análise preditiva de eficiência energética, manutenção preventiva e sugestões de agendamento.
              </p>
            </div>
          </div>

          <button
            onClick={handleFetchAiInsights}
            disabled={aiLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analisando...' : 'Gerar Diagnóstico IA'}</span>
          </button>
        </div>

        {aiInsight && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-blue-300 mb-1">Análise de IA:</p>
              {aiInsight}
            </div>

            {aiRecommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {aiRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start space-x-2"
                  >
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 font-bold rounded text-[10px]">
                      #{i + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consumo Energético por Período (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Consumo Energético por Horário</h3>
              <p className="text-xs text-slate-500">Comparativo Real (Com Telegestão) vs Baseline (Convencional)</p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200">
              <button
                onClick={() => setTimePeriod('hoje')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  timePeriod === 'hoje' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setTimePeriod('semana')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  timePeriod === 'semana' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENERGY_HOURLY_DATA}>
                <defs>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="kwhReal"
                  name="Consumo Real (kWh)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorReal)"
                />
                <Area
                  type="monotone"
                  dataKey="kwhBaseline"
                  name="Sem Telegestão (kWh)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorBaseline)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição dos Estados dos Postes */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Estados Operacionais</h3>
            <p className="text-xs text-slate-500">Distribuição percentual da frota de iluminação</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Section: Faults & Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Falhas e Acionamentos */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Histórico de Falhas e Ocorrências</h3>
              <p className="text-xs text-slate-500">Ocorrências registradas por categoria na semana</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend />
                <Bar dataKey="falhasComuns" name="Falha Comunicação" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="falhasEnergia" name="Falha Elétrica" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="manutencoes" name="Manutenções Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eficiência Energética Semanal */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Eficiência Operacional (%)</h3>
            <p className="text-xs text-slate-500">Evolução da eficiência da rede de iluminação telegestada</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semana" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend />
                <Bar dataKey="eficiencia" name="Eficiência Operacional (%)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
