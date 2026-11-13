const express = require('express');
const { randomUUID } = require('node:crypto');

const app = express();
const todos = [];
const states = ['todo', 'doing', 'done'];
const editableFields = ['title', 'description', 'state', 'dueDate'];

app.use(express.json());

function validateTodo(body, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Send a JSON object.';
  }

  const fields = Object.keys(body);
  if (fields.length === 0 || fields.some(field => !editableFields.includes(field))) {
    return 'Send at least one supported todo field.';
  }

  if (creating || Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return 'Title must be a non-empty string.';
    }
  }

  if (Object.hasOwn(body, 'state') && !states.includes(body.state)) {
    return 'State must be todo, doing, or done.';
  }

  if (Object.hasOwn(body, 'description') && typeof body.description !== 'string') {
    return 'Description must be a string.';
  }

  if (Object.hasOwn(body, 'dueDate')) {
    const date = body.dueDate;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return 'Due date must use YYYY-MM-DD format.';
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      return 'Due date must be a valid calendar date.';
    }
  }

  return null;
}

// Create a todo.
app.post('/todos', (req, res) => {
  const error = validateTodo(req.body, true);
  if (error) return res.status(400).json({ error });

  const now = new Date().toISOString();
  const todo = {
    state: 'todo',
    ...req.body,
    id: randomUUID(),
    title: req.body.title.trim(),
    createdAt: now,
    updatedAt: now,
  };

  todos.push(todo);
  return res.location(`/todos/${todo.id}`).status(201).json(todo);
});

// List all todos or filter them by state.
app.get('/todos', (req, res) => {
  const { state } = req.query;
  if (state === undefined) return res.json(todos);

  if (!states.includes(state)) {
    return res.status(400).json({ error: 'State must be todo, doing, or done.' });
  }

  return res.json(todos.filter(todo => todo.state === state));
});

// Find one todo by its ID.
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(item => item.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found.' });

  return res.json(todo);
});

// Update the fields supplied in the request body.
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(item => item.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found.' });

  const error = validateTodo(req.body, false);
  if (error) return res.status(400).json({ error });

  Object.assign(todo, req.body);
  todo.title = todo.title.trim();
  todo.updatedAt = new Date().toISOString();

  return res.json(todo);
});

// Delete one todo.
app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Todo not found.' });

  todos.splice(index, 1);
  return res.status(204).end();
});

// Return a JSON error when the request body contains invalid JSON.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  return next(error);
});

app.listen(3000, () => {
  console.log('Todo API running at http://localhost:3000');
});