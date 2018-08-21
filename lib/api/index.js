'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fp = require('lodash/fp');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getClientVerion = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(provider) {
    var payload, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            payload = {
              method: 'web3_clientVersion'
            };
            _context.next = 3;
            return provider.request(payload);

          case 3:
            result = _context.sent;
            return _context.abrupt('return', parseResult(result));

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getClientVerion(_x) {
    return _ref.apply(this, arguments);
  };
}();

var parseResult = function parseResult(result) {
  if ((0, _fp.get)('result', result)) {
    return (0, _fp.get)('result', result);
  } else {
    throw new Error(result);
  }
};

exports.default = function (provider) {
  return {
    clientVerion: getClientVerion(provider)
  };
};