import 'regenerator-runtime/runtime';
import { Map } from 'immutable';
import Express from 'express';
import GraphQLHTTP from 'express-graphql';
import Parse from 'parse/node';
import { ParseWrapperService, UserService } from 'micro-business-parse-server-common';
import { getRootSchema } from 'trolley-smart-backend-graphql';
import { ShoppingListService, StapleTemplateItemService } from 'trolley-smart-parse-server-common';

const applicationId = '50a47f7f-411a-4abb-8c50-3daabac420eb';
const javascriptKey = 'w2GaCmTc2U7QwjbR3NGA1cg0UTjvbSYE';
const masterKey = 'p35twdsjRGwe7vo2S1L654i2r5dcAT0C';

Parse.initialize(applicationId, javascriptKey || 'unused', masterKey);
Parse.serverURL = 'https://parse.buddy.com/parse';

const expressServer = Express();
const schema = getRootSchema();

expressServer.use('/graphql', GraphQLHTTP({
  schema,
  graphiql: true,
}));

const addDefaultShoppingList = async user =>
  new ShoppingListService().create(Map({ name: 'My List', user, status: 'A' }), ParseWrapperService.createACL(user));

const onAfterSaveUser = async (request) => {
  if (request.object.createdAt !== request.object.updatedAt) {
    return;
  }

  const user = await UserService.getUserById(request.object.objectId);

  await Promise.all([new StapleTemplateItemService().cloneStapleTemplateItems(user), addDefaultShoppingList(user)]);
};

expressServer.use('/afterSaveUser', (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    onAfterSaveUser(JSON.parse(body)).then(() => {
      res.writeHead(200);
      res.end();
    }).catch((error) => {
      throw new Error(error);
    });
  });
});

expressServer.listen(3000);
