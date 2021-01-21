const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

async function signup(parent, args, context, info) {
  //1 encrypt password using bcryptjs
  const password = await bcrypt.hash(args.password, 10);
  //2 use prisma context to store new user in db
  const user = await context.prisma.user.create({
    data: { ...args, password },
  });
  //3 generate json web token, signed with APP_SECRET (jwt library)
  const token = jwt.sign({ userId: user.id }, APP_SECRET);
  //4 authpayload object returns token and user
  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {
  //1 retrive one user matching email
  //if no user found, throw error
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error('No such user found');
  }
  //2 compare password stored in system with argument password
  //if not a match, throw error
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  //3 authpayload for the valid user with token
  return {
    token,
    user,
  };
}

async function post(parent, args, context, info) {
  const { userId } = context;

  const newLink = await context.prisma.link.create({
    data: {
      description: args.description,
      url: args.url,
      postedBy: { connect: { id: userId } },
    },
  });
  //implement subscription of "NEW_LINK" event, returns the newLink to subscriber
  context.pubsub.publish('NEW_LINK', newLink);
  //returns newLink to publisher
  return newLink;
}
/* Using userId to connect the Link to be created with the User who is creating it. This is happening through a nested write. */

async function vote(parent, args, context, info) {
  //1 validate incoming jwt with getUserId - will throw exception if not valid
  const userId = getUserId(context);
  //2 no double voting - if already exists, returns error message : already voted
  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId,
      },
    },
  });
  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  //3 create new a vote, connecting User and Link
  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    },
  });
  context.pubsub.publish('NEW_VOTE', newVote);

  return newVote;
}

module.exports = {
  signup,
  login,
  post,
  vote,
};
