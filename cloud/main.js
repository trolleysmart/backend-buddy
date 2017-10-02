'use strict';

require('regenerator-runtime/runtime');

var _immutable = require('immutable');

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var addDefaultShoppingList = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(user) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new _trolleySmartParseServerCommon.ShoppingListService().create((0, _immutable.Map)({ name: 'My List', user: user, status: 'A' }), _microBusinessParseServerCommon.ParseWrapperService.createACL(user)));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function addDefaultShoppingList(_x) {
    return _ref.apply(this, arguments);
  };
}();

var onAfterSaveUser = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(request) {
    var user;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(request.object.createdAt !== request.object.updatedAt)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return');

          case 2:
            _context2.next = 4;
            return _microBusinessParseServerCommon.UserService.getUserById(request.object.objectId);

          case 4:
            user = _context2.sent;
            _context2.next = 7;
            return Promise.all([new _trolleySmartParseServerCommon.StapleTemplateItemService().cloneStapleTemplateItems(user), addDefaultShoppingList(user)]);

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function onAfterSaveUser(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

expressServer.use('/afterSaveUser', function (req, res) {
  var body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    onAfterSaveUser(JSON.parse(body)).then(function () {
      res.writeHead(200);
      res.end();
    }).catch(function (error) {
      throw new Error(error);
    });
  });
});

expressServer.listen(3000);