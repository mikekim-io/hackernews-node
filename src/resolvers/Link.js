function postedBy(parent, args, context) {
  return context.prisma.link
    .findUnique({ where: { id: parent.id } })
    .postedBy();
}

/* In the postedBy resolver, you’re first fetching the Link from the database using the prisma instance and then invoke postedBy on it. Notice that the resolver needs to be called postedBy because it resolves the postedBy field from the Link type in schema.graphql. */

module.exports = { postedBy };
