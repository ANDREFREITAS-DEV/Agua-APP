const DB_KEY = 'aquahabit_data';
const SETTINGS_KEY = 'aquahabit_settings';

// Estrutura V2: Baseada em Eventos (Timeline)
const defaultData = {
    currentDate: new Date().toLocaleDateString('pt-BR'),
    entries: [] // Array de objetos: { id, type, label, amount, hydrationML, timestamp }
};

const defaultSettings = {
    goal: 2000,
    theme: 'light',
    notifications: true,
    wakeTime: '08:00', // Padrão V2
    sleepTime: '22:00' // Padrão V2
};

// Função auxiliar para gerar ID único (essencial para apagar itens depois)
const generateID = () => {
    return self.crypto && self.crypto.randomUUID 
        ? self.crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const Storage = {
    // Inicializa e verifica migração de versões
    init: () => {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);

        // --- MIGRAÇÃO V1 -> V2 ---
        // Se tem 'consumed' (número) e não tem 'entries', é V1.
        if (typeof data.consumed === 'number' && !data.entries) {
            console.log("Migrando dados da V1 para V2...");
            
            const v2Data = {
                currentDate: data.currentDate || new Date().toLocaleDateString('pt-BR'),
                entries: []
            };

            // Se havia água consumida na V1, criamos um registro genérico de água
            if (data.consumed > 0) {
            v2Data.entries.push({
                id: generateID(),
                type: 'water',
                label: 'Água (Importado)',
                amount: data.consumed,
                hydrationML: data.consumed,
                unit: 'ml', // <--- ADICIONE ESSA LINHA PARA CORRIGIR O "undefined"
                timestamp: Date.now()
            });
        }

            localStorage.setItem(DB_KEY, JSON.stringify(v2Data));
        }
    },

    getData: () => {
        const raw = localStorage.getItem(DB_KEY);
        let data = raw ? JSON.parse(raw) : { ...defaultData };

        // Verifica virada do dia (Reset diário simples)
        // Nota: Na V3 podemos criar um "Histórico Permanente", mas na V2 focamos no dia atual
        const today = new Date().toLocaleDateString('pt-BR');
        if (data.currentDate !== today) {
            data.currentDate = today;
            data.entries = []; // Reseta timeline para o novo dia
            Storage.saveData(data);
        }

        return data;
    },

    saveData: (data) => {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    // --- MÉTODOS DE MANIPULAÇÃO DA TIMELINE (CRUD) ---

    // Adiciona Bebida ou Remédio
    addEntry: (entryData) => {
        const data = Storage.getData();
        
        const newEntry = {
            id: generateID(),
            timestamp: Date.now(),
            ...entryData 
            // entryData deve vir com: { type, label, amount, hydrationML }
        };

        data.entries.push(newEntry);
        Storage.saveData(data);
        return data; // Retorna dados atualizados para atualizar UI
    },

    // Remove item pelo ID
    deleteEntry: (id) => {
        const data = Storage.getData();
        data.entries = data.entries.filter(item => item.id !== id);
        Storage.saveData(data);
        return data;
    },

    // --- SETTINGS ---

    getSettings: () => {
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? JSON.parse(settings) : { ...defaultSettings };
    },

    saveSettings: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
};

// Executa migração ao carregar o módulo (singleton)
Storage.init();