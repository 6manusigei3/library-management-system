# Library Management System

A RESTful library catalog API built with **NestJS 10**, **Prisma ORM 5**, **PostgreSQL**, and **TypeScript**. The backend supports book and genre management, catalog search and pagination, user registration and login, JWT authentication, and librarian-only book management.

## Features

- Full CRUD (Create, Read, Update, Delete) operations for books and genres.
- Book filtering by genre and case-insensitive search across title and author.
- Pagination for book listings.
- DTO-based request validation using `class-validator` and NestJS `ValidationPipe`.
- User registration and login with passwords hashed using bcrypt.
- JWT access tokens for authenticated requests.
- Role-based authorization: only users with the `LIBRARIAN` role can create, update, or delete books.
- Authenticated user profile endpoint.
- Prisma migrations and a repeatable seed script.
- Postman collection covering the API endpoints.

## Technologies

- Node.js 20 or later
- TypeScript
- NestJS 10
- Prisma ORM 5 and Prisma Client
- PostgreSQL
- Passport JWT and `@nestjs/jwt`
- bcrypt
- `class-validator` and `class-transformer`

## Project structure

```text
library-management-system/
├── api/
│   ├── docs/
│   │   └── postman_collection.json
│   ├── prisma/
│   │   ├── migrations/          # Versioned database migrations
│   │   ├── schema.prisma        # Database models and relations
│   │   └── seed.ts              # Sample genres and books
│   ├── src/
│   │   ├── auth/                # Register, login, JWT strategy and role guards
│   │   ├── books/               # Book CRUD, search, pagination and DTOs
│   │   ├── genres/              # Genre CRUD and DTOs
│   │   ├── prisma/              # Shared Prisma service and module
│   │   ├── users/               # User service and authenticated profile
│   │   ├── app.module.ts
│   │   └── main.ts              # Global validation, CORS and app bootstrap
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup and installation

1. Clone the repository and enter the backend directory:

   ```bash
   git clone https://github.com/6manusigei3/library-management-system.git
   cd library-management-system/api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and provide a PostgreSQL connection string and a strong JWT secret:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="replace-with-a-long-random-secret"
   ```

   Use a database that you control. Generate a strong secret, for example with `openssl rand -base64 32`. Keep `.env` private; it is excluded from version control. Never commit database credentials or a real JWT secret.

## Database setup

Apply the checked-in migrations and generate Prisma Client:

```bash
npx prisma migrate deploy
npm run prisma:generate
```

The migrations create the relational schema and add the fields required for authentication and book catalog management. `migrate deploy` applies pending migrations without resetting the database.

To load the sample catalog:

```bash
npm run db:seed
```

The seed script upserts four genres—Fiction, Science Fiction, Fantasy, and Mystery—and twenty sample books. It can be run repeatedly without creating duplicate genre or book records.

## Run the API

Start the development server:

```bash
npm run start:dev
```

The API is available at:

```text
http://localhost:3000
```

The port can be changed using the `PORT` environment variable.

## API endpoints

All request bodies should be sent as JSON with the `Content-Type: application/json` header.

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new patron account | Public |
| POST | `/auth/login` | Verify credentials and issue a JWT access token | Public |

Example registration body:

```json
{
  "name": "Library User",
  "email": "reader@example.com",
  "password": "change-this-password"
}
```

Example login body:

```json
{
  "email": "reader@example.com",
  "password": "change-this-password"
}
```

A successful login returns an `access_token` and safe user details. The password is hashed with bcrypt before it is stored; password hashes are not returned by the authentication endpoints.

For protected endpoints, send the token in the HTTP authorization header:

```text
Authorization: Bearer <access_token>
```

New registrations receive the `PATRON` role by default. A librarian account must be assigned the `LIBRARIAN` role through an authorized administrative/database operation. Existing accounts created before password authentication was added have no password hash and must have credentials provisioned before they can log in.

### Users

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/users/profile` | Return the authenticated user's profile | Authenticated user |

