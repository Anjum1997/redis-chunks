const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 8 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.',
});

module.exports = limiter;
