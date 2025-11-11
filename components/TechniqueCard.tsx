
import React from 'react';
import type { Technique, EffectInstance } from '../types';
import { FORCES } from '../constants';

interface TechniqueCardProps {
  technique: Technique;
  resistanceCost: number;
  totalPcCost: number;
  pcBudget: number;
  removeEffect: (instanceId: string) => void;
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const barColor = percentage > 100 ? 'bg-red-500' : 'bg-teal-400';
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, resistanceCost, totalPcCost, pcBudget, removeEffect }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg space-y-4">
      <h3 className="text-2xl font-bold text-center text-slate-100 border-b-2 border-slate-700 pb-3">Técnica Resultante</h3>
      
      <div>
        <h4 className="font-bold text-lg text-amber-400">{technique.name || "Nombre de la Técnica"}</h4>
        <p className="text-sm italic text-slate-400">{technique.description || "Descripción narrativa de la técnica."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Nivel</div>
            <div className="font-bold text-lg text-slate-100">{technique.level || '-'}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Coste Resistencia</div>
            <div className="font-bold text-lg text-slate-100">{resistanceCost || '-'}</div>
        </div>
         <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Fuerza</div>
            <div className={`font-bold text-lg ${technique.force ? `text-${FORCES[technique.force].color}-400` : 'text-slate-100'}`}>{technique.force || '-'}</div>
        </div>
         <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">PC Gastados</div>
            <div className={`font-bold text-lg ${totalPcCost > pcBudget ? 'text-red-400' : 'text-slate-100'}`}>{totalPcCost} / {pcBudget}</div>
        </div>
      </div>

      {technique.level && (
          <div>
            <ProgressBar value={totalPcCost} max={pcBudget} />
             {totalPcCost > pcBudget && <p className="text-xs text-red-400 text-center mt-1">¡Presupuesto excedido!</p>}
          </div>
      )}
      
      <div>
        <h5 className="font-semibold text-slate-300 mb-2 border-t border-slate-700 pt-3">Efectos y Desventajas</h5>
        {technique.effects.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Ningún efecto añadido.</p>
        ) : (
          <ul className="space-y-2">
            {technique.effects.map((instance) => (
              <li key={instance.id} className="bg-slate-900/50 p-2 rounded-md group">
                <div className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-slate-200">{instance.effect.name}</span>
                      {instance.isSecondary && <span className="text-xs text-amber-400/80 ml-1">(Secundario)</span>}
                       {instance.selectedOptions.length > 0 && (
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-1">
                            {instance.selectedOptions.map(opt => (
                                <span key={opt.optionId} className="bg-slate-700 px-1.5 py-0.5 rounded">{opt.value === 'true' ? opt.name : opt.value}</span>
                            ))}
                        </div>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${instance.finalCost >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        {instance.finalCost > 0 ? `+${instance.finalCost}` : instance.finalCost} PC
                        </span>
                        <button onClick={() => removeEffect(instance.id)} className="text-slate-500 hover:text-red-400 transition-opacity">
                            <RemoveIcon />
                        </button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default TechniqueCard;