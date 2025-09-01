package cron

import (
	"github.com/pocketbase/pocketbase"
)

func RunJobs(app *pocketbase.PocketBase) {
	// FX DATA HANDLER - every day at 01:00
	app.Cron().MustAdd("getFX", "0 1 * * *", func() {
		getFXData(app)
	})

	// VIX UPLOAD - every weekday at 20:00
	app.Cron().MustAdd("uploadVix", "0 20 * * 1-5", func() {
		uploadVixFile(app)
	})

	// VIX HANDLER - every weekday at 20:05
	app.Cron().MustAdd("handleVix", "5 20 * * 1-5", func() {
		handleVixFile(app)
	})

}
