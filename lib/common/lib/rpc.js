'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('xhr-request-promise');

var genPayload = function () {
  var nextId = 0;
  return function (method, params) {
    return {
      jsonrpc: '2.0',
      id: ++nextId,
      method: method,
      params: params
    };
  };
}();

exports.default = function (url) {
  return function (method, params) {
    return request(url, {
      method: 'POST',
      contentType: 'application/json-rpc',
      body: (0, _stringify2.default)(genPayload(method, params))
    }).then(function (answer) {
      var resp = JSON.parse(answer); // todo: use njsp?
      if (resp.error) {
        throw new Error(resp.error.message);
      } else {
        return resp.result;
      }
    }).catch(function (e) {
      return { error: e.toString() };
    });
  };
};