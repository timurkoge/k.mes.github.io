class KMessenger {
    constructor() {
        this.users = {
            'Артур': { password: this.hashPassword('125364'), color: '#2ecc71' },
            'Дамир': { password: this.hashPassword('154525'), color: '#f1c40f' },
            'Карим': { password: this.hashPassword('135635'), color: '#e74c3c' },
            'Тимур': { password: this.hashPassword('237560'), color: '#3498db' }
        };
        
        this.stickers = [...]; // Все стикеры из предыдущей версии
        this.currentUser = null;
        this.chats = {};
        this.activeChat = 'group-chat';
        this.init();
    }

    // Хеширование пароля (простое для примера)
    hashPassword(pass) {
        return btoa(unescape(encodeURIComponent(pass)));
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        const authData = localStorage.getItem('kmessenger_auth');
        if (authData) {
            try {
                const { username, token } = JSON.parse(authData);
                if (this.verifyAuthToken(username, token)) {
                    this.currentUser = { 
                        name: username, 
                        color: this.users[username].color 
                    };
                    this.loadChats();
                    this.showUI();
                    return;
                }
            } catch (e) {
                console.error('Auth error:', e);
            }
        }
        this.showAuth();
    }

    verifyAuthToken(username, token) {
        // В реальном приложении должна быть сложная проверка
        return this.users[username] && token === this.hashPassword(username);
    }

    showAuth() {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    showUI() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        this.initUI();
    }

    initUI() {
        this.elements = {
            // Все элементы из предыдущей версии
        };
        
        this.setupUIEventListeners();
        this.render();
    }

    loadChats() {
        const chatsData = localStorage.getItem(`kmessenger_chats_${this.currentUser.name}`);
        this.chats = chatsData ? JSON.parse(chatsData) : this.getDefaultChats();
        
        // Ограничение истории сообщений
        Object.values(this.chats).forEach(chat => {
            if (chat.messages.length > 1000) {
                chat.messages = chat.messages.slice(-1000);
            }
        });
    }

    getDefaultChats() {
        return {
            'group-chat': {
                name: 'Общий чат',
                avatar: 'К',
                color: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e74c3c, #3498db)',
                messages: []
            },
            // Личные чаты...
        };
    }

    saveChats() {
        try {
            localStorage.setItem(
                `kmessenger_chats_${this.currentUser.name}`, 
                JSON.stringify(this.chats)
            );
        } catch (e) {
            console.error('Storage error:', e);
            this.cleanupOldMessages();
        }
    }

    cleanupOldMessages() {
        Object.values(this.chats).forEach(chat => {
            chat.messages = chat.messages.slice(-500);
        });
        this.saveChats();
    }

    async sendMessage(content, options = {}) {
        if (!content && !options.file) return;
        
        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            sender: this.currentUser.name,
            text: content || '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...options
        };
        
        // Валидация и очистка HTML
        if (message.text) {
            message.text = this.sanitizeHtml(message.text);
        }
        
        this.chats[this.activeChat].messages.push(message);
        this.saveChats();
        
        await this.renderMessages();
        this.scrollToBottom(true);
        
        // Обновление списка чатов
        this.renderChatList();
    }

    sanitizeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async handleFileUpload(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
            throw new Error('Файл слишком большой');
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
        document.getElementById('message-input-container').prepend(bar);
        
        return {
            update: (percent) => {
                bar.style.width = `${percent}%`;
            },
            finish: () => {
                bar.remove();
            },
            error: () => {
                bar.style.backgroundColor = 'red';
                setTimeout(() => bar.remove(), 2000);
            }
        };
    }

    // Все остальные методы из предыдущей версии
    // ... (рендеринг, обработчики событий и т.д.)
    
    // Новые методы для исправления багов
    setupUIEventListeners() {
        // Безопасные обработчики с удалением при необходимости
        this.cleanupEventListeners();
        
        // Основные обработчики
        this.elements.sendBtn.addEventListener('click', this.handleSend.bind(this));
        this.elements.messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Контекстное меню
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // Оптимизированный скролл
        this.elements.messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
    }
    
    cleanupEventListeners() {
        // Удаление старых обработчиков
        if (this._events) {
            Object.entries(this._events).forEach(([el, handlers]) => {
                handlers.forEach(([type, handler]) => {
                    el.removeEventListener(type, handler);
                });
            });
        }
        this._events = new WeakMap();
    }
    
    handleScroll() {
        // Виртуализация при скролле
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.renderVisibleMessages();
        }, 100);
    }
    
    renderVisibleMessages() {
        // Реализация виртуализации
        const container = this.elements.messagesContainer;
        const scrollTop = container.scrollTop;
        const height = container.clientHeight;
        
        // Расчет видимого диапазона
        const startIdx = Math.floor(scrollTop / 50); // Примерная высота элемента
        const endIdx = Math.ceil((scrollTop + height) / 50);
        
        // Рендер только видимых сообщений
        // ...
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new KMessenger();
    
    // Глобальные хелперы
    window.downloadFile = (url, name) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    };
});