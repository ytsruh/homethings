package ai

import (
	"net/http"
	"strings"
)

// chatError is a user-safe failure with a machine-readable code.
// The raw provider detail is kept server-side only (see detail) and never
// sent to the client.
type chatError struct {
	Code       string
	Message    string
	StatusCode int
	detail     string
}

func (e *chatError) Error() string { return e.Message }

// Error codes returned to the client in {code, message} JSON bodies.
const (
	codeModelUnavailable = "model_unavailable"
	codeRateLimited      = "rate_limited"
	codeProviderAuth     = "provider_auth"
	codeProviderError    = "provider_error"
)

// mapUpstreamError converts a Cloudflare failure into a user-safe error.
// detail is the raw upstream response body, retained for server logs.
func mapUpstreamError(statusCode int, detail string) *chatError {
	mapped := &chatError{StatusCode: http.StatusBadGateway, detail: detail}

	switch {
	case statusCode == http.StatusTooManyRequests:
		mapped.Code = codeRateLimited
		mapped.Message = "The AI service is busy. Wait a moment and try again."
	case statusCode == http.StatusUnauthorized || statusCode == http.StatusForbidden:
		mapped.Code = codeProviderAuth
		mapped.Message = "The AI service rejected its credentials. Please tell the site owner."
	case statusCode == 410 || isModelGone(detail):
		mapped.Code = codeModelUnavailable
		mapped.Message = "That model is currently unavailable. Pick another model and try again."
	case statusCode >= 500:
		mapped.Code = codeProviderError
		mapped.Message = "The AI service failed. Please try again."
	default:
		mapped.Code = codeProviderError
		mapped.Message = "The AI service failed. Please try again."
	}

	return mapped
}

// isModelGone reports whether an upstream error body means the requested
// model is deprecated, removed, or unknown to the provider (e.g. Cloudflare
// renames like @cf/mistral/* -> @cf/mistralai/* return "No such model").
func isModelGone(detail string) bool {
	lowered := strings.ToLower(detail)
	for _, marker := range []string{"deprecat", "no such model", "unknown model", "model not found"} {
		if strings.Contains(lowered, marker) {
			return true
		}
	}
	return false
}
