import { Hydration } from './hydration.js'; // V2: Importa objeto, não classe
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { Notifications } from './notifications.js'; // Mantém seu arquivo original

document.addEventListener('DOMContentLoaded', () => {
    console.log('AquaHabit V2 Inicializando...');

    // 1. Inicializa a Interface V2 (Timeline, Gráfico, FAB)
    // Isso substitui o antigo 'UI.render(app.getProgress())' inicial
    UI.init(); 

    // Carrega configurações atuais para preencher os menus
    let currentSettings = Storage.getSettings();

    // --- LÓGICA DE TEMA (Mantida e Adaptada) ---
    // Verifica se existe função de tema na UI nova, senão faz manual para não quebrar
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        // Salva se necessário
        if (currentSettings.theme !== theme) {
            currentSettings.theme = theme;
            Storage.saveSettings(currentSettings);
        }
    };
    applyTheme(currentSettings.theme || 'light');

    document.getElementById('btn-theme')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });


    // --- PREENCHIMENTO DO MENU DE CONFIGURAÇÕES (Mantido da V1) ---
    const inputGoal = document.getElementById('input-goal');
    const toggleNotify = document.getElementById('toggle-notify');
    
    if(inputGoal) inputGoal.value = currentSettings.goal;
    if(toggleNotify) toggleNotify.checked = currentSettings.notifications;

    // Inicializar notificações se estiver ativado
    if (currentSettings.notifications) {
        // Verifica se Notifications existe (caso você não tenha alterado esse arquivo)
        if (typeof Notifications !== 'undefined') {
            Notifications.requestPermission();
            Notifications.startReminder();
        }
    }


    // =================================================================
    // LÓGICA DE INSTALAÇÃO PWA (MANTIDA INTEGRALMENTE DA SUA V1)
    // =================================================================
    let deferredPrompt; 
    const btnInstall = document.getElementById('btn-install');

    // Se o botão não existir no HTML V2, evitamos erro com o '?.'
    if (btnInstall) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            btnInstall.style.display = 'flex';
            console.log('PWA: Pode instalar!');
        });

        btnInstall.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`PWA: Usuário escolheu ${outcome}`);
            deferredPrompt = null;
            btnInstall.style.display = 'none';
        });

        window.addEventListener('appinstalled', () => {
            btnInstall.style.display = 'none';
            console.log('PWA: Instalado com sucesso!');
        });
    }


    // =================================================================
    // EVENT LISTENERS DO MENU / CONFIGURAÇÕES
    // =================================================================

    // Modal de Configurações (Se você manteve o HTML do menu da V1)
    const settingsModal = document.getElementById('settings-modal');
    const btnMenu = document.getElementById('btn-settings'); // Ajustei ID para bater com header V2 (engrenagem)

    if (settingsModal && btnMenu) {
        // Abrir Menu
        btnMenu.addEventListener('click', () => {
            settingsModal.showModal(); // Usa API nativa de Dialog
        });

        // Fechar Menu
        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            settingsModal.close();
        });

        // Fechar ao clicar fora
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) settingsModal.close();
        });
    }

    // Salvar Nova Meta (Adaptado para V2)
    document.getElementById('btn-save-goal')?.addEventListener('click', () => {
        const newGoal = parseInt(inputGoal.value);
        if (newGoal && newGoal > 0) {
            // LÓGICA V2: Atualiza Settings e pede para UI redesenhar
            currentSettings.goal = newGoal;
            Storage.saveSettings(currentSettings);
            
            // Força atualização da UI (Gráfico circular)
            UI.update(); 
            
            if (settingsModal) settingsModal.close();
            if (navigator.vibrate) navigator.vibrate(50); 
        }
    });

    // Toggle Notificações
    toggleNotify?.addEventListener('change', (e) => {
        currentSettings.notifications = e.target.checked;
        Storage.saveSettings(currentSettings);
        
        if (typeof Notifications !== 'undefined') {
            if (currentSettings.notifications) {
                Notifications.requestPermission();
                Notifications.startReminder();
            } else {
                alert('Lembretes desativados.');
            }
        }
    });

    // Compartilhar (Web Share API - Mantido)
    document.getElementById('btn-share')?.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                // Pega dados atualizados da V2
                const stats = Hydration.getDailyStats();
                await navigator.share({
                    title: 'AquaHabit',
                    text: `Já bebi ${stats.totalML}ml de água hoje! E você? 💧`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            alert('Compartilhar não suportado neste navegador.');
        }
    });

    // Apoiar
    document.getElementById('btn-support')?.addEventListener('click', () => {
        alert('Obrigado por querer apoiar! Em breve link do "Buy me a Coffee". ☕');
    });

    // Service Worker (Mantido)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('SW registrado'))
                .catch(err => console.error('Erro SW:', err));
        });
    }
});