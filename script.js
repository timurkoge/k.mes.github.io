// Данные пользователей (только для авторизации)
const users = {
    'Артур': { password: '125364', color: '#2ecc71' },
    'Дамир': { password: '154525', color: '#f1c40f' },
    'Карим': { password: '135635', color: '#e74c3c' },
    'Тимур': { password: '237560', color: '#3498db' }
};

// Функция для получения цвета пользователя по имени
function getUserColor(username) {
    switch(username) {
        case 'Артур': return '#2ecc71';
        case 'Дамир': return '#f1c40f';
        case 'Карим': return '#e74c3c';
        case 'Тимур': return '#3498db';
        default: return '#9b59b6';
    }
}

// Функция для сохранения чатов в localStorage
function saveChatsToLocalStorage(chats) {
    localStorage.setItem('kmes-chats', JSON.stringify(chats));
}

// Функция для загрузки чатов из localStorage
function loadChatsFromLocalStorage() {
    const savedChats = localStorage.getItem('kmes-chats');
    if (savedChats) {
        return JSON.parse(savedChats);
    }
    
    // Если чатов нет, возвращаем начальное состояние
    return {
        'group-chat': {
            name: 'Общий чат',
            avatar: 'К',
            color: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e74c3c, #3498db)',
            messages: [
                { sender: 'Артур', text: 'Привет всем!', time: '10:30' },
                { sender: 'Дамир', text: 'Привет! Как дела?', time: '10:32' },
                { sender: 'Тимур', text: 'Всё отлично, спасибо!', time: '10:35' },
                { sender: 'Карим', text: 'Ребята, когда встречаемся?', time: '11:20' }
            ]
        },
        'Артур': {
            name: 'Артур',
            avatar: 'А',
            color: '#2ecc71',
            messages: [
                { sender: 'Артур', text: 'Привет! Как дела?', time: '09:15' }
            ]
        },
        'Дамир': {
            name: 'Дамир',
            avatar: 'Д',
            color: '#f1c40f',
            messages: [
                { sender: 'Дамир', text: 'Где встречаемся?', time: '12:05' }
            ]
        },
        'Карим': {
            name: 'Карим',
            avatar: 'К',
            color: '#e74c3c',
            messages: [
                { sender: 'Карим', text: 'Отправил тебе файл', time: '15:30' }
            ]
        },
        'Тимур': {
            name: 'Тимур',
            avatar: 'Т',
            color: '#3498db',
            messages: [
                { sender: 'Тимур', text: 'Завтра в 10?', time: '18:45' }
            ]
        }
    };
}

// Основная функция инициализации мессенджера
function initMessenger(currentUser) {
    // Загружаем чаты из localStorage
    let chats = loadChatsFromLocalStorage();

    // Устанавливаем данные пользователя в интерфейс
    document.getElementById('user-name').textContent = currentUser.name;
    const userAvatar = document.getElementById('user-avatar');
    userAvatar.textContent = currentUser.name.charAt(0);
    userAvatar.style.backgroundColor = currentUser.color;

    // Элементы интерфейса
    const chatItems = document.querySelectorAll('.chat-item');
    const messagesContainer = document.getElementById('messages-container');
    const currentChatName = document.getElementById('current-chat-name');
    const currentChatAvatar = document.getElementById('current-chat-avatar');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    const clearChatBtn = document.getElementById('clear-chat');

    // Текущий активный чат
    let activeChat = 'group-chat';

    // Функция для отображения сообщений
    function displayMessages(chatId) {
        const chat = chats[chatId];
        messagesContainer.innerHTML = '';

        chat.messages.forEach(msg => {
            const isCurrentUser = msg.sender === currentUser.name;
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.style.justifyContent = isCurrentUser ? 'flex-end' : 'flex-start';

            messageElement.innerHTML = `
                ${!isCurrentUser ? `<div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">${msg.sender.charAt(0)}</div>` : ''}
                <div class="message-content" style="align-items: ${isCurrentUser ? 'flex-end' : 'flex-start'}">
                    ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                    <div class="message-text">${msg.text}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
                ${isCurrentUser ? `<div class="message-avatar" style="background-color: ${currentUser.color}">${currentUser.name.charAt(0)}</div>` : ''}
            `;

            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Обработчик клика по чату
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            chatItems.forEach(chat => chat.classList.remove('active'));
            this.classList.add('active');
            
            activeChat = this.getAttribute('data-chat');
            currentChatName.textContent = chats[activeChat].name;
            currentChatAvatar.textContent = chats[activeChat].avatar;
            
            if (activeChat === 'group-chat') {
                currentChatAvatar.style.background = chats[activeChat].color;
            } else {
                currentChatAvatar.style.background = getUserColor(activeChat);
            }
            
            displayMessages(activeChat);
        });
    });

    // Функция обновления превью чата
    function updateChatPreview(chatId, lastMessage) {
        const chatItem = document.querySelector(`.chat-item[data-chat="${chatId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector('.chat-preview');
            preview.textContent = lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;
        }
    }

    // Отправка сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            chats[activeChat].messages.push({
                sender: currentUser.name,
                text: text,
                time: time
            });
            
            // Сохраняем обновленные чаты
            saveChatsToLocalStorage(chats);
            
            messageInput.value = '';
            displayMessages(activeChat);
            updateChatPreview(activeChat, text);
        }
    }

    // Обработчики событий
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    clearChatBtn.addEventListener('click', function() {
        if (confirm('Вы действительно хотите очистить историю чата?')) {
            chats[activeChat].messages = [];
            saveChatsToLocalStorage(chats);
            displayMessages(activeChat);
            
            const chatItem = document.querySelector(`.chat-item[data-chat="${activeChat}"]`);
            if (chatItem) {
                const preview = chatItem.querySelector('.chat-preview');
                preview.textContent = 'Нет сообщений';
            }
        }
    });

    // Инициализация - показываем сообщения из общего чата
    displayMessages(activeChat);
}

// Обработка авторизации
document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        initMessenger(currentUser);
        return;
    }

    // Обработчик входа
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            errorMsg.textContent = 'Пожалуйста, заполните все поля';
            return;
        }

        if (users[username] && users[username].password === password) {
            const userData = {
                name: username,
                color: users[username].color
            };
            
            // Сохраняем пользователя
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            authContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            initMessenger(userData);
        } else {
            errorMsg.textContent = 'Неверное имя пользователя или пароль';
        }
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});