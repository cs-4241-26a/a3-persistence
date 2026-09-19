// FRONT-END (CLIENT) JAVASCRIPT HERE
console.log('load');
let notes = [];
let editIndex = null; // Track which note is being edited

// INITIALIZE DOM VARIABLES
const modal = document.getElementById('noteModal');
const openModalBtn = document.getElementById('addNote');
const cancelBtn = document.getElementById('cancelNote');
const form = document.getElementById('noteForm');


// NEW note
openModalBtn.addEventListener('click', () => {
  editIndex = null;
  form.reset();
  document.getElementById('saveNote').innerText = "Save Note";
  modal.style.display = 'flex';
});

// Hide the overlay
cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  form.reset();
});

// form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const noteData = {
    title: document.getElementById('noteTitle').value,
    content: document.getElementById('noteContent').value,
    urgency: document.getElementById('noteUrgency').value
  };

  if (editIndex !== null) {
    // EDITING Note
    noteData._id = notes[editIndex]._id;
    const response = await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    notes = await response.json();
  } else {
    // ADDING new note
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    notes = await response.json();
  }

  modal.style.display = 'none';
  form.reset();
  renderNotes();
});

// EXISTING note
window.editNote = function(index) {
  editIndex = index;
  const note = notes[index];

  // Pre-fill the form
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('noteContent').value = note.content;
  document.getElementById('noteUrgency').value = note.urgency;

  document.getElementById('saveNote').innerText = "Update Note";
  modal.style.display = 'flex';
};

async function deleteNote(index) {
  const noteID = notes[index]._id;

  const response = await fetch('/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: noteID })
  });

  notes = await response.json();
  renderNotes();
}

// fetch notes from server
async function fetchNotes() {
  const response = await fetch('/notes');

  if(response.status === 401) {
    window.location.href = '/auth/github';
    return
  }

  notes = await response.json();
  renderNotes();
}

// render HTML
function renderNotes() {
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';

  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div');
    // We use your flexbox styling alongside paper-css cards

    noteDiv.innerHTML = `
      <div class="card text-left" style="background-color: #F0CF65; width: 250px; cursor: pointer; transition: transform 0.3s ease; border: 2px solid #333;">
        <div class="card-body">
          <!-- PROXIMITY: Group Title and Urgency tightly together -->
          <h2 class="card-title" style="font-size: 1.5rem; font-family: 'Montserrat', sans-serif; color: #111; margin-bottom: 0;">${note.title}</h2>
          <p style="font-size: 12px; color: #444; font-weight: bold; text-transform: uppercase; margin-top: 5px; margin-bottom: 15px;">
            ${note.urgency} | Due: ${note.deadline}
          </p>
          
          <!-- PROXIMITY: Give the main content some breathing room -->
          <p class="card-text" style="font-family: 'Montserrat', sans-serif; color: #222; white-space: pre-wrap; margin-bottom: 25px;">${note.content}</p>
          
          <!-- ALIGNMENT & PROXIMITY: Push buttons to the bottom right -->
          <div class="row flex-right" style="gap: 10px;">
            <button class="btn-small btn-secondary" onclick="editNote(${index})">Edit</button>
            <button class="btn-small btn-danger" onclick="deleteNote(${index})">X</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(noteDiv);
  });
}

// INITIALIZE APP ON LOAD
window.onload = fetchNotes;