const states = ['todo', 'doing', 'done'];
const editableFields = ['title', 'description', 'state', 'dueDate'];
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

module.exports = { validateTodo, states };