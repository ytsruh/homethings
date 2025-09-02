package cron

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

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

			// Create a new VIX data entry
			collection, err := app.FindCollectionByNameOrId("fx_rates")
			if err != nil {
				fmt.Println("error getting the fx_rates collection")
				return
			}
			record := core.NewRecord(collection)
			record.Set("base_currency", currency)
			record.Set("date", time.Now())
			record.Set("USD", response.Rates["USD"])
			record.Set("EUR", response.Rates["EUR"])
			record.Set("JPY", response.Rates["JPY"])
			record.Set("GBP", response.Rates["GBP"])
			record.Set("CAD", response.Rates["CAD"])
			record.Set("CHF", response.Rates["CHF"])
			record.Set("CNY", response.Rates["CNY"])
			record.Set("INR", response.Rates["INR"])
			record.Set("AUD", response.Rates["AUD"])
			record.Set("NZD", response.Rates["NZD"])
			record.Set("created", time.Now())

			err = app.Save(record)
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
