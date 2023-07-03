const client = require('../db');

const bookAttributesArray = [
  'id',
  'author',
  'price',
  'description',
  'year_published',
  'added_dttm',
];
const selectBookAttributes = bookAttributesArray.join(', ');

async function getBooks() {
  const query = `
    select ${selectBookAttributes}
    from book
  `;

  let results;

  try {
    results = await client.query(query);
  } catch (e) {
    console.log(e);
    return undefined;
  }

  return results.rows;
}

async function getBook({ bookId }) {
  if (typeof bookId !== 'string') return undefined;

  const query = `
    select ${selectBookAttributes}
    from book
    where id = $1
  `;

  let results;

  try {
    results = await client.query(query, [bookId]);
  } catch (e) {
    console.log(e);
    return undefined;
  }

  if (results.rowCount === 0) return null;

  return results.rows[0];
}
