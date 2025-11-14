import { PowerLevel, Force, type Effect, type Technique, type EffectOption } from './types';

export const POWER_LEVELS: Record<PowerLevel, { resistanceCost: number, pcBudget: number }> = {
  [PowerLevel.SUPPORT]: { resistanceCost: 1, pcBudget: 5 },
  [PowerLevel.LEVEL_1]: { resistanceCost: 2, pcBudget: 10 },
  [PowerLevel.LEVEL_2]: { resistanceCost: 4, pcBudget: 20 },
  [PowerLevel.LEVEL_3]: { resistanceCost: 6, pcBudget: 30 },
};

export const FORCES: Record<Force, { description: string, color: string }> = {
    [Force.DESTRUCTION]: { description: "La senda de quienes rompen y terminan. Daño y combate.", color: "rose" },
    [Force.CONSERVATION]: { description: "La senda del cuidado y la preservación. Curación y defensas.", color: "emerald" },
    [Force.TRANSFORMATION]: { description: "La senda del cambio constante. Control elemental y del entorno.", color: "amber" },
    [Force.CREATION]: { description: "La senda de dar forma a lo nuevo. Invocaciones e ilusiones.", color: "sky" },
    [Force.ORDER]: { description: "La senda del equilibrio y la estructura. Control y sellos.", color: "zinc" },
    [Force.CHAOS]: { description: "La senda de lo indomable y contradictorio. Efectos aleatorios y daño persistente.", color: "violet" }
};

export const initialTechniqueState: Technique = {
  name: '',
  description: '',
  level: null,
  force: null,
  effects: [],
  resistanceCost: 0,
};

export const EFFECT_CATEGORIES = [
    "Efectos ofensivos",
    "Efectos defensivos",
    "Efectos de Movimiento",
    "Efectos de Apoyo",
    "Efectos de penalización",
    "Convocatoria",
    "Efectos Varios",
    "Desventajas"
];

// Reusable Effect Options
const DURATION_OPTION: EffectOption = {
    id: 'duration',
    name: 'Duración',
    type: 'select',
    values: [
        { name: 'Una ronda', cost: 0 },
        { name: 'Tres rondas', cost: 1 },
        { name: 'Cinco rondas', cost: 2 },
        { name: '5 minutos', cost: 3 },
        { name: '10 minutos', cost: 5 },
        { name: '20 minutos', cost: 8 },
    ]
};

const DURATION_PER_TURN_OPTION = (turnCost: number): EffectOption => ({
    id: 'extra_duration',
    name: `Mantener bono turnos extra`,
    type: 'select',
    values: [
        { name: 'Duración base (1 turno)', cost: 0 },
        { name: `+1 turno extra (+${turnCost} PC)`, cost: turnCost },
        { name: `+2 turnos extra (+${turnCost * 2} PC)`, cost: turnCost * 2 },
        { name: `+3 turnos extra (+${turnCost * 3} PC)`, cost: turnCost * 3 },
    ]
});

const PEN_DEF_DURATION_OPTION: EffectOption = {
    id: 'duration',
    name: 'Duración',
    type: 'select',
    values: [
        { name: 'Una ronda', cost: 0 },
        { name: 'Tres rondas', cost: 3 },
        { name: 'Cinco rondas', cost: 6 },
    ]
};

const SACRIFICE_OPTION: EffectOption = {
    id: 'sacrifice',
    name: 'Sacrificio (+5 PC)',
    description: 'El personaje puede sacrificar X resistencia para sumar X al bono.',
    type: 'boolean',
    cost: 5,
};

