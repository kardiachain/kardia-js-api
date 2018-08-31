'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toMasterKey = exports.checksum = exports.create = undefined;

var _hash = require('./hash');

var _bytes = require('./bytes');

var _bytes2 = _interopRequireDefault(_bytes);

var _desubits = require('./desubits');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Bytes -> Bytes
var bytesAddChecksum = function bytesAddChecksum(bytes) {
  var hash = (0, _hash.keccak256)(bytes);
  var sum = _bytes2.default.slice(0, 1, hash);
  return _bytes2.default.concat(bytes, sum);
};

// Bytes -> Bool
var bytesChecksum = function bytesChecksum(bytes) {
  var length = _bytes2.default.length(bytes);
  var prefix = _bytes2.default.slice(0, length - 1, bytes);
  return bytesAddChecksum(prefix) === bytes;
};

// () ~> Passphrase
var create = function create() {
  var bytes = bytesAddChecksum(_bytes2.default.random(11));
  var seed = (0, _desubits.fromBytes)(bytes);
  var passphrase = seed.replace(/([a-z]{8})/g, '$1 ');
  return passphrase;
};

// Passphrase -> Bytes
var toBytes = function toBytes(passphrase) {
  var seed = passphrase.replace(/ /g, '');
  var bytes = (0, _desubits.toBytes)(passphrase);
  return bytes;
};

// Passphrase -> Bool
var checksum = function checksum(passphrase) {
  return bytesChecksum(toBytes(passphrase));
};

// Passphrase -> Bytes
var toMasterKey = function toMasterKey(passphrase) {
  var hash = _hash.keccak256;
  var bytes = toBytes(passphrase);
  for (var i = 0, l = Math.pow(2, 12); i < l; ++i) {
    bytes = hash(bytes);
  }return bytes;
};

exports.create = create;
exports.checksum = checksum;
exports.toMasterKey = toMasterKey;