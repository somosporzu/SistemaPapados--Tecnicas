import { PowerLevel, Force, type Effect, type Technique, type EffectOption } from './types';

export const POWER_LEVELS: Record<PowerLevel, { resistanceCost: number, pcBudget: number }> = {
  [PowerLevel.SUPPORT]: { resistanceCost: 1, pcBudget: 5 },
  [PowerLevel.LEVEL_1]: { resistanceCost: 2, pcBudget: 10 },
  [PowerLevel.LEVEL_2]: { resistanceCost: 4, pcBudget: 15 },
  [PowerLevel.LEVEL_3]: { resistanceCost: 6, pcBudget: 25 },
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
    "Efectos de Dominio",
    "Desventajas"
];

// Reusable Effect Options
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

const SACRIFICE_OPTION: EffectOption = {
    id: 'sacrifice',
    name: 'Sacrificio (+5 PC)',
    description: 'El personaje puede sacrificar X resistencia para sumar X al bono.',
    type: 'boolean',
    cost: 5,
};

export const EFFECTS: Effect[] = [
    // 1. Efectos ofensivos
    { 
        id: "of_bono_ataque", 
        category: "Efectos ofensivos", 
        name: "Bono a la tirada de ataque", 
        description: "Otorga un bono a la tirada de ataque.", 
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
        description: "Añade un bono al daño de la técnica.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.CREATION, Force.ORDER], 
        options: [
            { id: 'bonus_select', name: 'Bonificación', type: 'select', values: [
                { name: '+1', cost: 2 }, { name: '+2', cost: 4 }, { name: '+3', cost: 8 }, { name: '+4', cost: 12 }, { name: '+5', cost: 15 }
            ]},
            { id: 'all_attacks', name: 'A todos los ataques del turno (+5 PC)', type: 'boolean', cost: 5 },
            SACRIFICE_OPTION,
            DURATION_PER_TURN_OPTION(2),
            { id: 'different_damage_type', name: 'Tipo de daño diferente (+3 PC)', type: 'boolean', cost: 3 }
        ] 
    },
    {
        id: "of_multiplicador",
        category: "Efectos ofensivos",
        name: "Multiplicador de Daño",
        description: "SECCIÓN ESPECIAL: Multiplica el daño base. No acumulable con Bonos al Daño.",
        baseCost: 0,
        restrictions: [Force.CONSERVATION, Force.CREATION, Force.ORDER],
        options: [
            { id: 'mult_select', name: 'Multiplicador', type: 'select', values: [
                { name: 'x2', cost: 12 }, { name: 'x3', cost: 20 }, { name: 'x4 (Solo Nivel 3)', cost: 25 }
            ]},
            { id: 'all_attacks_mult', name: 'A todos los ataques del turno (+8 PC)', type: 'boolean', cost: 8 },
            { id: 'mult_extra_duration', name: 'Mantener multiplicador turnos extra', type: 'select', values: [
                { name: 'Duración base (1 turno)', cost: 0 }, { name: '+1 turno extra (+4 PC)', cost: 4 }, { name: '+2 turnos extra (+8 PC)', cost: 8 }
            ]}
        ]
    },
    {
        id: "of_proyectil_magico",
        category: "Efectos ofensivos",
        name: "Proyectil Mágico",
        description: "Ataque a distancia independiente del arma.",
        baseCost: 0,
        restrictions: [], // Required: Transformation, Creation, Chaos logic usually handled via concepts
        options: [
            { id: 'proj_damage', name: 'Daño del Proyectil', type: 'select', values: [
                { name: '1d6-2', cost: 3 }, { name: '1d6-1', cost: 5 }, { name: '1d6', cost: 7 }, { name: '1d6+1', cost: 9 }, { name: '2d6-1', cost: 12 }, { name: '2d6', cost: 15 }, { name: '2d6+1', cost: 18 }
            ]},
            { id: 'proj_range', name: 'Alcance', type: 'select', values: [
                { name: '10 metros', cost: 0 }, { name: '15 metros', cost: 2 }, { name: '20 metros', cost: 4 }, { name: '30 metros', cost: 6 }
            ]},
            { id: 'proj_targets', name: 'Objetivos Extras', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '+1 objetivo', cost: 4 }, { name: '+2 objetivos', cost: 7 }, { name: '+3 objetivos', cost: 12 }
            ]},
            { id: 'no_lov', name: 'Sin línea de visión (+5 PC)', type: 'boolean', cost: 5 },
            { id: 'proj_projection', name: 'Proyección (+3 PC)', type: 'boolean', cost: 3 }
        ]
    },
    { 
        id: "of_distancia", 
        category: "Efectos ofensivos", 
        name: "Ataque a Distancia (Arma)", 
        description: "Permite usar el arma a distancia.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'dist_select', name: 'Distancia', type: 'select', values: [
                { name: '5 metros', cost: 2 }, { name: '10 metros', cost: 4 }, { name: '15 metros', cost: 6 }, { name: '20 metros', cost: 8 }
            ]},
            { id: 'dist_targets', name: 'Objetivos Extras', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '+1 objetivo', cost: 4 }, { name: '+2 objetivos', cost: 7 }, { name: '+3 objetivos', cost: 12 }
            ]},
            { id: 'no_lov_weapon', name: 'Sin línea de visión (+6 PC)', type: 'boolean', cost: 6 },
            { id: 'dist_projection', name: 'Proyección (+4 PC)', type: 'boolean', cost: 4 },
            { id: 'destruction_wake', name: 'Estela de destrucción (+8 PC)', type: 'boolean', cost: 8 }
        ]
    },
    { 
        id: "of_area", 
        category: "Efectos ofensivos", 
        name: "Ataque de Área", 
        description: "Afecta un área determinada.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'area_radius', name: 'Radio del Área', type: 'select', values: [
                { name: '1 metro', cost: 2 }, { name: '5 metros', cost: 3 }, { name: '10 metros', cost: 5 }, { name: '15 metros', cost: 9 }, { name: '20 metros', cost: 15 }
            ]},
            { id: 'area_shape', name: 'Forma del Área', type: 'select', values: [
                { name: 'Círculo', cost: 0 }, { name: 'Cono', cost: -1 }, { name: 'Línea', cost: -2 }, { name: 'Cubo', cost: 2 }
            ]},
            { id: 'selective_area', name: 'Elección de objetivos (+5 PC)', type: 'boolean', cost: 5 }
        ]
    },
    { 
        id: "of_ataque_extra", 
        category: "Efectos ofensivos", 
        name: "Ataque Extra", 
        description: "Ataques adicionales este turno.", 
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'extra_attacks', name: 'Ataques', type: 'select', values: [
                { name: '+1 ataque', cost: 3 }, { name: '+2 ataques', cost: 6 }, { name: '+3 ataques', cost: 9 }, { name: '+4 ataques', cost: 12 }
            ]},
            { id: 'extra_attacks_duration', name: 'Turnos extra', type: 'select', values: [
                { name: '1 turno', cost: 0 }, { name: '+1 turno (+3 PC)', cost: 3 }, { name: '+2 turnos (+6 PC)', cost: 6 }, { name: '+3 turnos (+9 PC)', cost: 9 }
            ]}
        ]
    },
    {
        id: "of_dano_continuo",
        category: "Efectos ofensivos",
        name: "Daño Continuo",
        description: "Daño por ronda.",
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.CREATION],
        options: [
            { id: 'dot_damage', name: 'Daño/Ronda', type: 'select', values: [
                { name: '1 Daño', cost: 3 }, { name: '3 Daño', cost: 5 }, { name: '6 Daño', cost: 10 }, { name: '9 Daño', cost: 15 }
            ]},
            { id: 'dot_duration', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 3 }, { name: '5 rondas', cost: 6 }
            ]},
            SACRIFICE_OPTION
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
            { id: 'def_bonus', name: 'Bonificación', type: 'select', values: [
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
        description: "Ataque reactivo.",
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'counter_type', name: 'Tipo', type: 'select', values: [
                { name: 'Normal', cost: 5 }, { name: 'Bono +1', cost: 7 }, { name: 'Bono +2', cost: 9 }, { name: 'Bono +3', cost: 11 }
            ]},
            { id: 'counter_dmg', name: 'Reemplazo Daño', type: 'select', values: [
                { name: 'Sin reemplazo', cost: 0 }, { name: 'Mitad daño recibido', cost: 5 }, { name: 'Todo el daño recibido', cost: 10 }
            ]}
        ]
    },
    { 
        id: "def_def_predeterminada", 
        category: "Efectos defensivos", 
        name: "Defensa Predeterminada", 
        description: "Valor fijo de defensa.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
             { id: 'def_fixed', name: 'Valor', type: 'select', values: [
                { name: 'Defensa 12', cost: 6 }, { name: 'Defensa 14', cost: 10 }, { name: 'Defensa 16', cost: 15 }
            ]},
            { id: 'def_fixed_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ] 
    },
    {
        id: "def_resistencia_tipo",
        category: "Efectos defensivos",
        name: "Resistencia a Daño",
        description: "Protección contra tipos de daño.",
        baseCost: 0,
        restrictions: [Force.DESTRUCTION],
        options: [
            { id: 'prot_level', name: 'Nivel', type: 'select', values: [
                { name: 'Resistencia', cost: 5 }, { name: 'Inmunidad', cost: 12 }
            ]},
            { id: 'prot_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ]
    },

    // 3. Efectos de Movimiento
    { 
        id: "mov_bono_mov", 
        category: "Efectos de Movimiento", 
        name: "Bono al movimiento", 
        description: "Aumenta distancia.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'mov_dist', name: 'Extra', type: 'select', values: [
                { name: '+3m', cost: 1 }, { name: '+6m', cost: 3 }, { name: '+9m', cost: 6 }
            ]},
            { id: 'mov_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ] 
    },
    { 
        id: "mov_instantaneo", 
        category: "Efectos de Movimiento", 
        name: "Movimiento Instantáneo", 
        description: "Desplazamiento rápido.", 
        baseCost: 0, 
        restrictions: [], 
        options: [
            { id: 'mov_inst_dist', name: 'Distancia', type: 'select', values: [
                { name: '5m', cost: 3 }, { name: '10m', cost: 6 }, { name: '15m', cost: 9 }
            ]},
            { id: 'teleport', name: 'Teletransportación (+5 PC)', type: 'boolean', cost: 5 }
        ] 
    },
     {
        id: "mov_especial",
        category: "Efectos de Movimiento",
        name: "Movimiento Especial",
        description: "Vuelo, levitar, etc.",
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'mov_spec_type', name: 'Tipo', type: 'select', values: [
                { name: 'Levitar', cost: 3 }, { name: 'Vuelo (Orden)', cost: 5 }, { name: 'Anfibio', cost: 3 }, { name: 'Acuático (Orden)', cost: 5 }, { name: 'Subterráneo Menor (Orden)', cost: 3 }, { name: 'Subterráneo Mayor (Orden)', cost: 5 }, { name: 'Incorpóreo (Caos/Cons/Dest)', cost: 5 }
            ]},
            { id: 'mov_spec_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ]
    },

    // 4. Efectos de Apoyo
    { 
        id: "ap_bono_tirada", 
        category: "Efectos de Apoyo", 
        name: "Bonificación a tirada", 
        description: "Situacional.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.DESTRUCTION], 
        options: [
            { id: 'roll_bonus', name: 'Bono', type: 'select', values: [
                { name: '+1', cost: 2 }, { name: '+2', cost: 4 }, { name: '+3', cost: 8 }, { name: '+4', cost: 12 }, { name: '+5', cost: 15 }
            ]},
            { id: 'roll_bonus_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]},
            SACRIFICE_OPTION
        ] 
    },
    { 
        id: "ap_curacion_fija", 
        category: "Efectos de Apoyo", 
        name: "Curación (Fija)", 
        description: "Recupera resistencia.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION], 
        options: [
            { id: 'heal_fixed', name: 'Cantidad', type: 'select', values: [
                { name: '3 Res', cost: 3 }, { name: '5 Res', cost: 5 }, { name: '8 Res', cost: 8 }, { name: '12 Res', cost: 12 }, { name: '15 Res', cost: 15 }
            ]},
            SACRIFICE_OPTION
        ] 
    },
    { 
        id: "ap_curacion_variable", 
        category: "Efectos de Apoyo", 
        name: "Curación (Variable)", 
        description: "Dados de recuperación.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION], 
        options: [
            { id: 'heal_var', name: 'Dados', type: 'select', values: [
                { name: '1d6', cost: 5 }, { name: '2d6', cost: 7 }, { name: '3d6', cost: 10 }, { name: '4d6', cost: 15 }, { name: '5d6', cost: 18 }
            ]},
            { id: 'heal_roll_bonus', name: 'Bono al resultado', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '+1', cost: 2 }, { name: '+2', cost: 4 }, { name: '+3', cost: 6 }
            ]},
            { id: 'heal_roll_pen', name: 'Penalizador', type: 'select', values: [
                { name: 'Ninguno', cost: 0 }, { name: '-1', cost: -1 }, { name: '-2', cost: -2 }, { name: '-3', cost: -3 }
            ]},
            SACRIFICE_OPTION
        ] 
    },
    {
        id: "ap_absorcion_resistencia",
        category: "Efectos de Apoyo",
        name: "Absorción de Resistencia",
        description: "Drenaje de vida.",
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'absorb_lvl', name: 'Nivel', type: 'select', values: [
                { name: 'Mitad daño', cost: 5 }, { name: 'Total daño', cost: 8 }, { name: 'Doble daño', cost: 12 }
            ]}
        ]
    },
    { 
        id: "ap_elim_estado", 
        category: "Efectos de Apoyo", 
        name: "Eliminar estado alterado", 
        description: "Limpieza.", 
        baseCost: 0, 
        restrictions: [Force.DESTRUCTION, Force.CREATION],
        options: [
            { id: 'rem_method', name: 'Método', type: 'select', values: [
                { name: 'ND normal', cost: 5 }, { name: 'Mitad ND', cost: 7 }, { name: 'Automático', cost: 15 }
            ]},
            { id: 'alt_attr', name: 'Atributo diferente (+2 PC)', type: 'boolean', cost: 2 }
        ]
    },

    // 5. Efectos de penalización
    { 
        id: "pen_pen_tirada", 
        category: "Efectos de penalización", 
        name: "Penalizador a tirada", 
        description: "Debilitamiento.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION, Force.DESTRUCTION],
        options: [
            { id: 'pen_roll_val', name: 'Penalización', type: 'select', values: [
                { name: '-1', cost: 3 }, { name: '-2', cost: 5 }, { name: '-3', cost: 9 }, { name: '-4', cost: 13 }, { name: '-5', cost: 16 }
            ]},
            { id: 'pen_roll_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]},
            SACRIFICE_OPTION
        ]
    },
    { 
        id: "pen_pen_defensa", 
        category: "Efectos de penalización", 
        name: "Penalizador a defensa", 
        description: "Ruptura de guardia.", 
        baseCost: 0, 
        restrictions: [Force.CONSERVATION],
        options: [
             { id: 'pen_def_val', name: 'Penalización', type: 'select', values: [
                { name: '-1', cost: 2 }, { name: '-2', cost: 4 }, { name: '-3', cost: 8 }, { name: '-4', cost: 12 }, { name: '-5', cost: 15 }
            ]},
            { id: 'pen_def_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 3 }, { name: '5 rondas', cost: 6 }
            ]},
            SACRIFICE_OPTION
        ]
    },
    {
        id: "pen_estado_alterado",
        category: "Efectos de penalización",
        name: "Imponer Estado Alterado",
        description: "Estados negativos.",
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'estado_select', name: 'Estado', type: 'select', values: [
                { name: 'Envenenado', cost: 6 }, { name: 'Envenenado Mayor', cost: 10 }, { name: 'Quemado', cost: 6 }, { name: 'Quemado Mayor', cost: 10 }, { name: 'Asfixiado', cost: 15 }, { name: 'Inmovilizado', cost: 6 }, { name: 'Aturdido', cost: 10 }, { name: 'Asustado', cost: 10 }, { name: 'Encantado', cost: 10 }, { name: 'Controlado', cost: 12 }, { name: 'Dormido', cost: 6 }, { name: 'Cegado', cost: 8 }, { name: 'Ensordecido', cost: 4 }
            ]},
            { id: 'multiple_estados', name: 'Cantidad de estados', type: 'select', values: [
                { name: '1 estado', cost: 0 }, { name: '2 estados', cost: 3 }, { name: '3 estados', cost: 7 }, { name: '4 estados', cost: 12 }
            ]},
            { id: 'estado_nd', name: 'ND Salvación', type: 'select', values: [
                { name: 'Sin salvación', cost: 0 }, { name: 'ND 6', cost: 2 }, { name: 'ND 9', cost: 4 }, { name: 'ND 12', cost: 6 }, { name: 'ND 15', cost: 8 }, { name: 'ND 18', cost: 12 }
            ]},
            { id: 'estado_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 5 }, { name: '10 min', cost: 8 }, { name: '20 min', cost: 12 }
            ]}
        ]
    },

    // 6. Convocatoria
    { 
      id: "con_criatura", 
      category: "Convocatoria", 
      name: "Convocar Criatura", 
      description: "Invocación.", 
      baseCost: 0, 
      restrictions: [Force.DESTRUCTION, Force.ORDER],
      options: [
        { id: 'nd_val', name: 'ND', type: 'select', values: [
            { name: 'ND 1/8', cost: 4 }, { name: 'ND 1/4', cost: 6 }, { name: 'ND 1/2', cost: 8 }, { name: 'ND 1', cost: 10 }, { name: 'ND 2', cost: 13 }, { name: 'ND 3', cost: 16 }, { name: 'ND 4 (Nivel 3)', cost: 20 }
        ]},
        { id: 'conv_count', name: 'Cantidad', type: 'select', values: [
            { name: '1 criatura', cost: 0 }, { name: '2 criaturas', cost: 4 }, { name: '3 criaturas', cost: 8 }
        ]},
        { id: 'conv_dur', name: 'Duración', type: 'select', values: [
            { name: '3 rondas', cost: 0 }, { name: '5 rondas', cost: 2 }, { name: '20 min', cost: 4 }, { name: '1 día', cost: 6 }, { name: 'Permanente', cost: 8 }
        ]}
    ]
    },
    { 
      id: "con_arma_armadura", 
      category: "Convocatoria", 
      name: "Convocar Arma/Armadura", 
      description: "Creación temporal.", 
      baseCost: 0, 
      restrictions: [],
      options: [
        { id: 'equip_bonus', name: 'Bono', type: 'select', values: [
            { name: 'Bono +0', cost: 4 }, { name: 'Bono +1', cost: 6 }, { name: 'Bono +2', cost: 9 }, { name: 'Bono +3', cost: 12 }
        ]},
        { id: 'equip_dur', name: 'Duración', type: 'select', values: [
            { name: '3 rondas', cost: 0 }, { name: '5 rondas', cost: 1 }, { name: '20 min', cost: 3 }, { name: '1 día', cost: 5 }, { name: 'Permanente', cost: 7 }
        ]},
        { id: 'elemental_equip', name: 'Elemental (+2 PC)', type: 'boolean', cost: 2 },
        { id: 'extra_weapon', name: 'Arma Extra (+3 PC)', type: 'boolean', cost: 3 },
        { id: 'ignore_req', name: 'Ignorar Requisitos (+4 PC)', type: 'boolean', cost: 4 }
      ]
    },

    // 7. Efectos Varios
    {
        id: "var_ilusion",
        category: "Efectos Varios",
        name: "Ilusión",
        description: "Engaño visual/auditivo.",
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'ilu_type', name: 'Tipo', type: 'select', values: [
                { name: 'Olfativa', cost: 3 }, { name: 'Visual', cost: 3 }, { name: 'Táctil', cost: 3 }, { name: 'Auditiva', cost: 3 }, { name: 'Completa', cost: 7 }
            ]},
            { id: 'ilu_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 5 }, { name: '10 min', cost: 8 }, { name: '20 min', cost: 12 }
            ]},
            { id: 'ilu_nd', name: 'ND Desacreditar', type: 'select', values: [
                { name: 'Sin salvación', cost: 0 }, { name: 'ND 6', cost: 0 }, { name: 'ND 9', cost: 2 }, { name: 'ND 12', cost: 4 }, { name: 'ND 15', cost: 6 }
            ]}
        ]
    },
    {
        id: "var_uso_indirecto",
        category: "Efectos Varios",
        name: "Uso Indirecto",
        description: "Origen desde otro elemento.",
        baseCost: 0, 
        restrictions: [], // Required: Transformation, Creation
        options: [
             { id: 'ind_lvl', name: 'Nivel Técnica', type: 'select', values: [
                { name: 'Nivel 0', cost: 2 }, { name: 'Nivel 1', cost: 4 }, { name: 'Nivel 2', cost: 6 }, { name: 'Nivel 3', cost: 8 }
            ]},
            { id: 'ind_persist', name: 'Manifestación Persistente', type: 'select', values: [
                { name: 'Instantánea', cost: 0 }, { name: '+1 turno (+3 PC)', cost: 3 }, { name: '+2 turnos (+6 PC)', cost: 6 }, { name: '+3 turnos (+9 PC)', cost: 9 }
            ]}
        ]
    },
    {
        id: "var_como_reaccion",
        category: "Efectos Varios",
        name: "Como Reacción",
        description: "Solo para Nivel 0 y 1.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'react_lvl', name: 'Nivel Técnica', type: 'select', values: [
                { name: 'Nivel 0', cost: 3 }, { name: 'Nivel 1', cost: 5 }
            ]}
        ]
    },
    {
        id: "var_accion_rapida",
        category: "Efectos Varios",
        name: "Acción Rápida",
        description: "Conversión de tiempo de uso.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'quick_lvl', name: 'Nivel Técnica', type: 'select', values: [
                { name: 'Nivel 0', cost: 2 }, { name: 'Nivel 1', cost: 5 }, { name: 'Nivel 2', cost: 7 }, { name: 'Nivel 3', cost: 10 }
            ]}
        ]
    },
    {
        id: "var_comunicacion_mental",
        category: "Efectos Varios",
        name: "Comunicación Mental",
        description: "Telepatía.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'tele_range', name: 'Alcance', type: 'select', values: [
                { name: '10m', cost: 2 }, { name: '100m', cost: 4 }, { name: '1km', cost: 6 }, { name: 'Plano', cost: 10 }
            ]},
            { id: 'tele_targets', name: 'Objetivos', type: 'select', values: [
                { name: '1 objetivo', cost: 0 }, { name: 'Hasta 3', cost: 3 }, { name: 'Hasta 5', cost: 5 }
            ]},
            { id: 'tele_dur', name: 'Duración', type: 'select', values: [
                { name: '1 min', cost: 0 }, { name: '10 min', cost: 2 }, { name: '1 hora', cost: 4 }
            ]},
            { id: 'tele_bi', name: 'Bidireccional (+3 PC)', type: 'boolean', cost: 3 }
        ]
    },
    {
        id: "var_sentidos_agudizados",
        category: "Efectos Varios",
        name: "Sentidos Agudizados",
        description: "Mejora perceptiva.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'sense_type', name: 'Tipo', type: 'select', values: [
                { name: 'Visión Oscuridad', cost: 3 }, { name: 'Oído Agudo', cost: 2 }, { name: 'Olfato Agudo', cost: 4 }, { name: 'Telescópica', cost: 3 }, { name: 'Percepción Sísmica', cost: 5 }
            ]},
            { id: 'sense_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ]
    },

    // 8. Efectos de Dominio
    {
        id: "dom_terreno",
        category: "Efectos de Dominio",
        name: "Dominio del Terreno",
        description: "Control físico.",
        baseCost: 0,
        restrictions: [],
        options: [
             { id: 'terr_eff', name: 'Efecto', type: 'select', values: [
                { name: 'Terreno Difícil', cost: 3 }, { name: 'Peligroso', cost: 6 }, { name: 'Intransitable', cost: 10 }
            ]},
            { id: 'terr_rad', name: 'Radio', type: 'select', values: [
                { name: '5m', cost: 3 }, { name: '10m', cost: 6 }, { name: '20m', cost: 9 }
            ]},
            { id: 'terr_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ]
    },
    {
        id: "dom_presencia",
        category: "Efectos de Dominio",
        name: "Presencia Avasalladora",
        description: "Carga mental.",
        baseCost: 0,
        restrictions: [],
        options: [
             { id: 'pres_eff', name: 'Efecto', type: 'select', values: [
                { name: 'Miedo', cost: 5 }, { name: 'Parálisis', cost: 10 }, { name: 'Sumisión', cost: 15 }
            ]},
            { id: 'pres_target', name: 'Objetivos', type: 'select', values: [
                { name: 'Un objetivo', cost: 0 }, { name: 'Hasta 3', cost: 5 }, { name: 'Todos en 10m', cost: 10 }
            ]},
            { id: 'pres_sel', name: 'Selectividad (+3 PC)', type: 'boolean', cost: 3 },
            { id: 'pres_dur', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: 0 }, { name: '3 rondas', cost: 1 }, { name: '5 rondas', cost: 2 }, { name: '5 min', cost: 3 }, { name: '10 min', cost: 5 }, { name: '20 min', cost: 8 }
            ]}
        ]
    },
    

    // 9. Desventajas
    { 
        id: "des_agotamiento", 
        category: "Desventajas", 
        name: "Agotamiento", 
        description: "Incapacidad post-uso.", 
        baseCost: 0, 
        restrictions: [],
        options: [
            { id: 'exh_val', name: 'Duración', type: 'select', values: [
                { name: '1 ronda', cost: -4 }, { name: '2 rondas', cost: -8 }, { name: '3 rondas', cost: -12 }
            ]}
        ]
    },
    {
        id: "des_fatiga",
        category: "Desventajas",
        name: "Fatiga",
        description: "Penalizador acumulativo.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'fat_val', name: 'Niveles', type: 'select', values: [
                { name: '1 nivel', cost: -3 }, { name: '2 niveles', cost: -6 }, { name: '3 niveles', cost: -9 }
            ]}
        ]
    },
    {
        id: "des_atadura",
        category: "Desventajas",
        name: "Atadura",
        description: "Requisito de equipamiento.",
        baseCost: 0, 
        restrictions: [Force.TRANSFORMATION],
        options: [
            { id: 'teth_type', name: 'Tipo', type: 'select', values: [
                { name: 'Objeto Tótem', cost: -4 }, { name: 'Arma Genérica', cost: -3 }, { name: 'Arma Específica', cost: -6 }, { name: 'Escudo Genérico', cost: -2 }, { name: 'Escudo Específico', cost: -4 }, { name: 'Consumir Material', cost: -3 }
            ]}
        ]
    },
    {
        id: "des_circunstancia",
        category: "Desventajas",
        name: "Circunstancia",
        description: "Limitación situacional.",
        baseCost: 0, 
        restrictions: [Force.TRANSFORMATION],
        options: [
            { id: 'circ_type', name: 'Situación', type: 'select', values: [
                { name: 'Mitad Resistencia', cost: -4 }, { name: 'Estado alterado', cost: -3 }, { name: 'Arma envainada', cost: -2 }, { name: 'Volando', cost: -3 }, { name: 'Sobre montura', cost: -3 }, { name: 'Día', cost: -4 }, { name: 'Noche', cost: -4 }, { name: 'Terreno específico', cost: -4 }, { name: 'Contra criatura específica', cost: -4 }, { name: 'Aliado cerca', cost: -3 }
            ]}
        ]
    },
    {
        id: "des_penalizador",
        category: "Desventajas",
        name: "Efectos Negativos Post-Uso",
        description: "Consecuencias inmediatas.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'neg_type', name: 'Efecto', type: 'select', values: [
                { name: 'Penalizador Acción -1', cost: -2 }, { name: 'Penalizador Acción -2', cost: -3 }, { name: 'Penalizador Acción -3', cost: -4 }, { name: 'Sufre Estado Alterado', cost: -3 }, { name: 'Pérdida Sentido', cost: -4 }, { name: 'Defensa mitad', cost: -4 }, { name: 'Defensa 0', cost: -6 }, { name: 'Sobrecarga menor', cost: -3 }, { name: 'Sobrecarga mayor', cost: -5 }, { name: 'Movimiento mitad', cost: -2 }, { name: 'Sin Reacciones', cost: -3 }
            ]}
        ]
    },
    {
        id: "des_tiempo_carga",
        category: "Desventajas",
        name: "Tiempo de Carga",
        description: "Preparación previa.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'charge_val', name: 'Requisito', type: 'select', values: [
                { name: 'Acción Rápida previa', cost: -3 }, { name: 'Acción Principal previa', cost: -5 }, { name: '2 turnos preparación', cost: -8 }
            ]}
        ]
    },
    {
        id: "des_dano_propio",
        category: "Desventajas",
        name: "Daño Propio",
        description: "Sacrificio de vitalidad.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'self_dmg', name: 'Daño Recibido', type: 'select', values: [
                { name: '1d6 daño', cost: -3 }, { name: '2d6 daño', cost: -5 }, { name: '3d6 daño', cost: -7 }, { name: 'Mitad Resistencia actual', cost: -10 }
            ]}
        ]
    },
    {
        id: "des_alcance_limitado",
        category: "Desventajas",
        name: "Alcance Limitado",
        description: "Solo para distancia/área.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'range_lim', name: 'Restricción', type: 'select', values: [
                { name: 'Alcance mitad', cost: -2 }, { name: 'Toque (Cuerpo a cuerpo)', cost: -4 }, { name: 'Área mitad', cost: -3 }
            ]}
        ]
    },
    {
        id: "des_predecible",
        category: "Desventajas",
        name: "Predecible",
        description: "Señales claras.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'pred_val', name: 'Efecto', type: 'select', values: [
                { name: 'Ventaja en salvaciones rival', cost: -4 }, { name: '+2 Defensa rival', cost: -3 }, { name: 'Anunciar objetivo', cost: -2 }
            ]}
        ]
    },
    {
        id: "des_inestable",
        category: "Desventajas",
        name: "Inestable",
        description: "Solo para Caos.",
        baseCost: 0,
        restrictions: [], // Required: Chaos
        options: [
            { id: 'inst_val', name: 'Efecto', type: 'select', values: [
                { name: '1d6: 1 falla', cost: -3 }, { name: '1d6: 1-2 falla', cost: -5 }, { name: '1d6: 1 afecta aliado', cost: -4 }
            ]}
        ]
    },
    {
        id: "des_sacrificio_req",
        category: "Desventajas",
        name: "Requisito de Sacrificio",
        description: "Algo más que resistencia.",
        baseCost: 0,
        restrictions: [],
        options: [
            { id: 'sac_val', name: 'Sacrificio', type: 'select', values: [
                { name: 'Objeto de valor', cost: -3 }, { name: 'Sangre propia (1 daño)', cost: -2 }, { name: 'Descalzo', cost: -1 }, { name: 'Pronunciar invocación', cost: -2 }
            ]}
        ]
    }
];