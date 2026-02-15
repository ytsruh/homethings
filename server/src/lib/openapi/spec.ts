import { apiInfo } from "./config";

export const openApiSpec = {
	openapi: "3.0.0",
	info: {
		title: apiInfo.title,
		version: apiInfo.version,
		description: apiInfo.description,
	},
	servers: [
		{
			url: apiInfo.serverUrl || "http://localhost:3000",
			description: "Server",
		},
	],
	components: {
		securitySchemes: {
			cookieAuth: {
				type: "apiKey",
				in: "cookie",
				name: "auth_token",
			},
		},
		schemas: {
			Error: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
			},
			User: {
				type: "object",
				properties: {
					id: { type: "string" },
					email: { type: "string" },
					name: { type: "string" },
				},
			},
			Note: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					body: { type: "string", nullable: true },
					priority: {
						type: "string",
						enum: ["low", "medium", "high", "urgent"],
					},
					completed: { type: "boolean" },
					createdBy: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Attachment: {
				type: "object",
				properties: {
					id: { type: "string" },
					fileKey: { type: "string" },
					fileName: { type: "string" },
					fileType: { type: "string" },
					fileSize: { type: "number" },
					createdAt: { type: "string", format: "date-time" },
				},
			},
			AttachmentWithUrl: {
				type: "object",
				properties: {
					id: { type: "string" },
					fileKey: { type: "string" },
					fileName: { type: "string" },
					fileType: { type: "string" },
					fileSize: { type: "number" },
					createdAt: { type: "string", format: "date-time" },
					presignedUrl: { type: "string" },
				},
			},
			Comment: {
				type: "object",
				properties: {
					id: { type: "string" },
					comment: { type: "string" },
					noteId: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
				},
			},
			ChatResponse: {
				type: "object",
				properties: {
					response: { type: "string" },
				},
			},
			TokenCount: {
				type: "object",
				properties: {
					count: { type: "number" },
				},
			},
			ModelsList: {
				type: "object",
				properties: {
					models: { type: "array", items: { type: "string" } },
					default: { type: "string" },
				},
			},
			LoginRequest: {
				type: "object",
				required: ["email", "password"],
				properties: {
					email: { type: "string", format: "email" },
					password: { type: "string" },
				},
			},
			RegisterRequest: {
				type: "object",
				required: ["email", "password", "name"],
				properties: {
					email: { type: "string", format: "email" },
					password: { type: "string", minLength: 6 },
					name: { type: "string" },
				},
			},
			UpdateUserRequest: {
				type: "object",
				properties: {
					name: { type: "string" },
					email: { type: "string", format: "email" },
					password: { type: "string", minLength: 6 },
				},
			},
			CreateNoteRequest: {
				type: "object",
				required: ["title"],
				properties: {
					title: { type: "string" },
				},
			},
			UpdateNoteRequest: {
				type: "object",
				properties: {
					title: { type: "string" },
					body: { type: "string" },
					priority: {
						type: "string",
						enum: ["low", "medium", "high", "urgent"],
					},
				},
			},
			CompleteNoteRequest: {
				type: "object",
				required: ["completed"],
				properties: {
					completed: { type: "boolean" },
				},
			},
			CreateCommentRequest: {
				type: "object",
				required: ["comment"],
				properties: {
					comment: { type: "string" },
				},
			},
			CreateFeedbackRequest: {
				type: "object",
				required: ["title", "body"],
				properties: {
					title: { type: "string" },
					body: { type: "string" },
				},
			},
			ChatRequest: {
				type: "object",
				required: ["message"],
				properties: {
					message: { type: "string", maxLength: 10000 },
					model: { type: "string" },
				},
			},
			TokensRequest: {
				type: "object",
				required: ["text"],
				properties: {
					text: { type: "string" },
				},
			},
		},
	},
	security: [{ cookieAuth: [] }],
	paths: {
		"/auth/login": {
			post: {
				tags: ["Authentication"],
				summary: "Login",
				description: "Authenticate with email and password",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/LoginRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Login successful",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
										user: { $ref: "#/components/schemas/User" },
									},
								},
							},
						},
					},
					401: {
						description: "Invalid credentials",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/auth/register": {
			post: {
				tags: ["Authentication"],
				summary: "Register",
				description: "Create a new account",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/RegisterRequest" },
						},
					},
				},
				responses: {
					201: {
						description: "Registration successful",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
										user: { $ref: "#/components/schemas/User" },
									},
								},
							},
						},
					},
					409: {
						description: "Email already registered",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/auth/logout": {
			post: {
				tags: ["Authentication"],
				summary: "Logout",
				description: "Clear authentication cookie",
				responses: {
					200: {
						description: "Logout successful",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/auth/me": {
			get: {
				tags: ["Authentication"],
				summary: "Get current user",
				description: "Returns the currently authenticated user",
				responses: {
					200: {
						description: "User found",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										user: { $ref: "#/components/schemas/User" },
									},
								},
							},
						},
					},
					401: {
						description: "Not authenticated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
			patch: {
				tags: ["Authentication"],
				summary: "Update current user",
				description: "Update the authenticated user's profile",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateUserRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Profile updated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
					401: {
						description: "Not authenticated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes": {
			post: {
				tags: ["Notes"],
				summary: "Create note",
				description: "Create a new note",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateNoteRequest" },
						},
					},
				},
				responses: {
					201: {
						description: "Note created",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Note" },
							},
						},
					},
				},
			},
			get: {
				tags: ["Notes"],
				summary: "List notes",
				description: "List all notes for the authenticated user",
				parameters: [
					{
						name: "completed",
						in: "query",
						schema: { type: "boolean" },
						description: "Filter by completion status",
					},
				],
				responses: {
					200: {
						description: "List of notes",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { $ref: "#/components/schemas/Note" },
								},
							},
						},
					},
				},
			},
		},
		"/notes/{id}": {
			get: {
				tags: ["Notes"],
				summary: "Get note",
				description: "Get a specific note by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "Note found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Note" },
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
			patch: {
				tags: ["Notes"],
				summary: "Update note",
				description: "Update a specific note",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateNoteRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Note updated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Note" },
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
			delete: {
				tags: ["Notes"],
				summary: "Delete note",
				description: "Delete a specific note and its attachments",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "Note deleted",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes/{id}/attachments": {
			post: {
				tags: ["Attachments"],
				summary: "Upload attachments",
				description: "Upload one or more files to a note",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								properties: {
									files: {
										type: "array",
										items: { type: "string", format: "binary" },
									},
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: "Attachments uploaded",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { $ref: "#/components/schemas/Attachment" },
								},
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
			get: {
				tags: ["Attachments"],
				summary: "List attachments",
				description: "List all attachments for a note with presigned URLs",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "List of attachments",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { $ref: "#/components/schemas/AttachmentWithUrl" },
								},
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes/{id}/attachments/{attachmentId}": {
			delete: {
				tags: ["Attachments"],
				summary: "Delete attachment",
				description: "Delete a specific attachment",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{
						name: "attachmentId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "Attachment deleted",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
					404: {
						description: "Attachment not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes/{id}/attachments/{attachmentId}/presigned": {
			get: {
				tags: ["Attachments"],
				summary: "Get presigned URL",
				description: "Get a presigned URL for a specific attachment",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{
						name: "attachmentId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "Presigned URL generated",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/AttachmentWithUrl" },
							},
						},
					},
					404: {
						description: "Attachment not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes/{id}/comments": {
			post: {
				tags: ["Comments"],
				summary: "Create comment",
				description: "Add a comment to a note",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateCommentRequest" },
						},
					},
				},
				responses: {
					201: {
						description: "Comment created",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Comment" },
							},
						},
					},
					404: {
						description: "Note not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/notes/{id}/comments/{commentId}": {
			delete: {
				tags: ["Comments"],
				summary: "Delete comment",
				description: "Delete a specific comment",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
					{
						name: "commentId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					200: {
						description: "Comment deleted",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
					404: {
						description: "Comment not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/feedback": {
			post: {
				tags: ["Feedback"],
				summary: "Submit feedback",
				description: "Submit user feedback",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateFeedbackRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Feedback submitted",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Error" },
							},
						},
					},
				},
			},
		},
		"/chat": {
			post: {
				tags: ["Chat"],
				summary: "Send message",
				description: "Send a chat message to the AI",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ChatRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "AI response",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ChatResponse" },
							},
						},
					},
				},
			},
		},
		"/chat/stream": {
			post: {
				tags: ["Chat"],
				summary: "Stream message",
				description: "Send a chat message and receive a streaming response",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ChatRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Streaming AI response",
						content: {
							"text/plain": {
								schema: { type: "string" },
							},
						},
					},
				},
			},
		},
		"/chat/models": {
			get: {
				tags: ["Chat"],
				summary: "List models",
				description: "List available AI models",
				responses: {
					200: {
						description: "List of available models",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ModelsList" },
							},
						},
					},
				},
			},
		},
		"/chat/tokens": {
			post: {
				tags: ["Chat"],
				summary: "Count tokens",
				description: "Count tokens in a text string",
				requestBody: {
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/TokensRequest" },
						},
					},
				},
				responses: {
					200: {
						description: "Token count",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TokenCount" },
							},
						},
					},
				},
			},
		},
	},
};
