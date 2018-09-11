'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recover = exports.sign = exports.signingData = exports.addDefaults = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Account = require('./account');
var Nat = require('./nat');
var Bytes = require('./bytes');
var RLP = require('./rlp');
var keccak256 = require('./hash').keccak256;

// EthereumRPC, IncompleteTransaction -> Promise Transaction
var addDefaults = function addDefaults(rpc, tx) {
  var baseDefaults = [tx.chainId || rpc('net_version', []), tx.gasPrice || rpc('eth_gasPrice', []), tx.nonce || rpc('eth_getTransactionCount', [tx.from, 'latest']), tx.value || '0x0', tx.data || '0x'];
  var noAddress = function noAddress(address) {
    return !address || address === '' || address === '0x';
  };
  return _promise2.default.all(baseDefaults).then(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 5),
        chainIdNum = _ref2[0],
        gasPrice = _ref2[1],
        nonce = _ref2[2],
        value = _ref2[3],
        data = _ref2[4];

    var chainId = Nat.fromNumber(chainIdNum);
    var gasEstimator = tx.gas ? _promise2.default.resolve(null) : rpc('eth_estimateGas', [{
      from: noAddress(tx.from) ? null : tx.from,
      to: noAddress(tx.to) ? null : tx.to,
      value: tx.value,
      nonce: tx.nonce,
      data: tx.data
    }]);
    return gasEstimator.then(function (gasEstimate) {
      if (gasEstimate.error) {
        throw gasEstimate.error;
      }
      return {
        chainId: chainId,
        from: noAddress(tx.from) ? '0x' : tx.from.toLowerCase(),
        to: noAddress(tx.to) ? '0x' : tx.to.toLowerCase(),
        gasPrice: gasPrice,
        gas: tx.gas ? tx.gas : Nat.div(Nat.mul(gasEstimate, '0x6'), '0x5'),
        nonce: nonce,
        value: value,
        data: data ? data.toLowerCase() : null
      };
    });
  });
};

// Transaction -> Bytes
var signingData = function signingData(tx) {
  return RLP.encode([Bytes.fromNat(tx.nonce), Bytes.fromNat(tx.gasPrice), Bytes.fromNat(tx.gas), tx.to ? tx.to.toLowerCase() : '0x', Bytes.fromNat(tx.value), tx.data, Bytes.fromNat(tx.chainId || '0x1'), '0x', '0x']);
};

// Transaction, Account -> Bytes
var sign = function sign(tx, account) {
  var data = signingData(tx);
  var signature = Account.makeSigner(Nat.toNumber(tx.chainId || '0x1') * 2 + 35)(keccak256(data), account.privateKey);
  var rawTransaction = RLP.decode(data).slice(0, 6).concat(Account.decodeSignature(signature));
  return RLP.encode(rawTransaction);
};

// Bytes -> Address
var recover = function recover(rawTransaction) {
  var values = RLP.decode(rawTransaction);
  var signature = Account.encodeSignature(values.slice(6, 9));
  var recovery = Bytes.toNumber(values[6]);
  var extraData = recovery < 35 ? [] : [Bytes.fromNumber(recovery - 35 >> 1), '0x', '0x'];
  var data = values.slice(0, 6).concat(extraData);
  var dataHex = RLP.encode(data);
  return Account.recover(keccak256(dataHex), signature);
};

exports.addDefaults = addDefaults;
exports.signingData = signingData;
exports.sign = sign;
exports.recover = recover;