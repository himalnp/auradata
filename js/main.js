import { currentData, fetchData, saveData } from './data.js';

// DOM Elements
const studentList = document.getElementById('student-list');
const maleLeaderboard = document.getElementById('male-leaderboard');
const femaleLeaderboard = document.getElementById('female-leaderboard');
const firstPlace = document.getElementById('first-place');
const secondPlace = document.getElementById('second-place');
const thirdPlace = document.getElementById('third-place');
const themeToggle = document.getElementById('theme-toggle');
const historyModal = document.getElementById('history-modal');
const historyContent = document.getElementById('history-content');
const historyTitle = document.getElementById('history-title');
const closeModal = document.querySelector('.close-modal');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    updateUI();
    setupEventListeners();
});

function updateUI() {
    renderAllStudents();
    renderLeaderboards();
    renderPodium();
}

function renderAllStudents() {
    studentList.innerHTML = currentData.students.map(student => `
        <div class="student-card" data-name="${student.name}">
            <h3>${student.name} ${student.badge || ''}</h3>
            <div class="aura-display">${student.aura} Aura</div>
        </div>
    `).join('');
}

function renderLeaderboards() {
    const sortedStudents = [...currentData.students].sort((a, b) => b.aura - a.aura);
    
    // Male Leaderboard
    maleLeaderboard.innerHTML = sortedStudents
        .filter(s => s.gender === 'male')
        .slice(0, 10)
        .map((student, index) => `
            <li>
                <span class="rank">${index + 1}.</span>
                <span class="name">${student.name}</span>
                <span class="aura">${student.aura} ${student.badge || ''}</span>
            </li>
        `).join('');
    
    // Female Leaderboard
    femaleLeaderboard.innerHTML = sortedStudents
        .filter(s => s.gender === 'female')
        .slice(0, 10)
        .map((student, index) => `
            <li>
                <span class="rank">${index + 1}.</span>
                <span class="name">${student.name}</span>
                <span class="aura">${student.aura} ${student.badge || ''}</span>
            </li>
        `).join('');
}

function renderPodium() {
    const sortedStudents = [...currentData.students].sort((a, b) => b.aura - a.aura);
    
    // First Place
    if (sortedStudents.length > 0) {
        const first = sortedStudents[0];
        firstPlace.querySelector('.name').textContent = first.name;
        firstPlace.querySelector('.aura').textContent = first.aura;
        firstPlace.querySelector('.badge-display').textContent = first.badge || '';
        firstPlace.querySelector('.history-btn').onclick = () => showHistory(first.name);
    }
    
    // Second Place
    if (sortedStudents.length > 1) {
        const second = sortedStudents[1];
        secondPlace.querySelector('.name').textContent = second.name;
        secondPlace.querySelector('.aura').textContent = second.aura;
        secondPlace.querySelector('.badge-display').textContent = second.badge || '';
        secondPlace.querySelector('.history-btn').onclick = () => showHistory(second.name);
    }
    
    // Third Place
    if (sortedStudents.length > 2) {
        const third = sortedStudents[2];
        thirdPlace.querySelector('.name').textContent = third.name;
        thirdPlace.querySelector('.aura').textContent = third.aura;
        thirdPlace.querySelector('.badge-display').textContent = third.badge || '';
        thirdPlace.querySelector('.history-btn').onclick = () => showHistory(third.name);
    }
}

function showHistory(studentName) {
    historyTitle.textContent = `${studentName}'s Aura History`;
    historyContent.innerHTML = getHistoryContent(studentName);
    historyModal.style.display = 'flex';
}

function getHistoryContent(studentName) {
    if (!currentData.history[studentName] || currentData.history[studentName].length === 0) {
        return '<p>No history available for this student.</p>';
    }
    
    return currentData.history[studentName].map(entry => `
        <div class="history-entry">
            <div class="history-date">${entry.date}</div>
            <div class="history-change ${entry.change >= 0 ? 'positive' : 'negative'}">
                ${entry.change >= 0 ? '+' : ''}${entry.change} Aura
            </div>
            <div class="history-total">→ ${entry.newAura} Aura</div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
    });
    
    // Modal Close
    closeModal.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
}