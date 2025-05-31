import { renderUsersPage } from './views/users.js';
import { renderEventsPage } from './views/events.js';
import { renderProfilePage } from './views/profile.js';
import { renderEditProfilePage } from './views/edit_profile.js';
import { renderUserPage } from './views/user.js';
import { renderMainPage } from './views/main.js';
import { renderEventPage } from './views/event.js';
import { renderEditEventPage } from './views/edit_event.js';// Import the renderEventPage function

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

export function navigateTo(hash) {
    if (window.location.hash === hash) {
        handleRoute();
    } else {
        window.location.hash = hash;
    }
}

async function handleRoute() {
    if (!isAuthenticated() && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'pages/login.html';
    }
    const hash = window.location.hash || '#main';

    if (hash === '#main') {
        await renderMainPage();
    } else if (hash === '#users') {
        await renderUsersPage();
    } else if (hash === '#events') {
        await renderEventsPage();
    } else if (hash === '#profile') {
        await renderProfilePage();
    } else if (hash.startsWith('#profile/edit/')) {
        const userId = hash.split('/')[2]; // Get user ID from the URL
        await renderEditProfilePage(userId);
    } else if (hash.startsWith('#profile/') && !hash.startsWith('#profile/edit/')) {
        const userId = hash.split('/')[1];
        if (userId) {
            await renderUserPage(userId);
        } else {
            renderNotFound();
        }
    } else if(hash.startsWith('#event/edit/')) {
        const eventId = hash.split('/')[2]; // Extract event ID or "new"
        await renderEditEventPage(eventId);
    } else if (hash.startsWith('#event/')) {
        const eventId = hash.split('/')[1]; // Get the event ID from the URL
        if (eventId) {
            await renderEventPage(eventId);
        } else {
            renderNotFound();
        }
    } else {
        renderNotFound();
    }
}

function renderNotFound() {
    document.getElementById('app').innerHTML = `<h1>Сторінку не знайдено</h1>`;
}

document.querySelectorAll('nav a[data-page]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        navigateTo('#' + this.dataset.page);
    });
});

function isAuthenticated() {
    return !!localStorage.getItem('token');
}