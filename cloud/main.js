require("regenerator-runtime/runtime");

var Express = require('express');
var GraphQLHTTP = require('express-graphql');
var Parse = require('parse/node');
var getRootSchema = require('trolley-smart-backend-graphql').getRootSchema;

Parse.initialize('50a47f7f-411a-4abb-8c50-3daabac420eb', 'w2GaCmTc2U7QwjbR3NGA1cg0UTjvbSYE' || 'unused', 'p35twdsjRGwe7vo2S1L654i2r5dcAT0C');
Parse.serverURL = 'https://parse.buddy.com/parse';

const expressServer = Express();
const schema = getRootSchema();

expressServer.use('/graphql', GraphQLHTTP({schema: schema, graphiql: true}));

expressServer.listen(3000);
