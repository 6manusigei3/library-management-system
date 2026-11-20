-- Add nullable authentication/ISBN data to preserve existing records.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Book" ADD COLUMN "isbn" TEXT;
ALTER TABLE "Book" ADD COLUMN "totalCopies" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Book" ALTER COLUMN "publishedYear" DROP NOT NULL;

CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
