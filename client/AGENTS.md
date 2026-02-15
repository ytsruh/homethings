# Agent Guidelines for HomeThings Client

This document provides guidance for AI agents working on this codebase.

## Project Overview

- **Framework**: React Router 7 (file-based routing / framework mode)
- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives + class-variance-authority)
- **Code Quality**: Biome linter/formatter

## Build Commands

```bash
# Development
bun run dev              # Start dev server (react-router dev)

# Build
bun run build            # Production build (react-router build)
bun run start            # Build and serve production build

# Type Checking
bun run typecheck        # Run TypeScript typegen + tsc --noEmit

# Linting & Formatting
bunx biome check .        # Run Biome linter
bunx biome check --write .  # Fix auto-fixable issues
bunx biome format .      # Format code
```

## Code Style

### Formatting
- Run `bunx biome format --write .` before committing

### TypeScript
- **Strict mode**: Always enabled
- **Type annotations**: Prefer explicit types for function parameters/returns
- **Avoid `any`**: Use `unknown` if truly unknown
- **Path aliases**: Use `~/*` instead of relative paths

```typescript
import type { Note } from "~/types";

interface NoteListProps {
  notes: Note[];
  onSelect: (id: string) => void;
}

export function NoteList({ notes, onSelect }: NoteListProps): JSX.Element {
  return <ul>{notes.map((note) => (
    <li key={note.id} onClick={() => onSelect(note.id)}>{note.title}</li>
  ))}</ul>;
}
```

### Tailwind CSS
- Use Tailwind v4 syntax
- Use `cn()` utility for conditional classes

```typescript
import { cn } from "~/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "outline" && "outline-classes"
)} />
```

### Error Handling
- Use try/catch for async operations
- Display errors via toast notifications (use `sonner`)
- Log errors to console (they are automatically stripped in production)

```typescript
try {
  const data = await fetchNote(id);
  setNote(data);
} catch (error) {
  console.error("Failed to fetch note:", error);
  toast.error("Failed to load note.");
}
```

### API Integration
- Define TypeScript interfaces for API responses
- Use Zod for runtime validation
- See `FRONTEND_DEV_GUIDE.md` for API patterns

## Project Structure

```
app/
├── components/       # React components (ui/ for shadcn)
├── hooks/            # Custom React hooks
├── lib/              # Utilities (utils.ts, api.ts)
├── posts/            # Blog/markdown content
├── routes/           # React Router routes
├── root.tsx          # Root layout
├── routes.ts         # Route definitions
└── styles.css        # Global styles
```

## Working with React Router 7

- Routes defined in `app/routes.ts` (or file-based in `app/routes/`)
- Use `+types/` auto-generated types for loader/action data
- Use `clientLoader` and `clientAction` for data access


## Before Submitting Changes

1. Run `bun run typecheck` to verify TypeScript
2. Run `bunx biome check --write .` to fix lint issues
3. Run `bun run build` to verify production build works

## Important Notes

- Do NOT add new dependencies without approval
- Do NOT modify biome.json or tsconfig.json without approval
- Always verify changes work with `bun run dev`
- Check `FRONTEND_DEV_GUIDE.md` for API patterns
