class KMessenger {
    constructor() {
        // Инициализация данных
        this.users = {
            'Артур': { password: this.hashPassword('125364'), color: '#2ecc71' },
            'Дамир': { password: this.hashPassword('154525'), color: '#f1c40f' },
            'Карим': { password: this.hashPassword('135635'), color: '#e74c3c' },
            'Тимур': { password: this.hashPassword('237560'), color: '#3498db' }
        };
        
        this.stickers = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', 
            '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
            '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😢', '😭', '😤', '😠',
            '🤬', '😱', '🥵', '🥶', '😳', '🥺', '😈', '👿', '👹', '👺', '💀', '☠️',
            '👻', '👽', '🤖', '💩', '👾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
            '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄',
            '🦋', '🐝', '🐞', '🦕', '🦖', '🐢', '🐍', '🦎', '❤️', '🧡', '💛', '💚',
            '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
            '💘', '💝', '💟', '⚡', '🔥', '🌈', '✨', '🎉', '🎊', '🎁', '🎂', '🎈'
        ];
        
        this.currentUser = null;
        this.chats = {};
        this.activeChat = 'group-chat';
        this.elements = {};
        this.messageCache = new Map();
        this.typingTimeout = null;
        this.isTyping = false;
        this.init();
    }

    // Хеширование пароля (упрощенное для примера)
    hashPassword(pass) {
        return btoa(unescape(encodeURIComponent(pass + 'SALT'))).slice(0, 32);
    }

    init() {
        this.checkAuth();
    }

    // Проверка авторизации
    async checkAuth() {
        const authData = localStorage.getItem('kmessenger_auth');
        
        if (authData) {
            try {
                const { username, token } = JSON.parse(authData);
                
                if (this.users[username] && token === this.hashPassword(username)) {
                    this.currentUser = { 
                        name: username, 
                        color: this.users[username].color 
                    };
                    await this.loadChats();
                    this.showUI();
                    return;
                }
            } catch (e) {
                console.error('Auth error:', e);
            }
            localStorage.removeItem('kmessenger_auth');
        }
        this.showAuth();
    }

    // Показ формы авторизации
    showAuth() {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        
        document.getElementById('login-btn').onclick = async () => {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                this.showError('Пожалуйста, заполните все поля');
                return;
            }

            if (this.users[username] && this.hashPassword(password) === this.users[username].password) {
                localStorage.setItem('kmessenger_auth', JSON.stringify({
                    username,
                    token: this.hashPassword(username)
                }));
                
                this.currentUser = { 
                    name: username, 
                    color: this.users[username].color 
                };
                
                await this.loadChats();
                this.showUI();
            } else {
                this.showError('Неверное имя пользователя или пароль');
            }
        };
    }

    showError(message) {
        const errorEl = document.getElementById('error-msg');
        errorEl.textContent = message;
        setTimeout(() => errorEl.textContent = '', 3000);
    }

    // Загрузка чатов с защитой от переполнения
    async loadChats() {
        try {
            const chatsData = localStorage.getItem(`kmessenger_chats_${this.currentUser.name}`);
            this.chats = chatsData ? JSON.parse(chatsData) : this.getDefaultChats();
            
            // Очистка старых сообщений
            for (const chatId in this.chats) {
                if (this.chats[chatId].messages.length > 1000) {
                    this.chats[chatId].messages = this.chats[chatId].messages.slice(-1000);
                }
            }
        } catch (e) {
            console.error('Load chats error:', e);
            this.chats = this.getDefaultChats();
        }
    }

    getDefaultChats() {
        return {
            'group-chat': {
                name: 'Общий чат',
                avatar: 'К',
                color: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e74c3c, #3498db)',
                messages: []
            },
            'Артур': { 
                name: 'Артур', 
                avatar: 'А', 
                color: '#2ecc71', 
                messages: [] 
            },
            'Дамир': { 
                name: 'Дамир', 
                avatar: 'Д', 
                color: '#f1c40f', 
                messages: [] 
            },
            'Карим': { 
                name: 'Карим', 
                avatar: 'К', 
                color: '#e74c3c', 
                messages: [] 
            },
            'Тимур': { 
                name: 'Тимур', 
                avatar: 'Т', 
                color: '#3498db', 
                messages: [] 
            }
        };
    }

    // Сохранение чатов с обработкой ошибок
    async saveChats() {
        try {
            localStorage.setItem(
                `kmessenger_chats_${this.currentUser.name}`, 
                JSON.stringify(this.chats)
            );
        } catch (e) {
            console.error('Storage error:', e);
            await this.cleanupOldMessages();
        }
    }

    // Очистка старых сообщений при переполнении
    async cleanupOldMessages() {
        for (const chatId in this.chats) {
            this.chats[chatId].messages = this.chats[chatId].messages.slice(-500);
        }
        await this.saveChats();
    }

    // Показ основного интерфейса
    showUI() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        
        this.initElements();
        this.setupEventListeners();
        this.renderAll();
    }

    // Инициализация DOM элементов
    initElements() {
        this.elements = {
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
            sendStickerBtn: document.getElementById('send-sticker-btn'),
            chatMenuBtn: document.getElementById('chat-menu-btn'),
            dropdownMenu: document.querySelector('.dropdown-menu')
        };
        
        // Настройка аватара пользователя
        this.elements.userAvatar.textContent = this.currentUser.name.charAt(0);
        this.elements.userAvatar.style.backgroundColor = this.currentUser.color;
        this.elements.userName.textContent = this.currentUser.name;

        // Добавляем индикатор набора текста
        this.elements.typingIndicator = document.createElement('div');
        this.elements.typingIndicator.className = 'typing-indicator';
        this.elements.messageInputContainer.before(this.elements.typingIndicator);
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Очистка старых обработчиков
        this.cleanupEventListeners();
        
        // Основные обработчики
        this.elements.sendBtn.addEventListener('click', this.handleSend.bind(this));
        this.elements.messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        this.elements.attachBtn.addEventListener('click', this.handleAttach.bind(this));
        this.elements.stickersBtn.addEventListener('click', this.handleStickers.bind(this));
        this.elements.clearChatBtn.addEventListener('click', this.handleClearChat.bind(this));
        this.elements.sendFileBtn.addEventListener('click', this.handleSendFile.bind(this));
        this.elements.sendStickerBtn.addEventListener('click', this.handleSendSticker.bind(this));
        this.elements.chatMenuBtn.addEventListener('click', this.toggleChatMenu.bind(this));
        this.elements.messageInput.addEventListener('input', this.handleTyping.bind(this));
        
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Виртуализация списка сообщений
        this.elements.messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Контекстное меню
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('click', () => {
            const menu = document.querySelector('.context-menu');
            if (menu) menu.remove();
            this.elements.dropdownMenu.style.display = 'none';
        });
    }

    // Рендер всего интерфейса
    async renderAll() {
        this.renderChatList();
        await this.renderMessages();
        this.initStickers();
        this.scrollToBottom();
    }

    // Рендер списка чатов
    renderChatList() {
        this.elements.chatsList.innerHTML = '';
        
        for (const chatId in this.chats) {
            const chat = this.chats[chatId];
            const lastMessage = chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].text || 
                  (chat.messages[chat.messages.length - 1].file ? '📎 Файл' : '🎭 Стикер')
                : 'Нет сообщений';
            
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatId === this.activeChat ? 'active' : ''}`;
            chatItem.dataset.chat = chatId;
            
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background: ${chatId === 'group-chat' ? chat.color : this.getUserColor(chatId)}">
                    ${chat.avatar}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${this.truncate(lastMessage, 25)}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                this.activeChat = chatId;
                this.renderAll();
            });
            
            this.elements.chatsList.appendChild(chatItem);
        }
    }

    // Рендер сообщений с виртуализацией
    async renderMessages() {
        const chat = this.chats[this.activeChat];
        this.elements.messagesContainer.innerHTML = '';
        this.elements.currentChatName.textContent = chat.name;
        this.elements.currentChatAvatar.textContent = chat.avatar;
        this.elements.currentChatAvatar.style.background = 
            this.activeChat === 'group-chat' ? chat.color : this.getUserColor(this.activeChat);
        
        // Добавление отступа сверху
        const padding = document.createElement('div');
        padding.style.height = '20px';
        this.elements.messagesContainer.appendChild(padding);
        
        // Рендер только видимых сообщений
        await this.renderVisibleMessages();
    }

    // Рендер видимых сообщений
    async renderVisibleMessages() {
        const container = this.elements.messagesContainer;
        const chat = this.chats[this.activeChat];
        const scrollTop = container.scrollTop;
        const height = container.clientHeight;
        
        // Определение видимого диапазона
        const startIdx = Math.max(0, Math.floor(scrollTop / 60) - 5);
        const endIdx = Math.min(chat.messages.length, Math.ceil((scrollTop + height) / 60) + 5);
        
        // Создание фрагмента для оптимизации
        const fragment = document.createDocumentFragment();
        
        for (let i = startIdx; i < endIdx; i++) {
            const msg = chat.messages[i];
            const cached = this.messageCache.get(msg.id);
            
            if (cached) {
                fragment.appendChild(cached);
                continue;
            }
            
            const isCurrentUser = msg.sender === this.currentUser.name;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isCurrentUser ? 'my-message' : ''}`;
            
            if (msg.isSticker) {
                messageElement.innerHTML = this.renderStickerMessage(msg, isCurrentUser);
            } else if (msg.file) {
                messageElement.innerHTML = this.renderFileMessage(msg, isCurrentUser);
            } else {
                messageElement.innerHTML = this.renderTextMessage(msg, isCurrentUser);
            }
            
            this.messageCache.set(msg.id, messageElement);
            fragment.appendChild(messageElement);
        }
        
        container.appendChild(fragment);
    }

    // Рендер стикера
    renderStickerMessage(msg, isCurrentUser) {
        return `
            ${!isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.getUserColor(msg.sender)}">
                ${msg.sender.charAt(0)}
            </div>` : ''}
            
            <div class="message-content">
                ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                <div class="sticker-message">${msg.text}</div>
                <div class="message-time">${msg.time}</div>
            </div>
            
            ${isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.currentUser.color}">
                ${this.currentUser.name.charAt(0)}
            </div>` : ''}
        `;
    }

    // Рендер файла (с превью для изображений)
    renderFileMessage(msg, isCurrentUser) {
        const isImage = msg.file.type.includes('image');
        
        return `
            ${!isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.getUserColor(msg.sender)}">
                ${msg.sender.charAt(0)}
            </div>` : ''}
            
            <div class="message-content">
                ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                <div class="file-message">
                    ${isImage ? `
                    <div class="image-preview-container" onclick="showFullImage('${msg.file.url}')">
                        <img src="${msg.file.url}" class="image-message" alt="${msg.file.name}">
                    </div>` : `
                    <div class="file-icon">
                        <i class="fas ${this.getFileIcon(msg.file.type)}"></i>
                    </div>
                    <div class="file-name">${this.truncate(msg.file.name, 30)}</div>
                    <div class="file-download" onclick="downloadFile('${msg.file.url}', '${msg.file.name}')">
                        <i class="fas fa-download"></i>
                    </div>`}
                </div>
                <div class="message-time">${msg.time} ${isCurrentUser ? '✓✓' : ''}</div>
            </div>
            
            ${isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.currentUser.color}">
                ${this.currentUser.name.charAt(0)}
            </div>` : ''}
        `;
    }

    // Рендер текстового сообщения
    renderTextMessage(msg, isCurrentUser) {
        return `
            ${!isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.getUserColor(msg.sender)}">
                ${msg.sender.charAt(0)}
            </div>` : ''}
            
            <div class="message-content">
                ${!isCurrentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
                <div class="message-text">${this.sanitizeHtml(msg.text)}</div>
                <div class="message-time">${msg.time} ${isCurrentUser ? '✓✓' : ''}</div>
            </div>
            
            ${isCurrentUser ? `
            <div class="message-avatar" style="background-color: ${this.currentUser.color}">
                ${this.currentUser.name.charAt(0)}
            </div>` : ''}
        `;
    }

    // Инициализация стикеров
    initStickers() {
        this.elements.stickersGrid.innerHTML = '';
        let selectedSticker = this.stickers[0];
        this.elements.stickerPreview.textContent = selectedSticker;
        
        this.stickers.forEach(sticker => {
            const stickerBtn = document.createElement('button');
            stickerBtn.className = 'sticker-btn';
            stickerBtn.textContent = sticker;
            
            stickerBtn.addEventListener('click', () => {
                selectedSticker = sticker;
                this.elements.stickerPreview.textContent = selectedSticker;
            });
            
            this.elements.stickersGrid.appendChild(stickerBtn);
        });
    }

    // Обработчики событий
    async handleSend() {
        const text = this.elements.messageInput.value.trim();
        if (text) {
            await this.sendMessage(text);
            this.elements.messageInput.value = '';
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
    }

    async handleSendFile() {
        if (this.elements.fileInput.files.length > 0) {
            try {
                const file = this.elements.fileInput.files[0];
                const uploadedFile = await this.handleFileUpload(file);
                await this.sendMessage('', { file: uploadedFile });
                this.elements.fileInput.value = '';
                this.closeAllModals();
            } catch (e) {
                this.showError(e.message);
            }
        }
    }

    async handleSendSticker() {
        const sticker = this.elements.stickerPreview.textContent;
        if (sticker) {
            await this.sendMessage(sticker, { isSticker: true });
            this.closeAllModals();
        }
    }

    handleAttach() {
        this.closeAllModals();
        this.elements.fileModal.style.display = 'flex';
    }

    handleStickers() {
        this.closeAllModals();
        this.elements.stickersModal.style.display = 'flex';
    }

    toggleChatMenu() {
        this.elements.dropdownMenu.style.display = 
            this.elements.dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendTypingEvent(true);
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.sendTypingEvent(false);
        }, 2000);
    }

    sendTypingEvent(isTyping) {
        // В реальном приложении здесь бы отправлялось событие другим пользователям
        this.elements.typingIndicator.textContent = isTyping 
            ? `${this.currentUser.name} печатает...` : '';
    }

    async handleClearChat() {
        if (confirm('Вы действительно хотите очистить историю чата?')) {
            this.chats[this.activeChat].messages = [];
            await this.saveChats();
            this.renderMessages();
            this.renderChatList();
        }
    }

    handleLogout() {
        localStorage.removeItem('kmessenger_auth');
        location.reload();
    }

    handleScroll() {
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.renderVisibleMessages();
        }, 100);
    }

    handleContextMenu(e) {
        if (e.target.closest('.message')) {
            e.preventDefault();
            this.showContextMenu(e);
        }
    }

    // Вспомогательные методы
    async sendMessage(content, options = {}) {
        if (!content && !options.file) return;
        
        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            sender: this.currentUser.name,
            text: content || '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...options
        };
        
        // Валидация и очистка
        if (message.text) {
            message.text = this.sanitizeHtml(message.text);
        }
        
        this.chats[this.activeChat].messages.push(message);
        await this.saveChats();
        
        await this.renderMessages();
        this.scrollToBottom(true);
        this.renderChatList();
    }

    async handleFileUpload(file) {
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Файл слишком большой (макс. 10MB)');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const progress = this.showUploadProgress();
            
            reader.onload = (e) => {
                progress.finish();
                resolve({
                    name: `${this.currentUser.name}_${Date.now()}_${file.name}`,
                    type: file.type,
                    size: file.size,
                    url: e.target.result
                });
            };
            
            reader.onerror = () => {
                progress.error();
                reject(new Error('Ошибка загрузки файла'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    showUploadProgress() {
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        this.elements.messageInput.before(bar);
        
        return {
            update: (percent) => bar.style.width = `${percent}%`,
            finish: () => bar.remove(),
            error: () => {
                bar.style.backgroundColor = 'red';
                setTimeout(() => bar.remove(), 2000);
            }
        };
    }

    showContextMenu(e) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        
        menu.innerHTML = `
            <div class="menu-item" data-action="copy"><i class="fas fa-copy"></i> Копировать</div>
            <div class="menu-item" data-action="reply"><i class="fas fa-reply"></i> Ответить</div>
            <div class="menu-item" data-action="forward"><i class="fas fa-share"></i> Переслать</div>
            <div class="menu-item" data-action="delete"><i class="fas fa-trash"></i> Удалить</div>
        `;
        
        document.body.appendChild(menu);
        
        menu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMenuAction(item.dataset.action, e.target.closest('.message'));
                menu.remove();
            });
        });
    }

    handleMenuAction(action, messageElement) {
        const messageId = messageElement.dataset.id;
        const message = this.findMessageById(messageId);
        
        switch (action) {
            case 'copy':
                const text = messageElement.querySelector('.message-text')?.textContent || 
                            messageElement.querySelector('.file-name')?.textContent;
                if (text) navigator.clipboard.writeText(text);
                break;
            case 'reply':
                // Реализация ответа на сообщение
                this.elements.messageInput.value = `Ответ на "${text}": `;
                this.elements.messageInput.focus();
                break;
            case 'forward':
                // Реализация пересылки сообщения
                alert(`Сообщение будет переслано: "${text}"`);
                break;
            case 'delete':
                if (confirm('Удалить это сообщение?')) {
                    this.deleteMessage(messageId);
                }
                break;
        }
    }

    findMessageById(id) {
        for (const chatId in this.chats) {
            const message = this.chats[chatId].messages.find(m => m.id === id);
            if (message) return message;
        }
        return null;
    }

    async deleteMessage(id) {
        for (const chatId in this.chats) {
            this.chats[chatId].messages = this.chats[chatId].messages.filter(m => m.id !== id);
        }
        await this.saveChats();
        this.renderMessages();
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    scrollToBottom(smooth = false) {
        const container = this.elements.messagesContainer;
        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    getUserColor(username) {
        switch(username) {
            case 'Артур': return '#2ecc71';
            case 'Дамир': return '#f1c40f';
            case 'Карим': return '#e74c3c';
            case 'Тимур': return '#3498db';
            default: return '#9b59b6';
        }
    }

    getFileIcon(fileType) {
        if (fileType.includes('image')) return 'fa-image';
        if (fileType.includes('audio')) return 'fa-music';
        if (fileType.includes('video')) return 'fa-video';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
        return 'fa-file';
    }

    sanitizeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    cleanupEventListeners() {
        // Очистка всех обработчиков событий
        this.elements.sendBtn.removeEventListener('click', this.handleSend);
        this.elements.messageInput.removeEventListener('keydown', this.handleKeyDown);
        this.elements.logoutBtn.removeEventListener('click', this.handleLogout);
        this.elements.attachBtn.removeEventListener('click', this.handleAttach);
        this.elements.stickersBtn.removeEventListener('click', this.handleStickers);
        this.elements.clearChatBtn.removeEventListener('click', this.handleClearChat);
        this.elements.sendFileBtn.removeEventListener('click', this.handleSendFile);
        this.elements.sendStickerBtn.removeEventListener('click', this.handleSendSticker);
        this.elements.chatMenuBtn.removeEventListener('click', this.toggleChatMenu);
        this.elements.messageInput.removeEventListener('input', this.handleTyping);
        this.elements.messagesContainer.removeEventListener('scroll', this.handleScroll);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new KMessenger();
    
    // Глобальные функции
    window.downloadFile = (url, name) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    };

    window.showFullImage = function(src) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <span class="close-image-modal">&times;</span>
            <img class="image-modal-content" src="${src}">
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-image-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };
});