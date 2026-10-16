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

// LogDetail exposes the raw provider detail for server-side logging only.
// Never send this to the client.
func (e *chatError) LogDetail() string { return e.detail }

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

// MapRecipeError converts a recipe extraction failure into an HTTP status
// and a user-safe JSON body. Image validation failures are 400s; upstream or
// config failures keep their chatError status/code; anything else is a 502.
// Shared helper so the recipes controller stays thin and never leaks provider
// detail to the client.
func MapRecipeError(err error) (int, map[string]string) {
	if imgErr, ok := err.(*imageValidationError); ok {
		msg := imgErr.Message
		if msg == "" {
			msg = "Invalid image data."
		}
		return http.StatusBadRequest, map[string]string{"message": msg}
	}
	if chatErr, ok := err.(*chatError); ok {
		status := chatErr.StatusCode
		if status == 0 {
			status = http.StatusBadGateway
		}
		return status, map[string]string{"code": chatErr.Code, "message": chatErr.Message}
	}
	return http.StatusBadGateway, map[string]string{
		"code":    codeProviderError,
		"message": "The AI service failed. Please try again.",
	}
}
