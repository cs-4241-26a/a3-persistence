const loginForm = document.getElementById('loginForm');
const alertBox = document.getElementById('alertBox');

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
}


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!loginForm.checkValidity()) {
    loginForm.classList.add('was-validated');
    return;
  }

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Login failed.', 'danger');
      return;
    }

    if (data.created) {
      showAlert(`Welcome! A new account for "${data.username}" was just created.`, 'success');
      setTimeout(() => (window.location.href = '/app'), 900);
    } else {
      window.location.href = '/app';
    }
  } catch (err) {
    showAlert('Something went wrong. Please try again.', 'danger');
  }
});
