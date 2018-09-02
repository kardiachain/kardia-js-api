"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (provider, bytecodes, abi) {
  var currentByteCode = bytecodes;
  var currentAbi = abi;
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