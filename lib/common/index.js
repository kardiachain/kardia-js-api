'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toHex = exports.numberToHex = exports.hexToNumberString = exports.hexToNumber = exports.hexToUtf8 = exports.utf8ToHex = exports.isHexStrict = exports.isAddress = exports.toBN = exports.isBN = exports.createAccount = exports.txGenerator = exports.recoverTx = exports.sign = undefined;

var _utils = require('./lib/utils');

Object.defineProperty(exports, 'isBN', {
  enumerable: true,
  get: function get() {
    return _utils.isBN;
  }
});
Object.defineProperty(exports, 'toBN', {
  enumerable: true,
  get: function get() {
    return _utils.toBN;
  }
});
Object.defineProperty(exports, 'isAddress', {
  enumerable: true,
  get: function get() {
    return _utils.isAddress;
  }
});
Object.defineProperty(exports, 'isHexStrict', {
  enumerable: true,
  get: function get() {
    return _utils.isHexStrict;
  }
});
Object.defineProperty(exports, 'utf8ToHex', {
  enumerable: true,
  get: function get() {
    return _utils.utf8ToHex;
  }
});
Object.defineProperty(exports, 'hexToUtf8', {
  enumerable: true,
  get: function get() {
    return _utils.hexToUtf8;
  }
});
Object.defineProperty(exports, 'hexToNumber', {
  enumerable: true,
  get: function get() {
    return _utils.hexToNumber;
  }
});
Object.defineProperty(exports, 'hexToNumberString', {
  enumerable: true,
  get: function get() {
    return _utils.hexToNumberString;
  }
});
Object.defineProperty(exports, 'numberToHex', {
  enumerable: true,
  get: function get() {
    return _utils.numberToHex;
  }
});
Object.defineProperty(exports, 'toHex', {
  enumerable: true,
  get: function get() {
    return _utils.toHex;
  }
});

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

  var rlpEncoded = (0, _rlp.encode)([(0, _bytes.fromNat)(transaction.nonce), (0, _bytes.fromNat)(transaction.gasPrice), (0, _bytes.fromNat)(transaction.gas), transaction.to.toLowerCase(), (0, _bytes.fromNat)(transaction.value), transaction.data]);
  var hash = (0, _hash.keccak256)(rlpEncoded);
  // var signature = makeSigner(27)(Hash.keccak256(rlpEncoded), privateKey);
  var signature = (0, _account.sign)(hash, privateKey);
  var decodeSign = (0, _account.decodeSignature)(signature);

  var rawTx = (0, _rlp.decode)(rlpEncoded).concat(decodeSign);
  rawTx[6] = makeEven(trimLeadingZero(decodeSign[0]));
  rawTx[7] = makeEven(trimLeadingZero(decodeSign[1]));
  rawTx[8] = makeEven(trimLeadingZero(decodeSign[2]));
  // console.log(rawTx);

  var rawTransaction = (0, _rlp.encode)(rawTx);

  var values = (0, _rlp.decode)(rawTransaction);
  var result = {
    messageHash: hash,
    v: trimLeadingZero(values[6]),
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    rawTransaction: rawTransaction
  };
  return result;
};

var recoverTx = function recoverTx(rawTx) {
  var values = (0, _rlp.decode)(rawTx);
  var signature = (0, _account.encodeSignature)([values[6], values[7], values[8]]);
  var signingData = values.slice(0, 6);
  var signingDataHex = (0, _rlp.encode)(signingData);
  return (0, _account.recover)((0, _hash.keccak256)(signingDataHex), signature);
};

/**
 * create tx object
 * @param  {address} receiver
 * @param  {hexString} amount                   amount number should be present in hex.
 * @param  {hexString} [nonce='0x0']     nounce number in hex
 * @param  {hexString} [gasPrice='0xff']
 * @param  {hexString} [gas='0xff']
 * @param  {hexString} [data='0x']
 * @return {Object}
 */
var txGenerator = function txGenerator(receiver, amount) {
  var nonce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0x0';
  var gasPrice = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '0xff';
  var gas = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0xff';
  var data = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '0x5544';
  return {
    nonce: (0, _utils.isHexStrict)(nonce) ? nonce : (0, _utils.toHex)(nonce),
    to: receiver,
    gasPrice: (0, _utils.isHexStrict)(gasPrice) ? gasPrice : (0, _utils.toHex)(gasPrice),
    gas: (0, _utils.isHexStrict)(gas) ? gas : (0, _utils.toHex)(gas),
    value: (0, _utils.isHexStrict)(amount) ? amount : (0, _utils.toHex)(amount),
    data: data
  };
};

var createAccount = _account.create;

exports.sign = sign;
exports.recoverTx = recoverTx;
exports.txGenerator = txGenerator;
exports.createAccount = createAccount;