# Welcome to Kardia Javascript API

---

Javascript library to interact with Kardia Chain.

## Development

### Source

- Source at `src` folder

### Test

- This project is using [jest framework](https://jestjs.io/)
- Run test: `npm run jest` or `yarn jest`
- Run test in watch mode: `yarn run jest:watch`

### Coding standard

- [es6](http://es6-features.org/)
- Check syntax using eslint
- Strongly recommend using [prettier](https://github.com/prettier/prettier) tool for auto format code

### Release guideline

1.  Make sure pass all test case
2.  `yarn run build` to create es5 version to support node and older browser. For more detail check [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-build-fails-to-minify)
3.  Pump version by npm version https://docs.npmjs.com/cli/version
4.  Create pull request and wait for review and chain ready.
5.  Release via npm after merged into master. Contact Kardia team to get release account.

### Version guideline

- Syntax: https://docs.npmjs.com/cli/version
- Rule:
  - `Prerelease`: Development version
  - `Patch`: Improvement, bug fixing, P2, P3 features
  - `Minor`: alpha testnet version (version 1), beta testnet version (version 2)
  - `Major`: Launch main net or big refactor.

## Install

### npm

```bash
  npm install kardia-tool
```

### yarn

```bash
  yarn add kardia-tool
```

## Usage

### es2015/nodejs

```js
var KardiaTool = require('kardia-tool');
var kardiaTool = KardiaTool('http://<host>:port');
// common function
var common = kardiaTool.common;
//api request
var api = kardiaTool.api;
//promise call
api
  .clientVerion()
  .then(result => console.log('result', result))
  .catch(err => console.log('err'));
```

### es6

```js
import KardiaTool from 'kardia-tool';
const kardiaTool = KardiaTool('http://<host>:port');
// common function
const common = kardiaTool.common;
//api request
var api = kardiaTool.api;
//async await call
try {
  const result = await api.clientVerion();
  console.log(result);
} catch (err) {
  console.log('err', err.message);
}
```
