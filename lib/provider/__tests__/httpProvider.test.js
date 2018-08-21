'use strict';

var _httpProvider = require('../httpProvider');

var _httpProvider2 = _interopRequireDefault(_httpProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('httpProvider', function () {
  it('returns an closure object', function () {
    var result = (0, _httpProvider2.default)('http://localhost');
    expect(result).toEqual(expect.objectContaining({
      version: '0.0.1',
      updateBaseLink: expect.any(Function),
      request: expect.any(Function)
    }));
  });
});