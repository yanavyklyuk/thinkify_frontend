import { renderUsersPage } from './views/users.js';
import { renderEventsPage } from './views/events.js';
import { renderProfilePage } from './views/profile.js';
import { renderEditProfilePage } from './views/edit_profile.js';
import { renderUserPage } from './views/user.js';

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

async function handleRoute() {
    const hash = window.location.hash || '#main';

    if (hash === '#main') {
        renderMainPage();
    } else if (hash === '#users') {
        await renderUsersPage();
    } else if (hash === '#events'){
        await renderEventsPage()
    } else if (hash === '#profile') {
        await renderProfilePage();
    } else if (hash.startsWith('#profile/edit/')) {
        const userId = hash.split('/')[2]; // витягуємо id з URL
        await renderEditProfilePage(userId);
    } else if (hash === '#profile/') {
        const userId = hash.split('/')[1];
        await renderUserPage(userId);
    }
    else {
        renderNotFound();
    }
}

function renderMainPage() {
    document.getElementById('app').innerHTML = `<h1>Головна сторінка</h1>`;
}

function renderNotFound() {
    document.getElementById('app').innerHTML = `<h1>Сторінку не знайдено</h1>`;
}
