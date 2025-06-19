// countryLoader.js - Handles loading and displaying cultural data

class CountryLoader {
    constructor() {
        this.data = null;
        this.currentCountry = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.loadCountryFromURL();
    }

    async loadData() {
    try {
        const response = await fetch('../data/cultures.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }
        
        this.data = await response.json();
        console.log('Cultural data loaded successfully');
        
    } catch (error) {
        console.error('Error loading cultural data:', error.message);
        
        // Provide fallback or user feedback
        this.data = null;
        // Maybe show an error message to the user
    }
}

    setupEventListeners() {
        // Country selection from dropdown or map
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadCountry(e.target.value);
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('country-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCountries(e.target.value);
            });
        }

        // Filter functionality
        const regionFilter = document.getElementById('region-filter');
        if (regionFilter) {
            regionFilter.addEventListener('change', (e) => {
                this.filterByRegion(e.target.value);
            });
        }
    }

    loadCountryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const countryId = urlParams.get('country');
        if (countryId) {
            this.loadCountry(countryId);
        } else {
            this.displayFeaturedCountries();
        }
    }

    loadCountry(countryId) {
        if (!this.data) return;

        const country = this.data.countries.find(c => c.id === countryId);
        if (country) {
            this.currentCountry = country;
            this.displayCountryDetails(country);
            this.updateURL(countryId);
        }
    }

    displayCountryDetails(country) {
        // Update page title
        const titleElement = document.getElementById('country-title');
        if (titleElement) {
            titleElement.textContent = country.name;
        }

        // Display basic info
        this.displayBasicInfo(country);
        
        // Display cultural cards
        this.displayCulturalCards(country);
        
        // Display holidays
        this.displayHolidays(country);
        
        // Display language phrases
        this.displayLanguagePhrases(country);
        
        // Display customs
        this.displayCustoms(country);
        
        // Display fun facts
        this.displayFunFacts(country);
    }

    displayBasicInfo(country) {
        const infoContainer = document.getElementById('basic-info');
        if (!infoContainer) return;

        infoContainer.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <strong>Region:</strong> ${country.region}
                </div>
                <div class="info-item">
                    <strong>Capital:</strong> ${country.capital}
                </div>
                <div class="info-item">
                    <strong>Language:</strong> ${country.language}
                </div>
                <div class="info-item">
                    <strong>Currency:</strong> ${country.currency}
                </div>
                <div class="info-item">
                    <strong>Population:</strong> ${country.population}
                </div>
            </div>
        `;
    }

    displayCulturalCards(country) {
        const cardsContainer = document.getElementById('cultural-cards');
        if (!cardsContainer) return;

        const cards = [
            {
                title: 'Traditional Food',
                content: country.traditionalFood.join(', '),
                icon: '🍽️'
            },
            {
                title: 'Traditional Clothing',
                content: `${country.clothing.traditional} - ${country.clothing.description}`,
                icon: '👘'
            }
        ];

        cardsContainer.innerHTML = cards.map(card => `
            <div class="culture-card">
                <div class="card-icon">${card.icon}</div>
                <h3>${card.title}</h3>
                <p>${card.content}</p>
            </div>
        `).join('');
    }

    displayHolidays(country) {
        const holidaysContainer = document.getElementById('holidays-container');
        if (!holidaysContainer) return;

        holidaysContainer.innerHTML = `
            <h3>🎉 Holidays & Celebrations</h3>
            <div class="holidays-grid">
                ${country.holidays.map(holiday => `
                    <div class="holiday-card">
                        <h4>${holiday.name}</h4>
                        <div class="holiday-date">${holiday.date}</div>
                        <p>${holiday.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayLanguagePhrases(country) {
        const phrasesContainer = document.getElementById('language-phrases');
        if (!phrasesContainer) return;

        phrasesContainer.innerHTML = `
            <h3>💬 Common Phrases</h3>
            <div class="phrases-grid">
                ${country.commonPhrases.map(phrase => `
                    <div class="phrase-card">
                        <div class="english">${phrase.phrase}</div>
                        <div class="translation">${phrase.translation}</div>
                        <div class="pronunciation">[${phrase.pronunciation}]</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayCustoms(country) {
        const customsContainer = document.getElementById('customs-container');
        if (!customsContainer) return;

        customsContainer.innerHTML = `
            <h3>🤝 Local Customs</h3>
            <ul class="customs-list">
                ${country.customs.map(custom => `
                    <li>${custom}</li>
                `).join('')}
            </ul>
        `;
    }

    displayFunFacts(country) {
        const factsContainer = document.getElementById('fun-facts');
        if (!factsContainer) return;

        factsContainer.innerHTML = `
            <h3>🌟 Fun Facts</h3>
            <ul class="facts-list">
                ${country.funFacts.map(fact => `
                    <li>${fact}</li>
                `).join('')}
            </ul>
        `;
    }

    displayFeaturedCountries() {
        const featuredContainer = document.getElementById('featured-countries');
        if (!featuredContainer || !this.data) return;

        // Show first 3 countries as featured
        const featured = this.data.countries.slice(0, 3);
        
        featuredContainer.innerHTML = `
            <h2>Featured Cultures</h2>
            <div class="featured-grid">
                ${featured.map(country => `
                    <div class="featured-card" onclick="countryLoader.loadCountry('${country.id}')">
                        <h3>${country.name}</h3>
                        <p class="region">${country.region}</p>
                        <p class="preview">${country.traditionalFood.slice(0, 2).join(', ')}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    searchCountries(query) {
        if (!this.data || !query) {
            this.displayFeaturedCountries();
            return;
        }

        const results = this.data.countries.filter(country => 
            country.name.toLowerCase().includes(query.toLowerCase()) ||
            country.region.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results') || 
                                document.getElementById('featured-countries');
        
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No countries found matching your search.</p>';
            return;
        }

        resultsContainer.innerHTML = `
            <h2>Search Results</h2>
            <div class="results-grid">
                ${results.map(country => `
                    <div class="result-card" onclick="countryLoader.loadCountry('${country.id}')">
                        <h3>${country.name}</h3>
                        <p class="region">${country.region}</p>
                        <p class="language">Language: ${country.language}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    filterByRegion(region) {
        if (!this.data) return;

        let filtered = this.data.countries;
        if (region && region !== 'all') {
            filtered = this.data.countries.filter(country => 
                country.region === region
            );
        }

        this.displaySearchResults(filtered);
    }

    updateURL(countryId) {
        const newURL = `${window.location.pathname}?country=${countryId}`;
        window.history.pushState(null, '', newURL);
    }

    populateCountrySelect() {
        const select = document.getElementById('country-select');
        if (!select || !this.data) return;

        select.innerHTML = '<option value="">Select a country...</option>';
        
        this.data.countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name;
            select.appendChild(option);
        });
    }

    populateRegionFilter() {
        const filter = document.getElementById('region-filter');
        if (!filter || !this.data) return;

        filter.innerHTML = '<option value="all">All Regions</option>';
        
        this.data.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            filter.appendChild(option);
        });
    }

    getCurrentCountry() {
        return this.currentCountry;
    }
}

// Initialize when DOM is loaded
let countryLoader;

document.addEventListener('DOMContentLoaded', () => {
    countryLoader = new CountryLoader();
    
    // Populate dropdowns after data loads
    setTimeout(() => {
        if (countryLoader.data) {
            countryLoader.populateCountrySelect();
            countryLoader.populateRegionFilter();
        }
    }, 500);
});