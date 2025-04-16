package pocketbase

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

func runCron(app *pocketbase.PocketBase) {
	// Get FX Rates at 1am every day
	app.Cron().MustAdd("getFX", "0 1 * * *", func() {
		getFXData(app)
	})
}

type ExchangeRateResponse struct {
	Result             string             `json:"result"`
	Provider           string             `json:"provider"`
	Documentation      string             `json:"documentation"`
	TermsOfUse         string             `json:"terms_of_use"`
	TimeLastUpdateUnix int64              `json:"time_last_update_unix"`
	TimeLastUpdateUTC  string             `json:"time_last_update_utc"`
	TimeNextUpdateUnix int64              `json:"time_next_update_unix"`
	TimeNextUpdateUTC  string             `json:"time_next_update_utc"`
	TimeEOLUnix        int64              `json:"time_eol_unix"`
	BaseCode           string             `json:"base_code"`
	Rates              map[string]float64 `json:"rates"`
}

var (
	currencies = []string{"USD", "EUR", "JPY", "GBP", "CAD", "CHF", "CNY", "INR", "AUD", "NZD"}
	baseUrl    = "https://open.er-api.com/v6/latest/"
)

func getFXData(app *pocketbase.PocketBase) {
	// Set error currencies
	var errorCurrencies []string
	var mu sync.Mutex
	var dbMu sync.Mutex // Mutex to serialize DB writes
	var wg sync.WaitGroup

	// Get currencies from the exchange rate API concurrently
	for _, currency := range currencies {
		wg.Add(1)
		go func(currency string) {
			defer wg.Done()

			url := baseUrl + currency
			resp, err := http.Get(url)
			if err != nil {
				fmt.Println("error retrieving exchange rate data for", currency)
				mu.Lock()
				errorCurrencies = append(errorCurrencies, currency)
				mu.Unlock()
				return
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				fmt.Println("error reading exchange rate data for", currency)
				mu.Lock()
				errorCurrencies = append(errorCurrencies, currency)
				mu.Unlock()
				return
			}

			var response ExchangeRateResponse
			err = json.Unmarshal(body, &response)
			if err != nil {
				fmt.Println("error unmarshalling exchange rate data for", currency)
				mu.Lock()
				errorCurrencies = append(errorCurrencies, currency)
				mu.Unlock()
				return
			}

			// Serialize the DB write with a mutex
			dbMu.Lock()
			_, err = app.DB().Insert("fx_rates", dbx.Params{
				"id":            uuid.New().String(),
				"base_currency": currency,
				"date":          time.Now(),
				"usd":           response.Rates["USD"],
				"eur":           response.Rates["EUR"],
				"jpy":           response.Rates["JPY"],
				"gbp":           response.Rates["GBP"],
				"cad":           response.Rates["CAD"],
				"chf":           response.Rates["CHF"],
				"cny":           response.Rates["CNY"],
				"inr":           response.Rates["INR"],
				"aud":           response.Rates["AUD"],
				"nzd":           response.Rates["NZD"],
			}).Execute()
			dbMu.Unlock()
			if err != nil {
				fmt.Println("error creating FX entry for", currency)
				mu.Lock()
				errorCurrencies = append(errorCurrencies, currency)
				mu.Unlock()
			}
		}(currency)
	}

	// Wait for all goroutines to finish
	wg.Wait()

	if len(errorCurrencies) > 0 {
		fmt.Println("error retrieving FX data for currencies: ", strings.Join(errorCurrencies, ", "))
		return
	}

	fmt.Println("successfully handled all FX data")
}
