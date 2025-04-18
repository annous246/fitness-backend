function checker(a) {
  if (!a || !a.length) return false;
  for (const el of a) {
    if (!el) return false;
  }
  return true;
}

function authenticate(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.json({ status: 400, ok: 0, message: "Session Expired" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ status: 400, ok: 0, message: "Session Expired" });
    }
    req.user = user;
    next();
  });
}
module.exports = { checker, authenticate };
