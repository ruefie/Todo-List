const currentDate = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-US', options);

const dateHeader = document.getElementById('dateHeader');
dateHeader.innerHTML = `<h2>Hello, today is ${formattedDate}</h2>`;

const form = document.getElementById("todoform");
const todoInput = document.getElementById("newtodo");
const todosListEl = document.getElementById("todos-list");
const filterDateInput = document.getElementById("filterdate");
const notificationEl = document.querySelector(".notification");
const todoDateInput = document.getElementById("newtodoDate");
const updateListCountEl = document.querySelector(".js-count");
const clearAll = document.querySelector(".js-clear");
const clearCompleted = document.querySelector(".js-clear-task");


let todos = JSON.parse(localStorage.getItem("todos")) || [];
let EditTodoID = -1;

renderTodos();
updateCounter();

// form.addEventListener("submit", (e) => {
//   e.preventDefault();
//   saveTodo();
//   renderTodos();
//   updateCounter();
//   localStorage.setItem("todos", JSON.stringify(todos));
// });


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputDate = new Date(todoDateInput.value);
  const currentDate = new Date();
  if (inputDate < currentDate) {
    showNotification("Please enter a valid date (today or future date).");
    return;
  }
  saveTodo();
  renderTodos();
  updateCounter();
  localStorage.setItem("todos", JSON.stringify(todos));
});


document.getElementById("filterButton").addEventListener("click", () => {
  renderTodos();
});

document.getElementById("showAllButton").addEventListener("click", () => {
  filterDateInput.value = "";
  renderTodos();
  updateCounter(); // Update the count after showing all todos
});

function saveTodo() {
  const todoValue = todoInput.value;
  const todoDateValue = todoDateInput.value;

  const isEmpty = todoValue.trim() === "";
  const isDuplicate = todos.some(
    (todo) =>
      todo.value.toUpperCase() === todoValue.toUpperCase() &&
      todo.date === todoDateValue
  );

  if (isEmpty) {
    showNotification("Invalid todo");
  } else if (isDuplicate) {
    showNotification("Duplicate todo");
  } else {
    if (EditTodoID >= 0) {
      todos = todos.map((todo, index) => ({
        checked: index === EditTodoID ? false : todo.checked,
        color: todo.color,
        value: index === EditTodoID ? todoValue : todo.value,
        date: index === EditTodoID ? todoDateValue : todo.date,
      }));
      EditTodoID = -1;
      showNotification("Todo successfully edited");
      todoInput.value = "";
      todoDateInput.value = "";
    } else {
      todos.push({
        value: todoValue,
        checked: false,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        date: todoDateValue,
      });
      showNotification("Todo successfully added");
      todoInput.value = "";
      todoDateInput.value = "";
    }
  }
}

function renderTodos() {
  if (todos.length === 0) {
    todosListEl.innerHTML =
      "Your List is empty. Would you like to add a new item?";
    return;
  }

  const filteredDate = filterDateInput.value;
  const filteredTodos = filteredDate
    ? todos.filter((todo) => todo.date === filteredDate)
    : todos;
  if (filteredTodos.length === 0) {
    todosListEl.innerHTML = "No item found for this date.";
  } else {
    todosListEl.innerHTML = "";

    filteredTodos.forEach((todo, index) => {
      const formattedDate = new Date(todo.date).toLocaleDateString("en-GB");

      todosListEl.innerHTML += `
            <div class="todo" id=${index}>
              <i class="bi ${
                todo.checked ? "bi-check-circle-fill" : "bi-circle"
              }" style="color: ${todo.color}" data-action="check"></i>
              <p class="${
                todo.checked ? "checked" : ""
              }" data-action="check">${todo.value}</p>
                <span class="${todo.checked ? "checked" : ""}" data-action="check">${formattedDate}</span>
              <i class="bi bi-pencil-square" data-action="edit"></i>
              <i class="bi bi-trash" data-action="delete"></i>
            </div>`;

            
    });
  }
}

