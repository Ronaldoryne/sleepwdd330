// map.js - Interactive world map functionality
class InteractiveWorldMap {
    constructor(containerId) {
        this.containerId = containerId;
        this.mapContainer = document.getElementById(containerId);
        this.countries = [];
        this.selectedCountry = null;
        this.searchQuery = '';
        this.currentRegion = 'all';
        this.mapData = null;
        this.tooltip = null;
        
        this.init();
    }

    async init() {
        await this.loadCountryData();
        this.createMapElements();
        this.setupEventListeners();
        this.createTooltip();
        this.renderMap();
    }

    // Load country data from JSON file
    async loadCountryData() {
        try {
            const response = await fetch('data/cultures.json');
            if (response.ok) {
                this.countries = await response.json();
            } else {
                // Fallback to default data
                this.countries = this.getDefaultCountries();
            }
        } catch (error) {
            console.error('Error loading country data:', error);
            this.countries = this.getDefaultCountries();
        }
    }

    // Default country data if JSON fails to load
    getDefaultCountries() {
        return [
            {
                id: 'japan',
                name: 'Japan',
                region: 'Asia',
                capital: 'Tokyo',
                language: 'Japanese',
                population: '125.8 million',
                currency: 'Yen',
                flag: '🇯🇵',
                coordinates: { lat: 36.2048, lng: 138.2529 },
                traditionalFood: 'Sushi, Ramen, Tempura',
                clothing: 'Kimono, Yukata',
                holidays: 'Cherry Blossom Festival, Golden Week',
                greeting: 'Konnichiwa',
                description: 'Known for its rich cultural heritage, technology, and beautiful landscapes.'
            },
            {
                id: 'mexico',
                name: 'Mexico',
                region: 'North America',
                capital: 'Mexico City',
                language: 'Spanish',
                population: '128.9 million',
                currency: 'Peso',
                flag: '🇲🇽',
                coordinates: { lat: 23.6345, lng: -102.5528 },
                traditionalFood: 'Tacos, Enchiladas, Mole',
                clothing: 'Huipil, Charro suit',
                holidays: 'Day of the Dead, Cinco de Mayo',
                greeting: 'Hola',
                description: 'Rich in ancient history, vibrant culture, and delicious cuisine.'
            },
            {
                id: 'india',
                name: 'India',
                region: 'Asia',
                capital: 'New Delhi',
                language: 'Hindi, English',
                population: '1.38 billion',
                currency: 'Rupee',
                flag: '🇮🇳',
                coordinates: { lat: 20.5937, lng: 78.9629 },
                traditionalFood: 'Curry, Biryani, Samosa',
                clothing: 'Sari, Dhoti, Kurta',
                holidays: 'Diwali, Holi, Eid',
                greeting: 'Namaste',
                description: 'Diverse nation with thousands of years of history and countless traditions.'
            },
            {
                id: 'egypt',
                name: 'Egypt',
                region: 'Africa',
                capital: 'Cairo',
                language: 'Arabic',
                population: '102.3 million',
                currency: 'Egyptian Pound',
                flag: '🇪🇬',
                coordinates: { lat: 26.8206, lng: 30.8025 },
                traditionalFood: 'Ful medames, Koshari, Falafel',
                clothing: 'Galabeya, Hijab',
                holidays: 'Ramadan, Eid al-Fitr, Coptic Christmas',
                greeting: 'Ahlan wa sahlan',
                description: 'Ancient civilization known for pyramids, pharaohs, and the Nile River.'
            },
            {
                id: 'brazil',
                name: 'Brazil',
                region: 'South America',
                capital: 'Brasília',
                language: 'Portuguese',
                population: '212.6 million',
                currency: 'Real',
                flag: '🇧🇷',
                coordinates: { lat: -14.2350, lng: -51.9253 },
                traditionalFood: 'Feijoada, Açaí, Brigadeiro',
                clothing: 'Carnival costumes, Capoeira uniforms',
                holidays: 'Carnival, Festa Junina, Independence Day',
                greeting: 'Olá',
                description: 'Known for its vibrant culture, Amazon rainforest, and passionate people.'
            },
            {
                id: 'france',
                name: 'France',
                region: 'Europe',
                capital: 'Paris',
                language: 'French',
                population: '67.4 million',
                currency: 'Euro',
                flag: '🇫🇷',
                coordinates: { lat: 46.6034, lng: 1.8883 },
                traditionalFood: 'Croissant, Baguette, Coq au vin',
                clothing: 'Beret, haute couture fashion',
                holidays: 'Bastille Day, Christmas, Easter',
                greeting: 'Bonjour',
                description: 'Famous for art, cuisine, fashion, and romantic atmosphere.'
            }
        ];
    }

