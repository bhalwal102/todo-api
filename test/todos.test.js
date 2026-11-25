const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    server.close();
    await once(server, 'close');
  }
});

test('creates, lists, reads, updates, filters, and deletes a todo', async () => {
  const createResponse = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Buy milk' }),
  });

  assert.equal(createResponse.status, 201);
  const todo = await createResponse.json();
  assert.ok(todo.id);
  assert.equal(todo.title, 'Buy milk');
  assert.equal(todo.state, 'todo');

  const todoUrl = `${baseUrl}/todos/${todo.id}`;

  const listResponse = await fetch(`${baseUrl}/todos`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [todo]);

  const getResponse = await fetch(todoUrl);
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), todo);

  const updateResponse = await fetch(todoUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'doing' }),
  });

  assert.equal(updateResponse.status, 200);
  const updatedTodo = await updateResponse.json();
  assert.equal(updatedTodo.id, todo.id);
  assert.equal(updatedTodo.state, 'doing');

  const filterResponse = await fetch(`${baseUrl}/todos?state=doing`);
  assert.equal(filterResponse.status, 200);
  assert.deepEqual(await filterResponse.json(), [updatedTodo]);

  const deleteResponse = await fetch(todoUrl, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 204);
  assert.equal(await deleteResponse.text(), '');

  const deletedResponse = await fetch(todoUrl);
  assert.equal(deletedResponse.status, 404);
  assert.deepEqual(await deletedResponse.json(), {
    error: 'Todo not found.',
  });
});
test('POST /todos rejects an empty title and returns 400', async () => {
  const response = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Title must be a non-empty string.');
});

test('GET /todos/:id returns 404 for a missing todo', async () => {
  const response = await fetch(`${baseUrl}/todos/missing-id`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Todo not found.');
});