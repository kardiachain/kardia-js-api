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
import BN from 'bn.js';
import { reduce, get, toNumber, map, replace, split, isEmpty } from 'lodash';
const Bytes = require('./bytes');
const Nat = require('./nat');
const keccak256s = require('./hash').keccak256s;

// (type : String), JSType(type) -> {data: Bytes, dynamic: Bool}
//   ABI-encodes a single term.
const encode = (type, value) => {
  if (type === 'uint256' || type === 'bytes32' || type === 'address') {
    return { data: Bytes.pad(32, value), dynamic: false };
  } else {
    return {
      data: encodeSingle(type, value),
      dynamic: isDynamic(type),
    };
  }
};

const isDynamic = (type) => {
  if (type === 'bytes' || type === 'string') return true;
  if (isArray(type)) return true;
  return false;
};

const deployData = (bytecode, method, params) => {
  var headBlock = '0x';
  let dataBlock = '0x';
  if (params && method) {
    let encodedParams = params.map((param, i) =>
      encode(method.inputs[i].type, param),
    );
    for (var i = 0; i < encodedParams.length; ++i) {
      if (encodedParams[i].dynamic) {
        var dataLoc = encodedParams.length * 32 + Bytes.length(dataBlock);
        headBlock = Bytes.concat(
          headBlock,
          Bytes.pad(32, Nat.fromNumber(dataLoc)),
        );
        dataBlock = Bytes.concat(dataBlock, encodedParams[i].data);
      } else {
        headBlock = Bytes.concat(headBlock, encodedParams[i].data);
      }
    }
  }
  return Bytes.flatten([bytecode, headBlock, dataBlock]);
};

// (method : Method), [JSType(method.inputs[i].type)] -> Bytes
//   ABI-encodes the transaction data to call a method.
const methodData = (method, params) => {
  const methodSig =
    method.name + '(' + method.inputs.map((i) => i.type).join(',') + ')';
  const methodHash = keccak256s(methodSig).slice(0, 10);
  let encodedParams = params.map((param, i) =>
    encode(method.inputs[i].type, param),
  );
  var headBlock = '0x';
  let dataBlock = '0x';
  for (var i = 0; i < encodedParams.length; ++i) {
    if (encodedParams[i].dynamic) {
      var dataLoc = encodedParams.length * 32 + Bytes.length(dataBlock);
      headBlock = Bytes.concat(
        headBlock,
        Bytes.pad(32, Nat.fromNumber(dataLoc)),
      );
      dataBlock = Bytes.concat(dataBlock, encodedParams[i].data);
    } else {
      headBlock = Bytes.concat(headBlock, encodedParams[i].data);
    }
  }
  return Bytes.flatten([methodHash, headBlock, dataBlock]);
};

// Encodes a single item (can be dynamic array)
// @returns: String
const encodeSingle = (type, arg) => {
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
    let result = '';
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
    const length = Bytes.length(arg);
    const nextMul32 = ((((length - 1) / 32) | 0) + 1) * 32;
    const lengthEncoded = encode('uint256', Nat.fromNumber(length)).data;
    const bytesEncoded = Bytes.padRight(nextMul32, arg);
    return Bytes.concat(lengthEncoded, bytesEncoded);
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type);
    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size);
    }

    return utils.setLengthRight(arg, 32);
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type);
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint<N> width: ' + size);
    }

    num = parseNumber(arg);
    if (num.bitLength() > size) {
      throw new Error(
        'Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength(),
      );
    }

    if (num < 0) {
      throw new Error('Supplied uint is negative');
    }
    // const bytes32 = zeros(size === 256 ? 31 : 32);
    // return Buffer.concat([bytes32, num.toArrayLike(Buffer, 'be')]);
    const buf = '0x' + num.toArrayLike(Buffer, 'be', 32).toString('hex');
    return buf;
  } else if (type.startsWith('int')) {
    size = parseTypeN(type);
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int<N> width: ' + size);
    }

    num = parseNumber(arg);
    if (num.bitLength() > size) {
      throw new Error(
        'Supplied int exceeds width: ' + size + ' vs ' + num.bitLength(),
      );
    }

    const buf = num.toTwos(256).toArrayLike(Buffer, 'be', 32);
    return '0x' + buf.toString('hex');
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type);

    num = parseNumber(arg);

    if (num < 0) {
      throw new Error('Supplied ufixed is negative');
    }

    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))));
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type);

    return encodeSingle(
      'int256',
      parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))),
    );
  }

  throw new Error('Unsupported or invalid type: ' + type);
};

const parseNumber = (arg) => {
  var type = typeof arg;
  if (type === 'string') {
    if (isHexPrefixed(arg)) {
      return new BN(stripHexPrefix(arg), 16);
    } else {
      return new BN(arg, 10);
    }
  } else if (type === 'number') {
    return new BN(arg);
  } else if (arg.toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg;
  } else {
    throw new Error('Argument is not a number');
  }
};

const parseTypeNxM = (type) => {
  var tmp = /^\D+(\d+)x(\d+)$/.exec(type);
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)];
};

// Parse N in type[<N>] where "type" can itself be an array type.
const parseTypeArray = (type) => {
  var tmp = type.match(/(.*)\[(.*?)\]$/);
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }
  return null;
};

// Parse N from type<N>
const parseTypeN = (type) => parseInt(/^\D+(\d+)$/.exec(type)[1], 10);

// Is a type an array?
const isArray = (type) => type.lastIndexOf(']') === type.length - 1;

function isHexPrefixed(str) {
  if (typeof str !== 'string') {
    return false;
  }

  return str.slice(0, 2) === '0x';
}

const stripHexPrefix = (str) => (isHexPrefixed(str) ? str.slice(2) : str);
const zeros = (bytes) => Buffer.allocUnsafe(bytes).fill(0);

const decodeOutput = (outputTypes, outputData) => {
  if (outputTypes.length === 1) {
    const type = get(outputTypes[0], 'type');
    return decodeSingleOutput(type, outputData[0]);
  }
  return reduce(
    outputTypes,
    (obj, data, index) => {
      const key = get(data, 'name') || index.toString();
      const type = get(data, 'type');
      obj[key] = decodeSingleOutput(type, outputData[index]);
      return obj;
    },
    {},
  );
};

const decodeSingleOutput = (outputType, outputData) => {
  if (isEmpty(outputData) || outputData === '0x') {
    return outputData;
  }
  if (isArray(outputType)) {
    const type = replace(outputType, '[]', '');
    const arrayData = split(outputData, ',');
    return map(arrayData, (data) => decodeSingleOutput(type, data));
  }
  if (outputType === 'address') {
    return `0x${replace(outputData, '0x', '')}`;
  }
  if (outputType.startsWith('uint') || outputType.startsWith('int')) {
    return toNumber(outputData);
  }
  if (outputType === 'bool') {
    return outputData == 'true';
  }
  if (outputType.startsWith('byte')) {
    return `0x${replace(outputData, '0x', '')}`;
  }
  return outputData;
};

export { encode, methodData, deployData, decodeOutput, decodeSingleOutput };
