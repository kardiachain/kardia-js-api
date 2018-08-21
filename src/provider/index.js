import httpProvider from './httpProvider';

export default url => {
  const re = new RegExp('^(http|https)://', 'i');
  if (re.test(url)) {
    return httpProvider(url);
  }
  throw new Error('Not support provider');
};
