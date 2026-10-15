// Package ai is a self-contained Cloudflare Workers AI chat integration.
//
// It exposes an Echo handler that speaks the Vercel AI SDK data stream
// protocol, so the React client can use useChat with DefaultChatTransport
// against the Go backend. All Cloudflare/AI SDK concerns live in this
// package; callers only wire Handler.Chat into the router.
package ai

import (
	"fmt"
	"os"
)

// Config holds the Cloudflare Workers AI settings.
// Values come from CLOUDFLARE_* environment variables.
// The chat model is not configured here: the client picks one per request
// from SupportedChatModels (see models.go).
type Config struct {
	AccountID string
	APIToken  string
}

// LoadConfig reads the CLOUDFLARE_* environment variables.
func LoadConfig() Config {
	return Config{
		AccountID: os.Getenv("CLOUDFLARE_ACCOUNT_ID"),
		APIToken:  os.Getenv("CLOUDFLARE_API_TOKEN"),
	}
}

// Validate reports whether the config has everything needed to call Cloudflare.
func (c Config) Validate() error {
	if c.AccountID == "" {
		return fmt.Errorf("CLOUDFLARE_ACCOUNT_ID is not configured")
	}
	if c.APIToken == "" {
		return fmt.Errorf("CLOUDFLARE_API_TOKEN is not configured")
	}
	return nil
}

// SystemPrompt keeps the generic assistant stateless and concise.
const SystemPrompt = "You are Homethings assistant, a helpful general-purpose chatbot. " +
	"Keep answers concise and formatted in markdown where it helps readability."
