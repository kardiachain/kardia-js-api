import { keccak256 } from './hash';
import Bytes from './bytes';
import { fromBytes, toBytes as desubitsToBytes } from './desubits';

// Bytes -> Bytes
const bytesAddChecksum = bytes => {
  const hash = keccak256(bytes);
  const sum = Bytes.slice(0, 1, hash);
  return Bytes.concat(bytes, sum);
};

// Bytes -> Bool
const bytesChecksum = bytes => {
  const length = Bytes.length(bytes);
  const prefix = Bytes.slice(0, length - 1, bytes);
  return bytesAddChecksum(prefix) === bytes;
};

// () ~> Passphrase
const create = () => {
  const bytes = bytesAddChecksum(Bytes.random(11));
  const seed = fromBytes(bytes);
  const passphrase = seed.replace(/([a-z]{8})/g, '$1 ');
  return passphrase;
};

// Passphrase -> Bytes
const toBytes = passphrase => {
  const seed = passphrase.replace(/ /g, '');
  const bytes = desubitsToBytes(passphrase);
  return bytes;
};

// Passphrase -> Bool
const checksum = passphrase => bytesChecksum(toBytes(passphrase));

// Passphrase -> Bytes
const toMasterKey = passphrase => {
  let hash = keccak256;
  let bytes = toBytes(passphrase);
  for (let i = 0, l = Math.pow(2, 12); i < l; ++i) bytes = hash(bytes);
  return bytes;
};

export { create, checksum, toMasterKey };
