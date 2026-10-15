package ai

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// extractDeltas parses an OpenAI-compatible SSE stream and invokes onDelta
// for every non-empty content delta. It stops at the upstream [DONE] marker.
func extractDeltas(upstream io.Reader, onDelta func(string)) error {
	scanner := bufio.NewScanner(upstream)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

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
			return nil
		}

		var chunk openAIChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		for _, choice := range chunk.Choices {
			if choice.Delta.Content != "" {
				onDelta(choice.Delta.Content)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("failed to read upstream stream: %w", err)
	}
	return nil
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
