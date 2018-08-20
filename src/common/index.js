import { decode, encode } from './lib/rlp';
import { fromNat } from './lib/bytes';
import { keccak256 } from './lib/hash';
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
  console.log(account);
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
    data: tx.data
  };

  var rlpEncoded = encode([
    fromNat(transaction.nonce),
    fromNat(transaction.gasPrice),
    fromNat(transaction.gas),
    transaction.to.toLowerCase(),
    fromNat(transaction.value),
    fromNat('0x1'),
    transaction.data
  ]);
  var hash = keccak256(rlpEncoded);
  // var signature = makeSigner(27)(Hash.keccak256(rlpEncoded), privateKey);
  const signature = signLib(hash, privateKey);
  const decodeSign = decodeSignature(signature);

  var rawTx = decode(rlpEncoded)
    .slice(0, 7)
    .concat(decodeSign);
  rawTx[7] = makeEven(trimLeadingZero(decodeSign[1]));
  rawTx[8] = makeEven(trimLeadingZero(decodeSign[2]));
  rawTx[9] = makeEven(trimLeadingZero(decodeSign[0]));
  // console.log(rawTx);

  var rawTransaction = encode(rawTx);

  var values = decode(rawTransaction);
  console.log(hash);
  const result = {
    messageHash: hash,
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    v: trimLeadingZero(values[9]),
    rawTransaction: rawTransaction
  };
  console.log(result);
  return result;
};

const recoverTx = rawTx => {
  var values = decode(rawTx);
  var signature = encodeSignature([values[9], values[7], values[8]]);
  var signingData = values.slice(0, 7);
  var signingDataHex = encode(signingData);
  return recover(keccak256(signingDataHex), signature);
};

const txGenerator = (receiver, amount, nonce = '0x0') => ({
  nonce: nonce,
  to: receiver,
  gasPrice: '0xff',
  gas: '0xff',
  value: amount,
  data: '0x'
});

export { sign, recoverTx, txGenerator };
