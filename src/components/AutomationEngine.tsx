import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  X,
  Moon,
  Star,
  Eye,
  Calendar,
  ZapOff,
  SlidersHorizontal,
  PauseCircle,
  PlayCircle,
  Edit3,
  Search,
  Check,
  Zap,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { AutomationRule, Pole } from '../types';

interface AutomationEngineProps {
  rules?: AutomationRule[];
  poles?: Pole[];
  onAddRule?: (rule: AutomationRule) => void;
  onUpdateRule?: (rule: AutomationRule) => void;
  onToggleRule?: (ruleId: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onExecuteRule?: (rule: AutomationRule) => void;
}

export const AutomationEngine: React.FC<AutomationEngineProps> = ({
  rules = [],
  poles = [],
  onAddRule,
  onUpdateRule,
  onToggleRule,
  onDeleteRule,
  onExecuteRule
}) => {
  const safeRules = rules || [];
  const safePoles = poles || [];

  // Local States
  const [simulationTime, setSimulationTime] = useState<string>('21:30');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'paused' | 'stargazing'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingRule, setDeletingRule] = useState<AutomationRule | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    targetAction: 'turn_off',
    targetTime: '21:00',
    endTime: '23:30',
    recurrence: 'monthly',
    monthlyDay: 15,
    eventDate: new Date().toISOString().split('T')[0],
    isStargazingModel: true,
    enabled: true,
    targetFilter: {
      neighborhood: 'all'
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Open modal for NEW rule
  const handleOpenAddModal = () => {
    setEditingRuleId(null);
    setFormData({
      name: '',
      targetAction: 'power_100',
      targetTime: '18:00',
      endTime: '23:00',
      recurrence: 'daily',
      monthlyDay: 15,
      eventDate: new Date().toISOString().split('T')[0],
      isStargazingModel: false,
      enabled: true,
      targetFilter: {
        neighborhood: 'all'
      }
    });
    setIsModalOpen(true);
  };

  // Open modal pre-loaded with Céu Estrelado preset
  const handleOpenStargazingPreset = () => {
    setEditingRuleId(null);
    setFormData({
      name: '✨ Modelo Céu Estrelado - Observação Astronômica Mensal',
      targetAction: 'turn_off',
      targetTime: '21:00',
      endTime: '23:30',
      recurrence: 'monthly',
      monthlyDay: 15,
      isStargazingModel: true,
      enabled: true,
      targetFilter: {
        neighborhood: 'all'
      }
    });
    setIsModalOpen(true);
  };

  // Open modal for EDITING an existing rule
  const handleOpenEditModal = (rule: AutomationRule) => {
    setEditingRuleId(rule.id);
    setFormData({
      name: rule.name,
      targetAction: rule.targetAction,
      targetTime: rule.targetTime,
      endTime: rule.endTime || '23:30',
      recurrence: rule.recurrence,
      monthlyDay: rule.monthlyDay || 15,
      eventDate: rule.eventDate || new Date().toISOString().split('T')[0],
      isStargazingModel: rule.isStargazingModel ?? (rule.recurrence === 'monthly'),
      enabled: rule.enabled,
      targetFilter: rule.targetFilter || { neighborhood: 'all' }
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update) Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetTime) return;

    const isStargazing =
      formData.isStargazingModel ||
      formData.name.toLowerCase().includes('estrelado') ||
      formData.recurrence === 'monthly';

    if (editingRuleId) {
      // Editing existing rule
      const updatedRule: AutomationRule = {
        id: editingRuleId,
        name: formData.name,
        targetAction: formData.targetAction as any,
        targetTime: formData.targetTime,
        endTime: formData.endTime || undefined,
        recurrence: formData.recurrence as any,
        monthlyDay: formData.recurrence === 'monthly' ? Number(formData.monthlyDay || 15) : undefined,
        eventDate: formData.recurrence === 'specific_dates' ? formData.eventDate : undefined,
        isStargazingModel: isStargazing,
        targetFilter: formData.targetFilter || {},
        enabled: formData.enabled ?? true,
        lastExecuted:
          formData.recurrence === 'monthly'
            ? `Recorrente Mensal (Dia ${formData.monthlyDay || 15})`
            : formData.recurrence === 'specific_dates'
            ? `Agendado (${formData.eventDate})`
            : 'Atualizada recentemente'
      };

      onUpdateRule?.(updatedRule);
      showToast(`Regra "${updatedRule.name}" atualizada com sucesso!`);
    } else {
      // Creating new rule
      const newRule: AutomationRule = {
        id: `AUTO-${Math.floor(10 + Math.random() * 90)}`,
        name: formData.name,
        targetAction: formData.targetAction as any,
        targetTime: formData.targetTime,
        endTime: formData.endTime || undefined,
        recurrence: formData.recurrence as any,
        monthlyDay: formData.recurrence === 'monthly' ? Number(formData.monthlyDay || 15) : undefined,
        eventDate: formData.recurrence === 'specific_dates' ? formData.eventDate : undefined,
        isStargazingModel: isStargazing,
        targetFilter: formData.targetFilter || {},
        enabled: formData.enabled ?? true,
        lastExecuted:
          formData.recurrence === 'monthly'
            ? `Recorrente Mensal (Dia ${formData.monthlyDay || 15})`
            : formData.recurrence === 'specific_dates'
            ? `Agendado (${formData.eventDate})`
            : 'Cadastrada'
      };

      onAddRule?.(newRule);
      showToast(`Nova regra de automação "${newRule.name}" criada com sucesso!`);
    }

    setIsModalOpen(false);
  };

  // Toggle Pause/Resume Rule
  const handleTogglePause = (rule: AutomationRule) => {
    onToggleRule?.(rule.id);
    const newState = !rule.enabled;
    showToast(
      newState
        ? `Automação "${rule.name}" REATIVADA e em execução no sistema.`
        : `Automação "${rule.name}" PAUSADA temporariamente.`
    );
  };

  // Execute Rule Instantly
  const handleExecuteNow = (rule: AutomationRule) => {
    onExecuteRule?.(rule);
    const affectedCount = getAffectedPolesCount(rule);
    showToast(`⚡ Regra "${rule.name}" executada imediatamente! ${affectedCount} postes da rede atualizados.`);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingRule) return;
    onDeleteRule?.(deletingRule.id);
    showToast(`Automação "${deletingRule.name}" excluída.`);
    setDeletingRule(null);
  };

