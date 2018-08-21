import * as common from './common';
import provider from './provider';

export default url => ({
  provider: provider(url),
  common: common
});
