import { Hydration } from './hydration.js';
import { ENTRY_TYPES } from './constants.js';
import { Storage } from './storage.js';

export const UI = {
    elements: {
        // --- Elementos da HOME (V2) ---
        totalDisplay: document.getElementById('total-amount'),
        progressRing: document.querySelector('.progress-ring-circle'),
        historyList: document.getElementById('history-list'),
        addBtn: document.getElementById('fab-add'),
        emptyState: document.getElementById('empty-state'),
        
        // --- Elementos do MODAL DE ADIÇÃO (V2) ---
        modal: document.getElementById('add-modal'),
        modalGrid: document.getElementById('drink-options-grid'),
        modalClose: document.getElementById('modal-close'),
        inputAmount: document.getElementById('input-amount'),
        inputLabel: document.getElementById('input-label'),
        confirmBtn: document.getElementById('btn-confirm-add'),
        labelContainer: document.getElementById('label-container'),
        unitSuffix: document.getElementById('unit-suffix'),

        // --- Elementos de NAVEGAÇÃO e ESTATÍSTICAS (V3) ---
        views: document.querySelectorAll('.view'),
        navItems: document.querySelectorAll('.nav-item'),
        pageTitle: document.getElementById('page-title'),
        chartContainer: document.getElementById('weekly-chart'),
        statBestDay: document.getElementById('stat-best-day'),
        statAverage: document.getElementById('stat-average'),

        // --- Elementos de CONFIGURAÇÃO (Engrenagem) ---
        settingsBtn: document.getElementById('btn-settings'),
        settingsModal: document.getElementById('settings-modal'),
        settingsClose: document.getElementById('btn-close-modal')
    },

    state: {
        selectedType: 'water',
        currentView: 'view-home'
    },

    init: () => {
        // Inicializa listeners, navegação e renderiza opções
        UI.setupEventListeners();
        UI.setupNavigation(); 
        UI.renderDrinkOptions();
        UI.update(); // Renderiza a tela inicial
    },

    // --- 1. CONFIGURAÇÃO DE EVENTOS (Cliques) ---
    setupEventListeners: () => {
        const { elements } = UI;

        // Abrir Modal de Adicionar
        if(elements.addBtn) {
            elements.addBtn.addEventListener('click', () => {
                UI.resetModal();
                elements.modal.classList.remove('hidden');
                elements.modal.classList.add('flex');
            });
        }

        // Fechar Modal de Adicionar
        if(elements.modalClose) elements.modalClose.addEventListener('click', UI.closeModal);
        if(elements.modal) {
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) UI.closeModal();
            });
        }

        // Botão Confirmar Adição
        if(elements.confirmBtn) {
            elements.confirmBtn.addEventListener('click', () => {
                const amount = parseInt(elements.inputAmount.value);
                const label = elements.inputLabel.value.trim();
                const typeId = UI.state.selectedType;
                const typeConfig = ENTRY_TYPES[typeId];

                // Validações
                if (isNaN(amount) || amount <= 0) {
                    alert('Digite uma quantidade válida.');
                    return;
                }
                if (typeConfig.requiresCustomLabel && !label) {
                    alert('Por favor, informe o nome do item.');
                    elements.inputLabel.focus();
                    return;
                }

                // Salva e Atualiza
                const success = Hydration.addRecord(typeId, amount, label || null);
                if (success) {
                    UI.closeModal();
                    UI.update();
                }
            });
        }

        // Deletar Item (Event Delegation)
        if(elements.historyList) {
            elements.historyList.addEventListener('click', (e) => {
                const btn = e.target.closest('.delete-btn');
                if (btn) {
                    if(confirm('Remover este registro?')) {
                        Hydration.removeRecord(btn.dataset.id);
                        UI.update();
                    }
                }
            });
        }

        // --- CONFIGURAÇÕES (Engrenagem) ---
        // Movemos a lógica do main.js para cá para centralizar a UI
        if (elements.settingsBtn && elements.settingsModal) {
            elements.settingsBtn.addEventListener('click', () => {
                elements.settingsModal.showModal();
            });

            if (elements.settingsClose) {
                elements.settingsClose.addEventListener('click', () => {
                    elements.settingsModal.close();
                });
            }
            
            // Fecha ao clicar fora (backdrop do dialog)
            elements.settingsModal.addEventListener('click', (e) => {
                if (e.target === elements.settingsModal) elements.settingsModal.close();
            });
        }
    },

    // --- 2. NAVEGAÇÃO ENTRE ABAS (V3) ---
    setupNavigation: () => {
        UI.elements.navItems.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                UI.switchView(targetId);
            });
        });
    },

    switchView: (viewId) => {
        // Atualiza botões da barra inferior
        UI.elements.navItems.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === viewId);
        });

        // Alterna as Views (Telas)
        UI.elements.views.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
                view.classList.remove('hidden');
            } else {
                view.classList.remove('active');
                view.classList.add('hidden');
            }
        });

        // Lógica específica de cada tela
        if (viewId === 'view-home') {
            // REMOVIDO: UI.elements.pageTitle.textContent = "Hoje";
            if(UI.elements.addBtn) UI.elements.addBtn.classList.remove('hidden');
            UI.update(); 
        } else if (viewId === 'view-stats') {
            // REMOVIDO: UI.elements.pageTitle.textContent = "Seu Progresso";
            if(UI.elements.addBtn) UI.elements.addBtn.classList.add('hidden');
            UI.renderStats(); 
        }
    },

    // --- 3. MODAL DE BEBIDAS (Lógica V2) ---
    renderDrinkOptions: () => {
        const grid = UI.elements.modalGrid;
        if(!grid) return;
        
        grid.innerHTML = '';

        Object.values(ENTRY_TYPES).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'drink-option-btn';
            btn.dataset.type = type.id;
            // Seleciona se for o atual
            if(type.id === UI.state.selectedType) btn.classList.add('selected');

            btn.innerHTML = `
                <span class="text-2xl" style="font-size: 2rem;">${type.icon}</span>
                <span class="text-xs mt-1" style="font-size: 0.8rem;">${type.label}</span>
            `;

            btn.addEventListener('click', () => UI.selectDrinkType(type));
            grid.appendChild(btn);
        });
    },

    selectDrinkType: (typeConfig) => {
        UI.state.selectedType = typeConfig.id;
        
        // Atualiza estilo dos botões
        document.querySelectorAll('.drink-option-btn').forEach(b => {
            b.classList.toggle('selected', b.dataset.type === typeConfig.id);
        });

        // Configura inputs
        if(UI.elements.inputAmount) UI.elements.inputAmount.value = typeConfig.defaultAmount;
        
        // Mostra/Esconde campo de nome (Remédio)
        if (UI.elements.labelContainer) {
            if (typeConfig.requiresCustomLabel) {
                UI.elements.labelContainer.classList.remove('hidden');
                UI.elements.inputLabel.placeholder = "Ex: Dipirona, Vitamina C...";
            } else {
                UI.elements.labelContainer.classList.add('hidden');
                UI.elements.inputLabel.value = '';
            }
        }

        if(UI.elements.unitSuffix) UI.elements.unitSuffix.textContent = typeConfig.unit;
    },

    resetModal: () => {
        UI.selectDrinkType(ENTRY_TYPES.water);
    },

    closeModal: () => {
        UI.elements.modal.classList.add('hidden');
        UI.elements.modal.classList.remove('flex');
    },

    // --- 4. RENDERIZAÇÃO PRINCIPAL (HOME) ---
    update: () => {
        const stats = Hydration.getDailyStats();
        
        // Atualiza Texto Total
        if(UI.elements.totalDisplay) UI.elements.totalDisplay.textContent = stats.totalML;
        
        // Atualiza Círculo
        const circle = UI.elements.progressRing;
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (Math.min(stats.percentage, 100) / 100) * circumference;
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
            
            // Cor de sucesso
            if (stats.percentage >= 100) circle.style.stroke = '#10b981';
            else circle.style.stroke = 'var(--primary-color)';
        }

        // Atualiza Lista
        UI.renderTimeline(stats.entries);
        
        // Mensagem de Parabéns
        UI.checkGoalMessage(stats.percentage);
    },

    renderTimeline: (entries) => {
        const list = UI.elements.historyList;
        const emptyState = UI.elements.emptyState;
        
        if(!list) return;
        list.innerHTML = '';

        if (!entries || entries.length === 0) {
            if(emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if(emptyState) emptyState.classList.add('hidden');

        // Ordena: Mais recente primeiro
        const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

        sortedEntries.forEach(entry => {
            const config = ENTRY_TYPES[entry.type] || ENTRY_TYPES.water;
            const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('li');
            item.className = 'history-item';
            
            item.innerHTML = `
                <div class="icon-circle" style="background-color: ${config.color}20; color: ${config.color}">
                    ${config.icon}
                </div>
                
                <div class="history-info">
                    <span class="drink-name">${entry.label}</span>
                    <span class="drink-time">${time}</span>
                </div>

                <div class="history-amount">
                    <strong>${entry.amount}</strong>
                    <small>${entry.unit}</small>
                </div>
                
                <button class="delete-btn" data-id="${entry.id}">✕</button>
            `;
            list.appendChild(item);
        });
    },

    checkGoalMessage: (percentage) => {
        const timelineSection = document.querySelector('.timeline-section');
        const existingMsg = document.querySelector('.celebration-message');

        if (percentage >= 100) {
            if (!existingMsg && timelineSection) {
                const msg = document.createElement('div');
                msg.className = 'celebration-message';
                msg.innerHTML = '🎉 Parabéns! Meta diária alcançada! 🚀';
                
                const header = timelineSection.querySelector('.section-header');
                if(header) header.insertAdjacentElement('afterend', msg);
                
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        } else {
            if (existingMsg) existingMsg.remove();
        }
    },

    // --- 5. RENDERIZAÇÃO DE ESTATÍSTICAS (V3) ---
    renderStats: () => {
        const weeklyData = Hydration.getWeeklyStats();
        const settings = Storage.getSettings();
        const goal = settings.goal || 2500;
        const container = UI.elements.chartContainer;
        
        if(!container) return;
        container.innerHTML = ''; 

        let maxVal = 0;
        let totalWeek = 0;
        let bestDayVal = 0;
        let bestDayName = '-';

        // Calcula máximos e médias
        weeklyData.forEach(d => {
            if (d.total > maxVal) maxVal = d.total;
            totalWeek += d.total;
            if (d.total > bestDayVal) {
                bestDayVal = d.total;
                bestDayName = d.day;
            }
        });

        const chartScale = Math.max(maxVal, goal);

        // Gera colunas
        weeklyData.forEach(day => {
            const heightPct = chartScale > 0 ? (day.total / chartScale) * 100 : 0;
            const isSuccess = day.total >= goal;
            
            // Lógica para colorir o dia atual
            const textStyle = day.isToday ? 'color:var(--primary-color); font-weight:800;' : '';

            const col = document.createElement('div');
            col.className = 'chart-column';
            col.innerHTML = `
                <div class="bar-track">
                    <div class="bar-fill ${isSuccess ? 'success' : ''}" style="height: ${heightPct}%"></div>
                </div>
                <span class="day-label" style="${textStyle}">${day.day}</span>
            `;
            container.appendChild(col);
        });

        // Atualiza Cards de resumo
        if(UI.elements.statBestDay) UI.elements.statBestDay.textContent = `${bestDayName} (${bestDayVal}ml)`;
        if(UI.elements.statAverage) UI.elements.statAverage.textContent = `${Math.round(totalWeek / 7)}ml`;
    }
};