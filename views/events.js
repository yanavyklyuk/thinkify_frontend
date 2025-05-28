export async function renderEventsPage() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    // Підтягуємо шаблон
    await loadTemplate('/thinkify_frontend/pages/events.html');

    try {
        const response = await fetch('http://localhost:8000/api/v1/events/', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Помилка доступу');
        }

        const events = await response.json();

        // Рендер таблиці
        const app = document.getElementById("app");
        app.innerHTML = `
          <h2>events</h2>
          <table border="1" id="events-table">
            <thead>
              <tr><th>ID</th><th>Ім’я</th><th>Прізвище</th><th>Email</th></tr>
            </thead>
            <tbody></tbody>
          </table>
        `;

        const tbody = app.querySelector('tbody');
        const template = document.getElementById("event-row-template");

        events.forEach(event => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.event-id').textContent = event.id;
            clone.querySelector('.event-name').textContent = event.name || '-';
            clone.querySelector('.event-date').textContent = event.date || '-';
            clone.querySelector('.event-type').textContent = event.type;
            tbody.appendChild(clone);
        });

    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}

async function loadTemplate(url) {
    if (document.getElementById("event-row-template")) return; // шаблон уже завантажено
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');
    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;
    document.body.appendChild(container.firstElementChild);
}
