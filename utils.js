function checker(a) {
  if (!a || !a.length) return false;
  for (const el of a) {
    if (!el) return false;
  }
  return true;
}

module.exports = { checker };
