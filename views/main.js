export async function renderMainPage() {
    await loadTemplate('/thinkify_frontend/pages/main.html', 'main-template');

    const template = document.getElementById('main-template');
    const app = document.getElementById('app');

    const clone = template.content.cloneNode(true);
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


    const btnUsers = app.querySelector('#btn-to-users');
    const btnEvents = app.querySelector('#btn-to-events');

    btnUsers.addEventListener('click', () => {
        window.location.hash = '#users';
    });

    btnEvents.addEventListener('click', () => {
        window.location.hash = '#events';
    });

    await updateUserName();
}

async function loadTemplate(url, templateId) {
    if (document.getElementById(templateId)) return;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити шаблон');

    const text = await response.text();
    const container = document.createElement('div');
    container.innerHTML = text;

    const template = container.querySelector(`#${templateId}`);
    if (!template) throw new Error(`Шаблон з id "${templateId}" не знайдено у ${url}`);

    document.body.appendChild(template);
}

async function updateUserName() {
    await new Promise(resolve => setTimeout(resolve, 0));

    const userName = localStorage.getItem("first_name") || "Користувач";
    const nameElement = document.getElementById("first_name");

    if (nameElement) {
        nameElement.textContent = userName;
    } else {
        console.warn("Елемент #first_name не знайдено!");
    }
}
