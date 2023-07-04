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

  describe('Testing getBook', () => {
    const testingBook = {
      id: 'TestingBook1',
      author: 'Testing author',
      price: 12,
      description: 'Testing description',
      year_published: 2000,
    };

    before(async () => {
      await cleanup(testingBook.id);
      await cleanup('testingBookThatDoesNotExist');
    });

    after(async () => {
      await cleanup(testingBook.id);
    });

    describe('Testing getting correct book', () => {
      it('Returned book is equal to testing book', async () => {
        await addBook(testingBook);
        const book = await getBook({ bookId: testingBook.id });
        delete book.added_dttm;
        expect(book).to.deep.equal(testingBook);
      });
    });

    describe('Testing getting book that does not exist', () => {
      it('Null is returned', async () => {
        const book = await getBook({ bookId: 'testingBookThatDoesNotExist' });
        expect(book).to.equal(null);
      });
    });
  });

  describe('Testing updateBook', () => {
    const testingBook = {
      id: 'TestingBook1',
      author: 'Testing author',
      price: 12,
      description: 'Testing description',
      year_published: 2000,
    };

    before(async () => {
      await cleanup(testingBook.id);
      await addBook(testingBook);
    });

    after(async () => {
      await cleanup(testingBook.id);
    });

    describe('Testing updating book correctly', () => {
      const newPrice = 199;
      it('Correct response', async () => {
        const resp = await updateBook({
          id: testingBook.id,
          newAttributes: {
            price: newPrice,
          },
        });
        expect(resp.rowCount).to.equal(1);
      });

      it('Book in the db has an updated price', async () => {
        const book = await getBook({ bookId: testingBook.id });
        expect(book.price).to.equal(newPrice);
      });
    });

    describe('Testing updating with empty attributes', () => {
      it('Correct error', async () => {
        let err = 0;
        try {
          await updateBook({
            id: testingBook.id,
            newAttributes: {},
          });
        } catch (e) {
          err = 1;
          expect(e instanceof InvalidArgumentError);
        }
        expect(err).to.equal(1);
      });
    });

    describe('Update with a parameter that does not exist', () => {
      before(async () => {
        await cleanup(testingBook.id);
        await addBook(testingBook);
      });

      it('Correct error', async () => {
        let err = 0;
        try {
          await updateBook({
            id: testingBook.id,
            newAttributes: {
              weirdAttribute: 1234,
            },
          });
        } catch (e) {
          err = 1;
          expect(e instanceof InvalidArgumentError);
        }
        expect(err).to.equal(1);
      });

      it('Book remains unchanged', async () => {
        const book = await getBook({ bookId: testingBook.id });
        delete book.added_dttm;
        expect(book).to.deep.equal(testingBook);
      });
    });

    describe('Update with multiple parameters and some that do not exist', () => {
      const newPrice = 299;
      const newAuthor = 'New Author';
      const newDescription = 'New description';

      before(async () => {
        await cleanup(testingBook.id);
        await addBook(testingBook);
      });

      after(async () => {
        await cleanup(testingBook.id);
      });

      it('Correct response', async () => {
        const resp = await updateBook({
          id: testingBook.id,
          newAttributes: {
            price: newPrice,
            author: newAuthor,
            description: newDescription,
            weirdAttribute: 1234,
          },
        });
        expect(resp.rowCount).to.equal(1);
      });

      it('Book attributes were properly updated', async () => {
        const book = await getBook({ bookId: testingBook.id });
        expect(book.price).to.equal(newPrice);
        expect(book.author).to.equal(newAuthor);
        expect(book.description).to.equal(newDescription);
        expect(book.year_published).to.equal(testingBook.year_published);
      });
    });
  });
});