    // Create map container elements
    createMapElements() {
        if (!this.mapContainer) {
            console.error('Map container not found');
            return;
        }

        this.mapContainer.innerHTML = `
            <div class="map-header">
                <h2>Explore World Cultures</h2>
                <div class="map-controls">
                    <div class="search-container">
                        <input type="text" id="country-search" placeholder="Search countries..." class="search-input">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="region-filter">
                        <select id="region-filter" class="region-select">
                            <option value="all">All Regions</option>
                            <option value="Africa">Africa</option>
                            <option value="Asia">Asia</option>
                            <option value="Europe">Europe</option>
                            <option value="North America">North America</option>
                            <option value="South America">South America</option>
                            <option value="Oceania">Oceania</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="map-content">
                <div class="world-map-svg"></div>
                <div class="country-grid"></div>
            </div>
            <div class="map-stats">
                <div class="stat-item">
                    <span class="stat-number">${this.countries.length}</span>
                    <span class="stat-label">Countries</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getRegionCount()}</span>
                    <span class="stat-label">Regions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getLanguageCount()}</span>
                    <span class="stat-label">Languages</span>
                </div>
            </div>
        `;
    }

    // Create tooltip for map interactions
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'map-tooltip';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('country-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterAndRender();
            });
        }

        // Region filter
        const regionFilter = document.getElementById('region-filter');
        if (regionFilter) {
            regionFilter.addEventListener('change', (e) => {
                this.currentRegion = e.target.value;
                this.filterAndRender();
            });
        }

        // Country card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.country-card')) {
                const countryCard = e.target.closest('.country-card');
                const countryId = countryCard.getAttribute('data-country-id');
                this.selectCountry(countryId);
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.renderMap();
        });
    }

    // Render the map (using country cards since SVG world map would be too complex)
    renderMap() {
        const filteredCountries = this.getFilteredCountries();
        this.renderCountryGrid(filteredCountries);
        this.updateStats(filteredCountries);
    }

    // Filter countries based on search and region
    getFilteredCountries() {
        return this.countries.filter(country => {
            const matchesSearch = !this.searchQuery || 
                country.name.toLowerCase().includes(this.searchQuery) ||
                country.region.toLowerCase().includes(this.searchQuery) ||
                country.language.toLowerCase().includes(this.searchQuery);
            
            const matchesRegion = this.currentRegion === 'all' || 
                country.region === this.currentRegion;
            
            return matchesSearch && matchesRegion;
        });
    }

    // Render country grid
    renderCountryGrid(countries) {
        const gridContainer = document.querySelector('.country-grid');
        if (!gridContainer) return;

        if (countries.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No countries found</h3>
                    <p>Try adjusting your search terms or region filter.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = countries.map(country => `
            <div class="country-card ${this.selectedCountry === country.id ? 'selected' : ''}" 
                 data-country-id="${country.id}">
                <div class="country-flag">
                    <span class="flag-emoji">${country.flag}</span>
                </div>
                <div class="country-info">
                    <h3 class="country-name">${country.name}</h3>
                    <p class="country-region">${country.region}</p>
                    <p class="country-capital">Capital: ${country.capital}</p>
                    <p class="country-language">Language: ${country.language}</p>
                </div>
                <div class="country-actions">
                    <button class="btn btn-primary explore-btn" title="Explore ${country.name}">
                        <i class="fas fa-eye"></i> Explore
                    </button>
                    <button class="bookmark-btn" 
                            data-country-id="${country.id}"
                            data-country-name="${country.name}"
                            data-country-region="${country.region}"
                            title="Bookmark ${country.name}">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
                <div class="country-preview">
                    <div class="preview-item">
                        <i class="fas fa-utensils"></i>
                        <span>${country.traditionalFood.split(',')[0]}</span>
                    </div>
                    <div class="preview-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${country.holidays.split(',')[0]}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add hover effects and animations
        this.addCardInteractions();
    }

    // Add interactive effects to country cards
    addCardInteractions() {
        const countryCards = document.querySelectorAll('.country-card');
        
        countryCards.forEach(card => {
            // Hover effect with tooltip
            card.addEventListener('mouseenter', (e) => {
                const countryId = card.getAttribute('data-country-id');
                const country = this.countries.find(c => c.id === countryId);
                if (country) {
                    this.showTooltip(e, country);
                }
                card.classList.add('hovered');
            });

            card.addEventListener('mouseleave', () => {
                this.hideTooltip();
                card.classList.remove('hovered');
            });

            card.addEventListener('mousemove', (e) => {
                if (this.tooltip.style.display !== 'none') {
                    this.updateTooltipPosition(e);
                }
            });

            // Click animation
            card.addEventListener('click', () => {
                card.classList.add('clicked');
                setTimeout(() => card.classList.remove('clicked'), 200);
            });
        });
    }

    // Show tooltip with country information
    showTooltip(event, country) {
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-flag">${country.flag}</span>
                <strong>${country.name}</strong>
            </div>
            <div class="tooltip-content">
                <p><strong>Population:</strong> ${country.population}</p>
                <p><strong>Currency:</strong> ${country.currency}</p>
                <p><strong>Greeting:</strong> ${country.greeting}</p>
                <p class="tooltip-description">${country.description}</p>
            </div>
        `;
        
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition(event);
    }

    // Update tooltip position
    updateTooltipPosition(event) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = event.clientX + 15;
        let top = event.clientY - 10;
        
        // Adjust position if tooltip goes off screen
        if (left + tooltipRect.width > viewportWidth) {
            left = event.clientX - tooltipRect.width - 15;
        }
        
        if (top + tooltipRect.height > viewportHeight) {
            top = event.clientY - tooltipRect.height - 10;
        }
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    // Hide tooltip
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    // Select a country
    selectCountry(countryId) {
        this.selectedCountry = countryId;
        const country = this.countries.find(c => c.id === countryId);
        
        if (country) {
            // Update selected state
            document.querySelectorAll('.country-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const selectedCard = document.querySelector(`[data-country-id="${countryId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
                selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Navigate to country detail page or show modal
            this.showCountryDetails(country);
        }
    }

    // Show country details (modal or navigate)
    showCountryDetails(country) {
        // You can either navigate to a detail page or show a modal
        // For navigation:
        if (typeof navigateToCountry === 'function') {
            navigateToCountry(country.id);
        } else {
            window.location.href = `country.html?id=${country.id}`;
        }
        
        // Or show a modal with details:
        // this.showCountryModal(country);
    }

    // Show country modal (alternative to navigation)
    showCountryModal(country) {
        const modal = document.createElement('div');
        modal.className = 'country-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${country.flag} ${country.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="country-details">
                        <div class="detail-section">
                            <h3>Basic Information</h3>
                            <p><strong>Region:</strong> ${country.region}</p>
                            <p><strong>Capital:</strong> ${country.capital}</p>
                            <p><strong>Language:</strong> ${country.language}</p>
                            <p><strong>Population:</strong> ${country.population}</p>
                            <p><strong>Currency:</strong> ${country.currency}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Culture & Traditions</h3>
                            <p><strong>Traditional Food:</strong> ${country.traditionalFood}</p>
                            <p><strong>Traditional Clothing:</strong> ${country.clothing}</p>
                            <p><strong>Major Holidays:</strong> ${country.holidays}</p>
                            <p><strong>Common Greeting:</strong> ${country.greeting}</p>
                        </div>
                        <div class="detail-section">
                            <h3>About</h3>
                            <p>${country.description}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary bookmark-btn" 
                            data-country-id="${country.id}"
                            data-country-name="${country.name}"
                            data-country-region="${country.region}">
                        <i class="far fa-bookmark"></i> Bookmark
                    </button>
                    <button class="btn btn-secondary start-quiz-btn" data-country="${country.name}">
                        <i class="fas fa-question-circle"></i> Take Quiz
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Filter and re-render based on current filters
    filterAndRender() {
        this.renderMap();
    }

    // Update statistics
    updateStats(countries) {
        const statsContainer = document.querySelector('.map-stats');
        if (!statsContainer) return;

        const countryCount = countries.length;
        const regionCount = new Set(countries.map(c => c.region)).size;
        const languageCount = new Set(countries.map(c => c.language)).size;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${countryCount}</span>
                <span class="stat-label">Countries</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${regionCount}</span>
                <span class="stat-label">Regions</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${languageCount}</span>
                <span class="stat-label">Languages</span>
            </div>
        `;
    }

    // Get total region count
    getRegionCount() {
        return new Set(this.countries.map(country => country.region)).size;
    }

    // Get total language count
    getLanguageCount() {
        return new Set(this.countries.map(country => country.language)).size;
    }

    // Get random country for featured content
    getRandomCountry() {
        return this.countries[Math.floor(Math.random() * this.countries.length)];
    }

    // Get countries by region
    getCountriesByRegion(region) {
        return this.countries.filter(country => country.region === region);
    }

    // Search countries by name
    searchCountries(query) {
        return this.countries.filter(country => 
            country.name.toLowerCase().includes(query.toLowerCase()) ||
            country.region.toLowerCase().includes(query.toLowerCase()) ||
            country.language.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Get country by ID
    getCountryById(id) {
        return this.countries.find(country => country.id === id);
    }

    // Add new country (for admin functionality)
    addCountry(countryData) {
        this.countries.push(countryData);
        this.renderMap();
    }

    // Update country data
    updateCountry(id, updates) {
        const countryIndex = this.countries.findIndex(country => country.id === id);
        if (countryIndex !== -1) {
            this.countries[countryIndex] = { ...this.countries[countryIndex], ...updates };
            this.renderMap();
        }
    }

    // Remove country
    removeCountry(id) {
        this.countries = this.countries.filter(country => country.id !== id);
        this.renderMap();
    }

    // Export map data
    exportData() {
        const dataStr = JSON.stringify(this.countries, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cultural-explorer-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Reset filters
    resetFilters() {
        this.searchQuery = '';
        this.currentRegion = 'all';
        
        const searchInput = document.getElementById('country-search');
        const regionFilter = document.getElementById('region-filter');
        
        if (searchInput) searchInput.value = '';
        if (regionFilter) regionFilter.value = 'all';
        
        this.renderMap();
    }

    // Highlight countries matching search
    highlightSearchResults(query) {
        const matchingCountries = this.searchCountries(query);
        
        document.querySelectorAll('.country-card').forEach(card => {
            const countryId = card.getAttribute('data-country-id');
            const isMatch = matchingCountries.some(country => country.id === countryId);
            card.classList.toggle('search-highlight', isMatch);
        });
    }
}

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('world-map');
    if (mapContainer) {
        window.worldMap = new InteractiveWorldMap('world-map');
    }
});

// Helper function for navigation (can be used by other modules)
function navigateToCountry(countryId) {
    window.location.href = `country.html?id=${countryId}`;
}

// Helper function to get country data (can be used by other modules)
function getCountryData(countryId) {
    return window.worldMap ? window.worldMap.getCountryById(countryId) : null;
}