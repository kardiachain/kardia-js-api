import { get, flow, isNumber } from 'lodash/fp';
import { hexToNumber, numberToHex } from '../common';

const always = value => value;
const defaultMethod = async (provider, methodName, customFormat = always) => {
  const payload = {
    method: methodName
  };
  const result = await provider.request(payload);
  return parseResult(result, customFormat);
};

const getBlockNumber = async (blockNumber, fullBlock = true) => {
  const blockNumberHash = isNumber(blockNumber)
    ? numberToHex(blockNumber)
    : blockNumber;
  const payload = {
    method: 'eth_getBlockByNumber',
    params: [blockNumberHash, fullBlock]
  };
  const result = await provider.request(payload);
  return parseResult(result, always);
};

const parseResult = (result, customFormat) => {
  console.log(customFormat(get('data.result', result)));
  if (get('data.result', result)) {
    return flow(
      get('data.result'),
      customFormat
    )(result);
  } else {
    throw new Error(result);
  }
};

export default provider => {
  return {
    clientVerion: () => defaultMethod(provider, 'web3_clientVersion'),
    coinBase: () => defaultMethod(provider, 'kai_coinbase'),
    isProposer: () => defaultMethod(provider, 'kai_proposer'),
    perCount: () => defaultMethod(provider, 'net_peerCount', hexToNumber),
    votingPower: () => defaultMethod(provider, 'kai_voting_power', hexToNumber),
    blockNumber: () => defaultMethod(provider, 'kai_blockNumber', hexToNumber),
    blockByNumber: (blockNum, fullBlock = true) =>
      getBlockNumber(blockNumfullBlock)
  };
};
