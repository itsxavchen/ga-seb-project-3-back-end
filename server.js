// ---------- Starter Code ----------

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

// ---------- Imported Routes ----------

// const authRouter = require('./controllers/auth');
const testJwtRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const postsRouter = require("./controllers/post.js");

// ---------- Connect to Mongodb ----------

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// ---------- Middleware ----------

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// ---------- Routes ----------

// app.use('/auth', authRouter);
app.use('/test-jwt', testJwtRouter);
app.use('/users', usersRouter);
app.use("/xkii", postsRouter);

// ---------- Server ----------

app.listen(process.env.PORT, () => {
  console.log('The express app is ready!');
});
