import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { Technique, EffectInstance, PowerLevel, Force, Effect, SelectedEffectOption } from './types';
import { POWER_LEVELS } from './constants';
import TechniqueCreator from './components/TechniqueCreator';
import TechniqueCard from './components/TechniqueCard';
import { initialTechniqueState } from './constants';

// Add htmlToImage to the global scope since it's from a CDN
declare const htmlToImage: any;

function App() {
  const [technique, setTechnique] = useState<Technique>(initialTechniqueState);
  const [copyButtonText, setCopyButtonText] = useState('Copiar como Texto');
  const [exportButtonText, setExportButtonText] = useState('Exportar como Imagen');
  const techniqueCardRef = useRef<HTMLDivElement>(null);

  const pcBudget = useMemo(() => {
    if (!technique.level) return 0;
    return POWER_LEVELS[technique.level].pcBudget;
  }, [technique.level]);

  const totalPcCost = useMemo(() => {
    return technique.effects.reduce((sum, effectInstance) => sum + effectInstance.finalCost, 0);
  }, [technique.effects]);
  
  const handleReset = () => {
    setTechnique(initialTechniqueState);
  };

  const handleSetLevel = (level: PowerLevel) => {
    const baseResistanceCost = POWER_LEVELS[level].resistanceCost;
    setTechnique(prev => ({ 
      ...prev, 
      level, 
      effects: [], // Reset effects when level changes
      resistanceCost: baseResistanceCost 
    }));
  };

  const handleSetForce = (force: Force) => {
    setTechnique(prev => ({ ...prev, force }));
  };
  
  const handleAddEffect = (effect: Effect, selectedOptions: SelectedEffectOption[]) => {
    setTechnique(prev => {
      const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
      const baseEffectCost = effect.baseCost + optionsCost;
      
      const isSecondary = prev.effects.length > 0;
      // The secondary effect rule adds +2 PC
      const secondaryCost = isSecondary && baseEffectCost > 0 ? 2 : 0;
      const finalCost = baseEffectCost + secondaryCost;
      
      const newEffectInstance: EffectInstance = {
        id: `${effect.id}-${Date.now()}`,
        effect,
        finalCost,
        isSecondary,
        selectedOptions,
      };
      
      return { ...prev, effects: [...prev.effects, newEffectInstance] };
    });
  };
  
  const handleRemoveEffect = (instanceId: string) => {
    setTechnique(prev => {
        const newEffects = prev.effects.filter(e => e.id !== instanceId);
        // Recalculate isSecondary status and finalCost for remaining effects
        const recalculatedEffects = newEffects.map((instance, index) => {
            const isSecondary = index > 0;

            const optionsCost = instance.selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
            const baseEffectCost = instance.effect.baseCost + optionsCost;
            const secondaryCost = isSecondary && baseEffectCost > 0 ? 2 : 0;
            const finalCost = baseEffectCost + secondaryCost;
            
            return {...instance, isSecondary, finalCost};
        });
        return { ...prev, effects: recalculatedEffects };
    });
  };

  const handleCopy = () => {
    if (!technique.level) return;

    const effectLines = technique.effects.map(instance => {
      let optionsStr = '';
      if (instance.selectedOptions.length > 0) {
        const optionDetails = instance.selectedOptions
          .map(opt => (opt.value === 'true' ? opt.name.split(' (')[0] : opt.value))
          .filter(Boolean);
        if (optionDetails.length > 0) {
            optionsStr = ` (${optionDetails.join(', ')})`;
        }
      }
      return `- ${instance.effect.name}${optionsStr}: ${instance.finalCost >= 0 ? '+' : ''}${instance.finalCost} PC`;
    }).join('\n');

    const textToCopy = `
--- TÉCNICA: ${technique.name || 'Sin Nombre'} ---

Nivel: ${technique.level}
Fuerza: ${technique.force || 'Ninguna'}
Coste de Resistencia: ${technique.resistanceCost}

PC Gastados: ${totalPcCost} / ${pcBudget}

Descripción:
${technique.description || 'Sin descripción.'}

--- EFECTOS ---
${effectLines || 'Ningún efecto añadido.'}
    `.trim().replace(/^    /gm, '');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar como Texto'), 2000);
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      setCopyButtonText('Error al copiar');
      setTimeout(() => setCopyButtonText('Copiar como Texto'), 2000);
    });
  };

  const handleExportImage = () => {
    if (!techniqueCardRef.current) {
      setExportButtonText('Error');
      setTimeout(() => setExportButtonText('Exportar como Imagen'), 2000);
      return;
    }
    
    setExportButtonText('Exportando...');

    const originalBg = techniqueCardRef.current.style.backgroundColor;
    techniqueCardRef.current.style.backgroundColor = '#1e293b'; // slate-800

    htmlToImage.toPng(techniqueCardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${technique.name.replace(/\s+/g, '-').toLowerCase() || 'tecnica-rpg'}.png`;
        link.href = dataUrl;
        link.click();
        setExportButtonText('¡Exportado!');
        setTimeout(() => setExportButtonText('Exportar como Imagen'), 2000);
      })
      .catch((err: Error) => {
        console.error('Error al exportar imagen:', err);
        setExportButtonText('Error');
        setTimeout(() => setExportButtonText('Exportar como Imagen'), 2000);
      })
      .finally(() => {
          if (techniqueCardRef.current) {
            techniqueCardRef.current.style.backgroundColor = originalBg;
          }
      });
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 tracking-tight">
            Creador de Técnicas RPG
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Diseña y equilibra técnicas para tu juego de rol siguiendo unos sencillos pasos.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TechniqueCreator 
              technique={technique}
              setTechnique={setTechnique}
              setLevel={handleSetLevel}
              setForce={handleSetForce}
              addEffect={handleAddEffect}
              pcBudget={pcBudget}
              totalPcCost={totalPcCost}
            />
          </div>
          <div className="lg:col-span-1">
             <div className="sticky top-8">
                <TechniqueCard 
                  ref={techniqueCardRef}
                  technique={technique} 
                  totalPcCost={totalPcCost}
                  pcBudget={pcBudget}
                  removeEffect={handleRemoveEffect}
                />
                 <div className="mt-4 flex flex-col gap-2">
                    <button
                        onClick={handleExportImage}
                        disabled={!technique.level || exportButtonText !== 'Exportar como Imagen'}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportButtonText}
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={!technique.level}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {copyButtonText}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Empezar de Nuevo
                    </button>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;