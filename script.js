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

async function syncWithBot() {
    if (!state.chat_id) {
        console.warn('Нет chat_id, синхронизация невозможна');
        return;
    }
    try {
        const response = await fetch('https://your-server.com/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        });
        const data = await response.json();
        console.log('Синхронизация:', data);
        if (data.status === 'success') {
            showMessage('Данные синхронизированы с ботом!');
        } else {
            showMessage('Ошибка синхронизации: ' + data.message);
        }
    } catch (error) {
        console.error('Ошибка синхронизации:', error);
        showMessage('Не удалось синхронизировать данные.');
    }
}

async function loadFromBot() {
    if (!state.chat_id) {
        console.warn('Нет chat_id, загрузка данных невозможна');
        return;
    }
    try {
        const response = await fetch(`https://your-server.com/get_user/${state.chat_id}`);
        const data = await response.json();
        console.log('Загрузка данных:', data);
        if (data.status === 'success') {
            Object.assign(state, data.data);
            updateUI();
            saveState();
            showMessage('Данные загружены из бота!');
        } else {
            showMessage('Ошибка загрузки данных: ' + data.message);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showMessage('Не удалось загрузить данные.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadState();

    const authSection = document.getElementById('auth-section');
    const gameSection = document.getElementById('game-section');
    const authButton = document.getElementById('auth-button');
    const messageDiv = document.getElementById('message');

    if (window.Telegram?.WebApp) {
        console.log('Telegram Web App SDK загружен');
        window.Telegram.WebApp.ready();
        const initData = window.Telegram.WebApp.initDataUnsafe;
        console.log('initData:', initData);
        if (initData?.user) {
            state.chat_id = initData.user.id;
            state.username = initData.user.username || "Unknown";
            authSection.classList.add('hidden');
            gameSection.classList.remove('hidden');
            updateUI();
            saveState();
            await loadFromBot(); // Загрузка данных при входе
            await syncWithBot(); // Синхронизация после загрузки
        } else {
            authSection.classList.remove('hidden');
            messageDiv.textContent = 'Пожалуйста, войдите через Telegram.';
        }
    } else {
        console.warn('Telegram Web App SDK не доступен. Тестирование в режиме без авторизации.');
        authSection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        updateUI();
        messageDiv.textContent = 'Для полной функциональности откройте приложение через Telegram.';
    }

    authButton.addEventListener('click', async () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            const initData = window.Telegram.WebApp.initDataUnsafe;
            console.log('Кнопка "Войти через Telegram" нажата, initData:', initData);
            if (initData?.user) {
                state.chat_id = initData.user.id;
                state.username = initData.user.username || "Unknown";
                authSection.classList.add('hidden');
                gameSection.classList.remove('hidden');
                updateUI();
                saveState();
                showMessage('Авторизация успешна!');
                await loadFromBot();
                await syncWithBot();
            } else {
                showMessage('Ошибка авторизации. Откройте приложение через Telegram.');
            }
        } else {
            showMessage('Telegram Web App не доступен. Откройте через Telegram.');
        }
    });

    document.getElementById('click-button').addEventListener('click', async () => {
        state.balance += 10;
        if (state.balance >= 10000 && state.level < 2) {
            state.level = 2;
            showMessage('Поздравляем! Ты достиг 2-го уровня!');
        }
        if (state.balance >= 1000000) {
            showMessage('Поздравляем! Ты заработал 1,000,000 монет и победил! 🏆');
            state.balance = 1000;
            state.level = 1;
        }
        updateUI();
        saveState();
        await syncWithBot();
    });

    document.getElementById('tasks-button').addEventListener('click', () => {
        document.getElementById('tasks-menu').classList.remove('hidden');
        document.getElementById('click-button').classList.add('hidden');
        document.getElementById('tasks-button').classList.add('hidden');
        document.getElementById('withdraw-button').classList.add('hidden');
    });

    document.getElementById('task-work').addEventListener('click', async () => {
        if (Math.random() <= 0.1) {
            state.balance -= 100;
            if (state.balance < 0) state.balance = 0;
            showMessage('Неудача! Потеряно 100 монет.');
        } else {
            state.balance += 500;
            showMessage('Успех! +500 монет.');
        }
        if (state.balance <= 0) {
            showMessage('Ты разорился! Начинай заново.');
            state.balance = 1000;
            state.level = 1;
        }
        updateUI();
        saveState();
        await syncWithBot();
    });

    document.getElementById('task-trade').addEventListener('click', async () => {
        if (Math.random() <= 0.3) {
            state.balance -= 500;
            if (state.balance < 0) state.balance = 0;
            showMessage('Неудача! Потеряно 500 монет.');
        } else {
            state.balance += 2000;
            showMessage('Успех! +2000 монет.');
        }
        if (state.balance <= 0) {
            showMessage('Ты разорился! Начинай заново.');
            state.balance = 1000;
            state.level = 1;
        }
        updateUI();
        saveState();
        await syncWithBot();
    });

    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('tasks-menu').classList.add('hidden');
        document.getElementById('click-button').classList.remove('hidden');
        document.getElementById('tasks-button').classList.remove('hidden');
        document.getElementById('withdraw-button').classList.remove('hidden');
    });

    document.getElementById('withdraw-button').addEventListener('click', async () => {
        if (state.balance < 1000) {
            showMessage('Недостаточно монет для вывода (мин. 1000)!');
        } else {
            const points = state.balance / 1000;
            state.balance = 0;
            showMessage(`Вы вывели ${points} очков! Баланс: 0`);
            updateUI();
            saveState();
            await syncWithBot();
        }
    });
});