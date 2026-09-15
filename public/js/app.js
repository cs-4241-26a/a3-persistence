const welcomeText = document.getElementById('welcomeText');
const logoutBtn = document.getElementById('logoutBtn');
const itemForm = document.getElementById('itemForm');
const itemAlert = document.getElementById('itemAlert');
const itemsList = document.getElementById('itemsList');
const emptyState = document.getElementById('emptyState');
const filterSelect = document.getElementById('filterSelect');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const itemIdField = document.getElementById('itemId');
const template = document.getElementById('itemCardTemplate');

let allItems = [];

function showItemAlert(message, type) {
  itemAlert.textContent = message;
  itemAlert.className = `alert alert-${type}`;
}

function clearItemAlert() {
  itemAlert.className = 'alert d-none';
}

async function init() {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) {
      window.location.href = '/';
      return;
    }
    const me = await res.json();
    welcomeText.textContent = `Hi, ${me.username}`;
    await loadItems();
  } catch (err) {
    window.location.href = '/';
  }
}

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

async function loadItems() {
  const res = await fetch('/api/items');
  if (!res.ok) return;
  allItems = await res.json();
  renderItems();
}

function renderItems() {
  const filter = filterSelect.value;
  const filtered = filter === 'all' ? allItems : allItems.filter((i) => i.category === filter);

  itemsList.innerHTML = '';
  emptyState.classList.toggle('d-none', filtered.length !== 0);

  filtered.forEach((item) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.item-title').textContent = item.title;
    node.querySelector('.item-category').textContent = item.category;

    const urlEl = node.querySelector('.item-url');
    urlEl.textContent = item.url;
    urlEl.href = item.url;

    node.querySelector('.item-notes').textContent = item.notes || '';
    node.querySelector('.item-favorite').textContent = item.favorite ? '★ Favorite' : '';

    node.querySelector('.edit-btn').addEventListener('click', () => startEdit(item));
    node.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item._id));

    itemsList.appendChild(node);
  });
}

filterSelect.addEventListener('change', renderItems);

function resetForm() {
  itemForm.reset();
  itemIdField.value = '';
  formTitle.textContent = 'Add a Bookmark';
  submitBtn.textContent = 'Add Bookmark';
  cancelEditBtn.classList.add('d-none');
  clearItemAlert();
}

function startEdit(item) {
  itemIdField.value = item._id;
  document.getElementById('title').value = item.title;
  document.getElementById('url').value = item.url;
  document.getElementById('notes').value = item.notes || '';
  document.getElementById('favorite').checked = !!item.favorite;
  const radio = document.querySelector(`input[name="category"][value="${item.category}"]`);
  if (radio) radio.checked = true;

  formTitle.textContent = 'Edit Bookmark';
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetForm);

itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearItemAlert();

  if (!itemForm.checkValidity()) {
    itemForm.classList.add('was-validated');
    return;
  }

  const payload = {
    title: document.getElementById('title').value.trim(),
    url: document.getElementById('url').value.trim(),
    category: document.querySelector('input[name="category"]:checked').value,
    notes: document.getElementById('notes').value.trim(),
    favorite: document.getElementById('favorite').checked,
  };

  const id = itemIdField.value;
  const isEdit = Boolean(id);

  try {
    const res = await fetch(isEdit ? `/api/items/${id}` : '/api/items', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showItemAlert(data.error || 'Something went wrong.', 'danger');
      return;
    }

    resetForm();
    await loadItems();
  } catch (err) {
    showItemAlert('Something went wrong. Please try again.', 'danger');
  }
});

async function deleteItem(id) {
  if (!confirm('Delete this bookmark?')) return;
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (res.ok) {
    await loadItems();
  }
}

init();
