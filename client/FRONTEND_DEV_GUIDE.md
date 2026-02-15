# HomeThings API - Frontend Developer Guide

A comprehensive guide for frontend developers using React to integrate with the HomeThings API.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Client Setup](#api-client-setup)
- [Endpoints Reference](#endpoints-reference)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)
- [AI & Streaming](#ai--streaming)
- [Best Practices](#best-practices)

---

## Overview

### Server Details

- **Base URL**: `http://localhost:3000` (dev) or your production URL
- **API Documentation**: Available at `/docs` (interactive Scalar UI)
- **OpenAPI Spec**: Available at `/openapi.json`
- **CORS**: Configured for `CLIENT_URL` with credentials support

### Technology Stack

- **Runtime**: Bun
- **Framework**: Hono (TypeScript)
- **Database**: Drizzle ORM with SQLite/Turso
- **Storage**: Cloudflare R2
- **Authentication**: JWT tokens in httpOnly cookies
- **AI**: OpenRouter with multiple models

### Authentication Overview

The API uses cookie-based JWT authentication:
- JWT token stored in `auth_token` cookie (httpOnly, sameSite=lax)
- Session duration: 7 days
- Public endpoints: `/auth/*` routes
- Protected endpoints: All `/api/*` routes
- Authentication middleware validates the JWT automatically

---

## Getting Started

### Prerequisites

Make sure your frontend is configured to send credentials:

```typescript
// fetch/config example
const response = await fetch('http://localhost:3000/api/notes', {
  method: 'GET',
  credentials: 'include', // Important: include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Environment Setup

Make sure your server environment variables are configured:
- `JWT_SECRET` - Secret key for JWT signing
- `CLIENT_URL` - Your frontend URL for CORS
- `R2_*` - Cloudflare R2 credentials
- `OPENROUTER_API_KEY` - For AI features
- `TURSO_*` - Database credentials (or `file:local.db` for local)

---

## Authentication

### Login

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

// Usage
await login('user@example.com', 'password123');
```

### Register

```typescript
interface RegisterRequest {
  email: string;
  password: string;  // Min 6 characters
  name: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

async function register(email: string, password: string, name: string): Promise<RegisterResponse> {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

// Usage
await register('user@example.com', 'password123', 'John Doe');
```

### Get Current User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

async function getCurrentUser(): Promise<{ user: User }> {
  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

// Usage
const { user } = await getCurrentUser();
```

### Update User Profile

```typescript
interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;  // Min 6 characters
}

async function updateUser(updates: UpdateUserRequest): Promise<{ message: string }> {
  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Update failed');
  }

  return response.json();
}

// Usage
await updateUser({ name: 'Jane Doe' });
await updateUser({ email: 'newemail@example.com' });
await updateUser({ password: 'newpassword123' });
```

### Logout

```typescript
async function logout(): Promise<void> {
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  // Redirect or update state
}

// Usage
await logout();
```

---

## API Client Setup

### Create an API Client Hook

```typescript
// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

---

## Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | Login with email/password | No |
| `/auth/register` | POST | Create new account | No |
| `/auth/logout` | POST | Clear auth session | No |
| `/auth/me` | GET | Get current user | No |
| `/auth/me` | PATCH | Update user profile | No |

### Notes Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/notes` | POST | Create a new note | Yes |
| `/api/notes` | GET | List user's notes | Yes |
| `/api/notes/:id` | GET | Get specific note | Yes |
| `/api/notes/:id` | PATCH | Update note | Yes |
| `/api/notes/:id` | DELETE | Delete note | Yes |
| `/api/notes/:id/complete` | PATCH | Mark note complete/incomplete | Yes |

### Attachments Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/notes/:id/attachments` | POST | Upload files to note | Yes |
| `/api/notes/:id/attachments` | GET | List attachments with URLs | Yes |
| `/api/notes/:id/attachments/:attachmentId` | DELETE | Delete attachment | Yes |
| `/api/notes/:id/attachments/:attachmentId/presigned` | GET | Get presigned URL | Yes |

### Comments Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/notes/:id/comments` | POST | Add comment to note | Yes |
| `/api/notes/:id/comments/:commentId` | DELETE | Delete comment | Yes |

### Feedback Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/feedback` | POST | Submit feedback | Yes |

### Chat Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/chat` | POST | Send message to AI | Yes |
| `/api/chat/stream` | POST | Stream AI response | Yes |
| `/api/chat/models` | GET | List available models | Yes |
| `/api/chat/tokens` | POST | Count tokens | Yes |

---

### Notes Operations

#### Create Note

```typescript
interface Note {
  id: string;
  title: string;
  body: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

async function createNote(title: string): Promise<Note> {
  return apiClient.post<Note>('/api/notes', { title });
}

// Usage with API client
const note = await createNote('My First Note');
console.log(note.id);
```

#### List Notes

```typescript
async function listNotes(completed: boolean = false): Promise<Note[]> {
  return apiClient.get<Note[]>(`/api/notes?completed=${completed}`);
}

// Usage
const notes = await listNotes(false);  // Get incomplete notes
const allNotes = await listNotes(true); // Get all notes
```

#### Get Note

```typescript
async function getNote(noteId: string): Promise<Note> {
  return apiClient.get<Note>(`/api/notes/${noteId}`);
}

// Usage
const note = await getNote('uuid-here');
```

#### Update Note

```typescript
interface UpdateNoteRequest {
  title?: string;
  body?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

async function updateNote(
  noteId: string,
  updates: UpdateNoteRequest
): Promise<Note> {
  return apiClient.patch<Note>(`/api/notes/${noteId}`, updates);
}

// Usage
await updateNote('uuid-here', {
  title: 'Updated Title',
  body: 'Updated body content',
  priority: 'high',
});
```

#### Mark Note Complete

```typescript
async function setNoteComplete(noteId: string, completed: boolean): Promise<Note> {
  return apiClient.patch<Note>(`/api/notes/${noteId}/complete`, { completed });
}

// Usage
await setNoteComplete('uuid-here', true);  // Mark complete
await setNoteComplete('uuid-here', false); // Mark incomplete
```

#### Delete Note

```typescript
async function deleteNote(noteId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/api/notes/${noteId}`);
}

// Usage
await deleteNote('uuid-here');
```

---

### Comments Operations

#### Create Comment

```typescript
interface Comment {
  id: string;
  comment: string;
  noteId: string;
  createdAt: Date;
}

async function createComment(noteId: string, comment: string): Promise<Comment> {
  return apiClient.post<Comment>(`/api/notes/${noteId}/comments`, { comment });
}

// Usage
const comment = await createComment('note-uuid', 'This is a comment');
```

#### Delete Comment

```typescript
async function deleteComment(noteId: string, commentId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/api/notes/${noteId}/comments/${commentId}`);
}

// Usage
await deleteComment('note-uuid', 'comment-uuid');
```

---

### Feedback Operations

#### Submit Feedback

```typescript
interface FeedbackRequest {
  title: string;   // Min 5 characters
  body: string;    // Min 5 characters
}

async function submitFeedback(title: string, body: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/api/feedback', { title, body });
}

// Usage
await submitFeedback('Great app!', 'I love using this application');
```

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  [key: string]: unknown;
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid credentials or token |
| `INVALID_EMAIL` | Invalid email format |
| `PASSWORD_TOO_SHORT` | Password less than 6 characters |
| `CONFLICT` | Email already registered |
| `NOT_FOUND` | Resource not found |
| `INVALID_MODEL` | Invalid AI model specified |
| `INTERNAL_ERROR` | Server error |

### Error Handling Wrapper

```typescript
async function handleApiCall<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    console.error('API Error:', error);
    return null;
  }
}

// Usage with React
const result = await handleApiCall(
  () => getNote('uuid'),
  (error) => setError(error.message)
);

if (result) {
  setNote(result);
}
```

---

## File Uploads

### Upload Attachments

```typescript
interface Attachment {
  id: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

interface AttachmentWithUrl extends Attachment {
  presignedUrl: string;
}

async function uploadAttachments(
  noteId: string,
  files: File[]
): Promise<Attachment[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`http://localhost:3000/api/notes/${noteId}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

// Usage with React file input
async function handleFileUpload(noteId: string, event: React.ChangeEvent<HTMLInputElement>) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  try {
    const attachments = await uploadAttachments(noteId, Array.from(files));
    setAttachments((prev) => [...prev, ...attachments]);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// In JSX
<input
  type="file"
  multiple
  onChange={(e) => handleFileUpload('note-uuid', e)}
/>
```

### Get Attachments

```typescript
async function getAttachments(noteId: string): Promise<AttachmentWithUrl[]> {
  return apiClient.get<AttachmentWithUrl[]>(`/api/notes/${noteId}/attachments`);
}

// Usage
const attachments = await getAttachments('note-uuid');
```

### Delete Attachment

```typescript
async function deleteAttachment(
  noteId: string,
  attachmentId: string
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(
    `/api/notes/${noteId}/attachments/${attachmentId}`
  );
}

// Usage
await deleteAttachment('note-uuid', 'attachment-uuid');
```

### Get Presigned URL

```typescript
async function getPresignedUrl(
  noteId: string,
  attachmentId: string
): Promise<AttachmentWithUrl> {
  return apiClient.get<AttachmentWithUrl>(
    `/api/notes/${noteId}/attachments/${attachmentId}/presigned`
  );
}

// Usage
const attachment = await getPresignedUrl('note-uuid', 'attachment-uuid');
// Use attachment.presignedUrl directly
```

---

## AI & Streaming

### Available Models

```typescript
interface ModelsResponse {
  models: string[];
  default: string;
}

async function getAvailableModels(): Promise<ModelsResponse> {
  return apiClient.get<ModelsResponse>('/api/chat/models');
}

// Usage
const { models, default: defaultModel } = await getAvailableModels();
console.log('Available models:', models);
```

Available models include:
- OpenAI: `openai/gpt-5`, `openai/gpt-5-mini`, `openai/gpt-5-nano` (default)
- Google: `google/gemini-2.5-flash`, `google/gemini-2.5-pro`
- Anthropic: `anthropic/claude-3.5-sonnet`, `anthropic/claude-4`
- XAI: `xai/grok-3`, `xai/grok-3-mini`, `xai/grok-4`

### Send Chat Message (Non-Streaming)

```typescript
interface ChatRequest {
  message: string;    // Max 10000 characters
  model?: string;     // Optional: specific AI model
}

interface ChatResponse {
  response: string;
}

async function sendChatMessage(
  message: string,
  model?: string
): Promise<ChatResponse> {
  return apiClient.post<ChatResponse>('/api/chat', { message, model });
}

// Usage
const { response } = await sendChatMessage('Hello, how can you help?');
console.log(response);
```

### Send Chat Message (Streaming)

```typescript
async function* streamChatMessage(
  message: string,
  model?: string,
  onChunk?: (chunk: string) => void
): AsyncGenerator<string> {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Chat request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is not readable');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    if (onChunk) {
      onChunk(chunk);
    }
    yield chunk;
  }
}

// Usage with React
async function handleStreamChat(message: string) {
  let fullResponse = '';

  for await (const chunk of streamChatMessage(message)) {
    fullResponse += chunk;
    setChatResponse(fullResponse);
  }
}
```

### Complete Streaming Component Example

```typescript
'use client';

import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatStream() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentResponse('');

    try {
      const responseGenerator = streamChatMessage(
        userMessage.content,
        'openai/gpt-5-nano'
      );

      let fullResponse = '';
      for await (const chunk of responseGenerator) {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: fullResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentResponse('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {currentResponse && (
          <div className="message assistant">
            <strong>assistant:</strong> {currentResponse}
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Count Tokens

```typescript
async function countTokens(text: string): Promise<{ count: number }> {
  return apiClient.post<{ count: number }>('/api/chat/tokens', { text });
}

// Usage
const { count } = await countTokens('How many tokens is this?');
console.log('Token count:', count);
```

---

## Best Practices

### Authentication Flow

```typescript
// Check auth status on app load
useEffect(() => {
  async function checkAuth() {
    try {
      const { user } = await getCurrentUser();
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }
  checkAuth();
}, []);

// Protect routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}
```

### API Call Optimization

```typescript
// Use React Query or similar for caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function NotesList() {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', false],
    queryFn: () => listNotes(false),
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {notes?.map((note) => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
}
```

### Error Boundaries

```typescript
// Wrap your app in an error boundary
class ApiErrorBoundary extends React.Component {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorHandler error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Type Safety

```typescript
// Create shared types file
// src/types/api.ts

export interface Note {
  id: string;
  title: string;
  body: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  comment: string;
  noteId: string;
  createdAt: Date;
}

// Use throughout your app
```

### Performance Tips

1. **Use response caching** with React Query or similar
2. **Optimize file uploads** by showing progress and supporting retry
3. **Debounce search inputs** to reduce API calls
4. **Lazy load** attachments and comments until needed
5. **Use optimistic updates** for better UX

```typescript
// Example of debounce
import { debounce } from 'lodash';

const handleSearch = debounce((query: string) => {
  // API call
}, 300);
```

---

## Troubleshooting

### Common Issues

**Issue: CORS errors**
- Ensure `CLIENT_URL` matches your frontend URL
- Verify `credentials: 'include'` is set on fetch calls

**Issue: 401 Unauthorized on API calls**
- Check that user is logged in (`/auth/me` returns user)
- Verify cookie is being sent (check dev tools > Application > Cookies)

**Issue: File upload fails**
- Verify file type is allowed (check validation)
- Ensure file doesn't exceed size limits
- Check R2 credentials are configured

**Issue: Streaming doesn't work**
- Ensure you're handling the response body correctly
- Check that you're using a TextDecoder to decode chunks
- Verify the response headers include correct content type

### Debug Mode

Check the OpenAPI docs at `http://localhost:3000/docs` for interactive testing of all endpoints.

---

## Support

For issues or questions about the API:
1. Check the interactive docs at `/docs`
2. Review the OpenAPI spec at `/openapi.json`
3. Refer to this guide
4. Contact the backend team

---

Last Updated: 2026-02-15