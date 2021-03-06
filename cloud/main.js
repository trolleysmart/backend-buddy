require('regenerator-runtime/runtime');

const Express = require('express');
const GraphQLHTTP = require('express-graphql');
const cors = require('cors');
const Parse = require('parse/node');
const { UserService } = require('@microbusiness/parse-server-common');
const { createConfigLoader, createUserLoaderBySessionToken } = require('@microbusiness/parse-server-common');
const { StapleTemplateItemService } = require('@trolleysmart/parse-server-common');
const {
  createUserDefaultShoppingListLoader,
  getRootSchema,
  storeLoaderById,
  storeLoaderByKey,
  tagLoaderByKey,
  tagLoaderById,
} = require('@trolleysmart/backend-graphql');

const applicationId = '50a47f7f-411a-4abb-8c50-3daabac420eb';
const javascriptKey = 'w2GaCmTc2U7QwjbR3NGA1cg0UTjvbSYE';
const masterKey = 'p35twdsjRGwe7vo2S1L654i2r5dcAT0C';

Parse.initialize(applicationId, javascriptKey || 'unused', masterKey);
Parse.serverURL = 'https://parse.buddy.com/parse';

const expressServer = Express();
const schema = getRootSchema();

expressServer.use(cors());
expressServer.use('/graphql', (request, response) => {
  const configLoader = createConfigLoader();
  const userLoaderBySessionToken = createUserLoaderBySessionToken();
  const userDefaultShoppingListLoader = createUserDefaultShoppingListLoader();

  return GraphQLHTTP({
    schema,
    graphiql: true,
    context: {
      request,
      sessionToken: request.headers.authorization,
      dataLoaders: {
        configLoader,
        userLoaderBySessionToken,
        userDefaultShoppingListLoader,
        storeLoaderById,
        storeLoaderByKey,
        tagLoaderByKey,
        tagLoaderById,
      },
    },
  })(request, response);
});

expressServer.use('/afterSaveUser', (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const request = JSON.parse(body);

    if (request.object.createdAt !== request.object.updatedAt) {
      res.writeHead(200);
      res.end();

      return;
    }

    UserService.getUserById(request.object.objectId)
      .then(user => new StapleTemplateItemService().cloneStapleTemplateItems(user))
      .then(() => {
        res.writeHead(200);
        res.end();
      }).catch((error) => {
        throw new Error(error);
      });
  });
});

expressServer.use('/afterSaveStore', () => {
  storeLoaderByKey.clearAll();
  storeLoaderById.clearAll();
});

expressServer.use('/afterSaveTag', () => {
  tagLoaderByKey.clearAll();
  tagLoaderById.clearAll();
});

expressServer.listen(3000);
