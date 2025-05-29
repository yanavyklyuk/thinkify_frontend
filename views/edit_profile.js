import { navigateTo } from '../app.js';

export async function loadTemplate(url, id) {
    if (document.getElementById(id)) return; // шаблон вже завантажено
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');
    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;
    document.body.appendChild(container.firstElementChild);
}

export async function renderEditProfilePage(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    try {
        // Load the edit profile template
        await loadTemplate('/thinkify_frontend/pages/edit_profile.html', 'edit-profile-template');

        // Fetch user data
        const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Error for user data loading');
        }

        const user = await response.json();

        // Render form with user data
        const template = document.getElementById('edit-profile-template');
        const app = document.getElementById('app');
        const clone = template.content.cloneNode(true);

        // Populate form fields
        clone.querySelector('input[name="first_name"]').value = user.first_name || '';
        clone.querySelector('input[name="last_name"]').value = user.last_name || '';
        clone.querySelector('input[name="username"]').value = user.username || '';
        clone.querySelector('input[name="email"]').value = user.email || '';
        clone.querySelector('input[name="role"]').value = user.role || '';

        app.innerHTML = '';
        app.appendChild(clone);

        // Add the "show" class to make it visible
        const profileContainer = app.querySelector('.user-profile'); // Select .user-profile
        setTimeout(() => {
            profileContainer.classList.add('show'); // Add "show" class
        }, 50);

        // Handle form submission
        const form = app.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                username: formData.get('username'),
                email: formData.get('email')
            };

            try {
                const res = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    throw new Error('Помилка оновлення профілю');
                }

                alert('Профіль успішно оновлено');
                window.location.hash = `#profile/${userId}`;
            } catch (err) {
                alert('Помилка: ' + err.message);
            }
        });

        // Handle "Cancel" button
        const cancelBtn = app.querySelector('#btn-cancel-edit');
        cancelBtn.addEventListener('click', () => {
            navigateTo(`#profile/${userId}`);
        });

    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}