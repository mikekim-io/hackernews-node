const { PrismaClient } = require('@prisma/client');
const { ApolloServer } = require('apollo-server');
const { getUserId } = require('./utils');
const fs = require('fs');
const path = require('path');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Link = require('./resolvers/Link');
const Subscription = require('./resolvers/Subscription');
const Vote = require('./resolvers/Vote');
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();

// require('dotenv').config();

//defines GraphQL schema, now located in schema.graphql
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

//dummy data for links
// let links = [
//   {
//     id: 'link-0',
//     url: 'www.howtographql.com',
//     description: 'Fullstack tutorial for GraphQL',
//   },
// ];
// let idCount = links.length;

//resolver is the actual implementation of the GraphQL schema
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
  // Query: {
  //   info: () => `This is the API of a Hackernews Clone`,
  //   feed
  // },
  // //create a new post that creates a new link
  // Mutation: {
  //   //post a link
  //   post: (parent, args, context, info) => {
  //     const newLink = context.prisma.link.create({
  //       data: {
  //         description: args.description,
  //         url: args.url,
  //       },
  //     });
  //     return newLink;
  //   },
  // },
  // //create resolver for all fields in link
  // Link: {
  //   id: (parent) => parent.id,
  //   description: (parent) => parent.description,
  //   url: (parent) => parent.url,
  // },
};

//save an instance of PrismaClient to a variable and add context
const prisma = new PrismaClient();

//bundled in the ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    };
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));

/* You’re now using the getUserId function to retrieve the ID of the User. This ID is stored in the JWT that’s set at the Authorization header of the incoming HTTP request. Therefore, you know which User is creating the Link here. Recall that an unsuccessful retrieval of the userId will lead to an exception and the function scope is exited before the createLink mutation is invoked. In that case, the GraphQL response will just contain an error indicating that the user was not authenticated. */
