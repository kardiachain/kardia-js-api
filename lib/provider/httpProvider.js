'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_axios2.default.defaults.headers.post['Content-Type'] = 'application/json';

var isMock = true;

var sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var version = '0.0.1';

var getConfigPayload = function getConfigPayload(payload, id) {
  return _extends({
    jsonrpc: '2.0',
    id: id
  }, payload);
};

var getMockData = function getMockData(apiName) {
  return {
    data: 'mock'
  };
};

exports.default = function (urlLink) {
  var id = 1;
  var baseLink = urlLink;
  var updateBaseLink = function updateBaseLink(urlLink) {
    baseLink = urlLink;
  };
  var request = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(payload, requestId) {
      var config;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = getConfigPayload(payload, requestId || id);

              if (!isMock) {
                _context.next = 5;
                break;
              }

              _context.next = 4;
              return sleep(1000);

            case 4:
              return _context.abrupt('return', getMockData(apiName));

            case 5:
              id++;
              _context.next = 8;
              return _axios2.default.post(urlLink, _extends({}, config));

            case 8:
              return _context.abrupt('return', _context.sent);

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function request(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  return {
    version: version,
    request: request,
    updateBaseLink: updateBaseLink
  };
};