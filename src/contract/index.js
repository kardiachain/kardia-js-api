import { find, replace, get, map } from 'lodash';
import abiJs from 'ethereumjs-abi';
import { deployData, methodData, decodeOutput } from '../common/lib/abi';
import { fromPrivate } from '../common/lib/account';
import { txGenerator, sign, toHex, isHexStrict } from '../common';
import Api from '../api';

const findFunctionFromAbi = (abi, type = 'function', name = '') => {
  if (type !== 'constructor') {
    return find(abi, (item) => item.type === type && item.name === name);
  }
  return find(abi, (item) => item.type === type);
};

const encodeArray = (params) =>
  map(params, (param) => {
    if (isHexStrict(param)) {
      return param;
    } else {
      return toHex(param);
    }
  });

const deployContract = (provider, bytecode = '0x', abi = [], params) => {
  const constructorAbi = findFunctionFromAbi(abi, 'constructor');
  const decorBycode = '0x' + replace(bytecode, '0x', '');
  const paramsDecorate = map(params, (param) => {
    if (Array.isArray(param)) {
      return encodeArray(param);
    } else if (isHexStrict(param)) {
      return param;
    } else {
      return toHex(param);
    }
  });
  const data = deployData(decorBycode, constructorAbi, paramsDecorate);
  return {
    txData: () => data,
    send: async (privateKey, txPayload = {}) => {
      const api = Api(provider);
      const senderAccount = fromPrivate(privateKey);
      const accountNonce = await api.accountNonce(senderAccount.address);
      //TODO call estimate gas if need
      const gas = '0xff';
      const gasPrice = '0xff';
      const tx = txGenerator(
        '0x',
        get(txPayload, 'amount', 0),
        get(txPayload, 'nonce', accountNonce),
        get(txPayload, 'gasPrice', gasPrice),
        get(txPayload, 'gas', gas),
        data,
      );
      const signedTx = sign(tx, privateKey);
      const result = await api.sendSignedTransaction(
        signedTx.rawTransaction,
        true,
      );
      console.log(result);
      return result;
    },
  };
};

const invokeContract = (provider, abi, name, params) => {
  const functionFromAbi = findFunctionFromAbi(abi, 'function', name);
  const paramsDecorate = map(params, (param) => {
    if (Array.isArray(param)) {
      return encodeArray(param);
    } else if (isHexStrict(param)) {
      return param;
    } else {
      return toHex(param);
    }
  });
  const data = methodData(functionFromAbi, paramsDecorate);
  return {
    txData: () => data,
    send: async (privateKey, contractAddress, txPayload = {}) => {
      const api = Api(provider);
      const senderAccount = fromPrivate(privateKey);
      const accountNonce = await api.accountNonce(senderAccount.address);
      //TODO call estimate gas if need
      const gas = 5000;
      const gasPrice = '0xff';
      const tx = txGenerator(
        contractAddress,
        get(txPayload, 'amount', 0),
        get(txPayload, 'nonce', accountNonce),
        get(txPayload, 'gasPrice', gasPrice),
        get(txPayload, 'gas', gas),
        data,
      );
      const signedTx = sign(tx, privateKey);
      const result = await api.sendSignedTransaction(
        signedTx.rawTransaction,
        true,
      );
      return result;
    },
    call: async (sender, contractAddress, txPayload = {}) => {
      const api = Api(provider);
      const callObject = {
        from: sender,
        to: contractAddress,
        data: data,
        value: get(txPayload, 'amount', 0),
        gasPrice: get(txPayload, 'gasPrice', 0),
        gas: get(txPayload, 'gas', 0),
      };
      const result = await api.callSmartContract(callObject);
      const outputTypes = functionFromAbi.outputs.map((output) => output.type);
      const outputBuffer = new Buffer(result.replace('0x', ''), 'hex');
      const decodeResult = abiJs.rawDecode(outputTypes, outputBuffer);
      const rawOutput = decodeResult.map((decode) => decode.toString());
      return decodeOutput(outputTypes, rawOutput);
    },
  };
};

export default (provider, bytecodes, abi) => {
  let currentByteCode = bytecodes;
  let currentAbi = abi;
  let currentProvider = provider;
  const updateAbi = (abi) => {
    currentAbi = abi;
  };
  const updateByteCode = (bytecodes) => {
    currentByteCode = bytecodes;
  };
  const info = () => ({
    provider: {
      version: provider.version,
      baseLink: provider.baseLink,
    },
    byteCode: currentByteCode,
    abi: currentAbi,
  });
  const deploy = (params) =>
    deployContract(currentProvider, currentByteCode, currentAbi, params);
  const invoke = ({ params, name }) =>
    invokeContract(currentProvider, currentAbi, name, params);
  return {
    updateAbi,
    updateByteCode,
    info,
    deploy,
    invoke,
  };
};
