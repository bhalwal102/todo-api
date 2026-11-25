const columns = ['id', 'title', 'description', 'state', 'createdAt', 'updatedAt'];

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(todos) {
  const rows = todos.map(todo => {
    return columns.map(column => csvCell(todo[column])).join(',');
  });

  return [columns.join(','), ...rows].join('\r\n');
}

module.exports = { toCsv };