package cronjobs

import (
	"fmt"

	"github.com/robfig/cron/v3"
	"homethings.ytsruh.com/pkg/search"
)

func Start() {
	c := cron.New()
	c.AddFunc("0 * * * *", search.RunEngine) // Run every hour
	c.AddFunc("0 15 * * *", search.RunIndex) // Run every hour at 15 minutes past
	c.Start()
	cronCount := len(c.Entries())
	fmt.Printf("setup %d cron jobs \n", cronCount)
}
