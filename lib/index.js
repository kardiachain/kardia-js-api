'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _contract = require('./contract');

var _contract2 = _interopRequireDefault(_contract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function (url) {
  return {
    provider: (0, _provider2.default)(url),
    api: (0, _api2.default)((0, _provider2.default)(url)),
    common: common,
    contract: _contract2.default
  };
};