import { Storage } from './storage.js';
import { ENTRY_TYPES } from './constants.js';

/**
 * Módulo de Lógica de Hidratação (Business Logic Layer)
 * Responsável por cálculos, validações e orquestração entre UI e Dados.
 */
export const Hydration = {
    
    /**
     * Adiciona um novo registro ao histórico
     * @param {string} typeId - Chave do tipo (ex: 'water', 'coffee', 'medicine')
     * @param {number} amount - Quantidade (ml ou unidades)
     * @param {string|null} customLabel - Nome personalizado (obrigatório p/ remédios)
     */
    addRecord: (typeId, amount, customLabel = null) => {
        const typeConfig = ENTRY_TYPES[typeId];

        if (!typeConfig) {
            console.error(`Tipo desconhecido: ${typeId}`);
            return false;
        }

        // 1. Cálculo da Hidratação Real (Regra de Negócio)
        // Se for remédio (factor 0), hydrationML será 0.
        // Math.floor garante números inteiros no banco.
        const hydrationML = Math.floor(amount * typeConfig.factor);

        // 2. Definição do Nome
        // Se o usuário digitou um nome (ex: "Dipirona"), usamos ele.
        // Se não, usamos o padrão do catálogo (ex: "Água").
        const label = customLabel || typeConfig.label;

        // 3. Montagem do Objeto (Payload)
        const entryData = {
            type: typeId,
            label: label,
            amount: amount,
            unit: typeConfig.unit, // Persistimos a unidade ('ml' ou 'un') para facilitar a UI
            hydrationML: hydrationML
        };

        // 4. Persistência
        Storage.addEntry(entryData);
        return true;
    },

    /**
     * Remove um registro pelo ID
     */
    removeRecord: (id) => {
        Storage.deleteEntry(id);
    },

    /**
     * Retorna o "Estado Atual" do dia para a UI consumir.
     * Calcula totais e progresso em tempo real baseados no histórico.
     */
    getDailyStats: () => {
        const data = Storage.getData();
        const settings = Storage.getSettings();

        // Reduce: Soma apenas a coluna 'hydrationML' de todos os registros
        const currentTotal = data.entries.reduce((total, entry) => {
            return total + (entry.hydrationML || 0);
        }, 0);

        // Cálculo de Porcentagem (Trava em 100% visualmente se quiser, ou deixa passar)
        // Aqui deixamos passar de 100% para gamificação ("Superou a meta!")
        const progressPercentage = (currentTotal / settings.goal) * 100;

        return {
            totalML: currentTotal,
            goalML: settings.goal,
            percentage: progressPercentage, // Número puro (ex: 50.5)
            entries: data.entries,          // Histórico bruto para a Timeline
            isGoalReached: currentTotal >= settings.goal
        };
    }
};