'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(method, params) {
        var answer, resp;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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