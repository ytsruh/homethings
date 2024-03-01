package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type SearchHandler struct {
	Index storage.SearchIndex
}

type IPData struct {
	Status      string  `json:"status"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	RegionName  string  `json:"regionName"`
	City        string  `json:"city"`
	District    string  `json:"district"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	Timezone    string  `json:"timezone"`
	ISP         string  `json:"isp"`
	Org         string  `json:"org"`
}

func (s *SearchHandler) Search(c echo.Context) error {
	now := time.Now()
	query := c.QueryParam("query")
	if query == "" {
		return c.JSON(http.StatusBadRequest, "query param is required")
	}
	urls, err := s.Index.FullTextSearch(query)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "something went wrong performing search")
	}
	return c.JSON(http.StatusOK, echo.Map{
		"results":   urls,
		"query":     query,
		"amount":    len(urls),
		"timeTaken": time.Since(now),
	})
}

func (s *SearchHandler) QueryMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Handle the query in Goroutine to not block the request
		go func() {
			// Get the query from the request & return if its empty
			query := c.QueryParam("query")
			if query == "" {
				return
			}
			var ip string
			var ipdata IPData
			if c.Request().Header.Get("X-Forwarded-For") != "" {
				ip = c.Request().Header.Get("X-Forwarded-For")
			} else {
				ip = c.RealIP()
			}
			// If the IP is not localhost, make a request to an external service and save the search query to the database
			if ip != "127.0.0.1" && ip != "::1" {
				// Make a fetch request to an external service
				response, err := http.Get("http://ip-api.com/json/" + ip + "?fields=status,message,country,countryCode,regionName,city,district,lat,lon,timezone,isp")
				if err != nil {
					fmt.Println("Error fetching IP data")
				}
				defer response.Body.Close()
				if response.StatusCode == http.StatusOK {
					bodyBytes, err := io.ReadAll(response.Body)
					if err != nil {
						fmt.Println("Error converting IP data")
						return
					}
					err = json.Unmarshal(bodyBytes, &ipdata)
					if err != nil {
						fmt.Println("Error converting IP data to struct")
						return
					}
				}
				// Save the search query to the database
				searchQuery := &storage.SearchQuery{
					Query:     query,
					UserAgent: c.Request().UserAgent(),
					Platform:  c.Request().Header.Get("User-Agent"),
					RequestIP: ip,
					Country:   ipdata.Country,
					Region:    ipdata.RegionName,
					City:      ipdata.City,
					District:  ipdata.District,
					Latitude:  ipdata.Lat,
					Longitude: ipdata.Lon,
					Timezone:  ipdata.Timezone,
					ISP:       ipdata.ISP,
				}
				searchQuery.Save()
			}
		}()
		err := next(c)
		return err
	}
}