  // Calculate poles affected by a rule
  const getAffectedPolesCount = (rule: AutomationRule) => {
    const neighborhood = rule.targetFilter?.neighborhood;
    if (!neighborhood || neighborhood === 'all') {
      return safePoles.length || 50;
    }
    const count = safePoles.filter((p) => p.neighborhood === neighborhood).length;
    return count || 12;
  };

  // Get unique neighborhoods list from poles
  const neighborhoodsList = Array.from(new Set(safePoles.map((p) => p.neighborhood))).filter(Boolean);

  // Time conversion for simulation
  const timeToMinutes = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const simMinutes = timeToMinutes(simulationTime);

  // Active simulated rule at current simulation time
  const activeSimRule = safeRules.find((r) => {
    if (!r.enabled) return false;
    const startM = timeToMinutes(r.targetTime);

    if (r.endTime) {
      const endM = timeToMinutes(r.endTime);
      if (endM > startM) {
        return simMinutes >= startM && simMinutes <= endM;
      } else {
        return simMinutes >= startM || simMinutes <= endM;
      }
    } else {
      return Math.abs(startM - simMinutes) < 30;
    }
  });

  // Filter Rules for Display
  const filteredRules = safeRules.filter((rule) => {
    // Search query
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.targetFilter?.neighborhood &&
        rule.targetFilter.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Neighborhood filter
    if (selectedNeighborhood !== 'all') {
      const ruleBairro = rule.targetFilter?.neighborhood || 'all';
      if (ruleBairro !== 'all' && ruleBairro !== selectedNeighborhood) {
        return false;
      }
    }

    // Tab filter
    if (selectedTab === 'active') return rule.enabled;
    if (selectedTab === 'paused') return !rule.enabled;
    if (selectedTab === 'stargazing') return rule.isStargazingModel || rule.recurrence === 'monthly';

    return true;
  });

