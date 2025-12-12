require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const { typeDefs, resolvers } = require('./schema');
const { getUserFromToken } = require('./auth');

async function startServer() {
  const app = express();
  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await getUserFromToken(req);
      return { user };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  app.listen(process.env.PORT, () =>
    console.log(`Server running at http://localhost:${process.env.PORT}/graphql`)
  );
}

startServer();
