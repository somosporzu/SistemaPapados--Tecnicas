import React, { useState, useRef, useEffect } from 'react';
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
  pcBudget: number;
  totalPcCost: number;
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const barColor = percentage > 100 ? 'bg-rose-500' : 'bg-orange-500';
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const TechniqueCreator: React.FC<TechniqueCreatorProps> = ({
  technique,
  setTechnique,
  setLevel,
  setForce,
  addEffect,
  pcBudget,
  totalPcCost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(EFFECT_CATEGORIES[0]);
  const effectsSectionRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Don't scroll on the initial render, only on subsequent level changes.
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

    if (technique.level && effectsSectionRef.current) {
        effectsSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
  }, [technique.level]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'resistanceCost') {
        const numValue = parseInt(value, 10);
        setTechnique(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
        setTechnique(prev => ({ ...prev, [name]: value }));
    }
  };

  const isEffectCompatible = (effect: Effect): boolean => {
      if (!technique.force) return true; // Show all if no force selected
      if (effect.restrictions.length === 0) return true;
      return !effect.restrictions.includes(technique.force);
  };
  
  const canAddEffect = (): boolean => {
      // Allow adding effects as long as a power level is selected.
      // The UI will warn the user if they go over budget, but won't block them.
      return !!technique.level;
  };

  return (
    <div className="space-y-8">
      {/* Step 1 & 2: Basic Info */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-orange-500 mb-4 border-b-2 border-orange-500/20 pb-2">Paso 1: Concepto y Poder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre de la Técnica"
              value={technique.name}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-slate-200 placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500 transition"
            />
            <div>
              <label htmlFor="resistanceCost" className="block text-sm font-medium text-slate-300 mb-1">Coste de Resistencia</label>
              <input
                type="number"
                name="resistanceCost"
                id="resistanceCost"
                placeholder="Coste Base"
                value={technique.resistanceCost}
                onChange={handleInputChange}
                disabled={!technique.level}
                className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-slate-200 placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                min="0"
              />
            </div>
            <textarea
              name="description"
              placeholder="Descripción Narrativa..."
              value={technique.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-slate-200 placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
          <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2 text-slate-300">Nivel de Poder</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(PowerLevel).map(level => (
                        <button key={level} onClick={() => setLevel(level)} className={`px-3 py-1 text-sm rounded-full transition ${technique.level === level ? 'bg-orange-500 text-white font-bold' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2 text-slate-300">Fuerza Dominante</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Force).map(force => (
                        <button key={force} onClick={() => setForce(force)} className={`px-3 py-1 text-sm rounded-full transition ${technique.force === force ? `bg-${FORCES[force].color}-500 text-white font-bold` : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}>
                            {force}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Effects */}
       <div ref={effectsSectionRef} className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
         <h2 className="text-2xl font-bold text-orange-500 mb-4 border-b-2 border-orange-500/20 pb-2">Paso 2: Compra de Efectos</h2>
          {!technique.level && <p className="text-slate-400 text-center p-4 bg-slate-700/50 rounded-md">Por favor, selecciona un Nivel de Poder para ver los efectos disponibles.</p>}
          {technique.level && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 sticky top-4 z-10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-300">Presupuesto de PC</span>
                      <span className={`font-bold text-lg transition-colors ${totalPcCost > pcBudget ? 'text-rose-500' : 'text-slate-200'}`}>
                          {totalPcCost} / {pcBudget}
                      </span>
                  </div>
                  <ProgressBar value={totalPcCost} max={pcBudget} />
                  {totalPcCost > pcBudget && (
                      <p className="text-xs text-rose-500 text-right mt-1">
                          ¡Presupuesto excedido!
                      </p>
                  )}
              </div>

              <div>
                <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-3 mb-3">
                  {EFFECT_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white shadow'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                   {EFFECTS.filter(e => e.category === selectedCategory && isEffectCompatible(e)).map(effect => (
                     <EffectCard 
                       key={effect.id}
                       effect={effect}
                       onAdd={addEffect}
                       canAdd={canAddEffect}
                     />
                   ))}
                 </div>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default TechniqueCreator;