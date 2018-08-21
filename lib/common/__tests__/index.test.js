'use strict';

var _index = require('../index');

describe('tx generator function', function () {
  it('is a function', function () {
    var result = (0, _index.txGenerator)('0x', 1, '0x0', '0xff', '0xff', '0x');
    expect(result).toEqual({
      data: '0x',
      gas: '0xff',
      gasPrice: '0xff',
      nonce: '0x0',
      value: 1,
      to: '0x'
    });
  });
});

describe('createAccount function', function () {
  it('return and object include address and privateKey', function () {
    var account = (0, _index.createAccount)();
    expect(account).toMatchObject({
      address: expect.any(String),
      privateKey: expect.any(String)
    });
  });
});