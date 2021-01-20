const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

//write all queries inside this function
async function main() {
  const newLink = await prisma.link.create({
    data: {
      description: 'Fullstack tutorial for GraphQL',
      url: 'www.howtographql.com',
    },
  });

  const allLinks = await prisma.link.findMany();
  console.log(allLinks);
}

//call main function
main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
