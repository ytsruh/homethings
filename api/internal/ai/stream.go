package ai

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// extractDeltas parses an OpenAI-compatible SSE stream and invokes onDelta
// for every non-empty content delta. It stops at the upstream [DONE] marker
// and returns the last finish reason reported by the model, if any
// ("stop", "length", ...), plus the last usage block when the provider
// reports token counts (nil when absent).
func extractDeltas(upstream io.Reader, onDelta func(string)) (string, *openAIUsage, error) {
	scanner := bufio.NewScanner(upstream)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	finishReason := ""
	var usage *openAIUsage
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			return finishReason, usage, nil
		}

		var chunk openAIChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		if chunk.Usage != nil {
			usage = chunk.Usage
		}
		for _, choice := range chunk.Choices {
			if choice.FinishReason != nil && *choice.FinishReason != "" {
				finishReason = *choice.FinishReason
			}
			if choice.Delta.Content != "" {
				onDelta(choice.Delta.Content)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return finishReason, usage, fmt.Errorf("failed to read upstream stream: %w", err)
	}
	return finishReason, usage, nil
}

// writePart writes one AI SDK data-stream SSE frame and flushes it.
func writePart(w http.ResponseWriter, flusher http.Flusher, payload any) error {
	encoded, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to encode stream part: %w", err)
	}
	if _, err := fmt.Fprintf(w, "data: %s\n\n", encoded); err != nil {
		return err
	}
	flusher.Flush()
	return nil
}

// writeDone terminates the AI SDK stream.
func writeDone(w http.ResponseWriter, flusher http.Flusher) {
	fmt.Fprint(w, "data: [DONE]\n\n")
	flusher.Flush()
}

// pingInterval is how often a keepalive comment is sent while waiting for
// upstream deltas. SSE comments are ignored by the AI SDK client but keep
// idle connections through proxies alive during slow reasoning generations.
const pingInterval = 5 * time.Second

// writePing writes a single SSE keepalive comment and flushes it.
func writePing(w http.ResponseWriter, flusher http.Flusher) error {
	if _, err := fmt.Fprint(w, ": ping\n\n"); err != nil {
		return err
	}
	flusher.Flush()
	return nil
}
