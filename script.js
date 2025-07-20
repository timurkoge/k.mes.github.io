// Данные пользователей для авторизации
const users = {
    'Артур': { password: '125364', color: '#2ecc71' },
    'Дамир': { password: '154525', color: '#f1c40f' },
    'Карим': { password: '135635', color: '#e74c3c' },
    'Тимур': { password: '237560', color: '#3498db' }
};

// Стикеры
const stickers = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'
];

// Загрузка чатов из localStorage
function loadChatsFromLocalStorage() {
    const savedChats = localStorage.getItem('kmes-chats');
    return savedChats ? JSON.parse(savedChats) : {
        'group-chat': {
            name: 'Общий чат',
            avatar: 'К',
            color: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e74c3c, #3498db)',
            messages: []
        },
        'Артур': { name: 'Артур', avatar: 'А', color: '#2ecc71', messages: [] },
        'Дамир': { name: 'Дамир', avatar: 'Д', color: '#f1c40f', messages: [] },
        'Карим': { name: 'Карим', avatar: 'К', color: '#e74c3c', messages: [] },
        'Тимур': { name: 'Тимур', avatar: 'Т', color: '#3498db', messages: [] }
    };
}

// Сохранение чатов в localStorage
function saveChatsToLocalStorage(chats) {
    localStorage.setItem('kmes-chats', JSON.stringify(chats));
}

// Получение цвета пользователя
function getUserColor(username) {
    switch(username) {
        case 'Артур': return '#2ecc71';
        case 'Дамир': return '#f1c40f';
        case 'Карим': return '#e74c3c';
        case 'Тимур': return '#3498db';
        default: return '#9b59b6';
    }
}

