// FRONT-END (CLIENT) JAVASCRIPT HERE
async function loadData() {
  const response = await fetch("/data");
  const data = await response.json();
  renderTable(data);
}

function renderTable(data) {
  const body = document.querySelector("#results-body");
  body.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const row = document.createElement("tr");

    row.innerHTML =
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.equipment +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.name +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.quantity +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      (item.urgent ? "Yes" : "No") +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.date +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.notes +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]">' +
      item.priority +
      "</td>" +
      '<td class="text-left p-2 border-b border-[#dce7f2]"><button type="button" class="px-2 py-0.5 text-sm border border-[#dce7f2] rounded-lg cursor-pointer hover:bg-[#2e6fa3] hover:text-white">Edit</button> <button type="button" class="px-2 py-0.5 text-sm border border-[#dce7f2] rounded-lg cursor-pointer hover:bg-[#2e6fa3] hover:text-white">Delete</button></td>';

    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = function () {
      startEdit(item);
    };
    buttons[1].onclick = function () {
      deleteItem(item._id);
    };

    body.appendChild(row);
  }
}

function startEdit(item) {
  document.querySelector("#equipment").value = item.equipment;
  document.querySelector("#name").value = item.name;
  document.querySelector("#quantity").value = item.quantity;
  document.querySelector("#urgent").checked = item.urgent;
  document.querySelector("#date").value = item.date;
  document.querySelector("#notes").value = item.notes;
  document.querySelector("#request-id").value = item._id;

  document.querySelector("#cancel").hidden = false;
}

function clearForm() {
  document.querySelector("#requestForm").reset();
  document.querySelector("#request-id").value = "";
  document.querySelector("#cancel").hidden = true;
}

async function deleteItem(id) {
  const response = await fetch("/data", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }),
  });

  const data = await response.json();
  renderTable(data);
}

async function submitForm(event) {
  event.preventDefault();

  const item = {
    equipment: document.querySelector("#equipment").value,
    name: document.querySelector("#name").value,
    quantity: Number(document.querySelector("#quantity").value),
    urgent: document.querySelector("#urgent").checked,
    date: document.querySelector("#date").value,
    notes: document.querySelector("#notes").value,
  };

  const idValue = document.querySelector("#request-id").value;
  let response;

  if (idValue) {
    // editing an existing item
    item._id = idValue;
    response = await fetch("/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  } else {
    // adding a new item
    response = await fetch("/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  }

  const data = await response.json();
  renderTable(data);
  clearForm();
}

window.onload = function () {
  document.querySelector("#requestForm").onsubmit = submitForm;
  document.querySelector("#cancel").onclick = clearForm;
  loadData();
};
