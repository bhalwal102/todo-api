const express = require('express');
const { randomUUID } = require('node:crypto');
const { validateTodo, states } = require('./validateTodo');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');
const { toCsv } = require('./toCsv');

const app = express();
const todos = [];

app.use(express.json());

app.get('/doc/openapi.json', (req, res) => {
  res.json(openapi);
});

app.use('/doc', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: { url: '/doc/openapi.json' },
}));

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

// List todos as JSON or CSV, optionally filtered by state.
app.get('/todos', (req, res) => {
  const { state } = req.query;

  if (state !== undefined && !states.includes(state)) {
    return res.status(400).json({ error: 'State must be todo, doing, or done.' });
  }

  const matchingTodos =
    state === undefined ? todos : todos.filter(todo => todo.state === state);

  res.vary('Accept');
  const format = req.accepts(['application/json', 'text/csv']);

  if (!format) {
    return res.status(406).json({ error: 'Request application/json or text/csv.' });
  }

  if (format === 'text/csv') {
    return res.type('text/csv').send(toCsv(matchingTodos));
  }

  return res.json(matchingTodos);
});

// Find one todo by ID.
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

// Return a JSON error for invalid JSON.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  return next(error);
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Todo API running at http://localhost:3000');
  });
}

module.exports = app;