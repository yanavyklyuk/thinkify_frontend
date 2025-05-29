import { navigateTo } from '../app.js';

async function loadTemplate(url, id) {
    if (document.getElementById(id)) return; // шаблон уже завантажено
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');
    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;
    document.body.appendChild(container.firstElementChild);
}

export async function renderProfilePage() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');

    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }
    if (!userId) {
        document.getElementById("app").innerHTML = `<p>Неможливо визначити користувача</p>`;
        return;
    }

    try {
        await loadTemplate('/thinkify_frontend/pages/profile.html', 'profile-template');

        const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Помилка завантаження профілю');
        }

        const user = await response.json();

        const template = document.getElementById('profile-template');
        const app = document.getElementById('app');

        const clone = template.content.cloneNode(true);
        clone.querySelector('.user-id').textContent = user.id;
        clone.querySelector('.user-first-name').textContent = user.first_name || '-';
        clone.querySelector('.user-last-name').textContent = user.last_name || '-';
        clone.querySelector('.user-username').textContent = user.username;
        clone.querySelector('.user-email').textContent = user.email || '-';
        clone.querySelector('.user-role').textContent = user.role || '-';

        sessionStorage.removeItem('fromUsers');

        app.innerHTML = '';
        app.appendChild(clone);

        const containers = app.querySelectorAll('.main-button-container');

        setTimeout(() => {
            const containers = app.querySelectorAll('.main-button-container');
            containers.forEach((container, index) => {
                setTimeout(() => {
                    container.classList.add('show');
                }, index * 300);
            });
        }, 100);

        setTimeout(() => {
            app.querySelector('.user-profile').classList.add('show');
        }, 50);

        const bntUsersList = app.querySelector('#btn-users-list');
        const btnEditProfile = app.querySelector('#btn-edit-profile');
        const btnLogout = app.querySelector('#btn-logout');


        bntUsersList.style.display = 'none';

        btnEditProfile.addEventListener('click', () => {
            window.location.hash = `#profile/edit/${userId}`;
        });

        btnLogout.addEventListener('click', async () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });


    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}