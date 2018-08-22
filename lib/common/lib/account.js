'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeSignature = exports.encodeSignature = exports.recover = exports.makeSigner = exports.sign = exports.fromPrivate = exports.toChecksum = exports.create = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _bytes = require('./bytes');

var _bytes2 = _interopRequireDefault(_bytes);

var _nat = require('./nat');

var _elliptic = require('elliptic');

var _elliptic2 = _interopRequireDefault(_elliptic);

var _hash = require('./hash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var secp256k1 = new _elliptic2.default.ec('secp256k1'); // eslint-disable-line

var create = function create(entropy) {
  var innerHex = (0, _hash.keccak256)(_bytes2.default.concat(_bytes2.default.random(32), entropy || _bytes2.default.random(32)));
  var middleHex = _bytes2.default.concat(_bytes2.default.concat(_bytes2.default.random(32), innerHex), _bytes2.default.random(32));
  var outerHex = (0, _hash.keccak256)(middleHex);
  return fromPrivate(outerHex);
};

var toChecksum = function toChecksum(address) {
  var addressHash = (0, _hash.keccak256s)(address.slice(2));
  var checksumAddress = '0x';
  for (var i = 0; i < 40; i++) {
    checksumAddress += parseInt(addressHash[i + 2], 16) > 7 ? address[i + 2].toUpperCase() : address[i + 2];
  }return checksumAddress;
};

var fromPrivate = function fromPrivate(privateKey) {
  var buffer = new Buffer(privateKey.slice(2), 'hex');
  var ecKey = secp256k1.keyFromPrivate(buffer);
  var publicKey = '0x' + ecKey.getPublic(false, 'hex').slice(2);
  var publicHash = (0, _hash.keccak256)(publicKey);
  var address = toChecksum('0x' + publicHash.slice(-40));
  return {
    address: address,
    privateKey: privateKey
  };
};

var encodeSignature = function encodeSignature(_ref) {
  var _ref2 = _slicedToArray(_ref, 3),
      v = _ref2[0],
      r = _ref2[1],
      s = _ref2[2];

  return _bytes2.default.flatten([r, s, v]);
};

var decodeSignature = function decodeSignature(hex) {
  return [_bytes2.default.slice(64, _bytes2.default.length(hex), hex), _bytes2.default.slice(0, 32, hex), _bytes2.default.slice(32, 64, hex)];
};

var makeSigner = function makeSigner(addToV) {
  return function (hash, privateKey) {
    var signature = secp256k1.keyFromPrivate(new Buffer(privateKey.slice(2), 'hex')).sign(new Buffer(hash.slice(2), 'hex'), { canonical: true });
    return encodeSignature([(0, _nat.fromString)(_bytes2.default.fromNumber(addToV + signature.recoveryParam)), _bytes2.default.pad(32, _bytes2.default.fromNat('0x' + signature.r.toString(16))), _bytes2.default.pad(32, _bytes2.default.fromNat('0x' + signature.s.toString(16)))]);
  };
};

var sign = makeSigner(27); // v=27|28 instead of 0|1...

var recover = function recover(hash, signature) {
  var vals = decodeSignature(signature);
  var vrs = {
    v: _bytes2.default.toNumber(vals[0]),
    r: vals[1].slice(2),
    s: vals[2].slice(2)
  };
  var ecPublicKey = secp256k1.recoverPubKey(new Buffer(hash.slice(2), 'hex'), vrs, vrs.v < 2 ? vrs.v : 1 - vrs.v % 2); // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
  var publicKey = '0x' + ecPublicKey.encode('hex', false).slice(2);
  var publicHash = (0, _hash.keccak256)(publicKey);
  var address = toChecksum('0x' + publicHash.slice(-40));
  return address;
};

exports.create = create;
exports.toChecksum = toChecksum;
exports.fromPrivate = fromPrivate;
exports.sign = sign;
exports.makeSigner = makeSigner;
exports.recover = recover;
exports.encodeSignature = encodeSignature;
exports.decodeSignature = decodeSignature;