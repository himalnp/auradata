import { currentData, fetchData } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        
        if (password === currentData.settings.password) {
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Incorrect password!');
        }
    });
});