// Builds an `IN (...)` clause from a fixed list of known constants.
// Never pass user input here; use bound parameters for that.
function inList(column, values) {
  return `${column} IN (${values.map((value) => `'${value}'`).join(', ')})`;
}

function placeholders(count) {
  return Array.from({ length: count }, () => '?').join(', ');
}

module.exports = { inList, placeholders };
