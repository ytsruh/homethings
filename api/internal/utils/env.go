// Package utils provides shared utility functions used across the application.
// The env sub-package handles loading and validating environment variables on startup.
package utils

import (
	"fmt"
	"os"
	"reflect"
	"sync"

	"github.com/joho/godotenv"
)

// EnvVar holds all environment variables used by the application.
// Each field must have an `env` tag matching the environment variable name.
// These values are loaded from the environment or a local .env file on startup.
type EnvVar struct {
	PORT               string `env:"PORT"`
	DB_PATH            string `env:"DB_PATH"`
	TURSO_DATABASE_URL string `env:"TURSO_DATABASE_URL"`
	TURSO_AUTH_TOKEN   string `env:"TURSO_AUTH_TOKEN"`
	JWT_SECRET         string `env:"JWT_SECRET"`
}

var (
	config   *EnvVar
	configMu sync.RWMutex
)

// LoadAndValidateEnv loads environment variables from a .env file (if present)
// and the system environment, then validates that all required variables are set.
// It returns the loaded configuration and an error if any required variable is missing.
// On success, the configuration is stored for global access via GetEnvVars.
func LoadAndValidateEnv() (*EnvVar, error) {
	// Load from .env file if it exists (typically in development).
	// This is silently ignored in production where env vars are set in the environment.
	_ = godotenv.Load()

	env := EnvVar{
		PORT:               os.Getenv("PORT"),
		DB_PATH:            os.Getenv("DB_PATH"),
		TURSO_DATABASE_URL: os.Getenv("TURSO_DATABASE_URL"),
		TURSO_AUTH_TOKEN:   os.Getenv("TURSO_AUTH_TOKEN"),
		JWT_SECRET:         os.Getenv("JWT_SECRET"),
	}

	// Validate that all required environment variables are set
	missingVars := ValidateEnvVars(env)
	if len(missingVars) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %v", missingVars)
	}

	// Store the config safely for global access
	configMu.Lock()
	config = &env
	configMu.Unlock()

	// Return a copy to prevent external mutation of the global state
	cfgCopy := env
	return &cfgCopy, nil
}

// ValidateEnvVars checks if all fields in the EnvVar struct are non-empty.
// It uses reflection to inspect struct fields and their `env` tags.
// Returns a slice of environment variable names (from the `env` tag) that are missing.
func ValidateEnvVars(env EnvVar) []string {
	v := reflect.ValueOf(env)
	t := reflect.TypeOf(env)

	var missingVars []string
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)

		// Only check string fields that have an env tag
		if field.Kind() == reflect.String {
			tag := fieldType.Tag.Get("env")
			if tag != "" && field.String() == "" {
				missingVars = append(missingVars, tag)
			}
		}
	}

	return missingVars
}

// GetEnvVars returns the current environment variables configuration.
// Returns a copy to prevent external mutation of the global state.
// Returns nil if LoadAndValidateEnv has not yet been called successfully.
func GetEnvVars() *EnvVar {
	configMu.RLock()
	defer configMu.RUnlock()
	if config == nil {
		return nil
	}
	cfgCopy := *config
	return &cfgCopy
}
