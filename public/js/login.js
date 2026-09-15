const login = async function (event) {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    window.location.href = "/home.html";
  } else {
    var errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = "incorrect username or password, please try again";
    errorMessage.style.display = "block";
  }
};

window.onload = function () {
  const form = document.querySelector("#loginForm");
  form.addEventListener("submit", login);
};
