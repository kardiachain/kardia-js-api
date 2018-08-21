'use strict';

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('kardiaTool', function () {
  it('is an object with common', function () {
    expect(_index2.default.common).toEqual(expect.objectContaining({
      createAccount: expect.any(Function),
      hexToNumber: expect.any(Function),
      hexToNumberString: expect.any(Function),
      hexToUtf8: expect.any(Function),
      isAddress: expect.any(Function),
      isBN: expect.any(Function),
      numberToHex: expect.any(Function),
      recoverTx: expect.any(Function),
      sign: expect.any(Function),
      toBN: expect.any(Function),
      txGenerator: expect.any(Function),
      utf8ToHex: expect.any(Function)
    }));
  });
});