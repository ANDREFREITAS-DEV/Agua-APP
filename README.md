# 💧 AquaHabit

> Um rastreador de hidratação moderno, minimalista e totalmente offline-first.

O **AquaHabit** é um Progressive Web App (PWA) desenvolvido para ajudar usuários a criar e manter o hábito de beber água diariamente. Focado em privacidade e performance, o aplicativo funciona sem internet e armazena todos os dados localmente no dispositivo do usuário.

---

## 🎯 Proposta do Projeto

O objetivo foi criar uma aplicação robusta utilizando a filosofia **"Vanilla"** (sem frameworks), demonstrando que é possível construir interfaces reativas, organizadas e instaláveis utilizando apenas os padrões web modernos (ES Modules, CSS Variables e Service Workers).

### ✨ Funcionalidades Atuais (V1.0)

* **Controle de Meta:** Defina e edite sua meta diária de ingestão de líquidos.
* **Registro Rápido:** Botões práticos para adicionar 200ml, 300ml ou 500ml.
* **Feedback Visual:** Barra de progresso dinâmica e cálculo de porcentagem em tempo real.
* **Histórico Automático:** O app detecta a virada do dia, salva o histórico de ontem e reseta o contador automaticamente.
* **Temas (Dark/Light):** Suporte nativo a modo escuro e claro, persistente nas preferências.
* **PWA Instalável:** Pode ser instalado no Android, iOS e Desktop como um aplicativo nativo.
* **Offline-First:** Funciona 100% sem conexão com a internet graças ao Service Worker.
* **Notificações Locais:** Lembretes configuráveis para beber água.
* **Engajamento:** Funcionalidade de compartilhamento nativo (Web Share API).

---

## 🚀 Roadmap: O que vem na V2.0?

Estamos planejando a evolução da arquitetura para transformar o AquaHabit em um **Monitor Completo de Bebidas**.

* **Rastreamento de Múltiplas Bebidas:** Suporte para Café ☕, Chá 🍵, Sucos 🍊 e Remédios 💊.
* **Linha do Tempo (Log Detalhado):** Em vez de apenas um contador total, o app mostrará *quando* você bebeu (ex: "10:30 - Café 50ml").
* **Fator de Hidratação:** Cálculo inteligente onde bebidas diuréticas (como café) impactam a meta de forma diferente da água pura.
* **Reset Manual:** Opção para reiniciar o dia caso o usuário queira corrigir registros.
* **Calculadora Inteligente:** Sugestão de meta baseada no peso corporal do usuário.

---

## 🛠️ Tecnologias Utilizadas

O projeto segue uma arquitetura modular limpa:

* **HTML5 Semântico:** Estrutura acessível e otimizada.
* **CSS3 (Tokens & Modules):** Uso de CSS Variables para Design Tokens e temas, sem pré-processadores.
* **JavaScript (ES6+ Modules):** Lógica separada em módulos (`hydration`, `storage`, `ui`, `notifications`) sem dependências externas.
* **Service Worker:** Estratégia de cache para funcionamento offline.
* **LocalStorage:** Persistência de dados no navegador.

---

## 📂 Estrutura do Projeto

```text
AquaHabit/
├── assets/             # Ícones e imagens
├── src/
│   ├── css/            # Estilos modularizados (tokens, app, theme, base)
│   └── js/             # Lógica de negócio (modules)
├── index.html          # Ponto de entrada
├── manifest.json       # Configuração do PWA
└── sw.js               # Service Worker (Cache & Offline)
