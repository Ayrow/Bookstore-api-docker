const { expect } = require('chai');

const app = require('../app/app.js');

describe('testing app creation', () => {
  it('App is correctly exported', () => {
    expect(typeof app).to.equal('function');
  });
});
