import { Elysia } from 'elysia'
import { auth } from '~/auth/config'

export const authMiddleware = new Elysia({ name: 'auth.middleware' })
	.macro({
		auth: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({ headers })
				if (!session) {
					throw new Error('INVALID_SESSION')
				}
				return {
					user: session.user,
					session: session.session,
				}
			},
		},
	})

export const createAuthError = (error: unknown) => {
	const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'

	return {
		status: message === 'MISSING_TOKEN' ? 401 : 403,
		body: {
			error: message === 'MISSING_TOKEN' ? 'MISSING_TOKEN' : message === 'INVALID_SESSION' ? 'INVALID_SESSION' : message === 'INVALID_TOKEN' ? 'INVALID_TOKEN' : message === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'INTERNAL_ERROR',
		},
	}
}