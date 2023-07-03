const express = require('express');

const bookRouter = require('./routes/book');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/book', bookRouter);

app.listen(3000);

module.exports = app;
