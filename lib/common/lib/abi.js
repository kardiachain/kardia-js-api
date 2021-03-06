'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeSingle = exports.methodSignature = exports.decodeSingleOutput = exports.decodeOutput = exports.deployData = exports.methodData = exports.encode = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// type Var = {
//   name: String
//   type: "uint256" | "bytes32" | ...
// }
//
// type Method = {
//   name: String
//   inputs: [Var]
//   output: [Var]
//   constant: Bool
//   payable: Bool
// }
var Bytes = require('./bytes');
var Nat = require('./nat');
var keccak256s = require('./hash').keccak256s;

// (type : String), JSType(type) -> {data: Bytes, dynamic: Bool}
//   ABI-encodes a single term.
var encode = function encode(type, value) {
  if (type === 'uint256' || type === 'bytes32' || type === 'address') {
    return { data: Bytes.pad(32, value), dynamic: false };
  } else {
    return {
      data: encodeSingle(type, value),
      dynamic: isDynamic(type)
    };
  }
};

var isDynamic = function isDynamic(type) {
  if (type === 'bytes' || type === 'string') return true;
  if (isArray(type)) return true;
  return false;
};

var deployData = function deployData(bytecode, method, params) {
  var headBlock = '0x';
  var dataBlock = '0x';
  if (params && method) {
    var encodedParams = params.map(function (param, i) {
      return encode(method.inputs[i].type, param);
    });
    for (var i = 0; i < encodedParams.length; ++i) {
      if (encodedParams[i].dynamic) {
        var dataLoc = encodedParams.length * 32 + Bytes.length(dataBlock);
        headBlock = Bytes.concat(headBlock, Bytes.pad(32, Nat.fromNumber(dataLoc)));
        dataBlock = Bytes.concat(dataBlock, encodedParams[i].data);
      } else {
        headBlock = Bytes.concat(headBlock, encodedParams[i].data);
      }
    }
  }
  return Bytes.flatten([bytecode, headBlock, dataBlock]);
};
var methodSignature = function methodSignature(method) {
  var methodSig = method.name + '(' + method.inputs.map(function (i) {
    return i.type;
  }).join(',') + ')';
  return keccak256s(methodSig);
};

// (method : Method), [JSType(method.inputs[i].type)] -> Bytes
//   ABI-encodes the transaction data to call a method.
var methodData = function methodData(method, params) {
  var methodSig = method.name + '(' + method.inputs.map(function (i) {
    return i.type;
  }).join(',') + ')';
  var methodHash = keccak256s(methodSig).slice(0, 10);
  var encodedParams = params.map(function (param, i) {
    return encode(method.inputs[i].type, param);
  });
  var headBlock = '0x';
  var dataBlock = '0x';
  for (var i = 0; i < encodedParams.length; ++i) {
    if (encodedParams[i].dynamic) {
      var dataLoc = encodedParams.length * 32 + Bytes.length(dataBlock);
      headBlock = Bytes.concat(headBlock, Bytes.pad(32, Nat.fromNumber(dataLoc)));
      dataBlock = Bytes.concat(dataBlock, encodedParams[i].data);
    } else {
      headBlock = Bytes.concat(headBlock, encodedParams[i].data);
    }
  }
  return Bytes.flatten([methodHash, headBlock, dataBlock]);
};

// Encodes a single item (can be dynamic array)
// @returns: String
var encodeSingle = function encodeSingle(type, arg) {
  var size, num, ret, i;

  if (type === 'address') {
    return encodeSingle('uint160', parseNumber(arg));
  } else if (type === 'bool') {
    return encodeSingle('uint8', arg ? 1 : 0);
  } else if (type === 'string') {
    return encodeSingle('bytes', new Buffer(arg, 'utf8'));
  } else if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (typeof arg.length === 'undefined') {
      throw new Error('Not an array?');
    }
    size = parseTypeArray(type);
    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size);
    }
    ret = [];
    var result = '';
    type = type.slice(0, type.lastIndexOf('['));
    if (typeof arg === 'string') {
      arg = JSON.parse(arg);
    }

    if (size === 'dynamic') {
      var length = encodeSingle('uint256', arg.length);
      // ret.push(length);
      result = length;
    }
    for (i in arg) {
      result = result + encodeSingle(type, arg[i]).replace('0x', '');
    }
    return result;
  } else if (type === 'bytes') {
    var _length = Bytes.length(arg);
    var nextMul32 = (((_length - 1) / 32 | 0) + 1) * 32;
    var lengthEncoded = encode('uint256', Nat.fromNumber(_length)).data;
    var bytesEncoded = Bytes.padRight(nextMul32, arg);
    return Bytes.concat(lengthEncoded, bytesEncoded);
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type);
    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size);
    }

    var _result = '0x' + setLengthRight(arg, 32).toString('hex');
    return _result;
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type);
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint<N> width: ' + size);
    }

    num = parseNumber(arg);
    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num < 0) {
      throw new Error('Supplied uint is negative');
    }
    // const bytes32 = zeros(size === 256 ? 31 : 32);
    // return Buffer.concat([bytes32, num.toArrayLike(Buffer, 'be')]);
    var buf = '0x' + num.toArrayLike(Buffer, 'be', 32).toString('hex');
    return buf;
  } else if (type.startsWith('int')) {
    size = parseTypeN(type);
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int<N> width: ' + size);
    }

    num = parseNumber(arg);
    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    var _buf = num.toTwos(256).toArrayLike(Buffer, 'be', 32);
    return '0x' + _buf.toString('hex');
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type);

    num = parseNumber(arg);

    if (num < 0) {
      throw new Error('Supplied ufixed is negative');
    }

    return encodeSingle('uint256', num.mul(new _bn2.default(2).pow(new _bn2.default(size[1]))));
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type);

    return encodeSingle('int256', parseNumber(arg).mul(new _bn2.default(2).pow(new _bn2.default(size[1]))));
  }

  throw new Error('Unsupported or invalid type: ' + type);
};

