const STORAGE_KEY = 'todoListApp.tasks';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const clearCompletedButton = document.getElementById('clear-completed');

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTasks() {
  if (tasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
    return;
  }

  todoList.innerHTML = tasks
    .map(
      (task) => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <label>
            <input type="checkbox" ${task.completed ? 'checked' : ''} />
            <span class="task-text">${escapeHtml(task.text)}</span>
          </label>
          <button type="button" class="delete-btn">Delete</button>
        </li>
      `
    )
    .join('');
}

function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  tasks.push({
    id: Date.now(),
    text: trimmedText,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('.delete-btn');
  const taskItem = event.target.closest('.task-item');

  if (button && taskItem) {
    const taskId = Number(taskItem.dataset.id);
    deleteTask(taskId);
  }
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  const taskItem = event.target.closest('.task-item');

  if (checkbox && taskItem) {
    const taskId = Number(taskItem.dataset.id);
    toggleTask(taskId);
  }
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);

renderTasks();
