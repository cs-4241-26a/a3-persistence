// Handle Habit Deletion via Fetch (if using AJAX)
async function deleteItem(id) {
    const res = await fetch(`/items/delete/${id}`, { method: 'POST' });
    if (res.ok) {
        window.location.reload();
    }
}

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = '/auth/logout';
    });
}