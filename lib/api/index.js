"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fp = require("lodash/fp");

var _common = require("../common");

var _api = require("../common/lib/api");

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var always = function always(value) {
  return value;
};
var defaultMethod = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(provider, methodName) {
    var customFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : always;
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var payload, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
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
            return _context.abrupt("return", parseResult(result, customFormat));

          case 5:
          case "end":
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
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(provider, blockNumber) {
    var payload, result;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            payload = {
              method: "kai_getBlockByNumber",
              params: [blockNumber]
            };
            _context2.next = 3;
            return provider.request(payload);

          case 3:
            result = _context2.sent;
            return _context2.abrupt("return", parseResult(result, always));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getBlockNumber(_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var getDualBlockNumber = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(provider, blockNumber) {
    var payload, result;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            payload = {
              method: "dual_getBlockByNumber",
              params: [blockNumber]
            };
            _context3.next = 3;
            return provider.request(payload);

          case 3:
            result = _context3.sent;
            return _context3.abrupt("return", parseResult(result, always));

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getDualBlockNumber(_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();

var getBlockByHash = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(provider, blockHash) {
    var payload, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            payload = {
              method: "kai_getBlockByHash",
              params: [blockHash]
            };
            _context4.next = 3;
            return provider.request(payload);

          case 3:
            result = _context4.sent;
            return _context4.abrupt("return", parseResult(result, always));

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getBlockByHash(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

var parseResult = function parseResult(result, customFormat) {
  if (!(0, _fp.isUndefined)((0, _fp.get)("data.result", result))) {
    return (0, _fp.flow)((0, _fp.get)("data.result"), customFormat)(result);
  } else {
    if ((0, _fp.isEmpty)(result.data)) {
      throw new Error("Empty Response");
    }
    throw new Error(JSON.stringify(result.data));
  }
};
var sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
var sendSignedTx = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(provider, rawTx) {
    var waitUntilMine = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 60000;
    var txHash, submittedHash, breakTimeout, receipt;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return defaultMethod(provider, "tx_sendRawTransaction", always, [rawTx]);

          case 2:
            txHash = _context5.sent;

            if (!(waitUntilMine === false)) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", txHash);

          case 5:
            submittedHash = txHash;
            breakTimeout = Date.now() + timeout;

          case 7:
            if (!(Date.now() < breakTimeout)) {
              _context5.next = 26;
              break;
            }

            _context5.prev = 8;
            _context5.next = 11;
            return defaultMethod(provider, "tx_getTransactionReceipt", always, [submittedHash]);

          case 11:
            receipt = _context5.sent;

            if (!receipt) {
              _context5.next = 16;
              break;
            }

            return _context5.abrupt("return", receipt);

          case 16:
            _context5.next = 18;
            return sleep(1000);

          case 18:
            _context5.next = 24;
            break;

          case 20:
            _context5.prev = 20;
            _context5.t0 = _context5["catch"](8);
            _context5.next = 24;
            return sleep(1000);

          case 24:
            _context5.next = 7;
            break;

          case 26:
            throw new Error("Timeout: cannot get receipt after " + timeout + "ms");

          case 27:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, undefined, [[8, 20]]);
  }));

  return function sendSignedTx(_x13, _x14) {
    return _ref5.apply(this, arguments);
  };
}();

exports.default = function (provider) {
  return {
    nodeName: function nodeName() {
      return defaultMethod(provider, "node_nodeName");
    },
    nodeInfo: function nodeInfo() {
      return defaultMethod(provider, "node_nodeInfo");
    },
    peerCount: function peerCount() {
      return defaultMethod(provider, "node_peersCount");
    },
    peers: function peers() {
      return defaultMethod(provider, "node_peers");
    },
    votingPower: function votingPower() {
      return defaultMethod(provider, "kai_votingPower");
    },
    isValidator: function isValidator() {
      return defaultMethod(provider, "kai_validator");
    },
    blockNumber: function blockNumber() {
      return defaultMethod(provider, "kai_blockNumber");
    },
    dualBlockNumber: function dualBlockNumber() {
      return defaultMethod(provider, "dual_blockNumber");
    },
    pendingTransaction: function pendingTransaction() {
      return defaultMethod(provider, "tx_pendingTransactions");
    },
    blockByNumber: function blockByNumber(blockNum) {
      return getBlockNumber(provider, blockNum);
    },
    dualBlockByNumber: function dualBlockByNumber(blockNum) {
      return getDualBlockNumber(provider, blockNum);
    },
    blockByHash: function blockByHash(blockHash) {
      return getBlockByHash(provider, blockHash);
    },
    transactionCount: function transactionCount(address) {
      var blockParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "latest";
      return defaultMethod(provider, "kai_getTransactionCount", _common.hexToNumber, [address, blockParam]);
    },
    sendSignedTransaction: function sendSignedTransaction(rawTx) {
      var waitUntilMine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var timeout = arguments[2];
      return sendSignedTx(provider, rawTx, waitUntilMine, timeout);
    },
    transactionByHash: function transactionByHash(txHash) {
      return defaultMethod(provider, "tx_getTransaction", always, [txHash]);
    },
    transactionReceipt: function transactionReceipt(txHash) {
      return defaultMethod(provider, "tx_getTransactionReceipt", always, [txHash]);
    },
    balance: function balance(address) {
      var blockHash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var blockHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
      return defaultMethod(provider, "account_balance", always, [address, blockHash, blockHeight]);
    },
    currentPower: function currentPower() {
      return defaultMethod(provider, "kai_validator");
    },
    validatorList: function validatorList() {
      return defaultMethod(provider, "kai_validators");
    },
    accountNonce: function accountNonce(address) {
      return defaultMethod(provider, "account_nonce", always, [address]);
    },
    callSmartContract: function callSmartContract(txObject) {
      var blockHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return defaultMethod(provider, "kai_kardiaCall", always, [txObject, blockHeight]);
    },
    estimateGas: function estimateGas(txObject) {
      return defaultMethod(provider, "kai_estimateGas", always, [txObject]);
    }
  };
};