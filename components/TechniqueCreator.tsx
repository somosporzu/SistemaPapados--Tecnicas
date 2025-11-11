import React from 'react';
// Fix: Import PowerLevel and Force as values, not just types, because they are enums used at runtime.
import { type Technique, PowerLevel, Force, type Effect, type SelectedEffectOption } from '../types';
import { FORCES, POWER_LEVELS, EFFECT_CATEGORIES, EFFECTS } from '../constants';
import { EffectCard } from './EffectCard';

interface TechniqueCreatorProps {
  technique: Technique;
  setTechnique: React.Dispatch<React.SetStateAction<Technique>>;
  setLevel: (level: PowerLevel) => void;
  setForce: (force: Force) => void;
  addEffect: (effect: Effect, selectedOptions: SelectedEffectOption[]) => void;
  removeEffect: (instanceId: string) => void;
  pcBudget: number;
  totalPcCost: number;
}

const TechniqueCreator: React.FC<TechniqueCreatorProps> = ({
  technique,
  setTechnique,
  setLevel,
  setForce,
  addEffect,
  pcBudget,
  totalPcCost,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTechnique(prev => ({ ...prev, [name]: value }));
  };

  const isEffectCompatible = (effect: Effect): boolean => {
      if (!technique.force) return true; // Show all if no force selected
      if (effect.restrictions.length === 0) return true;
      return !effect.restrictions.includes(technique.force);
  };
  
  const canAddEffect = (cost: number): boolean => {
      if (!technique.level) return false;
      const isSecondary = technique.effects.length > 0;
      const secondaryCost = isSecondary && cost > 0 ? 2 : 0;
      const totalCostToAdd = cost + secondaryCost;
      return totalPcCost + totalCostToAdd <= pcBudget;
  };

  return (
    <div className="space-y-8">
      {/* Step 1 & 2: Basic Info */}
      <div className="bg-stone-200/60 p-6 rounded-lg border border-stone-400">
        <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-800/20 pb-2">Paso 1: Concepto y Poder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre de la Técnica"
              value={technique.name}
              onChange={handleInputChange}
              className="w-full bg-stone-50 border border-stone-400 rounded-md py-2 px-3 focus:ring-orange-600 focus:border-orange-600 transition"
            />
            <textarea
              name="description"
              placeholder="Descripción Narrativa..."
              value={technique.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-stone-50 border border-stone-400 rounded-md py-2 px-3 focus:ring-orange-600 focus:border-orange-600 transition"
            />
          </div>
          <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2 text-stone-700">Nivel de Poder</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(PowerLevel).map(level => (
                        <button key={level} onClick={() => setLevel(level)} className={`px-3 py-1 text-sm rounded-full transition ${technique.level === level ? 'bg-orange-700 text-white font-bold' : 'bg-stone-300 hover:bg-stone-400'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2 text-stone-700">Fuerza Dominante</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Force).map(force => (
                        <button key={force} onClick={() => setForce(force)} className={`px-3 py-1 text-sm rounded-full transition ${technique.force === force ? `bg-${FORCES[force].color}-600 text-white font-bold` : 'bg-stone-300 hover:bg-stone-400'}`}>
                            {force}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Effects */}
       <div className="bg-stone-200/60 p-6 rounded-lg border border-stone-400">
         <h2 className="text-2xl font-bold text-sky-800 mb-4 border-b-2 border-sky-800/20 pb-2">Paso 2: Compra de Efectos</h2>
          {!technique.level && <p className="text-stone-600 text-center p-4 bg-stone-50/50 rounded-md">Por favor, selecciona un Nivel de Poder para ver los efectos disponibles.</p>}
          {technique.level && (
            <div className="space-y-4">
              {EFFECT_CATEGORIES.map(category => (
                <div key={category}>
                   <h3 className="text-xl font-semibold text-stone-700 mb-3 sticky top-0 bg-stone-200/80 backdrop-blur-sm py-2 z-10">{category}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                     {EFFECTS.filter(e => e.category === category && isEffectCompatible(e)).map(effect => (
                       <EffectCard 
                         key={effect.id}
                         effect={effect}
                         onAdd={addEffect}
                         canAdd={canAddEffect}
                       />
                     ))}
                   </div>
                </div>
              ))}
            </div>
          )}
       </div>
    </div>
  );
};

export default TechniqueCreator;
