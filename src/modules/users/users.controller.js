function getMe(req, res) {
  res.json({ data: req.user });
}

module.exports = { getMe };
