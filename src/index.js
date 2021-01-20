const { ApolloServer } = require('apollo-server');

//defines GraphQL schema
//defines simple query with one field called info
const typeDefs = `
  type Query {
    info: String!
  }
`;

//resolver is the actual implementation of the GraphQL schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
  },
};

//bundled in the ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
