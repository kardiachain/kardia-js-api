'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lodash = require('lodash');

var _ethereumjsAbi = require('ethereumjs-abi');

var _ethereumjsAbi2 = _interopRequireDefault(_ethereumjsAbi);

var _abi = require('../common/lib/abi');

var _account = require('../common/lib/account');

var _common = require('../common');

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var encodeArray = function encodeArray(params) {
  return (0, _lodash.map)(params, function (param) {
    if ((0, _common.isHexStrict)(param)) {
      return param;
    } else {
      return (0, _common.toHex)(param);
    }
  });
};

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
    send: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(privateKey) {
        var txPayload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var api, senderAccount, accountNonce, gas, gasPrice, tx, signedTx, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                api = (0, _api2.default)(provider);
                senderAccount = (0, _account.fromPrivate)(privateKey);
                _context.next = 4;
                return api.accountNonce(senderAccount.address);

              case 4:
                accountNonce = _context.sent;

                //TODO call estimate gas if need
                gas = '0xff';
                gasPrice = '0xff';
                tx = (0, _common.txGenerator)('0x', (0, _lodash.get)(txPayload, 'amount', 0), (0, _lodash.get)(txPayload, 'nonce', accountNonce), (0, _lodash.get)(txPayload, 'gasPrice', gasPrice), (0, _lodash.get)(txPayload, 'gas', gas), data);
                signedTx = (0, _common.sign)(tx, privateKey);
                _context.next = 11;
                return api.sendSignedTransaction(signedTx.rawTransaction, true);

              case 11:
                result = _context.sent;

                console.log(result);
                return _context.abrupt('return', result);

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      function send(_x6) {
        return _ref.apply(this, arguments);
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
    send: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(privateKey, contractAddress) {
        var txPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var api, senderAccount, accountNonce, gas, gasPrice, tx, signedTx, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                api = (0, _api2.default)(provider);
                senderAccount = (0, _account.fromPrivate)(privateKey);
                _context2.next = 4;
                return api.accountNonce(senderAccount.address);

              case 4:
                accountNonce = _context2.sent;

                //TODO call estimate gas if need
                gas = 5000;
                gasPrice = '0xff';
                tx = (0, _common.txGenerator)(contractAddress, (0, _lodash.get)(txPayload, 'amount', 0), (0, _lodash.get)(txPayload, 'nonce', accountNonce), (0, _lodash.get)(txPayload, 'gasPrice', gasPrice), (0, _lodash.get)(txPayload, 'gas', gas), data);
                signedTx = (0, _common.sign)(tx, privateKey);
                _context2.next = 11;
                return api.sendSignedTransaction(signedTx.rawTransaction, true);

              case 11:
                result = _context2.sent;
                return _context2.abrupt('return', result);

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      function send(_x8, _x9) {
        return _ref2.apply(this, arguments);
      }

      return send;
    }(),
    call: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(sender, contractAddress) {
        var txPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var api, callObject, result, outputTypes, outputBuffer, decodeResult;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                api = (0, _api2.default)(provider);
                callObject = {
                  from: sender,
                  to: contractAddress,
                  data: data,
                  value: (0, _lodash.get)(txPayload, 'amount', 0),
                  gasPrice: (0, _lodash.get)(txPayload, 'gasPrice', 0),
                  gas: (0, _lodash.get)(txPayload, 'gas', 0)
                };
                _context3.next = 4;
                return api.callSmartContract(callObject);

              case 4:
                result = _context3.sent;
                outputTypes = functionFromAbi.outputs.map(function (output) {
                  return output.type;
                });
                outputBuffer = new Buffer(result.replace('0x', ''), 'hex');
                decodeResult = _ethereumjsAbi2.default.rawDecode(outputTypes, outputBuffer);
                return _context3.abrupt('return', decodeResult.map(function (decode) {
                  return decode.toString();
                }));

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      }));

      function call(_x11, _x12) {
        return _ref3.apply(this, arguments);
      }

      return call;
    }()
  };
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
  var invoke = function invoke(_ref4) {
    var params = _ref4.params,
        name = _ref4.name;
    return invokeContract(currentProvider, currentAbi, name, params);
  };
  return {
    updateAbi: updateAbi,
    updateByteCode: updateByteCode,
    info: info,
    deploy: deploy,
    invoke: invoke
  };
};