// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  await fetchInfo();
}


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
  const response = await fetch('/alldocs');
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
    const user_cell = document.createElement('td');
    user_cell.textContent = user.username;
    const name_cell = document.createElement('td');
    name_cell.textContent = user.name;
    const class_cell = document.createElement('td');
    class_cell.textContent = user.user_class;
    const birth_year_cell = document.createElement('td');
    birth_year_cell.textContent = user.birth_year;
    const age_cell = document.createElement('td');
    age_cell.textContent = user.age;
    
    row.appendChild(user_cell);
    row.appendChild(name_cell);
    row.appendChild(class_cell);
    row.appendChild(birth_year_cell);
    row.appendChild(age_cell);
    age_table_body.appendChild(row);
  });
  
}


window.onload = async function() {

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
