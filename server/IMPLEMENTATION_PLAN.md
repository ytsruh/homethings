# Homethings API Server - Implementation Plan

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **API Framework** | ElysiaJS | Fast, type-safe routes |
| **Validation** | Zod | Schema validation with Elysia integration |
| **API Docs** | Scalar UI (dev only) | Modern, beautiful API documentation at `/docs` |
| **Database** | SQLite (local/Turso) | Primary data store for notes, comments, feedback |
| **ORM** | Drizzle | Type-safe database queries with migrations |
| **File Storage** | Cloudflare R2 | S3-compatible object storage via Bun's native S3 support |
| **Authentication** | BetterAuth | Email/password with session management |
| **AI Chat** | 4 providers | Streaming responses (OpenAI, Google, Anthropic, X AI) |
| **Deployment** | Railway | Docker container with environment variables |

---

## Project Structure

```
server/
├── src/
│   ├── index.ts                    # Main Elysia app + Scalar UI
│   ├── db/
│   │   ├── index.ts                # Turso connection
│   │   └── schema.ts              # Database schema (notes, comments, feedback)
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── notes.ts                # Notes CRUD (with R2 file upload)
│   │   ├── comments.ts             # Comments on notes
│   │   ├── attachments.ts           # Attachment management (ownership verified)
│   │   ├── feedback.ts             # Feedback
│   │   └── chat.ts                # AI chat streaming
│   ├── storage/
│   │   └── r2.ts                 # R2 S3 client using Bun's native support + presigned URLs
│   ├── auth/
│   │   └── config.ts              # BetterAuth configuration
│   ├── middleware/
│   │   ├── error.ts               # Global error handler
│   │   └── auth.ts                # Auth middleware with specific error messages
│   └── types.ts                 # Shared TypeScript types
├── drizzle.config.ts              # Drizzle kit configuration + local SQLite URL
├── package.json
├── tsconfig.json
├── Dockerfile                     # Railway deployment
└── .env.example
```

---

## Database Schema

### Tables

**users** (BetterAuth creates this)
- Extended with: avatar, showChat, showNotes, showTasks

**notes** - Main entity
```typescript
{
  id: string (primary key)
  title: string (not null)
  body: string (optional)
  priority: enum('low', 'medium', 'high', 'urgent') (default: medium)
  completed: boolean (default: false)
  createdBy: string (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**note_attachments** - File metadata (Normalized approach - Option B)
```typescript
{
  id: string (primary key)
  noteId: string (FK → notes.id, on delete: cascade)
  fileKey: string (not null) - R2 object key ONLY (no public URL)
  fileName: string (not null) - Original filename
  fileType: string (not null) - MIME type
  fileSize: number (not null) - File size in bytes
  createdAt: timestamp
}
```

**notes_comments** - Comments on notes
```typescript
{
  id: string (primary key)
  comment: string (not null)
  noteId: string (FK → notes.id, on delete: cascade)
  createdAt: timestamp
}
```

**feedback** - User feedback
```typescript
{
  id: string (primary key)
  title: string (not null)
  body: string (not null)
  createdBy: string (FK → users.id)
  createdAt: timestamp
}
```

---

## File Upload Configuration

**Allowed File Types:**
- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- PDFs: `application/pdf`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

**File Size Limit:**
- Maximum: 10MB per file
- Multiple files supported in single upload

**R2 Storage Strategy:**
- Uploads: Server-side via Bun's native S3 support (no presigned URL needed)
- Downloads: Presigned URLs (1-hour expiration, Content-Type restricted)
- Storage Path: `uploads/{userId}/{timestamp}-{uuid}.{ext}`

---

## R2 Storage Flow

### Upload Flow (Client → Server → R2)
```
1. Client sends multipart/form-data with files
2. Elysia validates file types (images, PDF, Excel, PPT, Docs)
3. Elysia validates file size (max 10MB)
4. Server uploads to R2 using Bun's native S3 support
5. Server stores fileKey (not fileUrl) in note_attachments table
6. Server returns note with attachment metadata (without URLs)
```

### Download Flow (Client → R2 via Presigned URL)
```
1. Client requests note details from API
2. Server generates presigned URLs for all attachments (1-hour expiry)
3. Client uses presigned URLs to download directly from R2
4. OR Client requests fresh presigned URL via /presigned endpoint
```

### Delete Flow (Client → Server → R2)
```
1. Client requests attachment deletion
2. Server verifies note ownership (first check)
3. Server verifies attachment belongs to note (second check)
4. Server deletes from R2 using S3 credentials
5. Server deletes from database
6. Note updatedAt NOT updated (per requirement)
```

---

## API Endpoints

### Authentication (BetterAuth)
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login with email/password
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Notes
- `GET /api/notes` - List notes (filter by completed, includes presigned URLs for attachments)
- `GET /api/notes/:id` - Get single note with presigned URLs
- `POST /api/notes` - Create note (with multiple file uploads)
- `PATCH /api/notes/:id` - Update note (add files, update fields)
- `DELETE /api/notes/:id` - Delete note (cleanup R2 files, no note updatedAt update)
- `PATCH /api/notes/:id/complete` - Toggle completion

### Attachments
- `DELETE /api/notes/:noteId/attachments/:attachmentId` - Delete single attachment (verifies note ownership first)
- `GET /api/notes/:noteId/attachments/:attachmentId/presigned` - Generate fresh presigned URL

### Comments
- `POST /api/notes/:noteId/comments` - Create comment
- `DELETE /api/notes/:noteId/comments/:commentId` - Delete comment

### Feedback
- `POST /api/feedback` - Submit feedback

### Chat
- `POST /api/chat` - Stream AI responses

### Documentation (Dev Only, Auth Required)
- `GET /docs` - Scalar UI (returns 404 in production)
- `GET /json` - OpenAPI specification (public for client SDKs)

---

## Environment Variables

```env
# Database
TURSO_DATABASE_URL=file:local.db  # For local SQLite
# TURSO_DATABASE_URL=libsql://your-database.turso.io  # For Turso production
TURSO_AUTH_TOKEN=your-turso-auth-token  # Only needed for Turso

