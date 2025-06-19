// themeToggle.js - Handles dark/light mode switching

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.updateToggleButton();
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Keyboard shortcut (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                }
            });
        }
    }

    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('culturalExplorerTheme');
            return savedTheme || 'auto';
        } catch (error) {
            console.error('Error loading theme preference:', error);
            return 'auto';
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('culturalExplorerTheme', theme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.setTheme(themes[nextIndex]);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateToggleButton();
        this.showThemeNotification(theme);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;

        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');

        let effectiveTheme = theme;

        if (theme === 'auto') {
            // Use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                effectiveTheme = 'dark';
            } else {
                effectiveTheme = 'light';
            }
        }

        // Apply theme classes
        body.classList.add(`theme-${theme}`);
        root.classList.add(`theme-${effectiveTheme}`);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);

        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme, effectiveTheme: effectiveTheme }
        }));
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        const colors = {
            light: '#ffffff',
            dark: '#1a1a1a'
        };

        metaThemeColor.content = colors[theme] || colors.light;
    }

    updateToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (!toggleButton) return;

        const themeInfo = {
            light: {
                icon: 'fas fa-sun',
                text: 'Light Mode',
                title: 'Switch to Dark Mode'
            },
            dark: {
                icon: 'fas fa-moon',
                text: 'Dark Mode', 
                title: 'Switch to Auto Mode'
            },
            auto: {
                icon: 'fas fa-adjust',
                text: 'Auto Mode',
                title: 'Switch to Light Mode'
            }
        };

        const info = themeInfo[this.currentTheme];
        toggleButton.innerHTML = `<i class="${info.icon}"></i> ${info.text}`;
        toggleButton.title = info.title;
        toggleButton.setAttribute('aria-label', info.title);
    }

    showThemeNotification(theme) {
        const messages = {
            light: 'Switched to Light Mode',
            dark: 'Switched to Dark Mode',
            auto: 'Switched to Auto Mode (follows system preference)'
        };

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="theme-notification-content">
                <i class="fas fa-palette"></i>
                <span>${messages[theme]}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    // Method to programmatically set theme (useful for settings panel)
    setThemeFromSettings(theme) {
        if (['light', 'dark', 'auto'].includes(theme)) {
            this.setTheme(theme);
        }
    }
}

// Initialize theme manager
let themeManager;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}