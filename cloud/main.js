'use strict';

require('regenerator-runtime/runtime');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _trolleySmartBackendGraphql = require('trolley-smart-backend-graphql');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var applicationId = '50a47f7f-411a-4abb-8c50-3daabac420eb';
var javascriptKey = 'w2GaCmTc2U7QwjbR3NGA1cg0UTjvbSYE';
var masterKey = 'p35twdsjRGwe7vo2S1L654i2r5dcAT0C';

_node2.default.initialize(applicationId, javascriptKey || 'unused', masterKey);
_node2.default.serverURL = 'https://parse.buddy.com/parse';

var expressServer = (0, _express2.default)();
var schema = (0, _trolleySmartBackendGraphql.getRootSchema)();

expressServer.use('/graphql', (0, _expressGraphql2.default)({
  schema: schema,
  graphiql: true
}));

expressServer.use('/afterSaveUser', function (req, res) {
  var body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    var request = JSON.parse(body);

    if (request.object.createdAt === request.object.updatedAt) {
      _microBusinessParseServerCommon.UserService.getUserById(request.object.objectId).then(function (user) {
        return new _trolleySmartParseServerCommon.StapleTemplateItemService().cloneStapleTemplateItems(user);
      }).then(function () {
        res.writeHead(200);
        res.end();
      }).catch(function (error) {
        throw new Error(error);
      });
    } else {
      res.writeHead(200);
      res.end();
    }
  });
});

expressServer.listen(3000);