// quiz.js - Handles cultural knowledge quizzes

class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.init();
    }

    init() {
        this.generateQuestions();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        const quizModeSelect = document.getElementById('quiz-mode');
        if (quizModeSelect) {
            quizModeSelect.addEventListener('change', (e) => {
                this.generateQuestions(e.target.value);
            });
        }
    }

    generateQuestions(mode = 'mixed') {
        if (!countryLoader || !countryLoader.data) {
            setTimeout(() => this.generateQuestions(mode), 500);
            return;
        }

        const countries = countryLoader.data.countries;
        this.questions = [];

        countries.forEach(country => {
            // Capital questions
            this.questions.push({
                question: `What is the capital of ${country.name}?`,
                options: this.generateCapitalOptions(country, countries),
                correct: country.capital,
                category: 'geography',
                country: country.name
            });

            // Language questions
            this.questions.push({
                question: `What is the primary language spoken in ${country.name}?`,
                options: this.generateLanguageOptions(country, countries),
                correct: country.language,
                category: 'language',
                country: country.name
            });

            // Food questions
            if (country.traditionalFood.length > 0) {
                const food = country.traditionalFood[0];
                this.questions.push({
                    question: `Which country is famous for ${food}?`,
                    options: this.generateCountryOptions(country, countries),
                    correct: country.name,
                    category: 'food',
                    country: country.name
                });
            }

            // Holiday questions
            if (country.holidays.length > 0) {
                const holiday = country.holidays[0];
                this.questions.push({
                    question: `In which country is ${holiday.name} celebrated?`,
                    options: this.generateCountryOptions(country, countries),
                    correct: country.name,
                    category: 'holidays',
                    country: country.name
                });
            }

            // Custom questions
            this.questions.push({
                question: `What is the traditional clothing of ${country.name}?`,
                options: this.generateClothingOptions(country, countries),
                correct: country.clothing.traditional,
                category: 'clothing',
                country: country.name
            });
        });

        // Filter by mode if specified
        if (mode !== 'mixed') {
            this.questions = this.questions.filter(q => q.category === mode);
        }

        // Shuffle questions
        this.shuffleArray(this.questions);
    }

    generateCapitalOptions(correctCountry, allCountries) {
        const options = [correctCountry.capital];
        const otherCapitals = allCountries
            .filter(c => c.id !== correctCountry.id)
            .map(c => c.capital);
        
        while (options.length < 4 && otherCapitals.length > 0) {
            const randomCapital = otherCapitals.splice(
                Math.floor(Math.random() * otherCapitals.length), 1
            )[0];
            options.push(randomCapital);
        }

        this.shuffleArray(options);
        return options;
    }

    generateLanguageOptions(correctCountry, allCountries) {
        const options = [correctCountry.language];
        const otherLanguages = allCountries
            .filter(c => c.id !== correctCountry.id)
            .map(c => c.language);
        
        while (options.length < 4 && otherLanguages.length > 0) {
            const randomLanguage = otherLanguages.splice(
                Math.floor(Math.random() * otherLanguages.length), 1
            )[0];
            if (!options.includes(randomLanguage)) {
                options.push(randomLanguage);
            }
        }

        this.shuffleArray(options);
        return options;
    }

    generateCountryOptions(correctCountry, allCountries) {
        const options = [correctCountry.name];
        const otherCountries = allCountries
            .filter(c => c.id !== correctCountry.id)
            .map(c => c.name);
        
        while (options.length < 4 && otherCountries.length > 0) {
            const randomCountry = otherCountries.splice(
                Math.floor(Math.random() * otherCountries.length), 1
            )[0];
            options.push(randomCountry);
        }

        this.shuffleArray(options);
        return options;
    }

    generateClothingOptions(correctCountry, allCountries) {
        const options = [correctCountry.clothing.traditional];
        const otherClothing = allCountries
            .filter(c => c.id !== correctCountry.id)
            .map(c => c.clothing.traditional);
        
        while (options.length < 4 && otherClothing.length > 0) {
            const randomClothing = otherClothing.splice(
                Math.floor(Math.random() * otherClothing.length), 1
            )[0];
            if (!options.includes(randomClothing)) {
                options.push(randomClothing);
            }
        }

        this.shuffleArray(options);
        return options;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startQuiz(questionCount = 10) {
        if (this.questions.length === 0) {
            alert('Questions are still loading. Please try again in a moment.');
            return;
        }

        this.currentQuiz = this.questions.slice(0, questionCount);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];

        this.showQuizModal();
        this.displayQuestion();
    }

    showQuizModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quiz-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="quiz-header">
                    <h2>🧠 Cultural Knowledge Quiz</h2>
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="quiz-progress"></div>
                        </div>
                        <span id="question-counter">1 / ${this.currentQuiz.length}</span>
                    </div>
                </div>
                <div class="quiz-body">
                    <div id="quiz-question-container">
                        <!-- Question content will be inserted here -->
                    </div>
                </div>
                <div class="quiz-footer">
                    <button id="quiz-prev" class="btn-secondary" style="display: none;">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button id="quiz-next" class="btn-primary" disabled>
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="quiz-finish" class="btn-success" style="display: none;">
                        <i class="fas fa-flag-checkered"></i> Finish Quiz
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        this.setupQuizEventListeners(modal);
    }

    setupQuizEventListeners(modal) {
        const nextBtn = modal.querySelector('#quiz-next');
        const prevBtn = modal.querySelector('#quiz-prev');
        const finishBtn = modal.querySelector('#quiz-finish');

        nextBtn.addEventListener('click', () => {
            this.nextQuestion();
        });

        prevBtn.addEventListener('click', () => {
            this.previousQuestion();
        });

        finishBtn.addEventListener('click', () => {
            this.finishQuiz();
        });

        // Prevent modal from closing during quiz
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.stopPropagation();
            }
        });
    }

    displayQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const container = document.getElementById('quiz-question-container');
        const counter = document.getElementById('question-counter');
        const progress = document.getElementById('quiz-progress');

        // Update progress
        const progressPercent = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;
        progress.style.width = `${progressPercent}%`;
        counter.textContent = `${this.currentQuestionIndex + 1} / ${this.currentQuiz.length}`;

        // Display question
        container.innerHTML = `
            <div class="quiz-question">
                <div class="question-category">${this.getCategoryIcon(question.category)} ${question.category.toUpperCase()}</div>
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <label class="quiz-option">
                            <input type="radio" name="quiz-answer" value="${option}" data-index="${index}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        // Restore previous answer if exists
        if (this.userAnswers[this.currentQuestionIndex]) {
            const selectedOption = container.querySelector(`input[value="${this.userAnswers[this.currentQuestionIndex]}"]`);
            if (selectedOption) {
                selectedOption.checked = true;
                this.updateNavigationButtons();
            }
        }

        // Setup option listeners
        const options = container.querySelectorAll('input[name="quiz-answer"]');
        options.forEach(option => {
            option.addEventListener('change', () => {
                this.userAnswers[this.currentQuestionIndex] = option.value;
                this.updateNavigationButtons();
            });
        });

        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const nextBtn = document.getElementById('quiz-next');
        const prevBtn = document.getElementById('quiz-prev');
        const finishBtn = document.getElementById('quiz-finish');

        // Enable/disable next button based on answer selection
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;
        nextBtn.disabled = !hasAnswer;

        // Show/hide previous button
        prevBtn.style.display = this.currentQuestionIndex > 0 ? 'inline-block' : 'none';

        // Show finish button on last question
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
            finishBtn.disabled = !hasAnswer;
        } else {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    finishQuiz() {
        this.calculateScore();
        this.showResults();
    }

    calculateScore() {
        this.score = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.currentQuiz[index].correct) {
                this.score++;
            }
        });
    }

    showResults() {
        const percentage = Math.round((this.score / this.currentQuiz.length) * 100);
        const modal = document.querySelector('.quiz-modal .modal-content');
        
        modal.innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <h2>🎉 Quiz Complete!</h2>
                    <div class="score-display">
                        <div class="score-circle">
                            <span class="score-number">${percentage}%</span>
                        </div>
                        <p>You scored ${this.score} out of ${this.currentQuiz.length}</p>
                    </div>
                </div>
                <div class="results-body">
                    <div class="performance-message">
                        ${this.getPerformanceMessage(percentage)}
                    </div>
                    <div class="results-breakdown">
                        <h3>Question Review</h3>
                        ${this.generateResultsBreakdown()}
                    </div>
                </div>
                <div class="results-footer">
                    <button class="btn-primary" onclick="quizManager.restartQuiz()">
                        <i class="fas fa-redo"></i> Take Another Quiz
                    </button>
                    <button class="btn-secondary" onclick="quizManager.closeQuiz()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
    }

    generateResultsBreakdown() {
        return this.currentQuiz.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            return `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-question">${question.question}</div>
                    <div class="result-answers">
                        <div class="user-answer">
                            <strong>Your answer:</strong> ${userAnswer || 'No answer'}
                            ${isCorrect ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}
                        </div>
                        ${!isCorrect ? `<div class="correct-answer"><strong>Correct answer:</strong> ${question.correct}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getPerformanceMessage(percentage) {
        if (percentage >= 90) {
            return "🌟 Outstanding! You're a true cultural expert!";
        } else if (percentage >= 70) {
            return "👏 Great job! You have solid cultural knowledge!";
        } else if (percentage >= 50) {
            return "👍 Good effort! Keep exploring to learn more!";
        } else {
            return "🤔 Keep learning! There's so much culture to discover!";
        }
    }

    getCategoryIcon(category) {
        const icons = {
            'geography': '🌍',
            'language': '💬',
            'food': '🍽️',
            'holidays': '🎉',
            'clothing': '👘',
            'mixed': '🌟'
        };
        return icons[category] || '❓';
    }

    restartQuiz() {
        this.closeQuiz();
        setTimeout(() => {
            this.startQuiz();
        }, 300);
    }

    closeQuiz() {
        const modal = document.querySelector('.quiz-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }
}

// Initialize quiz manager
let quizManager;

document.addEventListener('DOMContentLoaded', () => {
    quizManager = new QuizManager();
});