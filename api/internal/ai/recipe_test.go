package ai

import (
	"fmt"
	"net/http"
	"strings"
	"testing"
)

func TestRecipeVisionModelIsVisionCapable(t *testing.T) {
	model, err := GetChatModel(RecipeVisionModelID)
	if err != nil {
		t.Fatalf("recipe vision model not in catalog: %v", err)
	}
	if !model.SupportsImages {
		t.Fatalf("recipe vision model %q must support images", model.ID)
	}
}

func TestExtractRecipeJSONObject(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "raw object",
			input: `{"title":"Soup","tags":[],"ingredients":[],"steps":[]}`,
			want:  `{"title":"Soup","tags":[],"ingredients":[],"steps":[]}`,
		},
		{
			name:  "fenced json",
			input: "```json\n{\"title\":\"Soup\"}\n```",
			want:  `{"title":"Soup"}`,
		},
		{
			name:  "prose around object",
			input: `Here you go: {"title":"Soup","tags":[],"ingredients":[],"steps":[]} enjoy!`,
			want:  `{"title":"Soup","tags":[],"ingredients":[],"steps":[]}`,
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := extractRecipeJSONObject(tc.input)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tc.want {
				t.Fatalf("got %q, want %q", got, tc.want)
			}
		})
	}
}

func TestExtractRecipeJSONObjectNoObject(t *testing.T) {
	if _, err := extractRecipeJSONObject("no json here"); err == nil {
		t.Fatal("expected error for missing object")
	}
}

func TestExtractRecipeRejectsBadImage(t *testing.T) {
	if _, err := ExtractRecipeFromImage(t.Context(), "not-a-data-url"); err == nil {
		t.Fatal("expected error for invalid image data")
	} else {
		status, body := MapRecipeError(err)
		if status != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", status)
		}
		if !strings.Contains(body["message"], "data URLs") && !strings.Contains(body["message"], "Invalid image") {
			t.Fatalf("unexpected message: %q", body["message"])
		}
	}
}

func TestMapRecipeErrorUpstream(t *testing.T) {
	status, body := MapRecipeError(mapUpstreamError(http.StatusTooManyRequests, "slow"))
	if status != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", status)
	}
	if body["code"] != codeRateLimited {
		t.Fatalf("expected rate_limited code, got %q", body["code"])
	}
	if strings.Contains(body["message"], "slow") {
		t.Fatalf("user message leaks detail: %q", body["message"])
	}
}

func TestMapRecipeErrorFallback(t *testing.T) {
	status, body := MapRecipeError(fmt.Errorf("boom"))
	if status != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", status)
	}
	if body["code"] != codeProviderError {
		t.Fatalf("expected provider_error code, got %q", body["code"])
	}
}
