// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  // user information
  const name = document.querySelector( '#user_name' ).value;
  const birth_year = document.querySelector( '#birth_year' ).value;
  const user_class = document.querySelector( '#user_class' ).value;

  let user_info = {
    name: name,
    birth_year: Number(birth_year),
    user_class: user_class,
    age: 2026 - Number(birth_year)
  };

  const response = await fetch('/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(user_info)
  });

  const data = await response.json();
  console.log( 'data:', data );

  await fetchInfo();
}

const deleteUser = async function(id) {
  const response = await fetch('/remove', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        _id: id
    })
  })
  const data = await response.json()
}

let currentUser = null;
const editUser = function(user) {
  currentUser = user;
  console.log("edituserraun");
  document.querySelector('#edit_name').value = user.name;
  document.querySelector('#edit_year').value = user.birth_year;
  document.querySelector('#edit_class').value = user.user_class;
  document.querySelector('#edit_form_div').style.display = 'block';
};

document.querySelector('#edit_form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const name = document.querySelector('#edit_name').value;
  const birth_year = document.querySelector('#edit_year').value;
  const user_class = document.querySelector('#edit_class').value;
  const response = await fetch('/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      _id: currentUser._id,
      name: name,
      birth_year: birth_year,
      user_class: user_class
    })
  });
  if (response.ok) {
    document.querySelector('#edit_form_div').style.display = 'none';
    fetchInfo();
  }
});

const closeForm = function() {
  document.querySelector('#edit_form_div').style.display = 'none';
};

const ageSort_oldest = function(users) {
  users.sort(function(user_a, user_b){
    return user_b.age - user_a.age;
  });
}

const ageSort_youngest = function(users) {
  users.sort(function(user_a, user_b){
    return user_a.age - user_b.age;
  });
}

let sort_order = 'oldest';

const fetchInfo = async function() {
  const response = await fetch('/docs');
  const users = await response.json();
  console.log(users);

  // add users to table yayyy
  const age_table_body = document.querySelector('#age_table_body');
  age_table_body.innerHTML = '';

  //sort
  if (sort_order === 'oldest'){
    ageSort_oldest(users);
  }else if (sort_order === 'youngest'){
    ageSort_youngest(users);
  }


  //back to table
  users.forEach(function(user) {
    const row = document.createElement('tr');
    const name_cell = document.createElement('td');
    name_cell.textContent = user.name;
    const class_cell = document.createElement('td');
    class_cell.textContent = user.user_class;
    const birth_year_cell = document.createElement('td');
    birth_year_cell.textContent = user.birth_year;
    const age_cell = document.createElement('td');
    age_cell.textContent = user.age;
    const delete_cell = document.createElement('td');
    const delete_button = document.createElement('button');
    delete_button.textContent = 'Delete';
    delete_button.addEventListener('click', async function() {
      await deleteUser(user._id);
      await fetchInfo();
    });
    delete_cell.appendChild(delete_button);
    const edit_cell = document.createElement('td');
    const edit_button = document.createElement('button');
    edit_button.textContent = 'Edit';
    edit_button.addEventListener('click', async function() {
      editUser(user);
    });
    edit_cell.appendChild(edit_button);
    row.appendChild(name_cell);
    row.appendChild(class_cell);
    row.appendChild(birth_year_cell);
    row.appendChild(age_cell);
    row.appendChild(delete_cell);
    row.appendChild(edit_cell);
    age_table_body.appendChild(row);
  });
  
}


window.onload = async function() {
  const form = document.querySelector('#user_form');
  form.onsubmit = submit;
  //order stuff
  document.querySelector('#young_button').onclick = async function() {
    sort_order = 'youngest';
    await fetchInfo();
  };
  document.querySelector('#old_button').onclick = async function() {
    sort_order = 'oldest';
    await fetchInfo();
  };
  await fetchInfo();
}
