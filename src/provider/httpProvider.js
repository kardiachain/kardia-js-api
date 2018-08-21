import axios from 'axios';

const isMock = true;

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const version = '0.0.1';

export const getApiPath = (apiName, urlLink) => `${urlLink}/api/v1/${apiName}`;

const getMockData = apiName => ({
  data: 'mock'
});

export default urlLink => {
  let baseLink = urlLink;
  const updateBaseLink = urlLink => {
    baseLink = urlLink;
  };
  const request = async (payload, apiName) => {
    const config = { ...payload, url: getApiPath(apiName, urlLink) };
    if (isMock) {
      await sleep(1000);
      return getMockData(apiName);
    }
    return await axios(config);
  };
  return {
    version,
    request,
    updateBaseLink
  };
};
