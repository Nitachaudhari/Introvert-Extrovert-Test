import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export const ModulePlaceholder = ({
  moduleNumber,
  title,
  subtitle,
  description,
  features = [],
  nextModule,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-4">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          Phase 2 • Module {moduleNumber} Development Pipeline
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Module Architecture & Scope
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">{description}</p>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Planned Module Capabilities:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          {nextModule && (
            <Link
              to={nextModule.path}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>{nextModule.name}</span> <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;

