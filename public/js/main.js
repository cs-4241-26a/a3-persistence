// FRONT-END (CLIENT) JAVASCRIPT HERE
let editingID = -1;

const submit = async function (event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault();

  const title = document.querySelector("#title").value;
  const message = document.querySelector("#message").value;
  const drink = document.querySelector("#drink").value;
  const date = document.querySelector("#date").value;

  if (editingID == -1) {
    await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, message, drink, date }),
    });
  } else {
    await fetch("/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id: editingID, title, message, drink, date }),
    });
    editingID = -1;
    document.querySelector("#submit").textContent = "Submit";
  }

  getData();
};

window.onload = function () {
  const button = document.querySelector("#submit");
  const logoutButton = document.querySelector("#logout");

  if (button) {
    button.onclick = submit;
  }

  if (logoutButton) {
    logoutButton.onclick = logout;
  }

  getData();
};

const addData = function (data) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  data.forEach((note) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${note.title}</td>
      <td>${note.message}</td>
      <td>${note.drink}</td>
      <td>${note.date}</td>
      <td><button class="update" onclick="updateData(this)" data-id="${note._id}">Update</button></td>
      <td><button class="delete" onclick="deleteData(this)" data-id="${note._id}">Delete</button></td>
    `;

    tbody.appendChild(tr);
  });
};

const deleteData = async function (button) {
  await fetch("/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _id: button.dataset.id }),
  });

  getData();
};

const updateData = async function (button) {
  const row = button.parentNode.parentNode;
  const cells = row.children;

  document.querySelector("#title").value = cells[0].textContent;
  document.querySelector("#message").value = cells[1].textContent;
  document.querySelector("#drink").value = cells[2].textContent;
  document.querySelector("#date").value = cells[3].textContent;
  document.querySelector("#submit").textContent = "Update";
  editingID = button.dataset.id;
};

const getData = async function () {
  const response = await fetch("/data");
  const data = await response.json();
  addData(data);
};

const logout = async function (event) {
  if (event) {
    event.preventDefault();
  }

  const response = await fetch("/logout", {
    method: "POST",
  });

  if (response.ok) {
    window.location.href = "/";
  }
};
