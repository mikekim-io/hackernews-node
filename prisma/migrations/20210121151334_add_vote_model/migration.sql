-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote.linkId_userId_unique" ON "Vote"("linkId", "userId");

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
