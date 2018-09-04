import { find, replace, get, map } from 'lodash';
import { deployData, methodData } from '../common/lib/abi';
import { fromPrivate } from '../common/lib/account';
import { txGenerator, sign, toHex, isHexStrict } from '../common';
import Api from '../api';

const findFunctionFromAbi = (abi, type = 'function', name = '') => {
  if (type !== 'constructor') {
    return find(abi, item => item.type === type && item.name === name);
  }
  return find(abi, item => item.type === type);
};

const deployContract = (provider, bytecode = '0x', abi = [], params) => {
  const constructorAbi = findFunctionFromAbi(abi, 'constructor');
  const decorBycode = '0x' + replace(bytecode, '0x', '');
  const paramsDecorate = map(params, param => {
    if (isHexStrict(param)) {
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
        data
      );
      const signedTx = sign(tx, privateKey);
      const result = await api.sendSignedTransaction(signedTx.rawTransaction);
      console.log(result);
      return result;
    }
  };
};

const invokeContract = (provider, abi, name, params) => {
  const functionFromAbi = findFunctionFromAbi(abi, 'function', name);
  console.log(abi);
  const data = methodData(functionFromAbi, params);
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
        data
      );
      const signedTx = sign(tx, privateKey);
      const result = await api.sendSignedTransaction(signedTx.rawTransaction);
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
        gas: get(txPayload, 'gas', 0)
      };
      const result = await api.callSmartContract(callObject);
      return result;
    }
  };
};

export default (provider, bytecodes, abi) => {
  let currentByteCode = bytecodes;
  let currentAbi = abi;
  let currentProvider = provider;
  const updateAbi = abi => {
    currentAbi = abi;
  };
  const updateByteCode = bytecodes => {
    currentByteCode = bytecodes;
  };
  const info = () => ({
    provider: {
      version: provider.version,
      baseLink: provider.baseLink
    },
    byteCode: currentByteCode,
    abi: currentAbi
  });
  const deploy = params =>
    deployContract(currentProvider, currentByteCode, currentAbi, params);
  const invoke = ({ params, name }) =>
    invokeContract(currentProvider, currentAbi, name, params);
  return {
    updateAbi,
    updateByteCode,
    info,
    deploy,
    invoke
  };
};
