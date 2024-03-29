const { expect } = require('chai');
const InvalidArgumentError = require('../app/error');

describe('Testing custom error', () => {
  const customMessage = 'Custom message';
  const newError = new InvalidArgumentError(customMessage);

  it('custom error is instance of Error', () => {
    expect(newError instanceof Error).to.true;
  });

  it('name is set correctly', () => {
    expect(newError.name).to.equal('InvalidArgumentError');
  });

  it('Message is set correctly', () => {
    expect(newError.message).to.equal(customMessage);
  });
});
