'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOutput = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _lodash = require('lodash');

var _ethereumjsAbi = require('ethereumjs-abi');

var _ethereumjsAbi2 = _interopRequireDefault(_ethereumjsAbi);

var _abi = require('../common/lib/abi');

var _account = require('../common/lib/account');

var _common = require('../common');

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _handlebars = require('handlebars');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_GAS = 900000;
var DEFAULT_GAS_PRICE = 1;

var findFunctionFromAbi = function findFunctionFromAbi(abi) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'function';
  var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (type !== 'constructor') {
    return (0, _lodash.find)(abi, function (item) {
      return item.type === type && item.name === name;
    });
  }
  return (0, _lodash.find)(abi, function (item) {
    return item.type === type;
  });
};

var filterEventFromAbi = function filterEventFromAbi(abi) {
  var filteredAbi = (0, _lodash.filter)(abi, function (item) {
    return item.type === 'event';
  });
  return (0, _lodash.map)(filteredAbi, function (item) {
    return (0, _extends3.default)({
      signature: (0, _abi.methodSignature)(item)
    }, item);
  });
};

var encodeArray = function encodeArray(params) {
  return (0, _lodash.map)(params, function (param) {
    if ((0, _common.isHexStrict)(param)) {
      return param;
    } else {
      return (0, _common.toHex)(param);
    }
  });
};

var estimateGasFN = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var txPayload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var api = arguments[1];
    var data = arguments[2];
    var txObject, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            txObject = {
              from: (0, _lodash.get)(txPayload, 'from', '0x'),
              to: (0, _lodash.get)(txPayload, 'to', '0x'),
              data: data,
              value: (0, _lodash.get)(txPayload, 'value', 0),
              gasPrice: (0, _lodash.get)(txPayload, 'gasPrice', DEFAULT_GAS_PRICE),
              gas: (0, _lodash.get)(txPayload, 'gas', DEFAULT_GAS)
            };
            _context.next = 3;
            return api.estimateGas(txObject);

          case 3:
            result = _context.sent;
            return _context.abrupt('return', result);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function estimateGasFN() {
    return _ref.apply(this, arguments);
  };
}();

var deployContract = function deployContract(provider) {
  var bytecode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0x';
  var abi = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var params = arguments[3];

  var constructorAbi = findFunctionFromAbi(abi, 'constructor');
  var decorBycode = '0x' + (0, _lodash.replace)(bytecode, '0x', '');
  var paramsDecorate = (0, _lodash.map)(params, function (param) {
    if (Array.isArray(param)) {
      return encodeArray(param);
    } else if ((0, _common.isHexStrict)(param)) {
      return param;
    } else {
      return (0, _common.toHex)(param);
    }
  });
  var data = (0, _abi.deployData)(decorBycode, constructorAbi, paramsDecorate);
  return {
    txData: function txData() {
      return data;
    },
    estimateGas: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var txPayload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var api;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                api = (0, _api2.default)(provider);
                _context2.next = 3;
                return estimateGasFN(txPayload, api, data);

              case 3:
                return _context2.abrupt('return', _context2.sent);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      function estimateGas() {
        return _ref2.apply(this, arguments);
      }

      return estimateGas;
    }(),
    send: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(privateKey) {
        var txPayload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var api, senderAccount, accountNonce, tx, signedTx, result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                api = (0, _api2.default)(provider);
                senderAccount = (0, _account.fromPrivate)(privateKey);
                _context3.next = 4;
                return api.accountNonce(senderAccount.address);

              case 4:
                accountNonce = _context3.sent;
                tx = (0, _common.txGenerator)('0x', (0, _lodash.get)(txPayload, 'amount', 0), (0, _lodash.get)(txPayload, 'nonce', accountNonce), (0, _lodash.get)(txPayload, 'gasPrice', DEFAULT_GAS_PRICE), (0, _lodash.get)(txPayload, 'gas', DEFAULT_GAS), data);
                signedTx = (0, _common.sign)(tx, privateKey);
                _context3.next = 9;
                return api.sendSignedTransaction(signedTx.rawTransaction, true);

              case 9:
                result = _context3.sent;

                console.log(result);
                return _context3.abrupt('return', result);

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      }));

      function send(_x8) {
        return _ref3.apply(this, arguments);
      }

      return send;
    }()
  };
};