var parseNumber = function parseNumber(arg) {
  var type = typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg);
  if (type === 'string') {
    if (isHexPrefixed(arg)) {
      return new _bn2.default(stripHexPrefix(arg), 16);
    } else {
      return new _bn2.default(arg, 10);
    }
  } else if (type === 'number') {
    return new _bn2.default(arg);
  } else if (arg.toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg;
  } else {
    throw new Error('Argument is not a number');
  }
};

var parseTypeNxM = function parseTypeNxM(type) {
  var tmp = /^\D+(\d+)x(\d+)$/.exec(type);
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)];
};

// Parse N in type[<N>] where "type" can itself be an array type.
var parseTypeArray = function parseTypeArray(type) {
  var tmp = type.match(/(.*)\[(.*?)\]$/);
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }
  return null;
};

// Parse N from type<N>
var parseTypeN = function parseTypeN(type) {
  return parseInt(/^\D+(\d+)$/.exec(type)[1], 10);
};

// Is a type an array?
var isArray = function isArray(type) {
  return type.lastIndexOf(']') === type.length - 1;
};

function isHexPrefixed(str) {
  if (typeof str !== 'string') {
    return false;
  }

  return str.slice(0, 2) === '0x';
}

var stripHexPrefix = function stripHexPrefix(str) {
  return isHexPrefixed(str) ? str.slice(2) : str;
};
var zeros = function zeros(bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
};
var setLengthRight = function setLengthRight(msg, length) {
  return setLength(msg, length, true);
};

var setLength = function setLength(msg, length, right) {
  var buf = zeros(length);
  msg = toBuffer(msg);
  if (right) {
    if (msg.length < length) {
      msg.copy(buf);
      return buf;
    }
    return msg.slice(0, length);
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length);
      return buf;
    }
    return msg.slice(-length);
  }
};
var padToEven = function padToEven(value) {
  var a = value; // eslint-disable-line

  if (typeof a !== 'string') {
    throw new Error('while padding to even, value must be string, is currently ' + (typeof a === 'undefined' ? 'undefined' : (0, _typeof3.default)(a)) + ', while padToEven.');
  }

  if (a.length % 2) {
    a = '0' + a;
  }

  return a;
};

/**
 * Is the string a hex string.
 *
 * @method check if string is hex string of specific length
 * @param {String} value
 * @param {Number} length
 * @returns {Boolean} output the string is a hex string
 */
var isHexString = function isHexString(value, length) {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) {
    return false;
  }

  return true;
};
/**
 * Converts a `Number` into a hex `String`
 * @param {Number} i
 * @return {String}
 */
var intToHex = function intToHex(i) {
  var hex = i.toString(16); // eslint-disable-line

  return '0x' + hex;
};

/**
 * Converts an `Number` to a `Buffer`
 * @param {Number} i
 * @return {Buffer}
 */
var intToBuffer = function intToBuffer(i) {
  var hex = intToHex(i);

  return new Buffer(padToEven(hex.slice(2)), 'hex');
};

var toBuffer = function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v);
    } else if (typeof v === 'string') {
      if (isHexString(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
      } else {
        v = Buffer.from(v);
      }
    } else if (typeof v === 'number') {
      v = intToBuffer(v);
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0);
    } else if (_bn2.default.isBN(v)) {
      v = v.toArrayLike(Buffer);
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray());
    } else {
      throw new Error('invalid type');
    }
  }
  return v;
};

var decodeOutput = function decodeOutput(outputTypes, outputData) {
  if (outputTypes.length === 1) {
    var type = (0, _lodash.get)(outputTypes[0], 'type');
    return decodeSingleOutput(type, outputData[0]);
  }
  return (0, _lodash.reduce)(outputTypes, function (obj, data, index) {
    var key = (0, _lodash.get)(data, 'name') || index.toString();
    var type = (0, _lodash.get)(data, 'type');
    obj[key] = decodeSingleOutput(type, outputData[index]);
    return obj;
  }, {});
};

var decodeSingleOutput = function decodeSingleOutput(outputType, outputData) {
  if ((0, _lodash.isEmpty)(outputData) || outputData === '0x') {
    return outputData;
  }
  if (isArray(outputType)) {
    var type = (0, _lodash.replace)(outputType, '[]', '');
    var arrayData = (0, _lodash.split)(outputData, ',');
    return (0, _lodash.map)(arrayData, function (data) {
      return decodeSingleOutput(type, data);
    });
  }
  if (outputType === 'address') {
    return '0x' + (0, _lodash.replace)(outputData, '0x', '');
  }
  if (outputType.startsWith('uint') || outputType.startsWith('int')) {
    return (0, _lodash.toNumber)(outputData);
  }
  if (outputType === 'bool') {
    return outputData == 'true';
  }
  if (outputType.startsWith('byte')) {
    return '0x' + (0, _lodash.replace)(outputData, '0x', '');
  }
  return outputData;
};

exports.encode = encode;
exports.methodData = methodData;
exports.deployData = deployData;
exports.decodeOutput = decodeOutput;
exports.decodeSingleOutput = decodeSingleOutput;
exports.methodSignature = methodSignature;
exports.encodeSingle = encodeSingle;