'use strict';

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('provider', function () {
  describe('support http provider', function () {
    it('returns http provider when using http/https', function () {
      var httpProvider = (0, _index2.default)('http://localhost:300');
      expect(httpProvider).toBeTruthy();
      var httpsProvider = (0, _index2.default)('https://localhost:301');
      expect(httpsProvider).toBeTruthy();
    });
    it('throw error when input invalid provider', function () {
      expect(function () {
        (0, _index2.default)('ws://localhost:300');
      }).toThrow();
    });
  });
});