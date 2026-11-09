# Library Management System

A university assignment data layer for a library catalog, built with NestJS, Prisma, and PostgreSQL. It models users and roles, genres, books, and optional user reviews. Books reference genres through a relational foreign key.

## Technologies

- Node.js and TypeScript
- NestJS 10
- Prisma ORM 5
- PostgreSQL

## Project structure

```text
.
├── api/
│   ├── prisma/
│   │   ├── migrations/       # Versioned database schema
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── books/            # Book data access service
│   │   ├── genres/           # Genre data access service
│   │   ├── prisma/           # Shared Prisma client module and service
│   │   ├── users/            # User data access service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
└── README.md
```

## Installation

Use Node.js 20 or later. From the `api` directory, install dependencies:

```bash
cd api
npm install
```

## Environment configuration

Copy `api/.env.example` to `api/.env` and replace the placeholders with connection details for a PostgreSQL database you control:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Keep `.env` private; it is excluded by `.gitignore`. Do not commit credentials.

## Prisma migrations

With `DATABASE_URL` configured and the PostgreSQL server reachable, create/apply the initial development migration:

```bash
cd api
npx prisma migrate dev --name init
```

The checked-in initial migration is at `api/prisma/migrations/20261109000000_init/migration.sql`. To apply existing migrations in a deployment environment, use `npx prisma migrate deploy` from `api`.

## Database seeding

Once the schema is migrated, seed or refresh the sample catalog:

```bash
cd api
npm run db:seed
```

The seed script safely upserts four genres and twenty books, with five books assigned to each genre. Running it more than once does not create duplicate catalog rows.

## Run the application

After setting the environment and applying the migration:

```bash
cd api
npm run start:dev
```

The NestJS app listens on port 3000 by default (or the `PORT` environment variable). The data layer exposes injectable `BooksService`, `GenresService`, and `UsersService` classes. No HTTP controllers are included because this assignment focuses on the data layer.

Useful local checks:

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run build
```

## Schema Decisions

1. **PostgreSQL uses relational tables** to store users, genres, books, and reviews as structured records that can be queried and joined consistently.
2. **Book references Genre using `genreId`**, a scalar foreign key, so each book has one clear genre while the genre can be associated with many books.
3. **Foreign keys maintain referential integrity** by preventing books from pointing to nonexistent genres and reviews from pointing to nonexistent books or users.
4. **Storing genre data separately avoids duplication**: a genre name and its metadata are stored once and can be updated without changing every book row.
5. **Prisma represents relationships using `@relation`**. On `Book`, `@relation(fields: [genreId], references: [id])` connects the foreign-key scalar to the related `Genre`; the `Genre.books` field provides the inverse collection.

Prisma relational modeling stores related entities in separate tables and connects them with keys. A document database commonly embeds related data inside a document, which can make repeated genre data simpler to read but harder to update consistently.

The optional `Review` model relates each review to a user and book, allows one review per user per book, and constrains ratings to 1–5 in the initial SQL migration.