### Genres

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/genres` | Create a genre | Public |
| GET | `/genres` | List all genres | Public |
| GET | `/genres/:id` | Get one genre by ID | Public |
| PATCH | `/genres/:id` | Update a genre | Public |
| DELETE | `/genres/:id` | Delete a genre | Public |

Genre create and update requests accept a `name` field. Genre names must be non-empty strings and are limited to 100 characters. A genre cannot be deleted while books are still associated with it.

### Books

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/books` | Create a book | LIBRARIAN |
| GET | `/books` | List, filter, search and paginate books | Public |
| GET | `/books/:id` | Get one book by ID | Public |
| PATCH | `/books/:id` | Update a book | LIBRARIAN |
| DELETE | `/books/:id` | Delete a book | LIBRARIAN |

Book create and update DTOs validate the book fields, including `title`, `author`, `isbn`, `totalCopies`, and `genreId`. The create DTO also accepts `publishedYear`. ISBN values are unique when supplied, and `totalCopies` defaults to 1 when omitted.

#### Book listing query parameters

The `GET /books` endpoint supports:

| Parameter | Description | Example |
|---|---|---|
| `genreId` | Filter books by genre ID | `genreId=clxgenre123` |
| `search` | Case-insensitive search in title and author | `search=tolkien` |
| `page` | Page number, starting at 1 | `page=1` |
| `limit` | Number of results per page (maximum 100) | `limit=10` |

Example:

```http
GET /books?genreId=<genre-id>&search=tolkien&page=1&limit=10
```

The response contains the current page of books and pagination metadata:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## Validation and security

- A global NestJS `ValidationPipe` validates DTOs and strips properties that are not included in the DTO (`whitelist: true`).
- CORS is enabled in the application bootstrap.
- Passwords are hashed with bcrypt; plaintext passwords are not stored.
- JWTs are verified using the `JWT_SECRET` environment variable.
- `JwtAuthGuard` protects authenticated routes.
- `RolesGuard` and the `@Roles()` decorator restrict book create, update, and delete operations to the `LIBRARIAN` role.
- Book catalog read endpoints and genre endpoints are public in the current implementation.

## Postman collection

Import `api/docs/postman_collection.json` into Postman. The collection includes requests for registration, login, user profile, all genre endpoints, and all book endpoints.

The collection defines these variables:

- `base_url`: defaults to `http://localhost:3000`.
- `jwt_token`: populated by the login request when a token is returned.
- `user_id`, `genre_id`, and `book_id`: used by requests that operate on individual records.

Run registration and login first. To test book creation, updating, and deletion, use a token belonging to a user with the `LIBRARIAN` role.

## Useful development commands

Run these commands from the `api` directory:

| Command | Purpose |
|---|---|
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Compile the application |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run db:seed` | Seed the sample catalog |

## Schema Decisions

1. **Relational database design:** PostgreSQL stores users, genres, books, and reviews in separate related tables. This keeps structured data consistent and supports relational queries.
2. **Book–Genre relationship:** Each book stores a `genreId` foreign key referencing a genre. One genre can be associated with many books, while each book belongs to one genre.
3. **Referential integrity:** Foreign-key constraints prevent books from referencing nonexistent genres and reviews from referencing nonexistent books or users. A genre with associated books cannot be deleted.
4. **Reduced data duplication:** Genre names are stored once in the Genre table instead of being repeated in every Book record. Updating a genre therefore does not require updating each associated book.
5. **Prisma relations:** Prisma's `@relation(fields: [genreId], references: [id])` connects the Book foreign-key field to the Genre primary key. The `Genre.books` field represents the inverse one-to-many relation.
6. **Unique constraints:** User email and genre name are unique. Book ISBN is unique when present, and the combination of book title and author is also unique.
7. **Reviews:** Reviews are related to both a user and a book. A user can submit at most one review per book, and the database constrains review ratings to the range 1–5.

A relational model stores related entities in separate tables and connects them with keys. A document database may instead embed related data within a document. For this catalog, the relational approach avoids repeating genre information and supports consistent updates and referential integrity.