// Генерация случайного ответа
function getRandomReply() {
    const replies = [
        'Привет!',
        'Как дела?',
        'Что нового?',
        'Я сейчас занят',
        'Давай позже',
        'Хорошо',
        'Согласен',
        'Интересно',
        'Понятно',
        'Спасибо!'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
}

// Инициализация мессенджера
function initMessenger(currentUser) {
    let chats = loadChatsFromLocalStorage();
    let activeChat = 'group-chat';
    
    // Элементы интерфейса
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const chatsList = document.getElementById('chats-list');
    const messagesContainer = document.getElementById('messages-container');
    const currentChatAvatar = document.getElementById('current-chat-avatar');
    const currentChatName = document.getElementById('current-chat-name');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const attachBtn = document.getElementById('attach-btn');
    const stickersBtn = document.getElementById('stickers-btn');
    const clearChatBtn = document.getElementById('clear-chat');
    const stickersModal = document.getElementById('stickers-modal');
    const fileModal = document.getElementById('file-modal');
    const stickersGrid = document.getElementById('stickers-grid');
    const fileInput = document.getElementById('file-input');
    const sendFileBtn = document.getElementById('send-file-btn');
    const closeModals = document.querySelectorAll('.close-modal');

    // Установка данных пользователя
    userAvatar.textContent = currentUser.name.charAt(0);
    userAvatar.style.backgroundColor = currentUser.color;
    userName.textContent = currentUser.name;

    // Загрузка списка чатов
    function loadChatsList() {
        chatsList.innerHTML = '';
        
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            const lastMessage = chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].text 
                : 'Нет сообщений';
            
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatId === activeChat ? 'active' : ''}`;
            chatItem.setAttribute('data-chat', chatId);
            
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background-color: ${chatId === 'group-chat' ? '' : getUserColor(chatId)}">
                    ${chat.avatar}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${lastMessage}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                activeChat = chatId;
                loadChatsList();
                displayMessages(activeChat);
            });
            
            chatsList.appendChild(chatItem);
        });
    }

    // Отображение сообщений
    function displayMessages(chatId) {
        const chat = chats[chatId];
        messagesContainer.innerHTML = '';
        currentChatName.textContent = chat.name;
        currentChatAvatar.textContent = chat.avatar;
        
        if (chatId === 'group-chat') {
            currentChatAvatar.style.background = chat.color;
        } else {
            currentChatAvatar.style.background = getUserColor(chatId);
        }
        
        chat.messages.forEach(msg => {
            const isCurrentUser = msg.sender === currentUser.name;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isCurrentUser ? 'my-message' : ''}`;
            
            if (msg.file) {
                // Сообщение с файлом
                messageElement.innerHTML = `
                    ${!isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">
                        ${msg.sender.charAt(0)}
                    </div>` : ''}
                    
                    <div class="message-content">
                        ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                        <div class="file-message">
                            <div class="file-icon">
                                <i class="fas ${msg.file.type.includes('image') ? 'fa-image' : 'fa-file'}"></i>
                            </div>
                            <div class="file-name">${msg.file.name}</div>
                            <div class="file-download" onclick="downloadFile('${msg.file.url}', '${msg.file.name}')">
                                <i class="fas fa-download"></i>
                            </div>
                        </div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                    
                    ${isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${currentUser.color}">
                        ${currentUser.name.charAt(0)}
                    </div>` : ''}
                `;
            } else {
                // Текстовое сообщение или стикер
                messageElement.innerHTML = `
                    ${!isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">
                        ${msg.sender.charAt(0)}
                    </div>` : ''}
                    
                    <div class="message-content">
                        ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                        <div class="message-text">${msg.text}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                    
                    ${isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${currentUser.color}">
                        ${currentUser.name.charAt(0)}
                    </div>` : ''}
                `;
            }
            
            messagesContainer.appendChild(messageElement);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Отправка сообщения
    function sendMessage(text, isSticker = false, file = null) {
        if (!text && !file) return;
        
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newMessage = {
            sender: currentUser.name,
            text: text || '',
            time: time,
            isSticker: isSticker,
            file: file
        };
        
        chats[activeChat].messages.push(newMessage);
        saveChatsToLocalStorage(chats);
        
        // Обновление интерфейса
        displayMessages(activeChat);
        loadChatsList();
        
        // Автоматический ответ в личных чатах
        if (activeChat !== 'group-chat') {
            setTimeout(() => {
                const replyMessage = {
                    sender: activeChat,
                    text: getRandomReply(),
                    time: `${now.getHours()}:${(now.getMinutes()+1).toString().padStart(2, '0')}`
                };
                
                chats[activeChat].messages.push(replyMessage);
                saveChatsToLocalStorage(chats);
                displayMessages(activeChat);
                loadChatsList();
            }, 1000 + Math.random() * 2000);
        }
    }

    // Загрузка файла (эмуляция)
    function uploadFile(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileUrl = URL.createObjectURL(file);
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: fileUrl
                });
            }, 500);
        });
    }

    // Инициализация стикеров
    function initStickers() {
        stickersGrid.innerHTML = '';
        stickers.forEach(sticker => {
            const stickerElement = document.createElement('div');
            stickerElement.className = 'sticker';
            stickerElement.textContent = sticker;
            stickerElement.addEventListener('click', () => {
                sendMessage(sticker, true);
                stickersModal.style.display = 'none';
            });
            stickersGrid.appendChild(stickerElement);
        });
    }

    // Обработчики событий
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim()) {
            sendMessage(messageInput.value.trim());
            messageInput.value = '';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('auth-container').style.display = 'block';
    });

    attachBtn.addEventListener('click', () => {
        fileModal.style.display = 'flex';
    });

    stickersBtn.addEventListener('click', () => {
        stickersModal.style.display = 'flex';
    });

    clearChatBtn.addEventListener('click', () => {
        if (confirm('Вы действительно хотите очистить историю чата?')) {
            chats[activeChat].messages = [];
            saveChatsToLocalStorage(chats);
            displayMessages(activeChat);
            loadChatsList();
        }
    });

    sendFileBtn.addEventListener('click', async () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const uploadedFile = await uploadFile(file);
            sendMessage('', false, uploadedFile);
            fileInput.value = '';
            fileModal.style.display = 'none';
        }
    });

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Глобальная функция для скачивания файлов
    window.downloadFile = function(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Инициализация
    initStickers();
    loadChatsList();
    displayMessages(activeChat);
}

// Обработка авторизации
document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    // Проверка авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        initMessenger(currentUser);
        return;
    }

    // Обработчик входа
    loginBtn.addEventListener('click', () => {
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
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            authContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            initMessenger(userData);
        } else {
            errorMsg.textContent = 'Неверное имя пользователя или пароль';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});