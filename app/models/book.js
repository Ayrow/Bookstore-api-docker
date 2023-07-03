const client = require('../db');
const InvalidArgumentError = require('../error');

const bookAttributesArray = [
  'id',
  'author',
  'price',
  'description',
  'year_published',
  'added_dttm',
];
const insertBookAttributes = bookAttributesArray.slice(0, -1).join(', ');
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

function validate(expression, errorMessage) {
  if (expression) throw new InvalidArgumentError(errorMessage);
}

function makeValidation(attribute, value) {
  switch (attribute) {
    case 'author':
      validate(
        typeof value !== 'string' || value.length === 0,
        'Author must be a string and longer than 0.'
      );
      break;

    case 'price':
      validate(
        typeof value !== 'number' || value < 0,
        'Price must be a number and larger or equal to 0.'
      );
      break;

    case 'description':
      validate(
        typeof value !== 'string' || value !== undefined,
        'Description must be a string if exists'
      );
      break;
    case 'year_published':
      validate(
        typeof value !== 'number' || value < 0,
        'Year must be a number and larger than 0.'
      );
      break;
    default:
      console.log('Unknown attribute value');
  }
}

async function addBook({ id, author, price, description, year_published }) {
  if (typeof id !== 'string' || id.length === 0)
    throw new InvalidArgumentError('Id must be a string and longer than 0.');
  makeValidation('author', author);
  makeValidation('price', price);
  makeValidation('description', description);
  makeValidation('year_publisheed', year_published);

  let resp;

  try {
    resp = await client.query(
      `
     insert into book (${insertBookAttributes})
     values ($1, $2, $3, $4, $5)
    `,
      [id, author, price, description, year_published]
    );
  } catch (e) {
    console.log(e);
    return undefined;
  }

  return resp;
}