var invokeContract = function invokeContract(provider, abi, name, params) {
  var functionFromAbi = findFunctionFromAbi(abi, 'function', name);
  var paramsDecorate = (0, _lodash.map)(params, function (param) {
    if (Array.isArray(param)) {
      return encodeArray(param);
    } else if ((0, _common.isHexStrict)(param)) {
      return param;
    } else {
      return (0, _common.toHex)(param);
    }
  });
  var data = (0, _abi.methodData)(functionFromAbi, paramsDecorate);
  return {
    txData: function txData() {
      return data;
    },
    estimateGas: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var txPayload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var api;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                api = (0, _api2.default)(provider);
                _context4.next = 3;
                return estimateGasFN(txPayload, api, data);

              case 3:
                return _context4.abrupt('return', _context4.sent);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      function estimateGas() {
        return _ref4.apply(this, arguments);
      }

      return estimateGas;
    }(),
    send: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(privateKey, contractAddress) {
        var txPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var api, senderAccount, accountNonce, tx, signedTx, rawResult, events, result;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                api = (0, _api2.default)(provider);
                senderAccount = (0, _account.fromPrivate)(privateKey);
                _context5.next = 4;
                return api.accountNonce(senderAccount.address);

              case 4:
                accountNonce = _context5.sent;
                tx = (0, _common.txGenerator)(contractAddress, (0, _lodash.get)(txPayload, 'amount', 0), (0, _lodash.get)(txPayload, 'nonce', accountNonce), (0, _lodash.get)(txPayload, 'gasPrice', DEFAULT_GAS_PRICE), (0, _lodash.get)(txPayload, 'gas', DEFAULT_GAS), data);
                signedTx = (0, _common.sign)(tx, privateKey);
                _context5.next = 9;
                return api.sendSignedTransaction(signedTx.rawTransaction, true);

              case 9:
                rawResult = _context5.sent;
                events = (0, _lodash.map)(rawResult.logs, function (item) {
                  return parseEvent(abi, item);
                });
                result = (0, _extends3.default)({
                  events: events
                }, rawResult);
                return _context5.abrupt('return', result);

              case 13:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, undefined);
      }));

      function send(_x11, _x12) {
        return _ref5.apply(this, arguments);
      }

      return send;
    }(),
    call: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(contractAddress) {
        var txPayload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var blockHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var api, callObject, result;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                api = (0, _api2.default)(provider);
                callObject = {
                  from: (0, _lodash.get)(txPayload, 'from', '0x'),
                  to: contractAddress,
                  data: data,
                  value: (0, _lodash.get)(txPayload, 'amount', 0),
                  gasPrice: (0, _lodash.get)(txPayload, 'gasPrice', DEFAULT_GAS_PRICE),
                  gas: (0, _lodash.get)(txPayload, 'gas', DEFAULT_GAS)
                };
                _context6.next = 4;
                return api.callSmartContract(callObject, blockHeight);

              case 4:
                result = _context6.sent;
                return _context6.abrupt('return', parseOutput(functionFromAbi.outputs, result));

              case 6:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, undefined);
      }));

      function call(_x15) {
        return _ref6.apply(this, arguments);
      }

      return call;
    }()
  };
};

var parseOutput = exports.parseOutput = function parseOutput(outputs, result) {
  var outputTypes = outputs.map(function (output) {
    return output.type;
  });
  var outputBuffer = new Buffer(result.replace('0x', ''), 'hex');
  var decodeResult = _ethereumjsAbi2.default.rawDecode(outputTypes, outputBuffer);
  var rawOutput = decodeResult.map(function (decode, index) {
    if (outputTypes[index].endsWith(']')) {
      var resultItems = (0, _lodash.map)(decode, function (item) {
        if (outputTypes[index].startsWith('byte')) {
          return item.toString('hex');
        }
        return item.toString();
      });
      return resultItems;
    }
    if (outputTypes[index].startsWith('byte')) {
      return decode.toString('hex');
    }
    return decode.toString();
  });
  return (0, _abi.decodeOutput)(outputs, rawOutput);
};
var parseEvent = function parseEvent(currentAbi, eventObject) {
  if ((0, _lodash.isEmpty)(currentAbi)) {
    throw (0, _handlebars.Exception)('Abi is require for paser');
  }
  var filterEvents = filterEventFromAbi(currentAbi);
  var eventAbi = (0, _lodash.find)(filterEvents, function (item) {
    return item.signature === eventObject.topics[0];
  });
  if (eventAbi) {
    var notIndexInputs = (0, _lodash.filter)(eventAbi.inputs, function (item) {
      return item.indexed === false;
    });
    var indexInputs = (0, _lodash.filter)(eventAbi.inputs, function (item) {
      return item.indexed === true;
    });
    var orderedInputs = [].concat((0, _toConsumableArray3.default)(notIndexInputs), (0, _toConsumableArray3.default)(indexInputs));
    var outputTypes = orderedInputs.map(function (item) {
      return item.type;
    });
    var outputBuffer = new Buffer(eventObject.data.replace('0x', ''), 'hex');
    for (var i = 1; i < eventObject.topics.length; i++) {
      var indexedBuffer = new Buffer(eventObject.topics[i].replace('0x', ''), 'hex');
      outputBuffer = Buffer.concat([outputBuffer, indexedBuffer]);
    }
    var decodeResult = _ethereumjsAbi2.default.rawDecode(outputTypes, outputBuffer);
    var rawOutput = decodeResult.map(function (decode, index) {
      if (outputTypes[index].startsWith('byte')) {
        return decode.toString('hex');
      }
      return decode.toString();
    });
    var decodeObject = (0, _abi.decodeOutput)(eventAbi.inputs, rawOutput);
    return (0, _extends3.default)({
      event: (0, _extends3.default)({
        name: eventAbi.name
      }, decodeObject)
    }, eventObject);
  }
  return eventObject;
};

exports.default = function (provider, bytecodes, abi) {
  var currentByteCode = bytecodes;
  var currentAbi = abi;
  var currentProvider = provider;
  var updateAbi = function updateAbi(abi) {
    currentAbi = abi;
  };
  var updateByteCode = function updateByteCode(bytecodes) {
    currentByteCode = bytecodes;
  };
  var info = function info() {
    return {
      provider: {
        version: provider.version,
        baseLink: provider.baseLink
      },
      byteCode: currentByteCode,
      abi: currentAbi
    };
  };
  var deploy = function deploy(params) {
    return deployContract(currentProvider, currentByteCode, currentAbi, params);
  };
  var invoke = function invoke(_ref7) {
    var params = _ref7.params,
        name = _ref7.name;
    return invokeContract(currentProvider, currentAbi, name, params);
  };
  var eventParser = function eventParser(eventObject) {
    return parseEvent(currentAbi, eventObject);
  };
  return {
    updateAbi: updateAbi,
    updateByteCode: updateByteCode,
    info: info,
    deploy: deploy,
    invoke: invoke,
    eventParser: eventParser
  };
};