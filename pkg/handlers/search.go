package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type SearchHandler struct {
	Index storage.SearchIndex
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
