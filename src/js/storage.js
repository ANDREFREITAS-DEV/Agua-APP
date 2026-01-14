const DB_KEY = 'aquahabit_data';
const SETTINGS_KEY = 'aquahabit_settings';

// Estrutura V3: Entries acumula histórico eterno
const defaultData = {
    // currentDate servirá apenas para referência de último acesso se precisarmos
    currentDate: new Date().toLocaleDateString('pt-BR'), 
    entries: [] 
};

const defaultSettings = {
    goal: 2000,
    theme: 'light',
    notifications: true,
    wakeTime: '08:00',
    sleepTime: '22:00'
};

const generateID = () => {
    return self.crypto && self.crypto.randomUUID 
        ? self.crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const Storage = {
    init: () => {
        // Inicialização básica (mantida)
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
        }
    },

    getData: () => {
        const raw = localStorage.getItem(DB_KEY);
        let data = raw ? JSON.parse(raw) : { ...defaultData };
        // NA V3: NÃO RESETAMOS MAIS O ARRAY ENTRIES AQUI
        return data;
    },

    saveData: (data) => {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    addEntry: (entryData) => {
        const data = Storage.getData();
        const newEntry = {
            id: generateID(),
            timestamp: Date.now(), // Timestamp completo
            dateString: new Date().toLocaleDateString('pt-BR'), // Facilita filtro por dia
            ...entryData 
        };
        data.entries.push(newEntry);
        Storage.saveData(data);
        return data;
    },

    deleteEntry: (id) => {
        const data = Storage.getData();
        data.entries = data.entries.filter(item => item.id !== id);
        Storage.saveData(data);
        return data;
    },

    getSettings: () => {
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? JSON.parse(settings) : { ...defaultSettings };
    },

    saveSettings: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
};

Storage.init();