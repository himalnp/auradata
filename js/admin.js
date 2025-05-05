import { currentData, fetchData, saveData } from './data.js';

// DOM Elements
const studentSelect = document.getElementById('student-select');
const auraPoints = document.getElementById('aura-points');
const addAuraBtn = document.getElementById('add-aura');
const subtractAuraBtn = document.getElementById('subtract-aura');
const badgeStudentSelect = document.getElementById('badge-student-select');
const badgeType = document.getElementById('badge-type');
const assignBadgeBtn = document.getElementById('assign-badge');
const themeOptions = document.querySelectorAll('.theme-option');
const updateThemeBtn = document.getElementById('update-theme');
const newStudentName = document.getElementById('new-student-name');
const newStudentGender = document.getElementById('new-student-gender');
const addStudentBtn = document.getElementById('add-student');
const removeStudentBtn = document.getElementById('remove-student');
const championPosition = document.getElementById('champion-position');
const championStudent = document.getElementById('champion-student');
const assignChampionBtn = document.getElementById('assign-champion');

// Selected Theme
let selectedTheme = currentData.settings.theme;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    populateDropdowns();
    setupEventListeners();
});

function populateDropdowns() {
    // Clear existing options
    studentSelect.innerHTML = '';
    badgeStudentSelect.innerHTML = '';
    championStudent.innerHTML = '';
    
    // Add students to all dropdowns
    currentData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.name;
        option.textContent = student.name;
        
        studentSelect.appendChild(option.cloneNode(true));
        badgeStudentSelect.appendChild(option.cloneNode(true));
        championStudent.appendChild(option.cloneNode(true));
    });
    
    // Set current theme as active
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentData.settings.theme) {
            option.classList.add('active');
        }
    });
}

function setupEventListeners() {
    // Aura Management
    addAuraBtn.addEventListener('click', () => updateAura(true));
    subtractAuraBtn.addEventListener('click', () => updateAura(false));
    
    // Badge Management
    assignBadgeBtn.addEventListener('click', assignBadge);
    
    // Theme Management
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedTheme = option.dataset.theme;
        });
    });
    
    updateThemeBtn.addEventListener('click', updateTheme);
    
    // Student Management
    addStudentBtn.addEventListener('click', addStudent);
    removeStudentBtn.addEventListener('click', removeStudent);
    
    // Champion Management
    assignChampionBtn.addEventListener('click', assignChampion);
}

async function updateAura(isAdd) {
    const studentName = studentSelect.value;
    const points = parseInt(auraPoints.value) || 0;
    
    if (!studentName || points <= 0) {
        alert('Please select a student and enter valid points');
        return;
    }
    
    const student = currentData.students.find(s => s.name === studentName);
    if (!student) return;
    
    // Update aura
    student.aura = isAdd ? student.aura + points : student.aura - points;
    
    // Ensure aura doesn't go negative
    if (student.aura < 0) student.aura = 0;
    
    // Record history
    if (!currentData.history[studentName]) {
        currentData.history[studentName] = [];
    }
    
    currentData.history[studentName].push({
        date: new Date().toLocaleString(),
        change: isAdd ? points : -points,
        newAura: student.aura
    });
    
    // Update monthly leaderboard
    updateMonthlyLeaderboard();
    
    if (await saveData(currentData)) {
        alert(`Successfully ${isAdd ? 'added' : 'subtracted'} ${points} aura points to ${studentName}`);
        auraPoints.value = '';
    }
}

async function assignBadge() {
    const studentName = badgeStudentSelect.value;
    const badge = badgeType.value;
    
    const student = currentData.students.find(s => s.name === studentName);
    if (!student) return;
    
    student.badge = badge;
    
    if (await saveData(currentData)) {
        alert(`${badge ? 'Assigned badge to' : 'Removed badge from'} ${studentName}`);
    }
}

async function updateTheme() {
    currentData.settings.theme = selectedTheme;
    
    if (await saveData(currentData)) {
        alert(`Theme changed to ${selectedTheme}. Refresh the main page to see changes.`);
    }
}

async function addStudent() {
    const name = newStudentName.value.trim();
    const gender = newStudentGender.value;
    
    if (!name) {
        alert('Please enter a student name');
        return;
    }
    
    // Check if student already exists
    if (currentData.students.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        alert('Student already exists!');
        return;
    }
    
    // Add new student
    currentData.students.push({
        name,
        gender,
        aura: 0,
        badge: ""
    });
    
    if (await saveData(currentData)) {
        alert(`Added new student: ${name}`);
        newStudentName.value = '';
        populateDropdowns();
    }
}

async function removeStudent() {
    const name = newStudentName.value.trim();
    
    if (!name) {
        alert('Please enter a student name');
        return;
    }
    
    const index = currentData.students.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    
    if (index === -1) {
        alert('Student not found!');
        return;
    }
    
    if (!confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) {
        return;
    }
    
    currentData.students.splice(index, 1);
    
    // Remove from history
    delete currentData.history[name];
    
    // Remove from monthly leaderboard if present
    currentData.monthlyLeaderboard = currentData.monthlyLeaderboard.filter(s => s.name !== name);
    
    if (await saveData(currentData)) {
        alert(`Removed student: ${name}`);
        newStudentName.value = '';
        populateDropdowns();
    }
}

async function assignChampion() {
    const position = championPosition.value;
    const studentName = championStudent.value;
    
    const student = currentData.students.find(s => s.name === studentName);
    if (!student) return;
    
    // Sort students by aura to get current rankings
    const sortedStudents = [...currentData.students].sort((a, b) => b.aura - a.aura);
    
    // Find the current champion in this position
    const currentChampion = sortedStudents[position - 1];
    
    if (currentChampion.name === studentName) {
        alert(`${studentName} is already in position ${position}!`);
        return;
    }
    
    // Calculate aura needed to reach this position
    let targetAura = 0;
    if (position < sortedStudents.length) {
        targetAura = sortedStudents[position - 1].aura + 1;
    } else {
        targetAura = (sortedStudents[position - 2]?.aura || 0) + 10;
    }
    
    // Calculate difference
    const difference = targetAura - student.aura;
    
    // Update aura
    student.aura = targetAura;
    
    // Record history
    if (!currentData.history[studentName]) {
        currentData.history[studentName] = [];
    }
    
    currentData.history[studentName].push({
        date: new Date().toLocaleString(),
        change: difference,
        newAura: student.aura,
        note: `Assigned to position ${position}`
    });
    
    // Update monthly leaderboard
    updateMonthlyLeaderboard();
    
    if (await saveData(currentData)) {
        alert(`Assigned ${studentName} to position ${position} with ${targetAura} aura`);
    }
}

function updateMonthlyLeaderboard() {
    // Get current month/year
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    // Initialize if not exists
    if (!currentData.monthlyLeaderboard[monthYear]) {
        currentData.monthlyLeaderboard[monthYear] = [];
    }
    
    // Update top 3 for current month
    const sorted = [...currentData.students].sort((a, b) => b.aura - a.aura);
    currentData.monthlyLeaderboard[monthYear] = sorted.slice(0, 3).map(s => ({
        name: s.name,
        aura: s.aura,
        date: now.toISOString()
    }));
}