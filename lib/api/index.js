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
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var payload, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            payload = {
              method: methodName,
              params: params
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

  return function defaultMethod(_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var getBlockNumber = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(provider, blockNumber) {
    var fullTxs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var blockNumberHash, payload, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            blockNumberHash = (0, _fp.isNumber)(blockNumber) ? (0, _common.numberToHex)(blockNumber) : blockNumber;
            payload = {
              method: 'kai_getBlockByNumber',
              params: [blockNumberHash, fullTxs]
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

  return function getBlockNumber(_x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

var getBlockByHash = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(provider, blockHash) {
    var fullTxs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var payload, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            payload = {
              method: 'kai_getBlockByHash',
              params: [blockHash, fullTxs]
            };
            _context3.next = 3;
            return provider.request(payload);

          case 3:
            result = _context3.sent;
            return _context3.abrupt('return', parseResult(result, always));

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getBlockByHash(_x9, _x10) {
    return _ref3.apply(this, arguments);
  };
}();

var parseResult = function parseResult(result, customFormat) {
  if ((0, _fp.get)('data.result', result)) {
    return (0, _fp.flow)((0, _fp.get)('data.result'), customFormat)(result);
  } else {
    throw new Error(JSON.stringify(result.data));
  }
};

var sendSignedTx = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(provider, rawTx) {
    var waitUntilMine = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30000;
    var txHash, breakTimeout, receipt;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            txHash = defaultMethod(provider, 'kai_sendRawTransaction', always, [rawTx]);

            if (!(waitUntilMine === false)) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt('return', txHash);

          case 3:
            breakTimeout = Date.now() + timeout;

          case 4:
            if (!(Date.now < breakTimeout)) {
              _context4.next = 16;
              break;
            }

            _context4.next = 7;
            return defaultMethod(provider, 'kai_getTransactionReceipt', always, [rawTx]);

          case 7:
            receipt = _context4.sent;

            if (!receipt) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt('return', receipt);

          case 12:
            _context4.next = 14;
            return sleep(1000);

          case 14:
            _context4.next = 4;
            break;

          case 16:
            throw new Error('Timeout: cannot get receipt after ' + timeout + 'ms');

          case 17:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function sendSignedTx(_x13, _x14) {
    return _ref4.apply(this, arguments);
  };
}();

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
      return defaultMethod(provider, 'kai_votingPower', _common.hexToNumber);
    },
    blockNumber: function blockNumber() {
      return defaultMethod(provider, 'kai_blockNumber', _common.hexToNumber);
    },
    blockByNumber: function blockByNumber(blockNum) {
      var fullTxs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return getBlockNumber(provider, blockNumfullBlock, fullTxs);
    },
    blockByHash: function blockByHash() {
      return function (blockHash) {
        var fullTxs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return getBlockByHash(provider, blockHash, fullTxs);
      };
    },
    transactionCount: function transactionCount(address) {
      var blockParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'latest';
      return defaultMethod(provider, 'kai_getTransactionCount', _common.hexToNumber, [address, blockParam]);
    },
    sendSignedTransaction: function sendSignedTransaction(rawTx) {
      var waitUntilMine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var timeout = arguments[2];
      return sendSignedTx(provider, rawTx, waitUntilMine = false, timeout);
    },
    transactionReceipt: function transactionReceipt(txHash) {
      return defaultMethod(provider, 'kai_getTransactionReceipt', always, [txHash]);
    },
    balance: function balance(address) {
      var blockParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'latest';
      return defaultMethod(provider, 'kai_getBalance', _common.hexToNumber, [address, blockParam]);
    }
  };
};