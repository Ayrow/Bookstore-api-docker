const { expect } = require('chai');
const { Client } = require('pg');

const client = require('../app/db');

describe('Testing client', () => {
  it('Exported client is instance of pg Client', () => {
    expect(client instanceof Client).to.true;
  });
});
