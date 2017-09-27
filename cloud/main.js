require("regenerator-runtime/runtime");

var Express = require('express');
var GraphQLHTTP = require('express-graphql');
var Parse = require('parse/node');
var getRootSchema = require('trolley-smart-backend-graphql').getRootSchema;

Parse.initialize('7fd8e761-e3fd-4348-b876-ea6d071fbe14', 'ox9WktuYlln61YrunDXUBBjc0zbFFoJv'|| 'unused', 'ZBjVnnEBfY39sf57p7M77DSyiIBWwctw');
Parse.serverURL = 'https://parse.buddy.com/parse';

const expressServer = Express();
const schema = getRootSchema();

expressServer.use('/graphql', GraphQLHTTP({schema: schema, graphiql: true}));

expressServer.listen(3000);
