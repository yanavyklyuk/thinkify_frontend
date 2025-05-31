document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    console.log('Login attempt:', email);

    try {
        const response = await fetch(this.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            const payload = parseJwt(token);

            if (payload.role !== 'admin') {
                alert('You do not have access to this page');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('id', payload.user_id);
            localStorage.setItem('role', payload.role);
            localStorage.setItem('first_name', payload.first_name);
            window.location.href = 'index.html';
        } else {
            const errorData = await response.json();
            alert(errorData.detail ? errorData.detail[0].msg : 'Error occured');
        }
    } catch (error) {
        console.error('Error with log in:', error);
        alert('Error with connection.');
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Cannot parse token", e);
        return {};
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.login-container');
    if (container) {
        setTimeout(() => {
            container.classList.add('show');
        }, 100);
    }
});