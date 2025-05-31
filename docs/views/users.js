import { renderUserPage } from './user.js';

export async function renderUsersPage() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    await loadTemplate('/thinkify_frontend/docs/users.html');

    try {
        const response = await fetch('http://localhost:8000/api/v1/users/', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Помилка доступу');
        }

        const users = await response.json();

        const app = document.getElementById("app");
        app.innerHTML = `
          <div id="users-container" style="display: flex; flex-wrap: wrap; gap: 16px;"></div>
        `;

        const container = document.getElementById('users-container');
        const template = document.getElementById("user-row-template");

        users.forEach(user => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.user-card').addEventListener('click', () => {
                sessionStorage.setItem('fromUsers', '1');
                window.location.hash = `#profile/${user.id}`;
            });
            clone.querySelector('.user-first-name').textContent = user.first_name || '-';
            clone.querySelector('.user-last-name').textContent = user.last_name || '-';
            clone.querySelector('.user-username').textContent = user.username || '-';
            clone.querySelector('.user-role').textContent = user.role || '-';
            clone.querySelector('.user-card').addEventListener('click', () => {
                renderUserPage(user.id);
            });

            container.appendChild(clone);

            const cards = document.querySelectorAll('.user-card');

            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.add('show');
                }, i * 100);
            });
        });


    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}

async function loadTemplate(url) {
    if (document.getElementById("user-row-template")) return;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');
    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;
    document.body.appendChild(container.firstElementChild);
}
