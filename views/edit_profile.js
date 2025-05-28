export async function loadTemplate(url, id) {
    if (document.getElementById(id)) return; // шаблон уже завантажено
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
        // Завантажуємо шаблон форми редагування
        await loadTemplate('/thinkify_frontend/pages/edit_profile.html', 'edit-profile-template');

        // Завантажуємо дані користувача
        const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Error for user data loading');
        }

        const user = await response.json();

        // Відображаємо форму
        const template = document.getElementById('edit-profile-template');
        const app = document.getElementById('app');
        const clone = template.content.cloneNode(true);

        // Заповнюємо поля форми
        clone.querySelector('input[name="first_name"]').value = user.first_name || '';
        clone.querySelector('input[name="last_name"]').value = user.last_name || '';
        clone.querySelector('input[name="username"]').value = user.username || '';
        clone.querySelector('input[name="email"]').value = user.email || '';

        app.innerHTML = '';
        app.appendChild(clone);

        // Обробка сабміту форми
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
                    method: 'PUT', // або PATCH, в залежності від API
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
                window.location.hash = '#users'; // Повертаємось до перегляду профілю
            } catch (err) {
                alert('Помилка: ' + err.message);
            }
        });

        // Кнопка відміни — повернення на профіль
        const cancelBtn = app.querySelector('#btn-cancel-edit');
        cancelBtn.addEventListener('click', () => {
            window.location.hash = '#profile';
        });

    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}
