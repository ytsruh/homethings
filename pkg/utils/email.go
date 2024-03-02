package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type EmailType int

const (
	Notification EmailType = iota
	PasswordReset
)

type NewEmail struct {
	To      string
	Subject string
	Type    EmailType
	Data    interface{}
}

type payload struct {
	To         []string `json:"to"`
	Subject    string   `json:"subject"`
	Body       string   `json:"body"`
	Subscribed bool     `json:"subscribed"`
	Name       string   `json:"name"`
	From       string   `json:"from"`
}

type PasswordResetData struct {
	ID        string
	ExpiresAt string
}

func (email *NewEmail) Send() error {
	// Create an instance of the payload struct
	body := getEmailBody(email)
	if body == "" {
		return errors.New("error while creating email body")
	}
	payloadData := payload{
		To:         []string{email.To},
		Subject:    email.Subject,
		Body:       body,
		Subscribed: true,
		Name:       "Homethings",
		From:       "homethings@ytsruh.com",
	}

	// Convert the Payload struct to JSON & string
	payloadBytes, err := json.Marshal(payloadData)
	if err != nil {
		fmt.Println(err)
		return errors.New("error while creating JSON payload")
	}
	payload := strings.NewReader(string(payloadBytes))

	// Create a new request to send the email
	req, err := http.NewRequest("POST", "https://api.useplunk.com/v1/send", payload)
	if err != nil {
		fmt.Println(err)
		return errors.New("error while creating email sending request")
	}
	// Set the headers
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+os.Getenv("PLUNK_API_KEY"))

	// Send the request
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return errors.New("error while email sending request")
	}
	defer res.Body.Close()

	// Check if the status code is 200
	if res.StatusCode != http.StatusOK {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			fmt.Println(err)
			return errors.New("error while reading email response body")
		}
		fmt.Println(string(body))
		return errors.New("unexpected status code, email failed to send")
	}

	return nil
}

func getEmailBody(config *NewEmail) string {
	switch config.Type {
	case Notification:
		return fmt.Sprintf(`
            <html>
                <body>
                    <h1>%s</h1>
                    <p>Hello, %s. This is a notification email.</p>
                </body>
            </html>`, config.Subject, config.To)
	case PasswordReset:
		fmt.Println(config.Data)
		data, ok := config.Data.(PasswordResetData)
		if !ok {
			return ""
		}
		return fmt.Sprintf(`
            <html>
                <body>
                    <h1>%s</h1>
                    <p>Hello, %s. This is a password reset email.</p>
					<p>Reset link: %s </p>
					<p>Expires at: %s </p>
                </body>
            </html>`, config.Subject, config.To, data.ID, data.ExpiresAt)
	default:
		return ""
	}
}
