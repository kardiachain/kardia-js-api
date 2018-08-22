'use strict';

var _httpProvider = require('../../provider/httpProvider');

var _httpProvider2 = _interopRequireDefault(_httpProvider);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe('api test', function () {
  it('work success', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var api, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            api = (0, _index2.default)((0, _httpProvider2.default)('http://35.198.245.107:8545/'));
            _context.prev = 1;
            _context.next = 4;
            return api.coinBase();

          case 4:
            result = _context.sent;
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context['catch'](1);

            console.log('err', _context.t0.message);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[1, 7]]);
  })));
});