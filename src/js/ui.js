export const UI = {
    elements: {
        displayConsumed: document.getElementById('display-consumed'),
        displayGoal: document.getElementById('display-goal'),
        progressFill: document.getElementById('progress-fill'),
        percentText: document.getElementById('percentage-text'),
        historyList: document.getElementById('history-list'),
        html: document.documentElement,
        inputGoal: document.getElementById('input-goal')
    },

    render(state) {
        this.elements.displayConsumed.textContent = state.consumed;
        this.elements.displayGoal.textContent = state.goal;
        
        this.elements.progressFill.style.width = `${state.percent}%`;
        this.elements.percentText.textContent = `${state.percent}%`;

        // Cores dinâmicas na barra baseadas no progresso
        if (state.percent >= 100) {
            this.elements.percentText.textContent = "🎉 Meta Batida!";
        }

        this.renderHistory(state.history);
    },

    renderHistory(history) {
        this.elements.historyList.innerHTML = '';
        
        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<li class="history-item" style="justify-content:center; color:var(--text-secondary)">Sem histórico recente</li>';
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            // Verifica se bateu a meta naquele dia
            const achieved = item.amount >= item.goal ? '✅' : '';

            li.innerHTML = `
                <span class="history-date">${item.date}</span>
                <span class="history-val">${item.amount}ml ${achieved}</span>
            `;
            this.elements.historyList.appendChild(li);
        });
    },

    setTheme(theme) {
        this.elements.html.setAttribute('data-theme', theme);
    }
};