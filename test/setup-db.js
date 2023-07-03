const fs = require('fs');

const client = require('../app/db');

before(async () => {
  const book = fs.readFileSync('../ddl/book.sql').toString();
  const bookTestData = fs.readFileSync('../ddl/bookTestData.sql').toString();

  const stringSQL = book + bookTestData;
  const arraySQL = stringSQL.split(';');
  arraySQL.forEach(async (sql) => {
    await client.query(sql);
  });
});
