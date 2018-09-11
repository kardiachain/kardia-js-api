'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_axios2.default.defaults.headers.post['Content-Type'] = 'application/json';

var isMock = false;

var sleep = function sleep(ms) {
  return new _promise2.default(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var version = '0.0.1';

var getConfigPayload = function getConfigPayload(payload, id) {
  return (0, _extends3.default)({
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
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(payload, requestId) {
      var config;
      return _regenerator2.default.wrap(function _callee$(_context) {
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
              return _axios2.default.post(urlLink, (0, _extends3.default)({}, config));

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
    updateBaseLink: updateBaseLink,
    type: 'httpProvider',
    baseLink: baseLink
  };
};