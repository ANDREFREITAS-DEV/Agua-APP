import { HydrationLogic } from './hydration.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { Notifications } from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
    
    
    const app = new HydrationLogic();
    let currentSettings = Storage.getSettings();

    // 1. Setup Inicial
    UI.setTheme(currentSettings.theme);
    
    // Preencher valores no Menu
    const inputGoal = document.getElementById('input-goal');
    const toggleNotify = document.getElementById('toggle-notify');
    
    if(inputGoal) inputGoal.value = currentSettings.goal;
    if(toggleNotify) toggleNotify.checked = currentSettings.notifications;

    UI.render(app.getProgress());

    // Inicializar notificações se estiver ativado
    if (currentSettings.notifications) {
        Notifications.requestPermission();
        Notifications.startReminder();
    }

    // --- LÓGICA DE INSTALAÇÃO PWA (NOVO) ---
    let deferredPrompt; // Variável para guardar o evento do navegador
    const btnInstall = document.getElementById('btn-install');

    window.addEventListener('beforeinstallprompt', (e) => {
        // 1. Impede o navegador de mostrar o prompt nativo feio automaticamente
        e.preventDefault();
        // 2. Guarda o evento para usar depois
        deferredPrompt = e;
        // 3. Mostra o nosso botão bonito
        btnInstall.style.display = 'flex';
        console.log('PWA: Pode instalar!');
    });

    btnInstall.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // 4. Mostra o prompt nativo de instalação
        deferredPrompt.prompt();
        
        // 5. Espera a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA: Usuário escolheu ${outcome}`);
        
        // 6. Limpa a variável
        deferredPrompt = null;
        // 7. Esconde o botão (já instalou ou recusou)
        btnInstall.style.display = 'none';
    });

    window.addEventListener('appinstalled', () => {
        // Garante que o botão suma se já estiver instalado
        btnInstall.style.display = 'none';
        console.log('PWA: Instalado com sucesso!');
    });


    // --- EVENT LISTENERS ---

    // Adicionar Água
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amount = parseInt(e.currentTarget.dataset.amount);
            app.addWater(amount);
            UI.render(app.getProgress());
            if (navigator.vibrate) navigator.vibrate(50);
        });
    });

    // Tema
    document.getElementById('btn-theme').addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        UI.setTheme(newTheme);
        currentSettings = Storage.getSettings(); // Recarrega para garantir
        currentSettings.theme = newTheme;
        Storage.saveSettings(currentSettings);
    });

    // --- LÓGICA DO NOVO MENU ---
    const modal = document.getElementById('settings-modal');

    // Abrir Menu
    document.getElementById('btn-menu').addEventListener('click', () => {
        modal.showModal();
    });

    // Fechar Menu (Botão X)
    document.getElementById('btn-close-modal').addEventListener('click', () => {
        modal.close();
    });

    // Fechar ao clicar fora (Backdrop)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });

    // Salvar Nova Meta
    document.getElementById('btn-save-goal').addEventListener('click', () => {
        const newGoal = inputGoal.value;
        if (newGoal && newGoal > 0) {
            app.updateGoal(newGoal);
            UI.render(app.getProgress());
            
            // ATUALIZAÇÃO: Fecha o modal imediatamente após salvar
            modal.close();
            
            // Opcional: Feedback vibratório rápido
            if (navigator.vibrate) navigator.vibrate(50); 
        }
    });

    // Toggle Notificações
    toggleNotify.addEventListener('change', (e) => {
        currentSettings.notifications = e.target.checked;
        Storage.saveSettings(currentSettings);
        
        if (currentSettings.notifications) {
            Notifications.requestPermission();
            Notifications.startReminder();
        } else {
            // Numa implementação real complexa, aqui cancelaríamos o intervalo
            alert('Lembretes desativados (recarregue o app para surtir efeito total).');
        }
    });

    // Compartilhar (Web Share API)
    document.getElementById('btn-share').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AquaHabit',
                    text: `Já bebi ${app.data.consumed}ml de água hoje! E você? 💧`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            alert('Compartilhar não suportado neste navegador.');
        }
    });

    // Apoiar (Simulação)
    document.getElementById('btn-support').addEventListener('click', () => {
        alert('Obrigado por querer apoiar! Em breve link do "Buy me a Coffee". ☕');
    });
});