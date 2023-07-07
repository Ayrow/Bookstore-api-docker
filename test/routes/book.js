const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app/app');
const client = require('../../app/db');
const { getBook } = require('../../app/models/book');

chai.use(chaiHttp);

describe('Testing http endpoint', () => {
  const testingBook1 = {
    author: 'Testing author 1',
    price: 122,
    description: 'Testing description',
    year_published: 2000,
  };
  const testingBook2 = {
    author: 'Testing author 2',
    price: 142,
    year_published: 2000,
  };
  const testingBook3 = {
    author: 'Testing author 3',
    price: 112,
    description: 'Testing description',
    year_published: 2000,
  };

  async function cleanup() {
    await client.query(
      `
    delete from book
    where author in ($1, $2, $3)
    `,
      [testingBook1.author, testingBook2.author, testingBook3.author]
    );
  }

  function addBook({ testingBook, endCallback }) {
    chai.request(app).post('/book').send(testingBook).end(endCallback);
  }

  describe('Testing POST book', () => {
    before(async () => {
      await cleanup();
    });

    describe('Testing adding correct book', () => {
      it('Correct response status', (done) => {
        addBook({
          testingBook: testingBook1,
          endCallback: (_err, resp) => {
            expect(resp).to.have.status(201);
            expect(resp.body).to.have.property('id');
            testingBook1.id = resp.body.id;
            done();
          },
        });
      });

      it('Created book is equal to the testing book', async () => {
        const book = await getBook({ bookId: testingBook1.id });
        delete book.added_dttm;
        expect(testingBook1).to.deep.equal(book);
      });
    });

    describe('Testing adding book without price', () => {
      let countBefore;
      before(async () => {
        const resp = await client.query(`
        select count(*) as count
        from book
        `);
        countBefore = resp.rows[0].rows;
      });

      it('Correct response status', (done) => {
        addBook({
          testingBook: testingBook2,
          endCallback: (_err, resp) => {
            expect(resp).to.have.status(400);

            done();
          },
        });
      });

      it('Count after is equal to count befofe so no new book create', async () => {
        const resp = await client.query(`
        select count(*) as count
        from book
        `);
        expect(resp.rows[0].rows).to.equal(countBefore);
      });
    });
  });
});
