package cronjobs

import (
	"fmt"

	"github.com/robfig/cron/v3"
	"homethings.ytsruh.com/pkg/search"
)

func Start() {
	c := cron.New()
	c.AddFunc("0 * * * *", search.Run) // Run every hour
	c.Start()
	cronCount := len(c.Entries())
	fmt.Printf("setup %d cron jobs \n", cronCount)
}
