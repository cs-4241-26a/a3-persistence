// FRONT-END (CLIENT) JAVASCRIPT FOR LIFT TRACKER PAGE

// Function to clear the table and rebuild it from lifts array
// Called after every load/add/delete (server always sends back full array)
const renderTable = function (lifts) {
  const tbody = document.querySelector("#lifts-body");

  // Clears table
  tbody.replaceChildren();

  // Creates new table
  for (const lift of lifts) {

    // Table elements
    const tableRow = document.createElement("tr");
    const tdExercise = document.createElement("td");
    const tdWeight = document.createElement("td");
    const tdReps = document.createElement("td");
    const tdORM = document.createElement("td");
    const tdActions = document.createElement("td");

    const deleteButton = document.createElement("button"); // Delete button, unique to lift.ID
    const editButton = document.createElement("button"); // Edit button, unique to lift.ID

    // Setting textContent to lift's data (and button)
    tdExercise.textContent = lift.exercise;
    tdWeight.textContent = lift.weight;
    tdReps.textContent = lift.reps;
    tdORM.textContent = lift.orm;
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("button", "is-danger", "is-small", "is-outlined", "is-inverted", "mx-1"); // Add classes to delete button
    editButton.textContent = "Edit";
    editButton.classList.add("button", "is-danger", "is-small", "is-outlined", "is-inverted", "mx-1"); // Add classes to edit button

    // Event listener for delete button
    deleteButton.addEventListener('click', function () { deleteLift(lift._id) });

    // Event listener for edit button for row "lift"
    editButton.onclick = function () {
      // Exercise -> input field
      const exerciseInput = document.createElement("input");
      exerciseInput.type = "text";
      exerciseInput.value = lift.exercise;
      exerciseInput.classList.add("input", "is-small");

      // Weight -> input field
      const weightInput = document.createElement("input");
      weightInput.type = "number";
      weightInput.value = lift.weight;
      weightInput.classList.add("input", "is-small");

      // Reps -> input field
      const repsInput = document.createElement("input");
      repsInput.type = "number";
      repsInput.value = lift.reps;
      repsInput.classList.add("input", "is-small");

      // Replaces td's text with input fields
      tdExercise.replaceChildren(exerciseInput);
      tdWeight.replaceChildren(weightInput);
      tdReps.replaceChildren(repsInput);

      editButton.textContent = "Save"; // Changes "edit" to "save"

      // Listener for when user clicks "save"
      editButton.onclick = function () {
        updateLift(lift._id, exerciseInput.value, Number(weightInput.value), Number(repsInput.value));
      }
    };

    // Appends edit and delete button to tdActions
    tdActions.append(editButton, deleteButton);

    // Appends everything to tableRow
    tableRow.append(tdExercise, tdWeight, tdReps, tdORM, tdActions);

    // Appends table row to tbody
    tbody.appendChild(tableRow);
  }
}

// Function to fetch "/lifts", parse JSON response, render table
// Called on page load
const fetchLifts = async function () {
  const response = await fetch("/lifts", {
    method: "GET"
  });

  const lifts = await response.json();
  renderTable(lifts);
}

// Function to handle form submission for adding a new lift
// Called by #lift-form submit handler
const addLift = async function (event) {
  event.preventDefault()

  // Input elements
  const exerciseInput = document.getElementById("exercise"); // Using .getElementById() here 
  const weightInput = document.querySelector("#weight"); // Using .querySelector() here
  const repsInput = document.querySelector("#reps"); // Using .querySelector() here
  const unitInput = document.querySelector('input[name="unit"]:checked'); // Using .querySelector() here

  // Reading input values (converting string -> number for numeric ones)
  const exercise = exerciseInput.value;
  let weight = Number(weightInput.value);
  if (unitInput.value === "kg") {
    // Convert kg to lbs before sending; server stores weight in lbs
    weight *= 2.20462;
  }
  const reps = Number(repsInput.value);

  const body = JSON.stringify({ exercise, weight, reps });

  // POST to /addLift with { exercise, weight, reps }
  const response = await fetch("/addLift", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json"
    }
  });

  const lifts = await response.json();
  renderTable(lifts);

  // Clears the form inputs back to empty
  exerciseInput.value = "";
  weightInput.value = "";
  repsInput.value = "";
}

// Function to handle deleting a lift by ID
// Called by a delete button's click handler with that lift's ID
const deleteLift = async function (ID) {
  const body = JSON.stringify({ ID });

  // POST to /deleteLift with { ID: id }
  const response = await fetch("/deleteLift", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json"
    }
  });

  const lifts = await response.json();
  renderTable(lifts);
}

// Function to handle updating a lift by ID
// Called by an edit button's click handler with that lift's ID and new values
const updateLift = async function (ID, exercise, weight, reps) {
  const body = JSON.stringify({ ID, exercise, weight, reps });

  const response = await fetch("/updateLift", {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" }
  });

  const lifts = await response.json();
  renderTable(lifts);
}

// Function to handle logging out
// Called by #logout-button click handler
const logout = async function () {
  const response = await fetch("/logout", {
    method: "POST"
  });
  const result = await response.json();
  if (result.success) {
    window.location.href = "/"; // This redirects user to login page after logging out
  }
};

// Function to handle page load events
// Called when the page loads
window.onload = function () {
  // Fill table with any lifts already in the server on load
  fetchLifts();

  // Attach addLift as the #lift-form submit handler
  const liftForm = document.getElementById("lift-form");
  liftForm.addEventListener("submit", addLift);

  // Attach logout as the #logout-button click handler
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", logout);

  // Display the username of the logged-in user
  const usernameDisplay = document.getElementById("username-display");
  const username = localStorage.getItem("username");
  usernameDisplay.textContent = username;
}