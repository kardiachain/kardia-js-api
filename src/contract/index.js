import Api from '../api';

export default (provider, bytecodes, abi) => {
  let currentByteCode = bytecodes;
  let currentAbi = abi;
  let api = Api(provider);
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
  return {
    updateAbi,
    updateByteCode,
    info
  };
};
