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

        const app = document.getElementById("app");
        app.innerHTML = `
       <div id="events-container" style="display: flex; flex-wrap: wrap; gap: 16px;"></div>
     `;


        const container = document.getElementById('events-container');
        const template = document.getElementById("event-row-template");

        events.forEach(event => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.event-name').textContent = event.name || '-';
            clone.querySelector('.event-location-city').textContent = event.location_city || '-';
            clone.querySelector('.event-type').textContent = event.type;

            clone.querySelector('.event-card').addEventListener('click', () => {
                window.location.hash = `#event/${event.id}`;
            });

            container.appendChild(clone); // Додаємо картку у контейнер
        });

        const cards = document.querySelectorAll('.event-card');
        cards.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('show');
            }, i * 150);
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
