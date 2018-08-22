'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fp = require('lodash/fp');

var _common = require('../common');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var always = function always(value) {
  return value;
};
var defaultMethod = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(provider, methodName) {
    var customFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : always;
    var payload, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            payload = {
              method: methodName
            };
            _context.next = 3;
            return provider.request(payload);

          case 3:
            result = _context.sent;
            return _context.abrupt('return', parseResult(result, customFormat));

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function defaultMethod(_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var getBlockNumber = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(blockNumber) {
    var fullBlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var blockNumberHash, payload, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            blockNumberHash = (0, _fp.isNumber)(blockNumber) ? (0, _common.numberToHex)(blockNumber) : blockNumber;
            payload = {
              method: 'eth_getBlockByNumber',
              params: [blockNumberHash, fullBlock]
            };
            _context2.next = 4;
            return provider.request(payload);

          case 4:
            result = _context2.sent;
            return _context2.abrupt('return', parseResult(result, always));

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getBlockNumber(_x5) {
    return _ref2.apply(this, arguments);
  };
}();

var parseResult = function parseResult(result, customFormat) {
  console.log(customFormat((0, _fp.get)('data.result', result)));
  if ((0, _fp.get)('data.result', result)) {
    return (0, _fp.flow)((0, _fp.get)('data.result'), customFormat)(result);
  } else {
    throw new Error(result);
  }
};

exports.default = function (provider) {
  return {
    clientVerion: function clientVerion() {
      return defaultMethod(provider, 'web3_clientVersion');
    },
    coinBase: function coinBase() {
      return defaultMethod(provider, 'kai_coinbase');
    },
    isProposer: function isProposer() {
      return defaultMethod(provider, 'kai_proposer');
    },
    perCount: function perCount() {
      return defaultMethod(provider, 'net_peerCount', _common.hexToNumber);
    },
    votingPower: function votingPower() {
      return defaultMethod(provider, 'kai_voting_power', _common.hexToNumber);
    },
    blockNumber: function blockNumber() {
      return defaultMethod(provider, 'kai_blockNumber', _common.hexToNumber);
    },
    blockByNumber: function blockByNumber(blockNum) {
      var fullBlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return getBlockNumber(blockNumfullBlock);
    }
  };
};