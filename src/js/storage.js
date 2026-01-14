const DB_KEY = 'aquahabit_data';
const SETTINGS_KEY = 'aquahabit_settings';

// Estrutura inicial padrão
const defaultData = {
    currentDate: new Date().toLocaleDateString('pt-BR'),
    consumed: 0,
    history: [] 
};

const defaultSettings = {
    goal: 2000,
    theme: 'light',
    notifications: true // NOVO CAMPO
};

export const Storage = {
    getData: () => {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : { ...defaultData };
    },

    saveData: (data) => {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    getSettings: () => {
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? JSON.parse(settings) : { ...defaultSettings };
    },

    saveSettings: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
};