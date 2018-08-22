import { get, flow, isNumber } from 'lodash/fp';
import { hexToNumber, numberToHex } from '../common';

const always = value => value;
const defaultMethod = async (
  provider,
  methodName,
  customFormat = always,
  params = []
) => {
  const payload = {
    method: methodName,
    params
  };
  const result = await provider.request(payload);
  return parseResult(result, customFormat);
};

const getBlockNumber = async (provider, blockNumber, fullTxs = false) => {
  const blockNumberHash = isNumber(blockNumber)
    ? numberToHex(blockNumber)
    : blockNumber;
  const payload = {
    method: 'kai_getBlockByNumber',
    params: [blockNumberHash, fullTxs]
  };
  const result = await provider.request(payload);
  return parseResult(result, always);
};

const getBlockByHash = async (provider, blockHash, fullTxs = false) => {
  const payload = {
    method: 'kai_getBlockByHash',
    params: [blockHash, fullTxs]
  };
  const result = await provider.request(payload);
  return parseResult(result, always);
};

const parseResult = (result, customFormat) => {
  if (get('data.result', result)) {
    return flow(
      get('data.result'),
      customFormat
    )(result);
  } else {
    throw new Error(result);
  }
};

const sendSignedTx = async (
  provider,
  rawTx,
  waitUntilMine = false,
  timeout = 30000
) => {
  const txHash = defaultMethod(provider, 'kai_sendRawTransaction', always, [
    rawTx
  ]);
  if (waitUntilMine === false) {
    return txHash;
  }

  const breakTimeout = Date.now() + timeout;
  while (Date.now < breakTimeout) {
    const receipt = await defaultMethod(
      provider,
      'kai_getTransactionReceipt',
      always,
      [rawTx]
    );
    if (receipt) {
      return receipt;
    } else {
      await sleep(1000);
    }
  }
  throw new Error(`Timeout: cannot get receipt after ${timeout}ms`);
};

export default provider => {
  return {
    clientVerion: () => defaultMethod(provider, 'web3_clientVersion'),
    coinBase: () => defaultMethod(provider, 'kai_coinbase'),
    isProposer: () => defaultMethod(provider, 'kai_proposer'),
    perCount: () => defaultMethod(provider, 'net_peerCount', hexToNumber),
    votingPower: () => defaultMethod(provider, 'kai_votingPower', hexToNumber),
    blockNumber: () => defaultMethod(provider, 'kai_blockNumber', hexToNumber),
    blockByNumber: (blockNum, fullTxs = false) =>
      getBlockNumber(provider, blockNumfullBlock, fullTxs),
    blockByHash: () => (blockHash, fullTxs = false) =>
      getBlockByHash(provider, blockHash, fullTxs),
    transactionCount: (address, blockParam = 'latest') =>
      defaultMethod(provider, 'kai_getTransactionCount', hexToNumber, [
        address,
        blockParam
      ]),
    sendSignedTransaction: (rawTx, waitUntilMine = false, timeout) =>
      sendSignedTx(provider, rawTx, (waitUntilMine = false), timeout),
    transactionReceipt: txHash =>
      defaultMethod(provider, 'kai_getTransactionReceipt', always, [txHash]),
    balance: (address, blockParam = 'latest') =>
      defaultMethod(provider, 'kai_getBalance', hexToNumber, [
        address,
        blockParam
      ])
  };
};
