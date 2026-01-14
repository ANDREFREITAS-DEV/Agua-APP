import { Storage } from './storage.js';
import { ENTRY_TYPES } from './constants.js';

export const Hydration = {
    
    addRecord: (typeId, amount, customLabel = null) => {
        const typeConfig = ENTRY_TYPES[typeId];
        if (!typeConfig) return false;

        const hydrationML = Math.floor(amount * typeConfig.factor);
        const label = customLabel || typeConfig.label;

        const entryData = {
            type: typeId,
            label: label,
            amount: amount,
            unit: typeConfig.unit,
            hydrationML: hydrationML
        };

        Storage.addEntry(entryData);
        return true;
    },

    removeRecord: (id) => {
        Storage.deleteEntry(id);
    },

    // Retorna estatísticas APENAS DO DIA ATUAL (Home)
    getDailyStats: () => {
        const data = Storage.getData();
        const settings = Storage.getSettings();
        const todayStr = new Date().toLocaleDateString('pt-BR');

        // Filtra registros que tenham a dataString de hoje OU timestamp do dia
        const todayEntries = data.entries.filter(entry => {
            // Compatibilidade com V2 (usava timestamp) e V3 (usa dateString)
            if (entry.dateString) return entry.dateString === todayStr;
            return new Date(entry.timestamp).toLocaleDateString('pt-BR') === todayStr;
        });

        const currentTotal = todayEntries.reduce((total, entry) => total + (entry.hydrationML || 0), 0);
        const progressPercentage = (currentTotal / settings.goal) * 100;

        return {
            totalML: currentTotal,
            goalML: settings.goal,
            percentage: progressPercentage,
            entries: todayEntries, // Retorna só as de hoje para a Timeline
            isGoalReached: currentTotal >= settings.goal
        };
    },

    // NOVA: Retorna dados para o Gráfico (Últimos 7 dias)
    getWeeklyStats: () => {
        const data = Storage.getData();
        const settings = Storage.getSettings(); // Para saber a meta
        const daysMap = new Map();

        // 1. Gera os últimos 7 dias (incluindo hoje) com valor 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toLocaleDateString('pt-BR');
            // Pega o dia da semana (Dom, Seg...)
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
            
            daysMap.set(dateKey, { 
                day: dayName, 
                total: 0, 
                date: dateKey,
                isToday: i === 0 
            });
        }

        // 2. Popula com dados do histórico
        data.entries.forEach(entry => {
            // Determina a data do registro
            const entryDate = entry.dateString || new Date(entry.timestamp).toLocaleDateString('pt-BR');
            
            if (daysMap.has(entryDate)) {
                const current = daysMap.get(entryDate);
                current.total += (entry.hydrationML || 0);
            }
        });

        return Array.from(daysMap.values());
    }
};