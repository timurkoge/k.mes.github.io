// Данные пользователей для авторизации
const users = {
    'Артур': { password: '125364', color: '#2ecc71' },
    'Дамир': { password: '154525', color: '#f1c40f' },
    'Карим': { password: '135635', color: '#e74c3c' },
    'Тимур': { password: '237560', color: '#3498db' }
};

// Увеличенная коллекция стикеров
const stickers = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
    '😢', '😭', '😤', '😠', '🤬', '😱', '🥵', '🥶', '😳', '🥺', '😈', '👿', '👹', '👺', '💀', '☠️',
    '👻', '👽', '🤖', '💩', '👾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁',
    '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🦋', '🐝', '🐞', '🦕', '🦖', '🐢', '🐍', '🦎',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '⚡', '🔥', '🌈', '✨', '🎉', '🎊', '🎁', '🎂', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉'
];

// Инициализация мессенджера
function initMessenger(currentUser) {
    // Загрузка чатов (теперь для каждого пользователя свои чаты)
    let chats = loadChatsFromLocalStorage(currentUser.name);
    let activeChat = 'group-chat';
    
    // DOM элементы
    const elements = {
        userAvatar: document.getElementById('user-avatar'),
        userName: document.getElementById('user-name'),
        chatsList: document.getElementById('chats-list'),
        messagesContainer: document.getElementById('messages-container'),
        currentChatAvatar: document.getElementById('current-chat-avatar'),
        currentChatName: document.getElementById('current-chat-name'),
        messageInput: document.getElementById('message-input'),
        sendBtn: document.getElementById('send-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        attachBtn: document.getElementById('attach-btn'),
        stickersBtn: document.getElementById('stickers-btn'),
        clearChatBtn: document.getElementById('clear-chat'),
        stickersModal: document.getElementById('stickers-modal'),
        fileModal: document.getElementById('file-modal'),
        stickersGrid: document.getElementById('stickers-grid'),
        fileInput: document.getElementById('file-input'),
        sendFileBtn: document.getElementById('send-file-btn'),
        stickerPreview: document.getElementById('sticker-preview'),
        sendStickerBtn: document.getElementById('send-sticker-btn')
    };

    // Установка данных пользователя
    elements.userAvatar.textContent = currentUser.name.charAt(0);
    elements.userAvatar.style.backgroundColor = currentUser.color;
    elements.userName.textContent = currentUser.name;

    // Загрузка списка чатов
    function loadChatsList() {
        elements.chatsList.innerHTML = '';
        
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            const lastMessage = chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].text || '📎 Файл'
                : 'Нет сообщений';
            
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatId === activeChat ? 'active' : ''}`;
            chatItem.setAttribute('data-chat', chatId);
            
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background: ${chatId === 'group-chat' ? chat.color : getUserColor(chatId)}">
                    ${chat.avatar}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${lastMessage.length > 25 ? lastMessage.substring(0, 25) + '...' : lastMessage}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                activeChat = chatId;
                loadChatsList();
                displayMessages(activeChat);
            });
            
            elements.chatsList.appendChild(chatItem);
        });
    }

    // Отображение сообщений с отступами
    function displayMessages(chatId) {
        const chat = chats[chatId];
        elements.messagesContainer.innerHTML = '';
        elements.currentChatName.textContent = chat.name;
        elements.currentChatAvatar.textContent = chat.avatar;
        elements.currentChatAvatar.style.background = chatId === 'group-chat' ? chat.color : getUserColor(chatId);
        
        // Добавляем отступ сверху
        const paddingElement = document.createElement('div');
        paddingElement.style.height = '20px';
        elements.messagesContainer.appendChild(paddingElement);
        
        chat.messages.forEach(msg => {
            const isCurrentUser = msg.sender === currentUser.name;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isCurrentUser ? 'my-message' : ''}`;
            
            if (msg.isSticker) {
                messageElement.innerHTML = `
                    ${!isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">
                        ${msg.sender.charAt(0)}
                    </div>` : ''}
                    
                    <div class="message-content">
                        ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                        <div class="sticker-message">${msg.text}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                    
                    ${isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${currentUser.color}">
                        ${currentUser.name.charAt(0)}
                    </div>` : ''}
                `;
            } else if (msg.file) {
                messageElement.innerHTML = `
                    ${!isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">
                        ${msg.sender.charAt(0)}
                    </div>` : ''}
                    
                    <div class="message-content">
                        ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                        <div class="file-message" onclick="downloadFile('${msg.file.url}', '${msg.file.name}')">
                            <div class="file-icon">
                                <i class="fas ${getFileIcon(msg.file.type)}"></i>
                            </div>
                            <div class="file-name">${msg.file.name}</div>
                            <div class="file-download">
                                <i class="fas fa-download"></i>
                            </div>
                        </div>
                        <div class="message-time">${msg.time} ${isCurrentUser ? '✓✓' : ''}</div>
                    </div>
                    
                    ${isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${currentUser.color}">
                        ${currentUser.name.charAt(0)}
                    </div>` : ''}
                `;
            } else {
                messageElement.innerHTML = `
                    ${!isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${getUserColor(msg.sender)}">
                        ${msg.sender.charAt(0)}
                    </div>` : ''}
                    
                    <div class="message-content">
                        ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                        <div class="message-text">${msg.text}</div>
                        <div class="message-time">${msg.time} ${isCurrentUser ? '✓✓' : ''}</div>
                    </div>
                    
                    ${isCurrentUser ? `
                    <div class="message-avatar" style="background-color: ${currentUser.color}">
                        ${currentUser.name.charAt(0)}
                    </div>` : ''}
                `;
            }
            
            elements.messagesContainer.appendChild(messageElement);
        });
        
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }

    // Отправка сообщения (теперь с разделением чатов)
    function sendMessage(text, isSticker = false, file = null) {
        if (!text && !file) return;
        
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newMessage = {
            sender: currentUser.name,
            text: text,
            time: time,
            isSticker: isSticker,
            file: file
        };
        
        // Добавляем только в активный чат
        chats[activeChat].messages.push(newMessage);
        saveChatsToLocalStorage(currentUser.name, chats);
        
        displayMessages(activeChat);
        loadChatsList();
    }

    // Инициализация стикеров (увеличенный набор)
    function initStickers() {
        elements.stickersGrid.innerHTML = '';
        let selectedSticker = stickers[0];
        elements.stickerPreview.textContent = selectedSticker;
        
        stickers.forEach(sticker => {
            const stickerBtn = document.createElement('button');
            stickerBtn.className = 'sticker-btn';
            stickerBtn.textContent = sticker;
            
            stickerBtn.addEventListener('click', () => {
                selectedSticker = sticker;
                elements.stickerPreview.textContent = selectedSticker;
            });
            
            elements.stickersGrid.appendChild(stickerBtn);
        });
        
        elements.sendStickerBtn.addEventListener('click', () => {
            sendMessage(selectedSticker, true);
            elements.stickersModal.style.display = 'none';
        });
    }

    // Загрузка файлов с персонализацией
    async function handleFileUpload(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: `${currentUser.name}_${Date.now()}_${file.name}`,
                    type: file.type,
                    size: file.size,
                    url: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Вспомогательные функции
    function getFileIcon(fileType) {
        if (fileType.includes('image')) return 'fa-image';
        if (fileType.includes('audio')) return 'fa-music';
        if (fileType.includes('video')) return 'fa-video';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
        return 'fa-file';
    }

    function setupEventListeners() {
        elements.sendBtn.addEventListener('click', () => {
            const text = elements.messageInput.value.trim();
            if (text) {
                sendMessage(text);
                elements.messageInput.value = '';
            }
        });

        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && elements.messageInput.value.trim()) {
                sendMessage(elements.messageInput.value.trim());
                elements.messageInput.value = '';
            }
        });

        elements.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            location.reload();
        });

        elements.attachBtn.addEventListener('click', () => {
            elements.fileModal.style.display = 'flex';
        });

        elements.stickersBtn.addEventListener('click', () => {
            elements.stickersModal.style.display = 'flex';
        });

        elements.clearChatBtn.addEventListener('click', () => {
            if (confirm('Вы действительно хотите очистить историю чата?')) {
                chats[activeChat].messages = [];
                saveChatsToLocalStorage(currentUser.name, chats);
                displayMessages(activeChat);
                loadChatsList();
            }
        });

        elements.sendFileBtn.addEventListener('click', async () => {
            if (elements.fileInput.files.length > 0) {
                const file = elements.fileInput.files[0];
                const uploadedFile = await handleFileUpload(file);
                sendMessage('', false, uploadedFile);
                elements.fileInput.value = '';
                elements.fileModal.style.display = 'none';
            }
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Глобальные функции
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
    setupEventListeners();
}

// Загрузка чатов для конкретного пользователя
function loadChatsFromLocalStorage(username) {
    const savedChats = localStorage.getItem(`kmes-chats-${username}`);
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

function saveChatsToLocalStorage(username, chats) {
    localStorage.setItem(`kmes-chats-${username}`, JSON.stringify(chats));
}

function getUserColor(username) {
    switch(username) {
        case 'Артур': return '#2ecc71';
        case 'Дамир': return '#f1c40f';
        case 'Карим': return '#e74c3c';
        case 'Тимур': return '#3498db';
        default: return '#9b59b6';
    }
}

// Обработка авторизации
document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        initMessenger(currentUser);
        return;
    }

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