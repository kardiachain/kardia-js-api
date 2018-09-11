'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.numberToHex = exports.hexToNumberString = exports.hexToNumber = exports.hexToUtf8 = exports.isHexStrict = exports.utf8ToHex = exports.isAddress = exports.toBN = exports.isBN = exports.toHex = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

var _utf = require('utf8');

var _utf2 = _interopRequireDefault(_utf);

var _numberToBn = require('number-to-bn');

var _numberToBn2 = _interopRequireDefault(_numberToBn);

var _hash = require('./hash');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BN|Object} value
 * @param {Boolean} returnType
 * @return {String}
 */
var toHex = exports.toHex = function toHex(value) {
  var returnType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  /*jshint maxcomplexity: false */

  if (isAddress(value)) {
    return returnType ? 'address' : '0x' + value.toLowerCase().replace(/^0x/i, '');
  }

  if ((0, _lodash.isBoolean)(value)) {
    return returnType ? 'bool' : value ? '0x01' : '0x00';
  }

  if ((0, _lodash.isObject)(value) && !isBigNumber(value) && !isBN(value)) {
    return returnType ? 'string' : utf8ToHex((0, _stringify2.default)(value));
  }

  // if its a negative number, pass it through numberToHex
  if ((0, _lodash.isString)(value)) {
    if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
      return returnType ? 'int256' : numberToHex(value);
    } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
      return returnType ? 'bytes' : value;
    } else if (!isFinite(value)) {
      return returnType ? 'string' : utf8ToHex(value);
    }
  }

  return returnType ? value < 0 ? 'int256' : 'uint256' : numberToHex(value);
};
/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
var isBN = exports.isBN = function isBN(object) {
  return object instanceof _bn2.default || object && object.constructor && object.constructor.name === 'BN';
};

/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
var toBN = exports.toBN = function toBN(number) {
  try {
    return (0, _numberToBn2.default)(number);
  } catch (e) {
    throw new Error(e + ' Given value: "' + number + '"');
  }
};

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
var isAddress = exports.isAddress = function isAddress(address) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
    // If it's ALL lowercase or ALL upppercase
  } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
    return true;
    // Otherwise check each case
  } else {
    return checkAddressChecksum(address);
  }
};

/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
var checkAddressChecksum = function checkAddressChecksum(address) {
  // Check each case
  address = address.replace(/^0x/i, '');
  var addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '');

  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i] || parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */
var SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

var sha3 = function sha3(value) {
  if (isHexStrict(value) && /^0x/i.test(value.toString())) {
    value = hexToBytes(value);
  }

  var returnValue = (0, _hash.keccak256)(value); // jshint ignore:line

  if (returnValue === SHA3_NULL_S) {
    return null;
  } else {
    return returnValue;
  }
};

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
var utf8ToHex = exports.utf8ToHex = function utf8ToHex(str) {
  str = _utf2.default.encode(str);
  var hex = '';

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, '');
  str = str.split('').reverse().join('');
  str = str.replace(/^(?:\u0000)*/, '');
  str = str.split('').reverse().join('');

  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    // if (code !== 0) {
    var n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
    // }
  }

  return '0x' + hex;
};

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
var isHexStrict = exports.isHexStrict = function isHexStrict(hex) {
  return ((0, _lodash.isString)(hex) || (0, _lodash.isNumber)(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
};
/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
var hexToUtf8 = exports.hexToUtf8 = function hexToUtf8(hex) {
  if (!isHexStrict(hex)) throw new Error('The parameter "' + hex + '" must be a valid HEX string.');

  var str = '';
  var code = 0;
  hex = hex.replace(/^0x/i, '');

  // remove 00 padding from either side
  hex = hex.replace(/^(?:00)*/, '');
  hex = hex.split('').reverse().join('');
  hex = hex.replace(/^(?:00)*/, '');
  hex = hex.split('').reverse().join('');

  var l = hex.length;

  for (var i = 0; i < l; i += 2) {
    code = parseInt(hex.substr(i, 2), 16);
    // if (code !== 0) {
    str += String.fromCharCode(code);
    // }
  }

  return _utf2.default.decode(str);
};

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
var hexToNumber = exports.hexToNumber = function hexToNumber(value) {
  if (!value) {
    return value;
  }

  return toBN(value).toNumber();
};

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
var hexToNumberString = exports.hexToNumberString = function hexToNumberString(value) {
  if (!value) return value;

  return toBN(value).toString(10);
};

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object}
 * @return {Boolean}
 */
var isBigNumber = function isBigNumber(object) {
  return object && (object instanceof _bn2.default || object.constructor && object.constructor.name === 'BigNumber');
};

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
var numberToHex = exports.numberToHex = function numberToHex(value) {
  if (value == null || value == undefined) {
    return value;
  }

  if (!isFinite(value) && !isHexStrict(value)) {
    throw new Error('Given input "' + value + '" is not a number.');
  }

  var number = toBN(value);
  var result = number.toString(16);

  return number.lt(new _bn2.default(0)) ? '-0x' + result.substr(1) : '0x' + result;
};