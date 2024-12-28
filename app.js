//const http = require('http')
const express = require("express");
const helmet = require("helmet")
const slowDown = require("express-slow-down")
const config = require("./utils/config");
require("express-async-errors");
const app = express();
const cors = require("cors");
const path = require("path");

const cocktailRouter = require('./controllers/cocktail')
const userRouter = require('./controllers/user')
const ratingRouter = require('./controllers/rating')

const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

logger.info("connecting to", config.MONGODB_URI);


mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://pleasing-osprey-23.clerk.accounts.dev"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://pleasing-osprey-23.clerk.accounts.dev"],
      workerSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "data:", "https://img.clerk.com", "https://www.thecocktaildb.com"],
    },
  })
);
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.requestLogger);

app.use(express.static(path.join(__dirname, "dist")));

const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 60,
  delayMs: (hits) => hits * 500,
})

app.use('/api/cocktail', speedLimiter, cocktailRouter)
app.use('/api/user', userRouter)
app.use('/api/rating', ratingRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;