  // Stats Counters
  const totalRules = safeRules.length;
  const activeCount = safeRules.filter((r) => r.enabled).length;
  const pausedCount = safeRules.filter((r) => !r.enabled).length;
  const stargazingCount = safeRules.filter((r) => r.isStargazingModel || r.recurrence === 'monthly').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center space-x-3 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <CalendarClock className="w-7 h-7 text-emerald-600" />
            <span>Engenho de Automações e Agendamento Urbano</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão completa de regras de acionamento, dimerização programada e modelo recorrente de observação astronômica 'Céu Estrelado'.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenStargazingPreset}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 hover:from-indigo-900 hover:to-slate-800 text-amber-300 border border-indigo-700/60 rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ Criar Modelo Céu Estrelado</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Automação</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
            <CalendarClock className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total de Automações
            </span>
            <span className="text-2xl font-black text-slate-900">{totalRules}</span>
            <span className="block text-[10px] text-slate-500 font-medium">Cadastradas no sistema</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Automações Ativas
            </span>
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
            <span className="block text-[10px] text-emerald-700 font-medium">
              {totalRules > 0 ? Math.round((activeCount / totalRules) * 100) : 0}% ativas na rede
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <PauseCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Automações Pausadas
            </span>
            <span className="text-2xl font-black text-amber-600">{pausedCount}</span>
            <span className="block text-[10px] text-amber-700 font-medium">Prontas para retomar</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-950 to-indigo-950 border border-indigo-800/80 p-4 rounded-2xl shadow-sm flex items-center space-x-3 text-white">
          <div className="p-3 bg-indigo-500/20 text-amber-300 rounded-xl border border-indigo-500/40">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              Modelos Céu Estrelado
            </span>
            <span className="text-2xl font-black text-amber-300">{stargazingCount}</span>
            <span className="block text-[10px] text-indigo-200 font-medium">Recorrência Mensal</span>
          </div>
        </div>
      </div>

      {/* Featured Banner: Modelo 'Céu Estrelado' (Observação Astronômica Recorrente) */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-800/60 p-6 rounded-2xl shadow-lg text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-amber-300 flex-shrink-0">
              <Moon className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-amber-400/30">
                  Modelo Especial de Regra
                </span>
                <span className="flex items-center space-x-1 text-indigo-300 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>'Céu Estrelado' (Observação Astronômica)</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Regra Recorrente para Apagão Programado e Astroturismo</h2>
              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-3xl">
                Esta automação permite programar um evento recorrente (ex: 1x por mês no dia 15 ou na fase de Lua Nova) para desligar 100% dos postes durante um período pré-definido (ex: das 21:00 às 23:30). Ao suspender temporariamente a iluminação pública, elimina-se a poluição luminosa urbana para viabilizar observação de constelações, astrofotografia e eventos comunitários.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 self-start md:self-center">
            <button
              onClick={handleOpenStargazingPreset}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4 text-slate-950" />
              <span>Configurar Modelo 'Céu Estrelado'</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator 24h Interactive Timeline Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/60">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Simulador de Linha do Tempo e Acionamento (24h)</h3>
              <p className="text-xs text-slate-500">
                Arraste o ponteiro temporal para verificar como as automações e regras ativas controlam a iluminação pública da cidade.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-xl font-mono text-lg font-black text-emerald-400 shadow-inner">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{simulationTime}</span>
          </div>
        </div>

        {/* Time Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min={0}
            max={1439}
            step={15}
            value={simMinutes}
            onChange={(e) => {
              const totalM = Number(e.target.value);
              const hrs = Math.floor(totalM / 60)
                .toString()
                .padStart(2, '0');
              const mins = (totalM % 60).toString().padStart(2, '0');
              setSimulationTime(`${hrs}:${mins}`);
            }}
            className="w-full accent-emerald-600 bg-slate-100 rounded-lg cursor-pointer h-3 border border-slate-200"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>00:00 (Meia-noite)</span>
            <span>05:30 (Alvorada)</span>
            <span>12:00 (Meio-dia)</span>
            <span>18:00 (Crepúsculo)</span>
            <span className="text-indigo-600 font-bold">21:00 (Céu Estrelado)</span>
            <span>23:59</span>
          </div>
        </div>

        {/* Simulation Preview Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          {activeSimRule ? (
            activeSimRule.isStargazingModel || activeSimRule.targetAction === 'turn_off' ? (
              <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-xl border border-indigo-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-300 flex items-center space-x-2">
                      <span>✨ Modelo 'Céu Estrelado' Ativo em {simulationTime}!</span>
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] rounded border border-amber-400/30">
                        Apagão 100%
                      </span>
                    </p>
                    <p className="text-[11px] text-indigo-200">
                      Regra: <strong>"{activeSimRule.name}"</strong> (Janela das{' '}
                      <span className="font-mono">{activeSimRule.targetTime}</span> às{' '}
                      <span className="font-mono">{activeSimRule.endTime || '23:30'}</span>). Todos os postes estão 100% desligados para observação astronômica.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteNow(activeSimRule)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] rounded-lg shadow transition flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Executar Agora na Rede</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-900">
                <div className="flex items-center space-x-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    Simulação para <strong>{simulationTime}</strong>: A regra "
                    <strong>{activeSimRule.name}</strong>" está em vigor! Ação:{' '}
                    <span className="font-mono text-slate-900 font-bold">
                      {activeSimRule.targetAction === 'power_100'
                        ? 'Potência Total 100%'
                        : activeSimRule.targetAction === 'power_75'
                        ? 'Dimerização 75%'
                        : activeSimRule.targetAction === 'power_50'
                        ? 'Dimerização 50% (Eco Mode)'
                        : activeSimRule.targetAction}
                    </span>
                  </span>
                </div>

                <button
                  onClick={() => handleExecuteNow(activeSimRule)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition flex items-center space-x-1 flex-shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Executar Regra Agora</span>
                </button>
              </div>
            )
          ) : (
            <div className="text-slate-500 italic">
              Nenhuma automação direta disparando exatamente em <strong>{simulationTime}</strong>. A iluminação mantém o estado padrão da rede.
            </div>
          )}
        </div>
      </div>

      {/* Main Automations Table / Management Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {/* Search, Filter Tabs and Neighborhood Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                selectedTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({totalRules})
            </button>
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                selectedTab === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ativas ({activeCount})
            </button>
            <button
              onClick={() => setSelectedTab('paused')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                selectedTab === 'paused' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pausadas ({pausedCount})
            </button>
            <button
              onClick={() => setSelectedTab('stargazing')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1 ${
                selectedTab === 'stargazing'
                  ? 'bg-slate-950 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Céu Estrelado ({stargazingCount})</span>
            </button>
          </div>

          {/* Search & Neighborhood Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar automação por nome ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Bairros</option>
              {neighborhoodsList.map((nh) => (
                <option key={nh} value={nh}>
                  Bairro: {nh}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código / Nome da Automação</th>
                <th className="py-3.5 px-4">Ação na Iluminação</th>
                <th className="py-3.5 px-4">Janela / Período</th>
                <th className="py-3.5 px-4">Recorrência</th>
                <th className="py-3.5 px-4">Postes Afetados</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Execução / Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => {
                const isStargazing = rule.isStargazingModel || rule.recurrence === 'monthly';
                const affectedPoles = getAffectedPolesCount(rule);
                const targetBairro = rule.targetFilter?.neighborhood || 'all';

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Code */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[11px] rounded border border-emerald-200">
                            {rule.id}
                          </span>
                          <span className="text-slate-900 font-bold">{rule.name}</span>
                          {isStargazing && (
                            <span className="px-2 py-0.5 bg-indigo-950 text-amber-300 font-extrabold text-[9px] rounded-full border border-indigo-700 inline-flex items-center space-x-1">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              <span>CÉU ESTRELADO</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Última execução: {rule.lastExecuted || 'Pendente'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 font-semibold">
                      {rule.targetAction === 'power_100' && (
                        <span className="text-blue-700 font-bold inline-flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          <span>🔵 Ligar 100% Potência</span>
                        </span>
                      )}
                      {rule.targetAction === 'power_50' && (
                        <span className="text-amber-700 font-bold inline-flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>🟡 Dimerizar 50% (Eco)</span>
                        </span>
                      )}
                      {rule.targetAction === 'power_75' && (
                        <span className="text-amber-700 font-bold inline-flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>🟡 Dimerizar 75%</span>
                        </span>
                      )}
                      {rule.targetAction === 'turn_off' && (
                        <span className="text-rose-700 font-bold inline-flex items-center space-x-1">
                          <ZapOff className="w-3.5 h-3.5 text-rose-600" />
                          <span>Desligar 100% (Apagão)</span>
                        </span>
                      )}
                    </td>

                    {/* Window */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rule.endTime ? (
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                          {rule.targetTime} → {rule.endTime}
                        </span>
                      ) : (
                        <span>{rule.targetTime}</span>
                      )}
                    </td>

                    {/* Recurrence */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {rule.recurrence === 'monthly' && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 inline-flex items-center space-x-1">
                          <Moon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Mensal (Dia {rule.monthlyDay || 15})</span>
                        </span>
                      )}
                      {rule.recurrence === 'daily' && 'Diariamente'}
                      {rule.recurrence === 'weekdays' && 'Dias Úteis (Seg-Sex)'}
                      {rule.recurrence === 'weekends' && 'Finais de Semana'}
                      {rule.recurrence === 'holidays' && 'Feriados Nacionais'}
                      {rule.recurrence === 'specific_dates' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded border border-slate-200 flex items-center space-x-1 w-max">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{rule.eventDate || 'Data Específica'}</span>
                        </span>
                      )}
                    </td>

                    {/* Affected Poles */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {targetBairro === 'all' ? (
                            <strong className="text-slate-900">{affectedPoles} postes (Toda a Rede)</strong>
                          ) : (
                            <span>
                              <strong>{affectedPoles} postes</strong> ({targetBairro})
                            </span>
                          )}
                        </span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <button onClick={() => handleTogglePause(rule)} className="flex items-center space-x-1.5">
                        {rule.enabled ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full font-bold text-[10px] flex items-center space-x-1 hover:bg-emerald-100 transition">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ATIVA</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full font-bold text-[10px] flex items-center space-x-1 hover:bg-amber-100 transition">
                            <PauseCircle className="w-3 h-3 text-amber-600" />
                            <span>PAUSADA</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Quick Actions (Execute, Pause/Play, Edit, Delete) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Execute Now */}
                        <button
                          onClick={() => handleExecuteNow(rule)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition font-bold text-[10px] border border-emerald-200 flex items-center space-x-1"
                          title="Executar esta regra imediatamente nos postes"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Executar</span>
                        </button>

                        {/* Pause / Resume */}
                        <button
                          onClick={() => handleTogglePause(rule)}
                          className={`p-1.5 rounded-lg transition border ${
                            rule.enabled
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                          title={rule.enabled ? 'Pausar Automação' : 'Retomar Automação'}
                        >
                          {rule.enabled ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                          title="Editar Automação"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingRule(rule)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200"
                          title="Excluir Automação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <CalendarClock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">Nenhuma regra de automação encontrada com os filtros selecionados.</p>
                    <p className="text-xs text-slate-400">Tente ajustar a busca ou limpe os filtros para visualizar todas as regras.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Automation Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <CalendarClock className="w-5 h-5 text-emerald-600" />
                <span>{editingRuleId ? 'Editar Regra de Automação' : 'Cadastrar Nova Automação'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector for New Rule */}
            {!editingRuleId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="block font-bold text-slate-700 text-[11px] flex items-center space-x-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Modelos Pré-Configurados Rápidos</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenStargazingPreset}
                    className={`p-2.5 rounded-xl border text-left text-[11px] transition flex flex-col justify-between ${
                      formData.isStargazingModel || formData.recurrence === 'monthly'
                        ? 'bg-indigo-950 text-amber-300 border-indigo-700 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-1 font-bold">
                      <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>Modelo Céu Estrelado</span>
                    </span>
                    <span className="text-[9px] opacity-80 mt-1">
                      Recorrente Mensal • Desligamento 100%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        name: 'Dimerização Noturna Eco (50%)',
                        targetAction: 'power_50',
                        targetTime: '00:00',
                        endTime: '05:00',
                        recurrence: 'daily',
                        isStargazingModel: false,
                        enabled: true,
                        targetFilter: { neighborhood: 'all' }
                      })
                    }
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-left text-[11px] transition flex flex-col justify-between"
                  >
                    <span className="font-bold text-slate-900">Dimerização Noturna Eco</span>
                    <span className="text-[9px] text-slate-500 mt-1">Diário • 50% de energia da 00h às 05h</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Regra / Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ✨ Modelo Céu Estrelado - Observação Astronômica Mensal"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ação Alvo na Iluminação</label>
                  <select
                    value={formData.targetAction || 'turn_off'}
                    onChange={(e) => setFormData({ ...formData, targetAction: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="turn_off">🔴 Desligar 100% (Apagão Céu Estrelado)</option>
                    <option value="power_100">🔵 Ligar 100% Potência</option>
                    <option value="power_75">🟡 Dimerizar 75%</option>
                    <option value="power_50">🟡 Dimerizar 50% (Modo Eco)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bairro Alvo</label>
                  <select
                    value={formData.targetFilter?.neighborhood || 'all'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetFilter: { ...formData.targetFilter, neighborhood: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="all">Toda a Cidade (Todos os Postes)</option>
                    {neighborhoodsList.map((nh) => (
                      <option key={nh} value={nh}>
                        Apenas Bairro: {nh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recorrência da Automação</label>
                  <select
                    value={formData.recurrence || 'monthly'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence: e.target.value as any,
                        isStargazingModel: e.target.value === 'monthly' ? true : formData.isStargazingModel
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="monthly">🌙 Mensalmente (Recorrência Céu Estrelado)</option>
                    <option value="daily">Todos os Dias</option>
                    <option value="weekdays">Dias Úteis (Segua a Sexta)</option>
                    <option value="weekends">Finais de Semana</option>
                    <option value="specific_dates">Data Específica</option>
                    <option value="holidays">Feriados Nacionais</option>
                  </select>
                </div>

                {formData.recurrence === 'monthly' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dia Fixo do Mês</label>
                    <select
                      value={formData.monthlyDay || 15}
                      onChange={(e) => setFormData({ ...formData, monthlyDay: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={1}>Dia 01 do mês</option>
                      <option value={10}>Dia 10 do mês</option>
                      <option value={15}>Dia 15 do mês (Padrão Lua Nova)</option>
                      <option value={20}>Dia 20 do mês</option>
                      <option value={28}>Dia 28 do mês</option>
                    </select>
                  </div>
                ) : formData.recurrence === 'specific_dates' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data Específica</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate || ''}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ) : null}
              </div>

              {/* Período Definido (Horário de Início e Término) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Janela Temporal da Automação</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1 font-medium">Horário de Início</label>
                    <input
                      type="time"
                      required
                      value={formData.targetTime || '21:00'}
                      onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1 font-medium">Horário de Término / Reativação</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime || '23:30'}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Stargazing Checkbox & Enable State */}
              <div className="flex flex-col space-y-2">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="stargazingCheckModal"
                    checked={formData.isStargazingModel ?? true}
                    onChange={(e) => setFormData({ ...formData, isStargazingModel: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="stargazingCheckModal" className="text-indigo-900 font-bold text-xs cursor-pointer">
                    Marcar como Modelo Especial 'Céu Estrelado' (Astroturismo)
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enabledCheckModal"
                    checked={formData.enabled ?? true}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="enabledCheckModal" className="text-slate-800 font-bold text-xs cursor-pointer">
                    Automação Ativa (Desmarcar para salvar como Pausada)
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-500 shadow-md transition"
                >
                  {editingRuleId ? 'Salvar Alterações' : 'Confirmar e Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center space-x-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Excluir Regra de Automação?</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Você está prestes a excluir permanentemente a automação <strong>"{deletingRule.name}"</strong> ({deletingRule.id}). Esta ação removerá os agendamentos automáticos vinculados.
            </p>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingRule(null)}
                className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-500 shadow-md transition"
              >
                Sim, Excluir Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