const circumstanceDisadvantage: Omit<Effect, 'id' | 'name'> = {
    category: "Desventajas",
    description: "La técnica solo puede usarse bajo una condición especial. Restricción de Fuerza: Transformación.",
    baseCost: 0,
    restrictions: [Force.TRANSFORMATION],
    options: [
        {
            id: 'circumstance_type',
            name: 'Tipo de Circunstancia',
            type: 'select',
            values: [
                { name: 'Mitad de resistencia máxima', cost: -5 },
                { name: 'Bajo un estado alterado', cost: -3 },
                { name: 'Con arma envainada (debe desenfundar)', cost: -3 },
                { name: 'Volando', cost: -3 },
                { name: 'Sobre una montura', cost: -3 },
                { name: 'Debe ser de día', cost: -5 },
                { name: 'Debe ser de noche', cost: -5 },
                { name: 'En terreno determinado', cost: -5 },
                { name: 'Contra un tipo de criatura específico', cost: -5 },
            ]
        }
    ]
};

const penalizadorDisadvantage: Omit<Effect, 'id' | 'name'> = {
    category: "Desventajas",
    description: "Tras usar la técnica, el usuario sufre un efecto negativo.",
    baseCost: 0,
    restrictions: [],
    options: [
        {
            id: 'penalty_type',
            name: 'Tipo de Penalizador',
            type: 'select',
            values: [
                { name: 'Penalizador a toda acción -1', cost: -2 },
                { name: 'Penalizador a toda acción -3', cost: -4 },
                { name: 'Penalizador a toda acción -5', cost: -6 },
                { name: 'Sufre Estado Alterado', cost: -3 },
                { name: 'Pérdida de sentido', cost: -5 },
                { name: 'Defensa a la mitad', cost: -5 },
                { name: 'Defensa igual a 0', cost: -8 },
                { name: 'Sobrecarga menor (esperar 3 rondas)', cost: -3 },
                { name: 'Sobrecarga mayor (esperar 5 rondas)', cost: -5 },
            ]
        }
    ]
};