document.getElementById("showAllButton").addEventListener("click", () => {
  filterDateInput.value = ""; // Reset the filter input value
  renderTodos(); // Render all todo items
});

todosListEl.addEventListener("click", (event) => {
  const target = event.target;
  const parentElement = target.parentNode;

  if (parentElement.className !== "todo") return;
  const todo = parentElement;
  const todoID = Number(todo.id);

  const action = target.dataset.action;

  action === "check" && checkTodo(todoID);
  action === "edit" && editTodo(todoID);
  action === "delete" && deleteTodo(todoID);
});

function checkTodo(todoID) {
  todos = todos.map((todo, index) => ({
    value: todo.value,
    date: todo.date,
    color: todo.color,
    checked: index === todoID ? !todo.checked : todo.checked,
  }));
  renderTodos();
  updateCounter();
  localStorage.setItem("todos", JSON.stringify(todos));
}



// function checkTodo(todoID) {
//   todos = todos.map((todo, index) => ({
//     value: todo.value,
//     date: todo.date,
//     color: todo.color,
//     checked: index === todoID ? !todo.checked : todo.checked,
//   }));

//   // Get all todo elements in the list
//   const todoElements = document.querySelectorAll('.todo');

//   // Iterate over each todo element
//   todoElements.forEach((todoElement, index) => {
//     if (index === todoID) {
//       // Toggle the checked class for the todo text
//       const todoText = todoElement.querySelector('p');
//       todoText.classList.toggle('checked');

//       // Toggle the checked class for the date
//       const dateSpan = todoElement.querySelector('span');
//       dateSpan.classList.toggle('checked');
//     }
//   });

//   renderTodos();
//   updateCounter();
//   localStorage.setItem("todos", JSON.stringify(todos));
// }


function editTodo(todoID) {
  todoInput.value = todos[todoID].value;
  todoDateInput.value = todos[todoID].date;
  EditTodoID = todoID;
}

function deleteTodo(todoID) {
  todos = todos.filter((todo, index) => index !== todoID);
  EditTodoID = -1;
  renderTodos();
  updateCounter();
  localStorage.setItem("todos", JSON.stringify(todos));
}

function deleteAllTodos() {
  // Show confirmation message
  const confirmDelete = confirm(
    "Are you sure you want to delete all Todo List items?"
  );
  if (confirmDelete) {
    // Clear the todos array
    todos = [];
    // Update the local storage
    localStorage.setItem("todos", JSON.stringify(todos));
    // Re-render the todos list
    renderTodos();
    // Show notification
    showNotification("All Todo List items have been deleted.");
    // Update the counter
    updateCounter();
  }
}

clearAll.addEventListener("click", deleteAllTodos);




function deleteCompletedTasks() {
  todos = todos.filter((todo) => !todo.checked);
  renderTodos();
  updateCounter();
  localStorage.setItem("todos", JSON.stringify(todos));
}

clearCompleted.addEventListener("click", deleteCompletedTasks);


// clearAll.addEventListener("click", () => {
//   todosListEl.innerHTML = ""; // Reset the filter input value

//   updateCounter();
//   localStorage.setItem("todos", JSON.stringify(todos));
// });

function showNotification(msg) {
  notificationEl.innerHTML = msg;
  notificationEl.classList.add("notif-enter");

  setTimeout(() => {
    notificationEl.classList.remove("notif-enter");
  }, 2000);
}

function updateCounter() {
  const totalTasks = todos.length;
  const checkedTasks = todos.filter((todo) => todo.checked).length;

  if (checkedTasks > 0) {
    updateListCountEl.textContent = `You have ${checkedTasks} out of ${totalTasks} task${totalTasks !== 1 ? "s" : ""} done`;
  } else {
    updateListCountEl.textContent = `You have ${totalTasks} task${totalTasks !== 1 ? "s" : ""} in your list`;
  }

  localStorage.setItem("todos", JSON.stringify(todos));
}
