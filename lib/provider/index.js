'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _httpProvider = require('./httpProvider');

var _httpProvider2 = _interopRequireDefault(_httpProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (url) {
  var re = new RegExp('^(http|https)://', 'i');
  if (re.test(url)) {
    return (0, _httpProvider2.default)(url);
  }
  throw new Error('Not support provider');
};