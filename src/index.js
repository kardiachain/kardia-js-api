import * as common from './common';
import provider from './provider';
import Api from './api';

export default url => ({
  provider: provider(url),
  api: Api(provider(url)),
  common: common
});
