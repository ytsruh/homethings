package cronjobs

import (
	"fmt"

	"github.com/robfig/cron/v3"
)

func Start() {
	c := cron.New()
	c.AddFunc("0 * * * *", task) // Run every hour
	c.Start()
	cronCount := len(c.Entries())
	fmt.Printf("setup %d cron jobs \n", cronCount)
}

func task() {
	fmt.Println("started random task...")
	defer fmt.Println("random task has finished")
}
