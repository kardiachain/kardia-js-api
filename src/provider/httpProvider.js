import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const isMock = false;

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const version = '0.0.1';

const getConfigPayload = (payload, id) => ({
  jsonrpc: '2.0',
  id,
  ...payload
});

const getMockData = apiName => ({
  data: 'mock'
});

export default urlLink => {
  let id = 1;
  let baseLink = urlLink;
  const updateBaseLink = urlLink => {
    baseLink = urlLink;
  };
  const request = async (payload, requestId) => {
    const config = getConfigPayload(payload, requestId || id);
    if (isMock) {
      await sleep(1000);
      return getMockData(apiName);
    }
    id++;
    return await axios.post(urlLink, { ...config });
  };
  return {
    version,
    request,
    updateBaseLink,
    type: 'httpProvider',
    baseLink
  };
};
