import { navigateTo } from '../app.js';

async function loadTemplate(url, id) {
    if (document.getElementById(id)) return; // шаблон вже завантажено
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');
    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;
    document.body.appendChild(container.firstElementChild);
}

export async function renderEventPage(eventId) {
    const token = localStorage.getItem('token');

    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    if (!eventId) {
        document.getElementById("app").innerHTML = `<p>Неможливо визначити івент</p>`;
        return;
    }

    try {
        await loadTemplate('/thinkify_frontend/pages/event.html', 'event-template');

        const response = await fetch(`http://localhost:8000/api/v1/events/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Помилка завантаження івенту');
        }

        const event = await response.json();

        const template = document.getElementById('event-template');
        const app = document.getElementById('app');

        const clone = template.content.cloneNode(true);
        clone.querySelector('.event-id').textContent = event.id;
        clone.querySelector('.event-name').textContent = event.name || '-';
        clone.querySelector('.event-location-city').textContent = event.location_city || '-';
        clone.querySelector('.event-date').textContent = event.date || '-';
        clone.querySelector('.event-type').textContent = event.type || '-';
        clone.querySelector('.event-description').textContent = event.description || 'Опис відсутній';

        const eventUrl = clone.querySelector('.event-url');
        if (event.url) {
            eventUrl.href = event.url; // Set the event URL dynamically
            eventUrl.textContent = event.url; // Display the URL
        } else {
            eventUrl.textContent = 'URL not available';
        }

        app.innerHTML = '';
        app.appendChild(clone);

        setTimeout(() => {
            app.querySelector('.event-profile').classList.add('show');
        }, 120);

        // Back to events button
        const btnBackToEvents = app.querySelector('#btn-back-events');
        if (btnBackToEvents) {
            btnBackToEvents.addEventListener('click', () => {
                navigateTo('#events'); // Navigate back to events list
            });
        }

        // Edit event button
        const btnEditEvent = app.querySelector('#btn-edit-event');
        if (btnEditEvent) {
            btnEditEvent.addEventListener('click', () => {
                window.location.hash = `#event/edit/${eventId}`;
            });
        }

        // Delete event button
        const btnDeleteEvent = app.querySelector('#btn-delete-event');
        if (btnDeleteEvent) {
            btnDeleteEvent.addEventListener('click', async () => {
                const confirmDelete = confirm('Are you sure you want to delete this event?');
                if (!confirmDelete) return;

                try {
                    const deleteResponse = await fetch(`http://localhost:8000/api/v1/events/${eventId}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete event.');
                    }

                    alert('Event deleted successfully.');
                    navigateTo('#events'); // Navigate back to events list
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            });
        }
    } catch (err) {
        document.getElementById("app").innerHTML = `<p>Помилка: ${err.message}</p>`;
    }
}
export async function renderEditEventPage(eventId) {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById("app").innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    await loadTemplate('/thinkify_frontend/pages/event.html', 'edit-event-template');

    const app = document.getElementById('app');
    const template = document.getElementById('edit-event-template');
    const clone = template.content.cloneNode(true);

    app.innerHTML = '';
    app.appendChild(clone);

    const title = document.getElementById('edit-event-title');
    const nameInput = document.getElementById('event-name');
    const cityInput = document.getElementById('event-city');
    const typeInput = document.getElementById('event-type');
    const dateInput = document.getElementById('event-date');
    const descriptionInput = document.getElementById('event-description');
    const form = document.getElementById('event-form');

    // If eventId is not "new", fetch event data for editing
    if (eventId !== 'new') {
        title.textContent = 'Edit Event';

        try {
            const response = await fetch(`http://localhost:8000/api/v1/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Помилка завантаження івенту');
            }

            const event = await response.json();
            nameInput.value = event.name || '';
            cityInput.value = event.location_city || '';
            typeInput.value = event.type || '';
            dateInput.value = event.date || '';
            descriptionInput.value = event.description || '';
        } catch (err) {
            document.getElementById('app').innerHTML = `<p>Помилка: ${err.message}</p>`;
            return;
        }
    } else {
        // Creating a new event
        title.textContent = 'Create New Event';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = {
            name: nameInput.value,
            location_city: cityInput.value,
            type: typeInput.value,
            date: dateInput.value,
            description: descriptionInput.value,
        };

        try {
            const response = await fetch(
                `http://localhost:8000/api/v1/events/${eventId === 'new' ? '' : eventId}`,
                {
                    method: eventId === 'new' ? 'POST' : 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(eventData),
                }
            );

            if (!response.ok) {
                throw new Error('Не вдалося зберегти івент');
            }

            window.location.hash = '#events'; // Back to event list
        } catch (err) {
            alert(`Помилка: ${err.message}`);
        }
    });

    // Handle Cancel button
    document.getElementById('cancel-event-btn').addEventListener('click', () => {
        window.location.hash = '#events'; // Back to event list
    });
}