const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS'){
        return next()
    }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      const error = new HttpError("Authentication failed", 401);
      throw error;
    }
    const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY)
    req.userData = {userId: decodedToken.userId, email: decodedToken.email}
    next()
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }

};
