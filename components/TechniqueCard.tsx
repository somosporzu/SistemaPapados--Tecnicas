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
    const barColor = percentage > 100 ? 'bg-red-600' : 'bg-orange-600';
    return (
        <div className="w-full bg-stone-300 rounded-full h-2.5">
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
    <div className="bg-stone-200/60 border border-stone-400 rounded-lg p-6 shadow-lg space-y-4">
      <h3 className="text-2xl font-bold text-center text-stone-900 border-b-2 border-stone-400 pb-3">Técnica Resultante</h3>
      
      <div>
        <h4 className="font-bold text-lg text-orange-800">{technique.name || "Nombre de la Técnica"}</h4>
        <p className="text-sm italic text-stone-600">{technique.description || "Descripción narrativa de la técnica."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-stone-50/50 p-3 rounded-md">
            <div className="text-xs text-stone-600">Nivel</div>
            <div className="font-bold text-lg text-stone-900">{technique.level || '-'}</div>
        </div>
        <div className="bg-stone-50/50 p-3 rounded-md">
            <div className="text-xs text-stone-600">Coste Resistencia</div>
            <div className="font-bold text-lg text-stone-900">{resistanceCost || '-'}</div>
        </div>
         <div className="bg-stone-50/50 p-3 rounded-md">
            <div className="text-xs text-stone-600">Fuerza</div>
            <div className={`font-bold text-lg ${technique.force ? `text-${FORCES[technique.force].color}-600` : 'text-stone-900'}`}>{technique.force || '-'}</div>
        </div>
         <div className="bg-stone-50/50 p-3 rounded-md">
            <div className="text-xs text-stone-600">PC Gastados</div>
            <div className={`font-bold text-lg ${totalPcCost > pcBudget ? 'text-red-600' : 'text-stone-900'}`}>{totalPcCost} / {pcBudget}</div>
        </div>
      </div>

      {technique.level && (
          <div>
            <ProgressBar value={totalPcCost} max={pcBudget} />
             {totalPcCost > pcBudget && <p className="text-xs text-red-600 text-center mt-1">¡Presupuesto excedido!</p>}
          </div>
      )}
      
      <div>
        <h5 className="font-semibold text-stone-700 mb-2 border-t border-stone-400 pt-3">Efectos y Desventajas</h5>
        {technique.effects.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-4">Ningún efecto añadido.</p>
        ) : (
          <ul className="space-y-2">
            {technique.effects.map((instance) => (
              <li key={instance.id} className="bg-stone-50/50 p-2 rounded-md group">
                <div className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-stone-800">{instance.effect.name}</span>
                      {instance.isSecondary && <span className="text-xs text-orange-600/80 ml-1">(Secundario)</span>}
                       {instance.selectedOptions.length > 0 && (
                        <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-1">
                            {instance.selectedOptions.map(opt => (
                                <span key={opt.optionId} className="bg-stone-300 px-1.5 py-0.5 rounded">{opt.value === 'true' ? opt.name : opt.value}</span>
                            ))}
                        </div>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${instance.finalCost >= 0 ? 'text-orange-700' : 'text-red-600'}`}>
                        {instance.finalCost > 0 ? `+${instance.finalCost}` : instance.finalCost} PC
                        </span>
                        <button onClick={() => removeEffect(instance.id)} className="text-stone-500 hover:text-red-600 transition-opacity">
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
