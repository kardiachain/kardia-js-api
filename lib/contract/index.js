'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (provider, bytecodes, abi) {
  var currentByteCode = bytecodes;
  var currentAbi = abi;
  var api = (0, _api2.default)(provider);
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
  return {
    updateAbi: updateAbi,
    updateByteCode: updateByteCode,
    info: info
  };
};