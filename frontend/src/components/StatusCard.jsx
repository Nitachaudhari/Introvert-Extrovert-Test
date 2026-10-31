import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Server, Database, Globe } from 'lucide-react';

export const StatusCard = ({
  type = 'frontend',
  title,
  subtitle,
  status = 'checking', // 'connected' | 'checking' | 'error'
  latency,
  details,
  error,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'database':
        return <Database className="w-6 h-6 text-emerald-600" />;
      case 'backend':
        return <Server className="w-6 h-6 text-brand-600" />;
      default:
        return <Globe className="w-6 h-6 text-teal-600" />;
    }
  };

  const getStatusBadge = () => {
    if (status === 'connected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Connected
        </span>
      );
    }
    if (status === 'checking') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          Checking
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        Disconnected
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
        {latency !== undefined && latency !== null && (
          <div className="flex justify-between text-slate-600">
            <span>Response Latency:</span>
            <span className="font-mono font-medium text-slate-800">{latency} ms</span>
          </div>
        )}

        {details && Object.entries(details).map(([key, val]) => (
          <div key={key} className="flex justify-between text-slate-600">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="font-mono font-medium text-slate-800 truncate max-w-[180px]">{String(val)}</span>
          </div>
        ))}

        {error && (
          <div className="mt-2 p-2 bg-rose-50 rounded border border-rose-100 text-rose-700 text-xs break-words">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCard;

