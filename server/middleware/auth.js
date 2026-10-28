const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const [scheme, token] = (req.get("Authorization") || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid or has expired." });
  }
};

module.exports = authenticate;
