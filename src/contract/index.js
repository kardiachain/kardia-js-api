import { find, replace, get } from 'lodash';
import { deployData, methodData } from '../common/lib/abi';
import { fromPrivate } from '../common/lib/account';
import { txGenerator, sign } from '../common';
import Api from '../api';

const findFunctionFromAbi = (abi, type = 'function', name = '') => {
  if (type !== 'constructor') {
    return find(abi, item => item.type === type && type.name === name);
  }
  return find(abi, item => item.type === type);
};

const deployContract = (provider, bytecode = '0x', abi = [], params) => {
  const constructorAbi = findFunctionFromAbi(abi, 'constructor');
  const decorBycode = '0x' + replace(bytecode, '0x', '');
  const data = deployData(bytecode, constructorAbi, params);
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
        null,
        get(txPayload, 'amount', 0),
        get(txPayload, 'nonce', accountNonce),
        get(txPayload, 'gasPrice', gasPrice),
        get(txPayload, 'gas', gas),
        data
      );
      const signedTx = sign(tx, privateKey);
      api.sendSignedTransaction(signedTx.rawTransaction);
    }
  };
};

const invokeContract = (provider, abi, name, params) => {
  const functionFromAbi = findFunctionFromAbi(abi, 'function', name);
  const data = methodData(functionFromAbi, params);
  return {
    txData: () => data,
    send: async (privateKey, contractAddress, txPayload = {}) => {
      const api = Api(provider);
      const senderAccount = fromPrivate(privateKey);
      const accountNonce = await api.accountNonce(senderAccount.address);
      //TODO call estimate gas if need
      const gas = '0xff';
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
      api.sendSignedTransaction(signedTx.rawTransaction);
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
