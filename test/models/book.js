const { expect } = require('chai');
const client = require('../../app/db');

const {
  getBook,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
} = require('../../app/models/book');

describe('Testing models book', () => {
  async function cleanup(id) {
    await client.query(
      `
     delete from book
     where id = $1
    `,
      [id]
    );
  }

  describe('Testing addBook', () => {
    describe('Adding correct book', () => {
      const testingBook = {
        id: 'TestingBook1',
        author: 'Testing author',
        price: 12,
        description: 'Testing description',
        year_published: 2000,
      };

      before(async () => {
        await cleanup(testingBook.id);
      });

      after(async () => {
        await cleanup(testingBook.id);
      });

      it('Selected book is equal to testingBook', async () => {
        await addBook(testingBook);

        const resp = await client.query(
          `
         select id, author, price, description, year_published
         from book
         where id = $1
        `,
          [testingBook.id]
        );

        expect(resp.rows.length).to.equal(1);
        const book = resp.rows[0];
        expect(book).to.deep.equal(testingBook);
      });
    });
  });
});
