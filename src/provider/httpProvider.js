import axios from 'axios';

const isMock = true;

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const verion = '0.0.1';

const getApiPath = apiName => '/api/v1/';

const getMockData = apiName => ({
  data: 'mock'
});

export default urlLink => {
  let baseLink = urlLink;
  const updateBaseLink = urlLink => {
    baseLink = urlLink;
  };
  const request = async (payload, apiName) => {
    const config = { ...payload, url: `${urlLink}${getApiPath(apiName)}` };
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
