# Welcome to kardiaTool

---

Javascript to interact with Kardia Chain.

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
