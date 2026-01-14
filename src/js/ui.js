import { Hydration } from './hydration.js';
import { ENTRY_TYPES, APP_CONFIG } from './constants.js';

/**
 * UI Controller
 * Gerencia toda a manipulação do DOM, Event Listeners e Renderização.
 */
export const UI = {
    // Cache de elementos do DOM (para performance)
    elements: {
        totalDisplay: document.getElementById('total-amount'),
        progressRing: document.querySelector('.progress-ring-circle'),
        historyList: document.getElementById('history-list'),
        addBtn: document.getElementById('fab-add'),
        modal: document.getElementById('add-modal'),
        modalGrid: document.getElementById('drink-options-grid'),
        modalClose: document.getElementById('modal-close'),
        inputAmount: document.getElementById('input-amount'),
        inputLabel: document.getElementById('input-label'), // Novo: para nome do remédio
        confirmBtn: document.getElementById('btn-confirm-add'),
        emptyState: document.getElementById('empty-state')
    },

    state: {
        selectedType: 'water' // Tipo selecionado no modal
    },

    init: () => {
        UI.setupEventListeners();
        UI.renderDrinkOptions(); // Gera os botões do menu dinamicamente
        UI.update(); // Renderiza a tela inicial
    },

    setupEventListeners: () => {
        const { elements } = UI;

        // 1. Abrir Modal
        elements.addBtn.addEventListener('click', () => {
            UI.resetModal();
            elements.modal.classList.remove('hidden');
            elements.modal.classList.add('flex'); // Usa flex para centralizar
        });

        // 2. Fechar Modal
        elements.modalClose.addEventListener('click', UI.closeModal);
        
        // Fechar ao clicar fora do modal (overlay)
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) UI.closeModal();
        });

        // 3. Confirmar Adição
        elements.confirmBtn.addEventListener('click', () => {
            const amount = parseInt(elements.inputAmount.value);
            const label = elements.inputLabel.value.trim();
            const typeId = UI.state.selectedType;
            const typeConfig = ENTRY_TYPES[typeId];

            // Validação simples
            if (isNaN(amount) || amount <= 0) {
                alert('Digite uma quantidade válida.');
                return;
            }

            // Validação de Remédio (Nome obrigatório)
            if (typeConfig.requiresCustomLabel && !label) {
                alert('Por favor, informe o nome do remédio/item.');
                elements.inputLabel.focus();
                return;
            }

            // Envia para a lógica de negócio
            const success = Hydration.addRecord(typeId, amount, label || null);
            
            if (success) {
                UI.closeModal();
                UI.update(); // Atualiza a tela
            }
        });

        // 4. Deleção (Event Delegation na lista inteira)
        // Isso é melhor que criar um listener para cada botão de lixeira
        elements.historyList.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-btn');
            if (btn) {
                const id = btn.dataset.id;
                if(confirm('Remover este registro?')) {
                    Hydration.removeRecord(id);
                    UI.update();
                }
            }
        });
    },

    // Gera os botões do modal baseado no constants.js
    renderDrinkOptions: () => {
        const grid = UI.elements.modalGrid;
        grid.innerHTML = ''; // Limpa

        Object.values(ENTRY_TYPES).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'drink-option-btn';
            btn.dataset.type = type.id;
            btn.innerHTML = `
                <span class="text-2xl">${type.icon}</span>
                <span class="text-xs mt-1">${type.label}</span>
            `;

            btn.addEventListener('click', () => UI.selectDrinkType(type));
            grid.appendChild(btn);
        });
    },

    selectDrinkType: (typeConfig) => {
        UI.state.selectedType = typeConfig.id;
        
        // Atualiza visual dos botões
        document.querySelectorAll('.drink-option-btn').forEach(b => {
            b.classList.toggle('selected', b.dataset.type === typeConfig.id);
        });

        // Configura inputs
        const inputAmount = UI.elements.inputAmount;
        inputAmount.value = typeConfig.defaultAmount;
        
        // Exibe/Oculta campo de nome (para remédios)
        const labelContainer = document.getElementById('label-container');
        if (typeConfig.requiresCustomLabel) {
            labelContainer.classList.remove('hidden');
            UI.elements.inputLabel.placeholder = "Ex: Dipirona, Vitamina C...";
        } else {
            labelContainer.classList.add('hidden');
            UI.elements.inputLabel.value = '';
        }

        // Muda o sufixo (ml ou un)
        document.getElementById('unit-suffix').textContent = typeConfig.unit;
    },

    resetModal: () => {
        // Seleciona água por padrão ao abrir
        UI.selectDrinkType(ENTRY_TYPES.water);
    },

    closeModal: () => {
        UI.elements.modal.classList.add('hidden');
        UI.elements.modal.classList.remove('flex');
    },

    // Função Principal de Renderização
    update: () => {
        const stats = Hydration.getDailyStats();
        
        // 1. Atualiza Totais
        UI.elements.totalDisplay.textContent = stats.totalML;
        
        // 2. Atualiza Barra de Progresso Circular
        const circle = UI.elements.progressRing;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (Math.min(stats.percentage, 100) / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // 3. Muda a cor do círculo se atingiu a meta (Opcional - Toque visual extra)
        if (stats.percentage >= 100) {
            circle.style.stroke = 'var(--color-water, #3B82F6)'; // Garante azul ou verde de sucesso
        }

        // 4. Renderiza Timeline
        UI.renderTimeline(stats.entries);

        // --- NOVO: LÓGICA DA MENSAGEM DE PARABÉNS ---
        UI.checkGoalMessage(stats.percentage);
    },

    // Nova função auxiliar para controlar a mensagem
    checkGoalMessage: (percentage) => {
        const timelineSection = document.querySelector('.timeline-section');
        // Procura se a mensagem já existe para não criar duplicada
        const existingMsg = document.querySelector('.celebration-message');

        if (percentage >= 100) {
            // Se atingiu a meta e a mensagem NÃO existe, cria ela
            if (!existingMsg) {
                const msg = document.createElement('div');
                msg.className = 'celebration-message';
                msg.innerHTML = '🎉 Parabéns! Meta diária alcançada! 🚀';
                
                // Insere logo após o título "Histórico"
                const header = timelineSection.querySelector('.section-header');
                header.insertAdjacentElement('afterend', msg);
                
                // Vibração de sucesso (se suportado)
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        } else {
            // Se baixou de 100% (ex: apagou um registro), remove a mensagem
            if (existingMsg) {
                existingMsg.remove();
            }
        }
    },

    
    renderTimeline: (entries) => {
        const list = UI.elements.historyList;
        const emptyState = UI.elements.emptyState;
        
        list.innerHTML = ''; 

        if (entries.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Ordena: Mais recente no topo
        const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

        sortedEntries.forEach(entry => {
            const config = ENTRY_TYPES[entry.type] || ENTRY_TYPES.water;
            const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('li');
            item.className = 'history-item';
            
            // ESTRUTURA NOVA: Classes semânticas para facilitar o CSS
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
    
    }
};