export const EFFECTS: Effect[] = [
    // 1. Efectos ofensivos
    { 
        id: "of_bono_ataque", 
        category: "Efectos ofensivos", 
        name: "Bono a la tirada de ataque", 
        description: "Otorga un bono a la tirada de ataque. Los bonos altos tienen restricciones de Fuerza.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.CREATION, Force.ORDER], 
        options: [
            { id: 'bonus_select', name: 'Bonificación', type: 'select', values: [
                { name: '+1', cost: 2 }, { name: '+2', cost: 3 }, { name: '+3', cost: 5 }, { name: '+4', cost: 7 }, { name: '+5', cost: 10 }
            ]},
            { id: 'all_attacks', name: 'A todos los ataques del turno (+5 PC)', type: 'boolean', cost: 5 },
            SACRIFICE_OPTION,
            DURATION_PER_TURN_OPTION(2)
        ] 
    },
    { 
        id: "of_bono_dano", 
        category: "Efectos ofensivos", 
        name: "Bono al daño", 
        description: "Añade un bono al daño de la técnica. Los bonos altos tienen restricciones de Fuerza.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.CREATION, Force.ORDER], 
        options: [
            { id: 'bonus_select', name: 'Bonificación', type: 'select', values: [
                { name: '+1', cost: 2 }, { name: '+2', cost: 4 }, { name: '+3', cost: 8 }, { name: '+4', cost: 12 }, { name: '+5', cost: 15 }
            ]},
            { id: 'all_attacks', name: 'A todos los ataques del turno (+5 PC)', type: 'boolean', cost: 5 },
            SACRIFICE_OPTION,
            DURATION_PER_TURN_OPTION(2),
            { 
                id: 'different_damage_type', 
                name: 'Tipo de daño diferente (+3 PC)', 
                description: 'Restringido a fuerzas: Conservación, Orden.', 
                type: 'boolean', 
                cost: 3 
            }
        ] 
    },
    { 
        id: "of_distancia", 
        category: "Efectos ofensivos", 
        name: "Ataque a distancia", 
        description: "Permite que la técnica ataque a distancia. Incluye opciones para múltiples objetivos y efectos de trayectoria.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { 
                id: 'distancia_select', 
                name: 'Distancia', 
                type: 'select', 
                values: [
                    { name: '5 metros', cost: 2 }, { name: '10 metros', cost: 4 }, { name: '15 metros', cost: 6 }, { name: '20 metros', cost: 8 },
                ]
            },
            {
                id: 'extra_targets',
                name: 'Objetivos extras',
                type: 'select',
                values: [
                    { name: 'Ninguno', cost: 0 },
                    { name: '+1 objetivo', cost: 4 },
                    { name: '+2 objetivos', cost: 7 },
                    { name: '+3 objetivos', cost: 12 },
                ]
            },
            {
                id: 'projection',
                name: 'Proyección (+4 PC)',
                description: 'El personaje se mueve hacia el objetivo la distancia de la técnica.',
                type: 'boolean',
                cost: 4
            },
            {
                id: 'destruction_wake',
                name: 'Estela de destrucción (+8 PC)',
                description: 'Impacta a todos en línea recta hacia el objetivo.',
                type: 'boolean',
                cost: 8
            }
        ]
    },
    { 
        id: "of_area", 
        category: "Efectos ofensivos", 
        name: "Ataque de Área", 
        description: "Afecta un área. Puede ser selectivo con ciertas Fuerzas.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { 
                id: 'area_select', 
                name: 'Radio del Área', 
                type: 'select', 
                values: [
                    { name: '1 metro', cost: 2 }, { name: '5 metros', cost: 3 }, { name: '10 metros', cost: 5 }, { name: '15 metros', cost: 9 }, { name: '20 metros', cost: 15 },
                ]
            },
            {
                id: 'selective_targeting',
                name: 'Elección de objetivos (+5 PC)',
                description: 'Puedes elegir a quién golpear dentro del área. Restricción: Destrucción, Caos.',
                type: 'boolean',
                cost: 5
            }
        ]
    },
    { 
        id: "of_ataque_extra", 
        category: "Efectos ofensivos", 
        name: "Ataque Extra", 
        description: "Permite realizar uno o más ataques extra este turno.", 
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'extra_attack_select', name: 'Ataques', type: 'select', values: [
                { name: '+1 ataque', cost: 3 }, { name: '+2 ataques', cost: 6 }, { name: '+3 ataques', cost: 9 }, { name: '+4 ataques', cost: 12 }
            ]},
            DURATION_PER_TURN_OPTION(3)
        ]
    },
    {
        id: "of_dano_continuo",
        category: "Efectos ofensivos",
        name: "Daño Continuo",
        description: "Inflige daño por ronda durante un tiempo determinado. El tipo de daño y la duración son personalizables.",
        baseCost: 0,
        restrictions: [Force.CONSERVATION, Force.CREATION],
        options: [
            {
                id: 'damage_amount',
                name: 'Daño por Ronda',
                type: 'select',
                values: [
                    { name: '1 Daño', cost: 3 },
                    { name: '3 Daño', cost: 5 },
                    { name: '6 Daño', cost: 10 },
                    { name: '9 Daño', cost: 15 },
                ]
            },
            {
                id: 'dot_duration',
                name: 'Duración',
                type: 'select',
                values: [
                    { name: 'Una ronda', cost: 0 },
                    { name: 'Tres rondas', cost: 3 },
                    { name: 'Cinco rondas', cost: 6 },
                ]
            },
            {
                id: 'different_damage_type',
                name: 'Tipo de daño diferente (+3 PC)',
                description: 'Restringido a fuerzas: Conservación, Orden.',
                type: 'boolean',
                cost: 3
            }
        ]
    },

    // 2. Efectos defensivos
    { 
        id: "def_bono_defensa", 
        category: "Efectos defensivos", 
        name: "Bono a la defensa", 
        description: "Otorga un bono a la defensa.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION], 
        options: [
            { id: 'bonus_select', name: 'Bonificación', type: 'select', values: [
                { name: '+1', cost: 1 }, { name: '+2', cost: 3 }, { name: '+3', cost: 5 }, { name: '+4', cost: 7 }, { name: '+5', cost: 10 }
            ]},
            DURATION_PER_TURN_OPTION(2),
            SACRIFICE_OPTION
        ] 
    },
    {
        id: "def_contraataque",
        category: "Efectos defensivos",
        name: "Contrataque",
        description: "Permite realizar un ataque al ser atacado. Opcionalmente, reemplaza su daño con el daño recibido.",
        baseCost: 0,
        restrictions: [],
        options: [
            {
                id: 'counter_type',
                name: 'Tipo de Contrataque',
                type: 'select',
                values: [
                    { name: 'Ataque normal', cost: 5 },
                    { name: 'Ataque con bono +1', cost: 7 },
                    { name: 'Ataque con bono +2', cost: 9 },
                    { name: 'Ataque con bono +3', cost: 11 },
                ]
            },
            {
                id: 'damage_replacement',
                name: 'Reemplazo de Daño',
                type: 'select',
                values: [
                    { name: 'Sin reemplazo', cost: 0 },
                    { name: 'Reemplazar con mitad de daño recibido', cost: 5 },
                    { name: 'Reemplazar con todo el daño recibido', cost: 10 },
                ]
            }
        ]
    },
    { 
        id: "def_def_predeterminada", 
        category: "Efectos defensivos", 
        name: "Defensa Predeterminada", 
        description: "Tu defensa se convierte en un valor fijo.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
             { id: 'defense_select', name: 'Valor de Defensa', type: 'select', values: [
                { name: 'Defensa 12', cost: 6 }, { name: 'Defensa 14', cost: 10 }, { name: 'Defensa 16', cost: 15 }
            ]},
            DURATION_OPTION
        ] 
    },

    // 3. Efectos de Movimiento
    { 
        id: "mov_bono_mov", 
        category: "Efectos de Movimiento", 
        name: "Bono al movimiento", 
        description: "Aumenta la distancia de movimiento.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'movement_select', name: 'Distancia extra', type: 'select', values: [
                { name: '+3 metros', cost: 1 }, { name: '+6 metros', cost: 3 }, { name: '+9 metros', cost: 6 }
            ]},
            DURATION_OPTION
        ] 
    },
    { 
        id: "mov_instantaneo", 
        category: "Efectos de Movimiento", 
        name: "Movimiento Instantáneo", 
        description: "Te mueves instantáneamente una distancia. Puede ser teletransporte.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'distance_select', name: 'Distancia', type: 'select', values: [
                { name: '5 metros', cost: 3 }, { name: '10 metros', cost: 6 }, { name: '15 metros', cost: 9 }
            ]},
            { id: 'teleport', name: 'Teletransportación (+5 PC)', type: 'boolean', cost: 5 }
        ] 
    },
     {
        id: "mov_especial",
        category: "Efectos de Movimiento",
        name: "Movimiento Especial",
        description: "Gana un tipo de movimiento especial por una duración determinada. Las restricciones de Fuerza se aplican a tipos específicos.",
        baseCost: 0,
        restrictions: [],
        options: [
            {
                id: 'special_move_type',
                name: 'Tipo de Movimiento',
                type: 'select',
                values: [
                    { name: 'Levitar (mitad de velocidad)', cost: 3 },
                    { name: 'Vuelo (velocidad normal, Restricción: Orden)', cost: 5 },
                    { name: 'Anfibio (moverse a mitad de vel. normal)', cost: 3 },
                    { name: 'Acuático (vel. normal bajo agua, sin respirar)', cost: 5 },
                    { name: 'Subterráneo Menor (mitad vel., máx 3m)', cost: 3 },
                    { name: 'Subterráneo Mayor (vel. normal, máx 3m)', cost: 5 },
                    { name: 'Incorpóreo (ignora terreno/enemigos)', cost: 5 },
                ]
            },
            {
                id: 'special_move_duration',
                name: 'Duración',
                type: 'select',
                values: [
                    { name: 'Una ronda', cost: 0 },
                    { name: 'Tres rondas', cost: 1 },
                    { name: 'Cinco rondas', cost: 2 },
                    { name: '5 minutos', cost: 3 },
                    { name: '10 minutos', cost: 5 },
                    { name: '20 minutos', cost: 8 },
                ]
            }
        ]
    },

    // 4. Efectos de Apoyo
    { 
        id: "ap_bono_tirada", 
        category: "Efectos de Apoyo", 
        name: "Bonificación a tirada", 
        description: "Otorga un bono a una tirada situacional. Ciertas duraciones y bonos tienen restricciones.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.DESTRUCTION], 
        options: [
            { id: 'bonus_select', name: 'Bonificación', type: 'select', values: [
                { name: '+1', cost: 2 }, { name: '+2', cost: 4 }, { name: '+3', cost: 8 }, { name: '+4', cost: 12 }, { name: '+5', cost: 15 }
            ]},
            DURATION_OPTION, 
            SACRIFICE_OPTION
        ] 
    },
    { 
        id: "ap_curacion_fija", 
        category: "Efectos de Apoyo", 
        name: "Curación (Fija)", 
        description: "Recupera una cantidad fija de Resistencia.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION], 
        options: [
            { id: 'heal_select', name: 'Cantidad', type: 'select', values: [
                { name: '3 Resistencia', cost: 3 }, { name: '5 Resistencia', cost: 5 }, { name: '8 Resistencia', cost: 8 }, { name: '12 Resistencia', cost: 12 }, { name: '15 Resistencia', cost: 15 }
            ]},
            SACRIFICE_OPTION
        ] 
    },
    { 
        id: "ap_curacion_variable", 
        category: "Efectos de Apoyo", 
        name: "Curación (Variable)", 
        description: "Recupera una cantidad variable de Resistencia. El bono y penalizador se pueden aplicar varias veces.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION], 
        options: [
            { id: 'heal_select', name: 'Cantidad', type: 'select', values: [
                { name: '1d6', cost: 5 }, { name: '2d6', cost: 7 }, { name: '3d6', cost: 10 }, { name: '4d6', cost: 15 }, { name: '5d6', cost: 18 }
            ]},
            { id: 'bonus_roll', name: 'Bono al resultado', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '+1 al dado', cost: 2 }, { name: '+2 al dado', cost: 4 }, { name: '+3 al dado', cost: 6 }
            ]},
            { id: 'penalty_roll', name: 'Penalizador al resultado', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '-1 al dado', cost: -1 }, { name: '-2 al dado', cost: -2 }, { name: '-3 al dado', cost: -3 }
            ]},
            SACRIFICE_OPTION
        ] 
    },
    {
        id: "ap_absorcion_resistencia",
        category: "Efectos de Apoyo",
        name: "Absorción de Resistencia",
        description: "Recuperas Resistencia igual a una porción del daño infligido.",
        baseCost: 0,
        restrictions: [],
        options: [
            {
                id: 'absorb_select',
                name: 'Cantidad Recuperada',
                type: 'select',
                values: [
                    { name: 'Mitad del daño', cost: 5 },
                    { name: 'Total del daño', cost: 8 },
                    { name: 'Doble del daño', cost: 12 },
                ]
            }
        ]
    },
    { 
        id: "ap_elim_estado", 
        category: "Efectos de Apoyo", 
        name: "Eliminar estado alterado", 
        description: "Intenta eliminar un estado alterado del objetivo.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION, Force.CREATION],
        options: [
            { id: 'remove_select', name: 'Método', type: 'select', values: [
                { name: 'Lanzar contra ND normal', cost: 5 }, { name: 'Lanzar contra mitad de ND', cost: 7 }, { name: 'Eliminar automáticamente', cost: 15 }
            ]},
            { id: 'alt_attribute', name: 'Usar Atributo diferente (+2 PC)', type: 'boolean', cost: 2 },
        ]
    },

    // 5. Efectos de penalización
    { 
        id: "pen_pen_tirada", 
        category: "Efectos de penalización", 
        name: "Penalizador a tirada", 
        description: "Impone un penalizador a una tirada. Penalizadores altos y duraciones tienen restricciones.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.DESTRUCTION],
        options: [
            { id: 'penalty_select', name: 'Penalización', type: 'select', values: [
                { name: '-1', cost: 3 }, { name: '-2', cost: 5 }, { name: '-3', cost: 9 }, { name: '-4', cost: 13 }, { name: '-5', cost: 16 }
            ]},
            DURATION_OPTION,
            SACRIFICE_OPTION
        ]
    },
    { 
        id: "pen_pen_defensa", 
        category: "Efectos de penalización", 
        name: "Penalizador a defensa", 
        description: "Reduce la defensa del objetivo.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION],
        options: [
             { id: 'penalty_select', name: 'Penalización', type: 'select', values: [
                { name: '-1', cost: 2 }, { name: '-2', cost: 4 }, { name: '-3', cost: 8 }, { name: '-4', cost: 12 }, { name: '-5', cost: 15 }
            ]},
            PEN_DEF_DURATION_OPTION,
            SACRIFICE_OPTION
        ]
    },
    {
        id: "pen_estado_alterado",
        category: "Efectos de penalización",
        name: "Imponer Estado Alterado",
        description: "Impone una condición negativa al objetivo, que puede requerir una salvación para ser evitada.",
        baseCost: 0,
        restrictions: [],
        options: [
            {
                id: 'estado_select',
                name: 'Estado a imponer',
                type: 'select',
                values: [
                    { name: 'Envenenado (1d6) (x2)', cost: 10 },
                    { name: 'Envenenado Mayor (2d6) (x2)', cost: 16 },
                    { name: 'Quemado (1d6) (x2)', cost: 10 },
                    { name: 'Quemado Mayor (1d6) (x2)', cost: 16 },
                    { name: 'Asfixiado (x2)', cost: 10 },
                    { name: 'Inmovilizado (x2)', cost: 10 },
                    { name: 'Aturdido (x2)', cost: 16 },
                    { name: 'Asustado (x2)', cost: 16 },
                    { name: 'Encantado (x2)', cost: 16 },
                    { name: 'Controlado (x2)', cost: 20 },
                    { name: 'Dormido (x2)', cost: 10 },
                ]
            },
            {
                id: 'multiple_estados',
                name: 'Múltiples estados',
                type: 'select',
                values: [
                    { name: 'Ninguno', cost: 0 },
                    { name: '2 estados', cost: 3 },
                    { name: '3 estados', cost: 7 },
                    { name: '4 estados', cost: 12 },
                ]
            },
            {
                id: 'estado_duracion',
                name: 'Duración',
                type: 'select',
                values: [
                     { name: 'Una ronda', cost: 0 },
                     { name: 'Tres rondas', cost: 1 },
                     { name: 'Cinco rondas', cost: 2 },
                     { name: '5 minutos (Restr: Cons/Dest)', cost: 5 },
                     { name: '10 minutos (Restr: Cons/Dest)', cost: 8 },
                     { name: '20 minutos (Restr: Cons/Dest)', cost: 12 },
                ]
            },
            {
                id: 'estado_nd',
                name: 'ND de Salvación',
                type: 'select',
                values: [
                    { name: 'Sin salvación', cost: 0 },
                    { name: 'ND 6', cost: 2 },
                    { name: 'ND 9', cost: 4 },
                    { name: 'ND 12', cost: 6 },
                    { name: 'ND 15', cost: 8 },
                    { name: 'ND 18', cost: 12 },
                ]
            }
        ]
    },

    // 6. Convocatoria
    { 
      id: "con_criatura", 
      category: "Convocatoria", 
      name: "Convocar Criatura", 
      description: "Convoca una o más criaturas de un Nivel de Desafío (ND) específico.", 
      baseCost: 0, 
      restrictions: [Force.DESTRUCTION, Force.ORDER],
      options: [
        {
            id: 'nd_select',
            name: 'Nivel de Desafío (ND)',
            type: 'select',
            values: [
                { name: 'ND 1/8', cost: 5 },
                { name: 'ND 1/4', cost: 8 },
                { name: 'ND 1/2', cost: 10 },
                { name: 'ND 1', cost: 12 },
                { name: 'ND 2', cost: 14 },
                { name: 'ND 3', cost: 16 },
                { name: 'ND 4', cost: 18 },
            ]
        },
        {
            id: 'convocatoria_duracion',
            name: 'Duración',
            type: 'select',
            values: [
                { name: 'Tres rondas', cost: 0 },
                { name: 'Cinco rondas', cost: 3 },
                { name: '20 minutos', cost: 5 },
                { name: 'Un día', cost: 8 },
                { name: 'Hasta su cancelación', cost: 10 },
            ]
        },
        {
            id: 'convocatoria_cantidad',
            name: 'Cantidad',
            type: 'select',
            values: [
                { name: '1 criatura', cost: 0 },
                { name: '2 criaturas', cost: 5 },
                { name: '3 criaturas', cost: 10 },
            ]
        }
    ]
    },
    { 
      id: "con_arma_armadura", 
      category: "Convocatoria", 
      name: "Convocar Arma o Armadura", 
      description: "Crea un arma o armadura. Opciones de bonificación, duración y extras tienen restricciones de Fuerza específicas según el manual.",
      baseCost: 0, 
      restrictions: [],
      options: [
        {
            id: 'bono_select',
            name: 'Bonificación',
            type: 'select',
            values: [
                { name: 'Bono +0', cost: 5 },
                { name: 'Bono +1', cost: 8 },
                { name: 'Bono +2', cost: 10 },
                { name: 'Bono +3', cost: 12 },
            ]
        },
        {
            id: 'arma_duracion',
            name: 'Duración',
            type: 'select',
            values: [
                { name: 'Tres rondas', cost: 0 },
                { name: 'Cinco rondas', cost: 2 },
                { name: '20 minutos', cost: 4 },
                { name: 'Un día', cost: 6 },
                { name: 'Hasta su cancelación', cost: 8 },
            ]
        },
        {
            id: 'opcional_elemental',
            name: 'Atributo Elemental (+3 PC)',
            type: 'boolean',
            cost: 3,
        },
        {
            id: 'opcional_arma_extra',
            name: 'Arma Extra (+3 PC)',
            type: 'boolean',
            cost: 3
        },
        {
            id: 'opcional_ignorar_req',
            name: 'Ignorar Requisitos (+5 PC)',
            type: 'boolean',
            cost: 5
        }
      ]
    },

    // 7. Efectos Varios
    {
        id: "var_ilusion",
        category: "Efectos Varios",
        name: "Ilusión",
        description: "Crea una ilusión que afecta uno o más sentidos. Puede tener una salvación para ser desacreditada.",
        baseCost: 0,
        restrictions: [],
        options: [
            {
                id: 'ilusion_type',
                name: 'Tipo de Ilusión',
                type: 'select',
                values: [
                    { name: 'Ilusión Olfativa', cost: 3 },
                    { name: 'Ilusión Visual', cost: 3 },
                    { name: 'Ilusión Táctil', cost: 3 },
                    { name: 'Ilusión Completa', cost: 7 },
                ]
            },
            {
                id: 'ilusion_duration',
                name: 'Duración',
                type: 'select',
                values: [
                     { name: 'Una ronda', cost: 0 },
                     { name: 'Tres rondas', cost: 1 },
                     { name: 'Cinco rondas', cost: 2 },
                     { name: '5 minutos (Restr: Cons/Dest)', cost: 5 },
                     { name: '10 minutos (Restr: Cons/Dest)', cost: 8 },
                     { name: '20 minutos (Restr: Cons/Dest)', cost: 12 },
                ]
            },
            {
                id: 'ilusion_nd',
                name: 'ND de Salvación',
                type: 'select',
                values: [
                    { name: 'Sin salvación', cost: 0 },
                    { name: 'ND 6', cost: 0 },
                    { name: 'ND 9', cost: 2 },
                    { name: 'ND 12', cost: 4 },
                    { name: 'ND 15', cost: 6 },
                ]
            }
        ]
    },
    {
        id: "var_uso_indirecto",
        category: "Efectos Varios",
        name: "Uso Indirecto",
        description: "La técnica se origina desde otro elemento (nube, espinas del suelo, etc), no desde el usuario. El coste depende del nivel de la técnica.",
        baseCost: 0,
        restrictions: [Force.TRANSFORMATION],
        options: [
             {
                id: 'indirect_use_level',
                name: 'Nivel de la técnica',
                type: 'select',
                values: [
                    { name: 'Nivel Apoyo', cost: 2 },
                    { name: 'Nivel 1', cost: 4 },
                    { name: 'Nivel 2', cost: 6 },
                    { name: 'Nivel 3', cost: 8 },
                ]
            }
        ]
    },
    {
        id: "var_accion_extra",
        category: "Efectos Varios",
        name: "Acción Adicional",
        description: "Gana acciones adicionales este turno. Algunas opciones tienen restricciones de Fuerza.",
        baseCost: 0,
        restrictions: [],
        options: [
             {
                id: 'extra_action_type',
                name: 'Tipo de Acción Extra',
                type: 'select',
                values: [
                    { name: 'Moverse dos veces', cost: 3 },
                    { name: 'Moverse tres veces (Restr: Orden)', cost: 6 },
                    { name: 'Acción Adicional', cost: 6 },
                    { name: 'Turno adicional (Restr: Orden)', cost: 12 },
                ]
            }
        ]
    },
    

    // 8. Desventajas
    { 
        id: "des_agotamiento", 
        category: "Desventajas", 
        name: "Desventaja: Agotamiento", 
        description: "Tras usarla, no puedes moverte ni atacar por un número de rondas.", 
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'exhaust_select', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: -5 }, { name: '2 rondas', cost: -10 }, { name: '3 rondas', cost: -15 }
            ]}
        ]
    },
    {
        id: "des_atadura",
        category: "Desventajas",
        name: "Desventaja: Atadura",
        description: "Requiere usar un objeto o arma para ejecutar la técnica. Restricción de Fuerza: Transformación.",
        baseCost: 0,
        restrictions: [Force.TRANSFORMATION],
        options: [
            {
                id: 'tether_type',
                name: 'Tipo de Atadura',
                type: 'select',
                values: [
                    { name: 'Objeto Tótem', cost: -5 },
                    { name: 'Empuñar Arma Genérica', cost: -5 },
                    { name: 'Empuñar Arma Específica', cost: -10 },
                    { name: 'Usar Armadura o escudo genérico', cost: -2 },
                    { name: 'Usar armadura o escudo específico', cost: -5 },
                ]
            }
        ]
    },
    { ...circumstanceDisadvantage, id: 'des_circunstancia_1', name: 'Desventaja: Circunstancia 1' },
    { ...circumstanceDisadvantage, id: 'des_circunstancia_2', name: 'Desventaja: Circunstancia 2' },
    { ...circumstanceDisadvantage, id: 'des_circunstancia_3', name: 'Desventaja: Circunstancia 3' },
    { ...penalizadorDisadvantage, id: 'des_penalizador_1', name: 'Desventaja: Penalizador 1' },
    { ...penalizadorDisadvantage, id: 'des_penalizador_2', name: 'Desventaja: Penalizador 2' },
    { ...penalizadorDisadvantage, id: 'des_penalizador_3', name: 'Desventaja: Penalizador 3' },
];