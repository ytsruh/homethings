# Homethings Development Guide

This monorepo contains a personal homelab with a React frontend and Bun/Hono backend.

## Project Structure

```
/client          # React Router frontend (React 19, TypeScript, Tailwind v4)
/server          # Bun/Hono backend (TypeScript, Drizzle ORM, SQLite)
```

## Build Commands

### Client (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Build and serve production build |
| `npm run typecheck` | Run TypeScript type checking |

### Server (`cd server`)

| Command | Description |
|---------|-------------|
| `bun --hot src/index.ts` | Start dev server with hot reload |
| `bun src/index.ts` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio |

### Running a Single Test

No test framework is currently configured in this project.

## Environment Variables

Create a `.env` file in `/server`:

```bash
# Required
OPENROUTER_API_KEY=your_key_here

# Optional (with defaults)
PORT=3000
DATABASE_URL=file:./local.db
```

## Code Style

### Tooling

- **Linter/Formatter**: Biome (v2.2.2 client, v2.3.12 server)
- **TypeScript**: Strict mode enabled
- **Indentation**: Tabs
- **Quotes**: Double quotes for JavaScript/TypeScript

### Running the Linter

```bash
# Client
cd client && npm run lint  # Not configured - use biome directly
cd client && npx biome check .

# Server
cd server && npm run lint
cd server && npm run lint:fix
```

### TypeScript Conventions

- Always use explicit types for function parameters and return types
- Use `type` for simple type aliases, `interface` for objects
- Use Zod for runtime validation (especially API inputs)

### Naming Conventions

- **Files**: kebab-case (`notes.ts`, `my-component.tsx`)
- **Components**: PascalCase (`NotesList.tsx`)
- **Functions**: camelCase (`getNotes`, `createNote`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Types/Interfaces**: PascalCase (`Note`, `UserPayload`)

### Import Conventions

```typescript
// Standard library
import { Hono } from "hono";
import { useState } from "react";

// Third-party
import { z } from "zod";
import { toast } from "sonner";

// Relative imports (server)
import { database } from "~/db";
import { notes } from "~/db/schema";
import { throwNotFound } from "~/middleware/http-exception";

// Relative imports (client)
import { Badge } from "~/components/ui/badge";
import { createNote, type Note } from "~/lib/notes";
```

- Use `~` alias for project-relative imports (configured in tsconfig)
- Group imports: standard library → third-party → relative
- Alphabetize within groups

### Error Handling

**Server (Hono)**:
```typescript
// Use helper functions for common errors
import { throwNotFound, throwServerError } from "~/middleware/http-exception";

// 404
if (!note) {
  throwNotFound("Note not found");
  return;
}

// 500
if (!created) {
  throwServerError();
  return;
}
```

**Client (React)**:
```typescript
try {
  const result = await apiCall();
} catch (error) {
  console.error("Failed to fetch:", error);
  toast.error("Failed to fetch data");
}
```

### Database (Drizzle ORM)

- Define schemas in `server/src/db/schema.ts`
- Use `drizzle-orm` for queries
- Run migrations with `npm run db:generate` then `npm run db:migrate`
- Use SQLite for local development

### React Patterns

- Use React Router loaders for data fetching
- Use `useLoaderData` for accessing loader data
- Use `sonner` for toast notifications
- Use React Router actions for data sending (non GET Requests)
- Use Radix UI primitives for accessible components
- Use Tailwind CSS for styling (v4)

### API Design (Hono)

```typescript
// Route with validation
notesRoutes.post(
  "/notes",
  createValidator(CreateNoteRequestSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    // ...
    return c.json(createdNote);
  }
);

// Route with query params
notesRoutes.get(
  "/notes",
  createValidator(ListNotesQuerySchema, "query"),
  async (c) => {
    const query = c.req.valid("query");
    // ...
  }
);
```

### Component Structure

```typescript
// Functional component with props
export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onClick}>Click</button>
    </div>
  );
}

// Types in same file or adjacent .types.ts file
type MyComponentProps = {
  title: string;
  onClick: () => void;
};
```

## Additional Notes

- No test framework is currently set up
- Database is SQLite/Turso
- API documentation available at `/docs` when server is running
- OpenAPI spec available at `/openapi.json`
