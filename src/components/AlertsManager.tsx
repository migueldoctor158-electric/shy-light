import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Mail,
  MessageSquare,
  Smartphone,
  Plus,
  Filter
} from 'lucide-react';
import { SystemAlert } from '../types';

interface AlertsManagerProps {
  alerts?: SystemAlert[];
  onMarkAllRead?: () => void;
  onAddAlert?: (alert: SystemAlert) => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts = [],
  onMarkAllRead,
  onAddAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const handleSimulateAlert = () => {
    const newAlert: SystemAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'electrical_fault',
      severity: 'critical',
      title: 'Alerta de Sobretensão Detectado',
      message: 'Medição instantânea indicou variação de tensão +12% no circuito de alimentadores da Av. Paulista.',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      channelsSent: ['dashboard', 'email', 'sms', 'whatsapp', 'push']
    };
    onAddAlert?.(newAlert);
  };

  const filteredAlerts = (alerts || []).filter(
    (a) => filterSeverity === 'all' || a.severity === filterSeverity
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-rose-600" />
            <span>Central de Alertas e Notificações Multicanais</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoramento em tempo real de falhas elétricas, desconexões e alertas distribuídos por Dashboard, E-mail, SMS, WhatsApp e Push.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Marcar Todos Lidos
          </button>
          <button
            onClick={handleSimulateAlert}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Disparo de Alerta</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-semibold">Severidade:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">Todas as Severidades</option>
            <option value="critical">Crítico</option>
            <option value="warning">Aviso / Warning</option>
            <option value="info">Informativo</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-semibold">Total: {filteredAlerts.length} Alertas</span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.severity === 'critical'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : alert.severity === 'warning'
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-2.5 rounded-xl mt-0.5 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : alert.severity === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{alert.id}</span>
                  <h3 className="font-bold text-sm text-slate-900">{alert.title}</h3>
                  {!alert.read && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded-full uppercase">
                      Novo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
                <span className="text-[10px] font-mono text-slate-500 block">{alert.timestamp}</span>
              </div>
            </div>

            {/* Notification Channels Sent Badges */}
            <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden lg:inline">
                Notificado via:
              </span>
              <div className="flex items-center space-x-1.5">
                {alert.channelsSent.includes('dashboard') && (
                  <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-blue-700" title="Dashboard">
                    <Bell className="w-3.5 h-3.5" />
                  </span>
                )}
                {alert.channelsSent.includes('email') && (
                  <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-emerald-700" title="E-mail">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                )}
                {alert.channelsSent.includes('sms') && (
                  <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-amber-700" title="SMS">
                    <Smartphone className="w-3.5 h-3.5" />
                  </span>
                )}
                {alert.channelsSent.includes('whatsapp') && (
                  <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-emerald-700" title="WhatsApp">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
