import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog = {
  Fiction: [
    ['Pride and Prejudice', 'Jane Austen', 1813],
    ['To Kill a Mockingbird', 'Harper Lee', 1960],
    ['The Great Gatsby', 'F. Scott Fitzgerald', 1925],
    ['Beloved', 'Toni Morrison', 1987],
    ['Things Fall Apart', 'Chinua Achebe', 1958],
  ],
  'Science Fiction': [
    ['Dune', 'Frank Herbert', 1965],
    ['Foundation', 'Isaac Asimov', 1951],
    ['The Left Hand of Darkness', 'Ursula K. Le Guin', 1969],
    ['Kindred', 'Octavia E. Butler', 1979],
    ['The Martian', 'Andy Weir', 2011],
  ],
  Fantasy: [
    ['The Hobbit', 'J.R.R. Tolkien', 1937],
    ['A Wizard of Earthsea', 'Ursula K. Le Guin', 1968],
    ['The Name of the Wind', 'Patrick Rothfuss', 2007],
    ['The Fifth Season', 'N.K. Jemisin', 2015],
    ['The Lion, the Witch and the Wardrobe', 'C.S. Lewis', 1950],
  ],
  Mystery: [
    ['And Then There Were None', 'Agatha Christie', 1939],
    ['The Big Sleep', 'Raymond Chandler', 1939],
    ['The Hound of the Baskervilles', 'Arthur Conan Doyle', 1902],
    ['The Maltese Falcon', 'Dashiell Hammett', 1930],
    ['The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005],
  ],
} as const;

async function main(): Promise<void> {
  let bookCount = 0;

  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const [title, author, publishedYear] of books) {
      await prisma.book.upsert({
        where: { title_author: { title, author } },
        update: { publishedYear, genreId: genre.id },
        create: { title, author, publishedYear, genreId: genre.id },
      });
      bookCount += 1;
    }
  }

  const [genreTotal, bookTotal] = await Promise.all([
    prisma.genre.count(),
    prisma.book.count(),
  ]);
  console.log(
    `Seed complete: ${genreTotal} genres and ${bookTotal} books available (${Object.keys(catalog).length} genres and ${bookCount} catalog books processed).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
