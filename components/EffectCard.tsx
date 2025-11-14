import React, { useState, useMemo, useEffect } from 'react';
import type { Effect, EffectOption, SelectedEffectOption } from '../types';

interface EffectCardProps {
    effect: Effect;
    onAdd: (effect: Effect, selectedOptions: SelectedEffectOption[]) => void;
    canAdd: () => boolean;
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

    const handleOptionChange = (option: EffectOption, value: string, optionIdOverride?: string) => {
        const optionId = optionIdOverride || option.id;

        setSelectedOptions(prev => {
            const existing = prev.find(o => o.optionId === optionId);

            if (option.type === 'select') {
                const selectedValue = option.values?.find(v => v.name === value);
                 if (!selectedValue) {
                    // Handle deselection for extra states
                    if (optionId.startsWith('extra_estado_')) {
                        return prev.filter(o => o.optionId !== optionId);
                    }
                    return prev;
                };

                const newOption: SelectedEffectOption = { optionId, name: option.name, value: selectedValue.name, cost: selectedValue.cost };
                if (existing) {
                    return prev.map(o => (o.optionId === optionId ? newOption : o));
                } else {
                    return [...prev, newOption];
                }
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

    const { totalCost } = useMemo(() => {
        const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
        return { 
            totalCost: effect.baseCost + optionsCost 
        };
    }, [effect.baseCost, selectedOptions]);
    
    // --- Special logic for 'pen_estado_alterado' ---
    const multiStateSelection = useMemo(() => {
        if (effect.id !== 'pen_estado_alterado') return null;
        return selectedOptions.find(o => o.optionId === 'multiple_estados');
    }, [effect.id, selectedOptions]);

    const numExtraStates = useMemo(() => {
        if (!multiStateSelection) return 0;
        switch (multiStateSelection.value) {
            case '2 estados': return 1;
            case '3 estados': return 2;
            case '4 estados': return 3;
            default: return 0;
        }
    }, [multiStateSelection]);

     // Cleanup effect when numExtraStates decreases
    useEffect(() => {
        if (effect.id !== 'pen_estado_alterado') return;
        
        setSelectedOptions(prev => {
            const currentExtraStates = prev.filter(o => o.optionId.startsWith('extra_estado_'));
            if (currentExtraStates.length > numExtraStates) {
                return prev.filter(o => {
                    if (!o.optionId.startsWith('extra_estado_')) return true;
                    const index = parseInt(o.optionId.split('_')[2], 10);
                    return index <= numExtraStates;
                });
            }
            return prev;
        });

    }, [numExtraStates, effect.id]);


    const allPossibleStates = useMemo(() => {
        if (effect.id !== 'pen_estado_alterado') return [];
        const estadoOption = effect.options?.find(o => o.id === 'estado_select');
        return estadoOption?.values || [];
    }, [effect]);

    const selectedStateValues = useMemo(() => {
        return selectedOptions
            .filter(o => o.optionId === 'estado_select' || o.optionId.startsWith('extra_estado_'))
            .map(o => o.value);
    }, [selectedOptions]);

    const renderExtraStateSelectors = () => {
        if (effect.id !== 'pen_estado_alterado' || numExtraStates === 0) return null;

        return Array.from({ length: numExtraStates }).map((_, index) => {
            const extraOptionId = `extra_estado_${index + 1}`;
            const currentlySelectedExtraState = selectedOptions.find(o => o.optionId === extraOptionId)?.value;
            
            const availableStates = allPossibleStates.filter(
                state => !selectedStateValues.includes(state.name) || state.name === currentlySelectedExtraState
            );

            const extraStateOption: EffectOption = {
                id: extraOptionId,
                name: `Estado Adicional ${index + 1}`,
                type: 'select',
                values: availableStates // FIX: Use the full value object with correct costs
            };

            return (
                <div key={extraStateOption.id}>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">{extraStateOption.name}</label>
                    <p className="text-xs text-slate-500 mb-1 italic">Este estado tendrá una ND de salvación 2 puntos inferior.</p>
                    <select 
                        value={currentlySelectedExtraState || ''}
                        onChange={(e) => handleOptionChange(extraStateOption, e.target.value, extraStateOption.id)}
                        className="w-full text-xs bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-slate-200 focus:ring-orange-500 focus:border-orange-500 transition"
                    >
                        <option value="">Selecciona un estado...</option>
                        {extraStateOption.values?.map(v => <option key={v.name} value={v.name}>{v.name} ({v.cost >= 0 ? '+' : ''}{v.cost} PC)</option>)}
                    </select>
                </div>
            )
        })
    }
    // --- End special logic ---

    const isAddDisabled = !canAdd();
    const isDisadvantage = effect.category === "Desventajas";

    return (
        <div className={`flex flex-col justify-between p-4 rounded-lg border transition-all duration-200 ${isDisadvantage ? 'bg-emerald-900/20 border-emerald-700' : 'bg-slate-900/50 border-slate-700'}`}>
            <div>
                <h4 className={`font-bold ${isDisadvantage ? 'text-emerald-400' : 'text-slate-200'}`}>{effect.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{effect.description}</p>
            </div>

            {effect.options && effect.options.length > 0 && (
                 <div className="space-y-2 mt-3">
                    {effect.options.map(option => (
                        <div key={option.id}>
                            <label className="text-xs font-semibold text-slate-400 block mb-1">{option.name}</label>
                            {option.description && <p className="text-xs text-slate-500 mb-1 italic">{option.description}</p>}
                            {option.type === 'select' && option.values && (
                                <select 
                                    onChange={(e) => handleOptionChange(option, e.target.value)}
                                    value={selectedOptions.find(o => o.optionId === option.id)?.value || ''}
                                    className="w-full text-xs bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-slate-200 focus:ring-orange-500 focus:border-orange-500 transition"
                                >
                                    {option.values.map(v => <option key={v.name} value={v.name}>{v.name} ({v.cost >= 0 ? '+' : ''}{v.cost} PC)</option>)}
                                </select>
                            )}
                            {option.type === 'boolean' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" 
                                    checked={!!selectedOptions.find(o => o.optionId === option.id)}
                                    onChange={(e) => handleOptionChange(option, e.target.checked.toString())} className="form-checkbox bg-slate-700 border-slate-600 rounded text-orange-500 focus:ring-orange-500"/>
                                    <span className="text-xs text-slate-300">Activar</span>
                                </label>
                            )}
                        </div>
                    ))}
                    {renderExtraStateSelectors()}
                </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                <span className={`text-sm font-bold ${isDisadvantage ? 'text-emerald-400' : 'text-orange-400'}`}>
                    Coste Total: {totalCost} PC
                </span>
                <button
                    onClick={() => onAdd(effect, selectedOptions)}
                    disabled={isAddDisabled}
                    className={`flex items-center gap-1 text-xs font-bold py-1 px-2 rounded-md transition-colors duration-200 ${
                        isDisadvantage 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                    <PlusIcon /> Añadir
                </button>
            </div>
        </div>
    );
};