'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var njsp = require('nano-json-stream-parser');
var request = require('xhr-request-promise');

exports.default = function (url) {
  var api = {};
  var onResponse = {};
  var callbacks = {};
  var nextId = 0;
  var send = void 0;

  var parseResponse = njsp(function (json) {
    onResponse[json.id] && onResponse[json.id](null, json.result);
  });

  var genPayload = function genPayload(method, params) {
    return {
      jsonrpc: '2.0',
      id: ++nextId,
      method: method,
      params: params
    };
  };

  if (/^http/.test(url)) {
    api.send = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(method, params) {
        var answer, resp;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return request(url, {
                  method: 'POST',
                  contentType: 'application/json-rpc',
                  body: JSON.stringify(genPayload(method, params))
                });

              case 3:
                answer = _context.sent;
                resp = JSON.parse(answer);

                if (!resp.error) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt('return', resp.error.message);

              case 9:
                throw resp.result;

              case 10:
                _context.next = 15;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context['catch'](0);

                console.log(_context.t0);

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined, [[0, 12]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();
  }

  return api;
};