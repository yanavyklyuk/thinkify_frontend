async function loadTemplate(url, id) {
    if (document.getElementById(id)) return;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load template from: ${url}`);
        }

        const text = await response.text();
        const container = document.createElement('div');
        container.innerHTML = text;

        const template = container.querySelector(`#${id}`);
        if (!template) {
            throw new Error(`Template with id "${id}" not found in loaded HTML.`);
        }

        document.body.appendChild(template);
    } catch (error) {
        console.error(error.message);
        throw new Error('Template loading failed.');
    }
}

export async function renderEditEventPage(eventId) {
    const token = localStorage.getItem('token');

    if (!token) {
        document.getElementById('app').innerHTML = `<p>Необхідно увійти в систему</p>`;
        return;
    }

    await loadTemplate('/thinkify_frontend/pages/edit_event.html', 'edit-event-template');

    const app = document.getElementById('app');
    const template = document.getElementById('edit-event-template');

    if (!template) {
        app.innerHTML = `<p>Error: Template not found</p>`;
        console.error(`Template with id "edit-event-template" not found in the DOM.`);
        return;
    }

    const clone = template.content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(clone);

    setTimeout(() => {
        const modal = document.querySelector('.event-edit');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);

    const title = document.getElementById('edit-event-title');
    const nameInput = document.getElementById('event-name');
    const cityInput = document.getElementById('event-city');
    const urlInput = document.getElementById('event-url');
    const typeInput = document.getElementById('event-type');
    const dateInput = document.getElementById('event-date');
    const descriptionInput = document.getElementById('event-description');
    const form = document.getElementById('event-form');

    if (eventId !== 'new') {
        title.textContent = 'Edit Event';

        try {
            const response = await fetch(`http://localhost:8000/api/v1/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch event details.');
            }

            const event = await response.json();

            nameInput.value = event.name || '';
            cityInput.value = event.location_city || '';
            urlInput.value = event.url || '';
            typeInput.value = event.type || '';

            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toISOString().slice(0, 16);
            dateInput.value = formattedDate;

            descriptionInput.value = event.description || '';
        } catch (err) {
            app.innerHTML = `<p>Помилка: ${err.message}</p>`;
            return;
        }
    } else {
        title.textContent = 'Create New Event';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = {
            name: nameInput.value.trim(),
            location_city: cityInput.value.trim(),
            url: urlInput.value.trim(),
            type: typeInput.value.trim(),
            date: dateInput.value,
            description: descriptionInput.value.trim(),
        };

        if (!eventData.url.startsWith('http://') && !eventData.url.startsWith('https://')) {
            alert('Please provide a valid URL (e.g., https://example.com).');
            return;
        }

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
                const error = await response.json();
                console.error('Server error:', error);
                throw new Error(error.message || 'Failed to save event');
            }

            window.location.hash = '#events';
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    });

    document.getElementById('cancel-event-btn').addEventListener('click', () => {
        window.location.hash = '#events';
    });
}