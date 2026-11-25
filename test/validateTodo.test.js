const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateTodo } = require('../validateTodo');

test('Valid title is accepted', () => {
  const result = validateTodo({ title: 'Buy milk' }, true);

  assert.equal(result, null);
});

test('Empty title is rejected', () => {
  const result = validateTodo({ title: '' }, true);

  assert.equal(result, 'Title must be a non-empty string.');
});