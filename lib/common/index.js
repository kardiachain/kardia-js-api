'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.txGenerator = exports.recoverTx = exports.sign = undefined;

var _rlp = require('./lib/rlp');

var _bytes = require('./lib/bytes');

var _hash = require('./lib/hash');

var _account = require('./lib/account');

var makeEven = function makeEven(hex) {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
};

var trimLeadingZero = function trimLeadingZero(hex) {
  while (hex && hex.startsWith('0x0')) {
    hex = '0x' + hex.slice(3);
  }
  return hex;
};

var sign = function sign(tx) {
  var privateKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0xf7a3c3b95c4235d7afcf9cc19fafb8ce14c536f5dfac76dc285c7d8f2a376875';

  var account = (0, _account.fromPrivate)(privateKey);
  console.log(account);
  if (!tx.gas) {
    throw new Error('"gas" is missing');
  }

  if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0) {
    throw new Error('Gas, gasPrice, nonce is lower than 0');
  }

  var transaction = {
    nonce: tx.nonce,
    gasPrice: tx.gasPrice,
    gas: tx.gas,
    to: '0x' + tx.to.toLowerCase().replace('0x', ''),
    value: tx.value,
    data: tx.data
  };

  var rlpEncoded = (0, _rlp.encode)([(0, _bytes.fromNat)(transaction.nonce), (0, _bytes.fromNat)(transaction.gasPrice), (0, _bytes.fromNat)(transaction.gas), transaction.to.toLowerCase(), (0, _bytes.fromNat)(transaction.value), (0, _bytes.fromNat)('0x1'), transaction.data]);
  var hash = (0, _hash.keccak256)(rlpEncoded);
  // var signature = makeSigner(27)(Hash.keccak256(rlpEncoded), privateKey);
  var signature = (0, _account.sign)(hash, privateKey);
  var decodeSign = (0, _account.decodeSignature)(signature);

  var rawTx = (0, _rlp.decode)(rlpEncoded).slice(0, 7).concat(decodeSign);
  rawTx[7] = makeEven(trimLeadingZero(decodeSign[1]));
  rawTx[8] = makeEven(trimLeadingZero(decodeSign[2]));
  rawTx[9] = makeEven(trimLeadingZero(decodeSign[0]));
  // console.log(rawTx);

  var rawTransaction = (0, _rlp.encode)(rawTx);

  var values = (0, _rlp.decode)(rawTransaction);
  console.log(hash);
  var result = {
    messageHash: hash,
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    v: trimLeadingZero(values[9]),
    rawTransaction: rawTransaction
  };
  console.log(result);
  return result;
};

var recoverTx = function recoverTx(rawTx) {
  var values = (0, _rlp.decode)(rawTx);
  var signature = (0, _account.encodeSignature)([values[9], values[7], values[8]]);
  var signingData = values.slice(0, 7);
  var signingDataHex = (0, _rlp.encode)(signingData);
  return (0, _account.recover)((0, _hash.keccak256)(signingDataHex), signature);
};

var txGenerator = function txGenerator(receiver, amount) {
  var nonce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0x0';
  return {
    nonce: nonce,
    to: receiver,
    gasPrice: '0xff',
    gas: '0xff',
    value: amount,
    data: '0x'
  };
};

exports.sign = sign;
exports.recoverTx = recoverTx;
exports.txGenerator = txGenerator;