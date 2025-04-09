package password

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"math/big"
)

func assertAvailablePRNG() error {
	// Assert that a cryptographically secure PRNG is available.
	buf := make([]byte, 1)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		return errors.New("system does not have a cryptographically secure PRNG")
	}
	return nil
}

func generateRandomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?@#$%&"
	r := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", errors.New("failed to generate random number")
		}
		r[i] = letters[num.Int64()]
	}

	return string(r), nil
}

func generateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, errors.New("failed to generate random bytes")
	}
	return b, nil
}

func Run(length int, encoded bool) string {
	err := assertAvailablePRNG()
	if err != nil {
		return err.Error()
	}
	// If encoded is true, generate a base64 encoded random string
	if encoded {
		b, err := generateRandomBytes(length)
		if err != nil {
			return err.Error()
		}
		return base64.URLEncoding.EncodeToString(b)
	}
	// If encoded is false, generate a random string
	pwd, err := generateRandomString(length)
	if err != nil {
		return err.Error()
	}
	return pwd
}
