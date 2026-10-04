const STORAGE_KEY = 'modernTodoApp.tasks';
const THEME_KEY = 'modernTodoApp.theme';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const clearCompletedButton = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');
const taskCount = document.getElementById('task-count');
const doneCount = document.getElementById('done-count');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let activeFilter = 'all';

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

function getVisibleTasks() {
  if (activeFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateSummary() {
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.filter((task) => task.completed).length;

  taskCount.textContent = `${remaining} task${remaining === 1 ? '' : 's'}`;
  doneCount.textContent = String(completed);
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks match this filter yet.</li>';
    updateSummary();
    return;
  }

  todoList.innerHTML = visibleTasks
    .map(
      (task) => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-main">
            <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" />
            <span class="task-text">${escapeHtml(task.text)}</span>
          </div>
          <button type="button" class="delete-btn" aria-label="Delete task">Delete</button>
        </li>
      `
    )
    .join('');

  updateSummary();
}

function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    todoInput.focus();
    return;
  }

  tasks.unshift({
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

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  const taskItem = event.target.closest('.task-item');

  if (checkbox && taskItem) {
    const taskId = Number(taskItem.dataset.id);
    toggleTask(taskId);
  }
});

todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');
  const taskItem = event.target.closest('.task-item');

  if (deleteButton && taskItem) {
    const taskId = Number(taskItem.dataset.id);
    deleteTask(taskId);
  }
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });

    renderTasks();
  });
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(nextTheme);
});

const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);
renderTasks();
