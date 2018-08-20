import Nat from './nat';
import Map from './map';
import Bytes from './bytes';
import { keccak256s } from './hash';

const _slicedToArray = (() => {
  const sliceIterator = (arr, i) => {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  };
  return (arr, i) => {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      );
    }
  };
})();

export default provider => {
  var send = method => () => {
    for (
      var _len = arguments.length, params = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      params[_key] = arguments[_key];
    }

    return new Promise((resolve, reject) => {
      return provider.send(method, params, (err, result) => {
        return err ? reject(err) : resolve(result);
      });
    });
  };

  // TODO check inputs
  // TODO move to proper file
  var encodeABI = (type, value) => {
    if (type === 'bytes') {
      var length = Bytes.length(value);
      var nextMul32 = ((((length - 1) / 32) | 0) + 1) * 32;
      var lengthEncoded = encodeABI('uint256', Nat.fromNumber(length)).data;
      var bytesEncoded = Bytes.padRight(nextMul32, value);
      return { data: Bytes.concat(lengthEncoded, bytesEncoded), dynamic: true };
    } else if (type === 'uint256' || type === 'bytes32' || type === 'address') {
      return { data: Bytes.pad(32, value), dynamic: false };
    } else {
      throw "Eth-lib can't encode ABI type " + type + ' yet.';
    }
  };

  var sendTransaction = send('eth_sendTransaction');
  var sendRawTransaction = send('eth_sendRawTransaction');
  var getTransactionReceipt = send('eth_getTransactionReceipt');
  var compileSolidity = send('eth_compileSolidity');
  var call = send('eth_call');
  var getBalance = send('eth_getBalance');
  var accounts = send('eth_accounts');

  var removeEmptyTo = tx =>
    tx.to === '' || tx.to === '0x' ? Map.remove('to')(tx) : tx;

  var waitTransactionReceipt = getTransactionReceipt; // TODO: implement correctly

  var addTransactionDefaults = async tx => {
    var baseDefaults = [
      tx.chainId || send('net_version')(),
      tx.gasPrice || send('eth_gasPrice')(),
      tx.nonce || send('eth_getTransactionCount')(tx.from, 'latest'),
      tx.value || '0x0',
      tx.data || '0x'
    ];

    var _ref = await Promise.all(baseDefaults),
      _ref2 = _slicedToArray(_ref, 5),
      chainIdNum = _ref2[0],
      gasPrice = _ref2[1],
      nonce = _ref2[2],
      value = _ref2[3],
      data = _ref2[4];

    var chainId = Nat.fromNumber(chainIdNum);
    var from = tx.from;
    var to = tx.to === '' || tx.to === '0x' ? null : tx.to;
    var gas = tx.gas
      ? tx.gas
      : Nat.div(
          Nat.mul(
            await send('eth_estimateGas')({
              from: tx.from,
              to: tx.to,
              value: tx.value,
              nonce: tx.nonce,
              data: tx.data
            }),
            '0x6'
          ),
          '0x5'
        );

    return {
      chainId: chainId,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      gasPrice: gasPrice,
      gas: gas,
      nonce: nonce,
      value: value,
      data: data.toLowerCase()
    };
  };

  var sendTransactionWithDefaults = async tx =>
    sendTransaction(removeEmptyTo(await addTransactionDefaults(tx)));

  var callWithDefaults = (tx, block) =>
    addTransactionDefaults(tx).then(tx =>
      call(removeEmptyTo(tx), block || 'latest')
    );

  var callMethodData = method => () => {
    for (
      var _len2 = arguments.length, params = Array(_len2), _key2 = 0;
      _key2 < _len2;
      _key2++
    ) {
      params[_key2] = arguments[_key2];
    }

    var methodSig =
      method.name +
      '(' +
      method.inputs
        .map(i => {
          return i.type;
        })
        .join(',') +
      ')';
    var methodHash = keccak256s(methodSig).slice(0, 10);
    var encodedParams = params.map((param, i) => {
      return encodeABI(method.inputs[i].type, param);
    });
    var headBlock = '0x';
    var dataBlock = '0x';
    for (var i = 0; i < encodedParams.length; ++i) {
      if (encodedParams[i].dynamic) {
        var dataLoc = encodedParams.length * 32 + Bytes.length(dataBlock);
        headBlock = Bytes.concat(
          headBlock,
          Bytes.pad(32, Nat.fromNumber(dataLoc))
        );
        dataBlock = Bytes.concat(dataBlock, encodedParams[i].data);
      } else {
        headBlock = Bytes.concat(headBlock, encodedParams[i].data);
      }
    }
    return Bytes.flatten([methodHash, headBlock, dataBlock]);
  };

  // Address, Address, ContractInterface -> Contract
  var contract = (from, address, contractInterface) => {
    var contract = {};
    contract._address = address;
    contract._from = from;
    contract.broadcast = {};
    contractInterface.forEach(method => {
      if (method && method.name) {
        var _call = (type, value) => {
          return () => {
            var transaction = {
              from: from,
              to: address,
              value: value,
              data: callMethodData(method).apply(undefined, arguments)
            };
            return type === 'data'
              ? Promise.resolve(transaction)
              : method.constant
                ? callWithDefaults(transaction)
                : sendTransactionWithDefaults(transaction).then(
                    type === 'receipt'
                      ? waitTransactionReceipt
                      : x => {
                          return x;
                        }
                  );
          };
        };
        contract[method.name] = _call('receipt', '0x0');
        if (!method.constant) {
          contract[method.name + '_data'] = _call('data', '0x0');
          contract[method.name + '_pay'] = value => {
            return () => {
              return _call('receipt', value).apply(undefined, arguments);
            };
          };
          contract[method.name + '_pay_txHash'] = value => {
            return () => {
              return _call('txHash', value).apply(undefined, arguments);
            };
          };
          contract[method.name + '_txHash'] = _call('txHash', '0x0');
        }
      }
    });
    return contract;
  };

  // Address, Bytecode -> TxHash
  var deployBytecode_txHash = (from, code) =>
    sendTransactionWithDefaults({ from: from, data: code, to: '' });

  // Address, Bytecode -> Receipt
  var deployBytecode = (from, code) =>
    deployBytecode_txHash(from, code).then(waitTransactionReceipt);

  // Address, Bytecode, ContractInterface
  var deployBytecodeContract = (from, code, contractInterface) =>
    deployBytecode(from, code).then(receipt =>
      contract(from, receipt.contractAddress, contractInterface)
    );

  // Address, String, Address -> Contract
  var solidityContract = (from, source, at) =>
    compileSolidity(source).then(_ref3 => {
      var abiDefinition = _ref3.info.abiDefinition;
      return contract(from, at, abiDefinition);
    });

  // Address, String -> TxHash
  var deploySolidity_txHash = (from, source) =>
    compileSolidity(source).then(_ref4 => {
      var code = _ref4.code;
      return deployBytecode_txHash(from, code);
    });

  // Address, String -> Receipt
  var deploySolidity = (from, source) =>
    deploySolidity_txHash(from, source).then(waitTransactionReceipt);

  // Address, String -> Contract
  var deploySolidityContract = (from, source) =>
    compileSolidity(source).then(_ref5 => {
      var code = _ref5.code,
        abiDefinition = _ref5.info.abiDefinition;
      return deployBytecodeContract(from, code, abiDefinition);
    });

  return {
    send: send,

    sendTransaction: sendTransaction,
    sendRawTransaction: sendRawTransaction,
    getTransactionReceipt: getTransactionReceipt,
    call: call,
    getBalance: getBalance,
    accounts: accounts,

    waitTransactionReceipt: waitTransactionReceipt,
    addTransactionDefaults: addTransactionDefaults,
    sendTransactionWithDefaults: sendTransactionWithDefaults,
    callWithDefaults: callWithDefaults,
    callMethodData: callMethodData,

    contract: contract,
    deployBytecode_txHash: deployBytecode_txHash,
    deployBytecode: deployBytecode,
    deployBytecodeContract: deployBytecodeContract,

    compileSolidity: compileSolidity,
    solidityContract: solidityContract,
    deploySolidity_txHash: deploySolidity_txHash,
    deploySolidity: deploySolidity,
    deploySolidityContract: deploySolidityContract
  };
};
