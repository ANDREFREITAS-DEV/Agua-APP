import { Storage } from './storage.js';

export class HydrationLogic {
    constructor() {
        this.data = Storage.getData();
        this.settings = Storage.getSettings();
        this.checkDayReset();
    }

    checkDayReset() {
        const today = new Date().toLocaleDateString('pt-BR');
        
        if (this.data.currentDate !== today) {
            // Salvar dia anterior no histórico se houve consumo
            if (this.data.consumed > 0) {
                this.data.history.unshift({
                    date: this.data.currentDate,
                    amount: this.data.consumed,
                    goal: this.settings.goal
                });
                
                // Limitar histórico a 7 dias
                if (this.data.history.length > 7) {
                    this.data.history.pop();
                }
            }

            // Resetar para hoje
            this.data.currentDate = today;
            this.data.consumed = 0;
            this.save();
        }
    }

    addWater(amount) {
        this.data.consumed += parseInt(amount);
        this.save();
        return this.data.consumed;
    }

    updateGoal(newGoal) {
        this.settings.goal = parseInt(newGoal);
        Storage.saveSettings(this.settings);
    }

    getProgress() {
        const percent = Math.min(100, Math.round((this.data.consumed / this.settings.goal) * 100));
        return {
            consumed: this.data.consumed,
            goal: this.settings.goal,
            percent: percent,
            history: this.data.history
        };
    }

    save() {
        Storage.saveData(this.data);
    }
}