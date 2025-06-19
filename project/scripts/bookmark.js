// bookmark.js - Handles favorites and bookmarking functionality
class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.init();
    }

    init() {
        this.updateBookmarkButtons();
        this.setupEventListeners();
    }

    // Load bookmarks from localStorage
    loadBookmarks() {
        try {
            const saved = localStorage.getItem('culturalExplorerBookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            return [];
        }
    }

    // Save bookmarks to localStorage
    saveBookmarks() {
        try {
            localStorage.setItem('culturalExplorerBookmarks', JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    }

    // Add a country to bookmarks
    addBookmark(countryData) {
        const bookmark = {
            id: countryData.id || countryData.name.toLowerCase().replace(/\s+/g, '-'),
            name: countryData.name,
            region: countryData.region,
            flag: countryData.flag || '',
            dateAdded: new Date().toISOString()
        };

        // Check if already bookmarked
        if (!this.isBookmarked(bookmark.id)) {
            this.bookmarks.push(bookmark);
            this.saveBookmarks();
            this.updateBookmarkButtons();
            this.showNotification(`${countryData.name} added to bookmarks!`, 'success');
            return true;
        }
        return false;
    }

    // Remove a country from bookmarks
    removeBookmark(countryId) {
        const index = this.bookmarks.findIndex(bookmark => bookmark.id === countryId);
        if (index > -1) {
            const removed = this.bookmarks.splice(index, 1)[0];
            this.saveBookmarks();
            this.updateBookmarkButtons();
            this.showNotification(`${removed.name} removed from bookmarks!`, 'info');
            return true;
        }
        return false;
    }

    // Check if a country is bookmarked
    isBookmarked(countryId) {
        return this.bookmarks.some(bookmark => bookmark.id === countryId);
    }

    // Toggle bookmark status
    toggleBookmark(countryData) {
        const countryId = countryData.id || countryData.name.toLowerCase().replace(/\s+/g, '-');
        
        if (this.isBookmarked(countryId)) {
            return this.removeBookmark(countryId);
        } else {
            return this.addBookmark(countryData);
        }
    }

    // Get all bookmarks
    getAllBookmarks() {
        return this.bookmarks.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Get bookmarks by region
    getBookmarksByRegion(region) {
        return this.bookmarks.filter(bookmark => 
            bookmark.region.toLowerCase() === region.toLowerCase()
        );
    }

    // Clear all bookmarks
    clearAllBookmarks() {
        if (confirm('Are you sure you want to remove all bookmarks?')) {
            this.bookmarks = [];
            this.saveBookmarks();
            this.updateBookmarkButtons();
            this.renderBookmarksList();
            this.showNotification('All bookmarks cleared!', 'info');
        }
    }

    // Update bookmark button states
    updateBookmarkButtons() {
        const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
        bookmarkButtons.forEach(button => {
            const countryId = button.getAttribute('data-country-id');
            const isBookmarked = this.isBookmarked(countryId);
            
            button.classList.toggle('bookmarked', isBookmarked);
            button.innerHTML = isBookmarked ? 
                '<i class="fas fa-bookmark"></i> Bookmarked' : 
                '<i class="far fa-bookmark"></i> Bookmark';
        });

        // Update bookmark counter
        const counter = document.querySelector('.bookmark-counter');
        if (counter) {
            counter.textContent = this.bookmarks.length;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle bookmark button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) {
                const button = e.target.closest('.bookmark-btn');
                const countryId = button.getAttribute('data-country-id');
                const countryName = button.getAttribute('data-country-name');
                const countryRegion = button.getAttribute('data-country-region');
                
                const countryData = {
                    id: countryId,
                    name: countryName,
                    region: countryRegion
                };
                
                this.toggleBookmark(countryData);
            }
        });

        // Handle clear all bookmarks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-bookmarks-btn')) {
                this.clearAllBookmarks();
            }
        });

        // Handle bookmark list item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-item')) {
                const item = e.target.closest('.bookmark-item');
                const countryId = item.getAttribute('data-country-id');
                
                // Navigate to country page
                if (typeof navigateToCountry === 'function') {
                    navigateToCountry(countryId);
                } else {
                    window.location.href = `country.html?id=${countryId}`;
                }
            }
        });
    }

    // Render bookmarks list
    renderBookmarksList(container = '.bookmarks-list') {
        const listContainer = document.querySelector(container);
        if (!listContainer) return;

        if (this.bookmarks.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-bookmarks">
                    <i class="fas fa-bookmark fa-3x"></i>
                    <h3>No bookmarks yet</h3>
                    <p>Start exploring countries and bookmark your favorites!</p>
                </div>
            `;
            return;
        }

        const bookmarksList = this.getAllBookmarks().map(bookmark => `
            <div class="bookmark-item" data-country-id="${bookmark.id}">
                <div class="bookmark-flag">
                    ${bookmark.flag ? `<span class="flag">${bookmark.flag}</span>` : '<i class="fas fa-flag"></i>'}
                </div>
                <div class="bookmark-info">
                    <h4>${bookmark.name}</h4>
                    <p class="region">${bookmark.region}</p>
                    <small class="date-added">Added ${this.formatDate(bookmark.dateAdded)}</small>
                </div>
                <button class="remove-bookmark-btn" data-country-id="${bookmark.id}" title="Remove bookmark">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        listContainer.innerHTML = bookmarksList;

        // Add event listeners for remove buttons
        listContainer.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const countryId = btn.getAttribute('data-country-id');
                this.removeBookmark(countryId);
                this.renderBookmarksList(container);
            });
        });
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Export bookmarks as JSON
    exportBookmarks() {
        const dataStr = JSON.stringify(this.bookmarks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cultural-explorer-bookmarks.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Bookmarks exported successfully!', 'success');
    }

    // Import bookmarks from JSON
    importBookmarks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedBookmarks = JSON.parse(e.target.result);
                if (Array.isArray(importedBookmarks)) {
                    this.bookmarks = [...this.bookmarks, ...importedBookmarks];
                    // Remove duplicates
                    this.bookmarks = this.bookmarks.filter((bookmark, index, self) => 
                        index === self.findIndex(b => b.id === bookmark.id)
                    );
                    this.saveBookmarks();
                    this.updateBookmarkButtons();
                    this.renderBookmarksList();
                    this.showNotification('Bookmarks imported successfully!', 'success');
                } else {
                    throw new Error('Invalid bookmark format');
                }
            } catch (error) {
                this.showNotification('Error importing bookmarks!', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize bookmark manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookmarkManager = new BookmarkManager();
});

// Helper function to create bookmark button
function createBookmarkButton(countryData) {
    const button = document.createElement('button');
    button.className = 'bookmark-btn';
    button.setAttribute('data-country-id', countryData.id || countryData.name.toLowerCase().replace(/\s+/g, '-'));
    button.setAttribute('data-country-name', countryData.name);
    button.setAttribute('data-country-region', countryData.region);
    
    const isBookmarked = window.bookmarkManager?.isBookmarked(countryData.id);
    button.innerHTML = isBookmarked ? 
        '<i class="fas fa-bookmark"></i> Bookmarked' : 
        '<i class="far fa-bookmark"></i> Bookmark';
    
    if (isBookmarked) {
        button.classList.add('bookmarked');
    }
    
    return button;
}