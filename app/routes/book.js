const InvalidArgumentError = require('../error');
const { getBooks, getBook } = require('../models/book');

const router = require('express').Router();

router.get('/', async (req, res) => {
  const { limit, offset, sortBy } = req.query;
  const desc = req.query.desc !== undefined ? true : false;

  let books;
  try {
    books = await getBooks({ limit, offset, sortBy, desc });
  } catch (e) {
    console.log(e);
    if (e instanceof InvalidArgumentError)
      return res.status(400).json({ message: e.message });
    return res.sendStatus(500);
  }

  if (books === undefined) return res.sendStatus(500);

  res.json(books);
});

router.get('/:bookId', async (req, res) => {
  const bookId = req.params.bookId;

  let book;
  try {
    book = await getBook({ bookId });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }

  if (book === undefined) return res.sendStatus(500);
  if (book === null) return res.sendStatus(400);

  res.json(book);
});

router.post('/', (req, res) => {});

router.patch('/', (req, res) => {});

router.delete('/', (req, res) => {});

module.exports = router;
