import { decode, encode } from './lib/rlp';
import { fromNat } from './lib/bytes';
import { keccak256 } from './lib/hash';
import { create } from './lib/account';
import { isHexStrict, toHex } from './lib/utils';
import {
  fromPrivate,
  sign as signLib,
  encodeSignature,
  recover,
  decodeSignature
} from './lib/account';

const makeEven = hex => {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
};

const trimLeadingZero = hex => {
  while (hex && hex.startsWith('0x0')) {
    hex = '0x' + hex.slice(3);
  }
  return hex;
};

const sign = (
  tx,
  privateKey = '0xf7a3c3b95c4235d7afcf9cc19fafb8ce14c536f5dfac76dc285c7d8f2a376875'
) => {
  const account = fromPrivate(privateKey);
  if (!tx.gas) {
    throw new Error('"gas" is missing');
  }

  if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0) {
    throw new Error('Gas, gasPrice, nonce is lower than 0');
  }

  const transaction = {
    nonce: tx.nonce,
    gasPrice: tx.gasPrice,
    gas: tx.gas,
    to: '0x' + tx.to.toLowerCase().replace('0x', ''),
    value: tx.value,
    data: '0x' + tx.data.toLowerCase().replace('0x', '')
  };

  var rlpEncoded = encode([
    fromNat(transaction.nonce),
    fromNat(transaction.gasPrice),
    fromNat(transaction.gas),
    transaction.to.toLowerCase(),
    fromNat(transaction.value),
    transaction.data
  ]);
  var hash = keccak256(rlpEncoded);
  // var signature = makeSigner(27)(Hash.keccak256(rlpEncoded), privateKey);
  const signature = signLib(hash, privateKey);
  const decodeSign = decodeSignature(signature);

  var rawTx = decode(rlpEncoded).concat(decodeSign);
  rawTx[6] = makeEven(trimLeadingZero(decodeSign[0]));
  rawTx[7] = makeEven(trimLeadingZero(decodeSign[1]));
  rawTx[8] = makeEven(trimLeadingZero(decodeSign[2]));
  // console.log(rawTx);

  var rawTransaction = encode(rawTx);

  var values = decode(rawTransaction);
  const result = {
    messageHash: hash,
    v: trimLeadingZero(values[6]),
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    rawTransaction: rawTransaction
  };
  return result;
};

const recoverTx = rawTx => {
  var values = decode(rawTx);
  var signature = encodeSignature([values[6], values[7], values[8]]);
  var signingData = values.slice(0, 6);
  var signingDataHex = encode(signingData);
  return recover(keccak256(signingDataHex), signature);
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
const txGenerator = (
  receiver = '0x',
  amount,
  nonce = '0x0',
  gasPrice = '0xff',
  gas = '0xff',
  data = '0x'
) => ({
  nonce: isHexStrict(nonce) ? nonce : toHex(nonce),
  to: receiver,
  gasPrice: isHexStrict(gasPrice) ? gasPrice : toHex(gasPrice),
  gas: isHexStrict(gas) ? gas : toHex(gas),
  value: isHexStrict(amount) ? amount : toHex(amount),
  data: data
});

const createAccount = create;

export { sign, recoverTx, txGenerator, createAccount };
export {
  isBN,
  toBN,
  isAddress,
  isHexStrict,
  utf8ToHex,
  hexToUtf8,
  hexToNumber,
  hexToNumberString,
  numberToHex,
  toHex
} from './lib/utils';
