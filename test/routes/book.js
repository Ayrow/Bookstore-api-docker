const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app/app');
const client = require('../../app/db');

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

  describe('Testing POST book', () => {
    before(async () => {
      await cleanup();
    });

    describe('Testing adding correct book', () => {
      it('Correct response status', (done) => {
        chai
          .request(app)
          .post('/book')
          .send(testingBook1)
          .end((_err, resp) => {
            expect(resp).to.have.status(201);
            expect(resp.body).to.have.property('id');
            testingBook1.id = resp.body.id;
            done();
          });
      });
    });
  });
});
