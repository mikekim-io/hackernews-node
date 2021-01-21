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

  return await context.prisma.link.create({
    data: {
      description: args.description,
      url: args.url,
      postedBy: { connect: { id: userId } },
    },
  });
}
/* Using userId to connect the Link to be created with the User who is creating it. This is happening through a nested write. */

module.exports = {
  signup,
  login,
  post,
};