# BetterAuth
BETTER_AUTH_SECRET=your-random-secret-key-min-32-chars
BETTER_AUTH_URL=https://your-domain.com
COOKIE_DOMAIN=.your-domain.com  # For cross-domain cookies

# Cloudflare R2 Storage
CF_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=homethings-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Client (for CORS)
CLIENT_URL=http://localhost:3000

# AI API Keys
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...

# Server
PORT=3000
NODE_ENV=development  # CRITICAL: Set to 'production' to hide /docs endpoint
```

---

## Key Implementation Decisions

### Storage Strategy (Option B: Normalized)
- **Choice**: Separate `note_attachments` table for metadata
- **Benefits**:
  - Better query performance (JOINs vs JSON parsing)
  - Easier to manage attachments (add/remove individually)
  - Clear metadata tracking (file type, size, name)
  - Supports better file lifecycle management
  - Database enforces referential integrity

### File Upload Strategy
- **Multiple Uploads**: Supported in single request
- **Server-side Upload**: Direct to R2 (no presigned URL needed for upload)
- **Download**: Presigned URLs (1-hour expiration)
- **No Public URLs**: Store only `fileKey` in database (not public URL)

### Documentation Access
- **Development**: `/docs` available, requires valid session
- **Production**: `/docs` returns 404 immediately (no auth check)
- **Theme**: Scalar UI 'kepler' theme (default)

### Authentication Error Handling
- **Specific Error Messages**:
  - `MISSING_TOKEN`: Authorization token required
  - `INVALID_SESSION`: Invalid or expired session token
  - `INVALID_TOKEN`: Invalid session token
  - `TOKEN_EXPIRED`: Session token has expired. Please sign in again.
  - `INTERNAL_ERROR`: Authentication error. Please try again later.

### Attachment Deletion Behavior
- **Ownership Verification**: Verify note ownership before allowing attachment deletion
- **Note Update**: Attachment deletion does NOT trigger note `updatedAt` update

---

## Security Measures

| Decision | Implementation | Security Benefit |
|-----------|----------------|------------------|
| **Presigned URLs** | 1-hour expiration, Content-Type restriction | Prevents URL abuse |
| **No public URLs** | Store only fileKey in DB | Compromised DB doesn't expose files |
| **Ownership verification** | Check note before allowing attachment deletion | Prevents unauthorized deletions |
| **Dev-only docs** | Returns 404 in production | Hides API structure from public |
| **Auth required for docs** | Verify session even in dev | Prevents accidental exposure |
| **Specific error messages** | Session expired, invalid token, missing token | Better UX, easier debugging |
| **CORS configuration** | Specific origin + credentials | Prevents CSRF attacks |


## Implementation Checklist

### Phase 1: Project Setup
- [x] Initialize server project with Bun + TypeScript
- [x] Install all dependencies
- [x] Configure `tsconfig.json` with path aliases (`~/*` → `./src/*`)
- [x] Create directory structure

### Phase 2: Database Setup
- [x] Configure Drizzle with local SQLite + Turso support
- [x] Define database schema (notes, note_attachments, notes_comments, feedback, users)
- [x] Generate migrations
- [x] Run migrations to local SQLite database

### Phase 3: Authentication
- [x] Configure BetterAuth with Drizzle adapter
- [x] Add custom user fields (avatar, showChat, showNotes, showTasks) in schema
- [x] Set up email/password authentication (no social providers)
- [x] Configure base URL and secret
- [x] Configure cross-domain cookies for subdomain access
- [x] Create auth middleware with specific error messages using macro pattern

### Phase 4: Storage Layer
- [ ] Implement R2 storage service with Bun's native S3 support
- [ ] Implement presigned URL generation function
- [ ] Add file type validation (images, PDF, Excel, PPT, Docs)
- [ ] Add file size validation (max 10MB)
- [ ] Implement upload function
- [ ] Implement delete function (single + batch)

### Phase 5: Main App
- [ ] Configure CORS for client
- [ ] Set up OpenAPI generation with Zod schemas
- [ ] Implement `/docs` route with dev-only + auth-required logic
- [ ] Return 404 for `/docs` in production
- [ ] Mount BetterAuth handler
- [ ] Apply auth middleware to protected routes
- [ ] Add error handling middleware

### Phase 6: Notes API
- [ ] Implement GET `/api/notes` (list with presigned URLs)
- [ ] Implement GET `/api/notes/:id` (single with presigned URLs)
- [ ] Implement POST `/api/notes` (create with multiple file uploads)
- [ ] Implement PATCH `/api/notes/:id` (update with uploads)
- [ ] Implement DELETE `/api/notes/:id` (delete with R2 cleanup)
- [ ] Implement PATCH `/api/notes/:id/complete` (toggle completion)
- [ ] Add Zod validation schemas to all endpoints
- [ ] Add OpenAPI documentation to all endpoints

### Phase 7: Attachments API
- [ ] Implement DELETE `/api/notes/:noteId/attachments/:attachmentId`
- [ ] Verify note ownership first (before attachment check)
- [ ] Verify attachment belongs to note (second check)
- [ ] Delete from R2 and database
- [ ] Do NOT update note `updatedAt`
- [ ] Implement GET `/api/notes/:noteId/attachments/:attachmentId/presigned`

### Phase 8: Comments API
- [ ] Implement POST `/api/notes/:noteId/comments` (create comment)
- [ ] Implement DELETE `/api/notes/:noteId/comments/:commentId` (delete comment)
- [ ] Add Zod validation schemas
- [ ] Add OpenAPI documentation

### Phase 9: Feedback API
- [ ] Implement POST `/api/feedback` (submit feedback)
- [ ] Add Zod validation schema
- [ ] Add OpenAPI documentation

### Phase 10: Chat API
- [ ] Implement POST `/api/chat` (streaming)
- [ ] Support OpenAI models (GPT-5, GPT-5 Mini, GPT-5 Nano)
- [ ] Support Google models (Gemini 2.5 Flash, Gemini 2.5 Pro)
- [ ] Support Anthropic models (Claude 3.5 Sonnet, Claude 3.7 Sonnet, Claude Opus 4, Claude Sonnet 4)
- [ ] Support X AI models (Grok 3, Grok 3 Mini, Grok 4)
- [ ] Return ReadableStream with proper headers
- [ ] Add OpenAPI documentation

### Phase 11: Deployment Prep
- [ ] Create Dockerfile for Railway
- [ ] Create comprehensive `.env.example`
- [ ] Add package.json scripts (dev, start, db:generate, db:migrate)
- [ ] Configure Railway deployment settings
- [ ] Test all endpoints locally
- [ ] Verify presigned URL generation
- [ ] Test file upload/download flow
- [ ] Verify `/docs` returns 404 in production
- [ ] Test auth error messages
- [ ] Verify attachment deletion doesn't update note

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "start": "bun src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Dockerfile

```dockerfile
FROM oven/bun:1

WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Run the app
CMD ["bun", "run", "start"]
```

---

## Development Notes

### Presigned URL Generation
- Uses AWS Signature Version 4 (SigV4)
- Default expiration: 1 hour (3600 seconds)
- Restricts Content-Type to match uploaded file type
- No need for AWS SDK (built with Node.js crypto)

### Bun's Native S3 Support
- No heavy AWS SDK dependency
- Direct `fetch("s3://...")` calls
- Pass credentials via `s3` option in fetch
- Works seamlessly with Cloudflare R2 (S3-compatible)

### Scalar UI Integration
- Served as HTML string from `/docs` route
- References OpenAPI spec at `/json` endpoint
- Uses CDN-hosted Scalar JS/CSS
- Theme: 'kepler' (default modern theme)

### Production Deployment (Railway)
- Set `NODE_ENV=production` to hide `/docs` endpoint
- Configure CORS origin to Railway domain
- Use Railway's PORT environment variable
- No need for `/docs` in production (auto 404)

---

## Testing Plan

1. **Authentication Flow**
   - [ ] Sign up new user
   - [ ] Sign in with email/password
   - [ ] Get current session
   - [ ] Sign out
   - [ ] Test expired token error message
   - [ ] Test invalid token error message
   - [ ] Test cross-domain cookie behavior

2. **Notes CRUD**
   - [ ] Create note without attachments
   - [ ] Create note with multiple attachments
   - [ ] List notes (with completed filter)
   - [ ] Get single note (with presigned URLs)
   - [ ] Update note (add new attachments)
   - [ ] Toggle note completion
   - [ ] Delete note (verify R2 cleanup)

3. **Attachments**
   - [ ] Verify presigned URLs work for download
   - [ ] Delete attachment (ownership check)
   - [ ] Generate fresh presigned URL
   - [ ] Verify note `updatedAt` NOT updated on attachment delete

4. **Comments**
   - [ ] Add comment to note
   - [ ] Delete comment

5. **Feedback**
   - [ ] Submit feedback

6. **Chat Streaming**
   - [ ] Test OpenAI streaming
   - [ ] Test Google streaming
   - [ ] Test Anthropic streaming
   - [ ] Test X AI streaming

7. **File Uploads**
   - [ ] Upload image file
   - [ ] Upload PDF file
   - [ ] Upload Excel file
   - [ ] Upload PowerPoint file
   - [ ] Test invalid file type rejection
   - [ ] Test file size limit (>10MB rejection)

8. **Documentation**
   - [ ] Access `/docs` in dev with valid session
   - [ ] Try accessing `/docs` without auth (should get 401)
   - [ ] Verify `/docs` returns 404 in production
   - [ ] Verify OpenAPI spec at `/json` is accessible

9. **Error Handling**
   - [ ] Test validation errors
   - [ ] Test not found errors
   - [ ] Test unauthorized access
   - [ ] Test auth error messages (specific)

---

## Success Criteria

- ✅ All CRUD operations work for notes
- ✅ File uploads work with R2 (max 10MB, multiple files)
- ✅ Presigned URLs work for downloads (1-hour expiry)
- ✅ Authentication works with BetterAuth
- ✅ BetterAuth error messages are specific and helpful
- ✅ Comments work on notes
- ✅ Feedback submission works
- ✅ AI chat streaming works (all 4 providers)
- ✅ Scalar UI is accessible in dev (auth required)
- ✅ `/docs` returns 404 in production
- ✅ CORS is configured correctly
- ✅ All endpoints have OpenAPI documentation
- ✅ Attachment deletion doesn't update note `updatedAt`
- ✅ Ownership verification works for attachments
- ✅ Dockerfile works for Railway deployment
- ✅ Environment variables are properly configured

---

## Next Steps

After this plan is implemented:

1. Test the complete API locally
2. Deploy to Railway
3. Update client application to use new API endpoints
4. Remove PocketBase SDK from client
5. Update client authentication flow to use BetterAuth
6. Update client data fetching to use new endpoints
7. Migrate existing data from PocketBase to new database (separate task)
8. Decommission PocketBase server (after successful migration)

---

## Notes

- This implementation plan is complete and addresses all confirmed requirements
- No user/data migration from PocketBase is included (deferred to later)
- Client application updates are not included in this plan (separate phase)
- R2 bucket is assumed to be already configured
- All decisions are based on confirmed requirements from user discussions
