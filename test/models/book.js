const { expect } = require('chai');
const client = require('../../app/db');

const {
  getBook,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
} = require('../../app/models/book');
const InvalidArgumentError = require('../../app/error');

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

    describe('Adding book with no id', () => {
      const testingBook = {
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

      it('Correct error message', async () => {
        let err = 0;
        try {
          await addBook(testingBook);
        } catch (e) {
          err = 1;
          expect((e.message = 'Id must be a string and longer than 0.'));
        }
        expect(err).to.equal(1);
      });

      function makeNegativeAddBookTestCase({
        testingBook,
        testCaseTitle,
        itTitle,
      }) {
        describe(testCaseTitle, () => {
          before(async () => {
            await cleanup(testingBook.id);
          });

          after(async () => {
            await cleanup(testingBook.id);
          });

          it(itTitle, async () => {
            let err = 0;
            try {
              await addBook(testingBook);
            } catch (e) {
              err = 1;
              expect(e instanceof InvalidArgumentError);
            }
            expect(err).to.equal(1);
          });
        });
      }
    });

    makeNegativeAddBookTestCase({
      testingBook: {
        id: 'TestingBook1',
        price: 12,
        description: 'Testing description',
        year_published: 2000,
      },
      testCaseTitle: 'Adding book with no author',
      itTitle: 'Correct error type',
    });

    makeNegativeAddBookTestCase({
      testingBook: {
        id: 'TestingBook1',
        author: 'Testing author',
        price: -12,
        description: 'Testing description',
        year_published: 2000,
      },
      testCaseTitle: 'Adding book with negative price',
      itTitle: 'Correct error type',
    });

    makeNegativeAddBookTestCase({
      testingBook: {
        id: 'TestingBook1',
        author: 'Testing author',
        price: 12,
        description: 'Testing description',
      },
      testCaseTitle: 'Adding book without year_published',
      itTitle: 'Correct error type',
    });

    makeNegativeAddBookTestCase({
      testingBook: {
        id: 'TestingBook1',
        author: undefined,
        price: 12,
        description: 'Testing description',
        year_published: 2000,
      },
      testCaseTitle: 'Adding book with undefined author',
      itTitle: 'Correct error type',
    });
  });
});
