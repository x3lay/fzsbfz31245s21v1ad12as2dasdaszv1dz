const state = {
    chat_id: null,
    username: "Unknown",
    balance: 1000,
    level: 1
};

function saveState() {
    localStorage.setItem('clickerGameState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('clickerGameState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
}

function updateUI() {
    document.getElementById('username').textContent = state.username;
    document.getElementById('level').textContent = state.level;
    document.getElementById('balance').textContent = state.balance.toFixed(1);
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    setTimeout(() => messageDiv.textContent = '', 3000);
}

function syncWithBot() {
    // Здесь можно отправить данные на сервер, связанный с ботом
    console.log('Синхронизация с ботом:', state);
    // Пример: fetch('/sync', { method: 'POST', body: JSON.stringify(state) });
}

document.addEventListener('DOMContentLoaded', () => {
    loadState();

    const authSection = document.getElementById('auth-section');
    const gameSection = document.getElementById('game-section');
    const authButton = document.getElementById('auth-button');

    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        const initData = window.Telegram.WebApp.initDataUnsafe;
        if (initData.user) {
            state.chat_id = initData.user.id;
            state.username = initData.user.username || "Unknown";
            authSection.classList.add('hidden');
            gameSection.classList.remove('hidden');
            updateUI();
        } else {
            authSection.classList.remove('hidden');
        }
    } else {
        // Для тестирования без Telegram Web App
        authSection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        updateUI();
    }

    authButton.addEventListener('click', () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            const initData = window.Telegram.WebApp.initDataUnsafe;
            if (initData.user) {
                state.chat_id = initData.user.id;
                state.username = initData.user.username || "Unknown";
                authSection.classList.add('hidden');
                gameSection.classList.remove('hidden');
                updateUI();
                saveState();
            }
        }
    });

    document.getElementById('click-button').addEventListener('click', () => {
        state.balance += 10;
        if (state.balance >= 10000 && state.level < 2) {
            state.level = 2;
            showMessage('Поздравляем! Ты достиг 2-го уровня!');
        }
        updateUI();
        saveState();
        syncWithBot();
    });

    document.getElementById('tasks-button').addEventListener('click', () => {
        document.getElementById('tasks-menu').classList.remove('hidden');
        document.getElementById('click-button').classList.add('hidden');
        document.getElementById('tasks-button').classList.add('hidden');
        document.getElementById('withdraw-button').classList.add('hidden');
    });

    document.getElementById('task-work').addEventListener('click', () => {
        if (Math.random() <= 0.1) {
            state.balance -= 100;
            if (state.balance < 0) state.balance = 0;
            showMessage('Неудача! Потеряно 100 монет.');
        } else {
            state.balance += 500;
            showMessage('Успех! +500 монет.');
        }
        updateUI();
        saveState();
        syncWithBot();
    });

    document.getElementById('task-trade').addEventListener('click', () => {
        if (Math.random() <= 0.3) {
            state.balance -= 500;
            if (state.balance < 0) state.balance = 0;
            showMessage('Неудача! Потеряно 500 монет.');
        } else {
            state.balance += 2000;
            showMessage('Успех! +2000 монет.');
        }
        updateUI();
        saveState();
        syncWithBot();
    });

    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('tasks-menu').classList.add('hidden');
        document.getElementById('click-button').classList.remove('hidden');
        document.getElementById('tasks-button').classList.remove('hidden');
        document.getElementById('withdraw-button').classList.remove('hidden');
    });

    document.getElementById('withdraw-button').addEventListener('click', () => {
        if (state.balance < 1000) {
            showMessage('Недостаточно монет для вывода (мин. 1000)!');
        } else {
            const points = state.balance / 1000;
            state.balance = 0;
            showMessage(`Вы вывели ${points} очков! Баланс: 0`);
            updateUI();
            saveState();
            syncWithBot();
        }
    });

    // Проверка условий игры
    if (state.balance >= 1000000) {
        showMessage('Поздравляем! Ты заработал 1,000,000 монет и победил! 🏆');
        state.balance = 1000;
        state.level = 1;
        updateUI();
        saveState();
        syncWithBot();
    } else if (state.balance <= 0) {
        showMessage('Ты разорился! Начинай заново.');
        state.balance = 1000;
        state.level = 1;
        updateUI();
        saveState();
        syncWithBot();
    }
});