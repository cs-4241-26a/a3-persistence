// FRONT-END (CLIENT) JAVASCRIPT HERE

let ul = null;

// stores id of assignment being updated
let isEditing = null;

function display(assignments) {
    //clears list to prevent duplicates
    ul.innerHTML = "";
    //console.log(arr);
    //displays all assignments returned by server and stores assignment information
    //to be retrieved when editing or deleting
    assignments.forEach(item => {
        const li = document.createElement("li");
        li.dataset.id = item._id;
        li.dataset.assignment = item.assignment;
        li.dataset.category = item.category;
        li.dataset.deadline = item.deadline;
        li.innerHTML = ` <input type="checkbox" /> <span>${item.assignment} | ${item.category} | ${item.deadline} | ${item.priority}</span><button class="edit">Edit</button><button class="delete">Delete</button>`;
        ul.appendChild(li);
    });
}

async function load() {
    const response = await fetch("/docs");
    const assignments = await response.json();
    display(assignments);
}
const submit = async function (event) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault();

    //gets current values of form
    const input = document.querySelector("#assignment"),
        category = document.querySelector("#category"),
        date = document.querySelector("#deadline"),
        json = { assignment: input.value, category: category.value, deadline: date.value };

    let url = "/add";
    let method = "POST";
    if (isEditing != null) {
        url = `/update`;
        json._id = isEditing;
    }

    const body = JSON.stringify(json);

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body,
    });

    //clears form after submission
    input.value = "";
    category.value = "";
    date.value = "";

    //gets updated assignment list
    const assignments = await response.json();
    isEditing = null;

    display(assignments);
};

window.onload = function () {
    document.querySelector("#form").addEventListener("submit", submit);
    //creates list to display elements
    ul = document.createElement("ul");
    ul.className = "list";
    document.body.appendChild(ul);

    ul.addEventListener("click", async event => {
        const li = event.target.closest("li");
        if (event.target.classList.contains("delete")) {
            const response = await fetch("/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: li.dataset.id,
                }),
            });
            if (response.ok) {
                console.log("Deleted");
            }

            const assignments = await response.json();
            display(assignments);
        }
        if (event.target.classList.contains("edit")) {
            isEditing = li.dataset.id;
            document.querySelector("#assignment").value = li.dataset.assignment;
            document.querySelector("#category").value = li.dataset.category;
            document.querySelector("#deadline").value = li.dataset.deadline;
            event.target.disabled = true; //prevents edit button to be clicked again
        }
    });
    document.querySelector("#logout").addEventListener("click", async () => {
        try {
            const response = await fetch("/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Could not log out.");
            }

            window.location.href = "/login.html";
        } catch (error) {
            alert(error.message);
        }
    });
    load();
};
