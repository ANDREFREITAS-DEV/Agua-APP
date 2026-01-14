/**
 * AquaHabit V2 - Constants
 * Centraliza configurações, regras de negócio e catálogo de itens.
 */

// Configurações Globais do App
export const APP_CONFIG = Object.freeze({
    DEFAULT_GOAL: 2500,       // Meta padrão em ml
    MIN_ML_INPUT: 50,         // Mínimo para registrar (exceto remédio)
    MAX_ML_INPUT: 2000,       // Trava de segurança para erros de digitação
    ANIMATION_DURATION: 300,  // ms
    STORAGE_KEYS: {
        DATA: 'aquahabit_data',
        SETTINGS: 'aquahabit_settings'
    }
});

/**
 * CATÁLOGO DE ENTRADAS
 * Define tipos, ícones, cores e, principalmente, a matemática de hidratação.
 * * factor: Multiplicador de hidratação (1.0 = 100%, 0.85 = 85%).
 * unit: 'ml' para líquidos, 'un' para cápsulas/comprimidos.
 * requiresCustomLabel: Se true, a UI deve pedir um nome (ex: "Qual remédio?").
 */
export const ENTRY_TYPES = Object.freeze({
    water: {
        id: 'water',
        label: 'Água',
        icon: '💧',
        factor: 1.0,
        unit: 'ml',
        color: 'var(--color-water, #3B82F6)', // Fallback azul
        defaultAmount: 200
    },
    coffee: {
        id: 'coffee',
        label: 'Café',
        icon: '☕',
        factor: 0.85, // Diurético leve
        unit: 'ml',
        color: 'var(--color-coffee, #8D6E63)',
        defaultAmount: 100
    },
    tea: {
        id: 'tea',
        label: 'Chá',
        icon: '🍵',
        factor: 0.95,
        unit: 'ml',
        color: 'var(--color-tea, #66BB6A)',
        defaultAmount: 150
    },
    soda: {
        id: 'soda',
        label: 'Refri',
        icon: '🥤',
        factor: 0.85, // Açúcar/Sódio reduzem eficiência
        unit: 'ml',
        color: 'var(--color-soda, #EF5350)',
        defaultAmount: 350
    },
    juice: {
        id: 'juice',
        label: 'Suco',
        icon: '🍊',
        factor: 0.90,
        unit: 'ml',
        color: 'var(--color-juice, #FFA726)',
        defaultAmount: 250
    },
    // --- NOVO: REMÉDIOS ---
    medicine: {
        id: 'medicine',
        label: 'Remédio',
        icon: '💊',
        factor: 0, // Não conta para meta de água
        unit: 'un', // Unidade (cápsula/comprimido)
        color: 'var(--color-medicine, #9C27B0)',
        defaultAmount: 1,
        requiresCustomLabel: true // Força o usuário a digitar o nome (ex: "Vitamina C")
    }
});