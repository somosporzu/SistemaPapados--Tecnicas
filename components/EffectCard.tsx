import React, { useState, useMemo, useEffect } from 'react';
import type { Effect, EffectOption, SelectedEffectOption } from '../types';

interface EffectCardProps {
    effect: Effect;
    onAdd: (effect: Effect, selectedOptions: SelectedEffectOption[]) => void;
    canAdd: (cost: number) => boolean;
}

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const EffectCard: React.FC<EffectCardProps> = ({ effect, onAdd, canAdd }) => {
    const [selectedOptions, setSelectedOptions] = useState<SelectedEffectOption[]>([]);
    
    useEffect(() => {
        // Pre-select first option for 'select' types if they exist
        const initialSelections: SelectedEffectOption[] = [];
        if (effect.options) {
            for (const option of effect.options) {
                if (option.type === 'select' && option.values && option.values.length > 0) {
                    const firstValue = option.values[0];
                    initialSelections.push({
                        optionId: option.id,
                        name: option.name,
                        value: firstValue.name,
                        cost: firstValue.cost
                    });
                }
            }
        }
        setSelectedOptions(initialSelections);
    }, [effect]);

    const handleOptionChange = (option: EffectOption, value: string) => {
        setSelectedOptions(prev => {
            const existing = prev.find(o => o.optionId === option.id);
            if (option.type === 'select') {
                const selectedValue = option.values?.find(v => v.name === value);
                if (!selectedValue) return prev;
                const newOption: SelectedEffectOption = { optionId: option.id, name: option.name, value: selectedValue.name, cost: selectedValue.cost };
                return existing ? prev.map(o => o.optionId === option.id ? newOption : o) : [...prev, newOption];
            }
            if (option.type === 'boolean') {
                const isChecked = value === 'true';
                if (isChecked) {
                    const newOption: SelectedEffectOption = { optionId: option.id, name: option.name, value: 'true', cost: option.cost || 0 };
                    return existing ? prev : [...prev, newOption];
                } else {
                    return prev.filter(o => o.optionId !== option.id);
                }
            }
            return prev;
        });
    };

    const totalCost = useMemo(() => {
        const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
        return effect.baseCost + optionsCost;
    }, [effect.baseCost, selectedOptions]);

    const isAddDisabled = !canAdd(totalCost);
    const isDisadvantage = effect.category === "Desventajas";

    return (
        <div className={`flex flex-col justify-between p-4 rounded-lg border transition-all duration-200 ${isDisadvantage ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-300'}`}>
            <div>
                <h4 className={`font-bold ${isDisadvantage ? 'text-emerald-800' : 'text-slate-800'}`}>{effect.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{effect.description}</p>
            </div>

            {effect.options && effect.options.length > 0 && (
                 <div className="space-y-2 mt-3">
                    {effect.options.map(option => (
                        <div key={option.id}>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">{option.name}</label>
                            {option.description && <p className="text-xs text-slate-500 mb-1 italic">{option.description}</p>}
                            {option.type === 'select' && option.values && (
                                <select 
                                    onChange={(e) => handleOptionChange(option, e.target.value)}
                                    className="w-full text-xs bg-slate-100 border border-slate-300 rounded-md py-1 px-2 focus:ring-violet-500 focus:border-violet-500 transition"
                                >
                                    {option.values.map(v => <option key={v.name} value={v.name}>{v.name} ({v.cost >= 0 ? '+' : ''}{v.cost} PC)</option>)}
                                </select>
                            )}
                            {option.type === 'boolean' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" onChange={(e) => handleOptionChange(option, e.target.checked.toString())} className="form-checkbox bg-slate-200 border-slate-300 rounded text-violet-500 focus:ring-violet-500"/>
                                    <span className="text-xs text-slate-700">Activar</span>
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-300/50">
                <span className={`text-sm font-bold ${isDisadvantage ? 'text-emerald-700' : 'text-violet-700'}`}>
                    Coste Total: {totalCost} PC
                </span>
                <button
                    onClick={() => onAdd(effect, selectedOptions)}
                    disabled={isAddDisabled}
                    className={`flex items-center gap-1 text-xs font-bold py-1 px-2 rounded-md transition-colors duration-200 ${
                        isDisadvantage 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-violet-500 hover:bg-violet-600 text-white disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                    <PlusIcon /> Añadir
                </button>
            </div>
        </div>
    );
};