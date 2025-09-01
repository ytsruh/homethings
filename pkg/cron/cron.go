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

	// UK SHORT UPLOAD - every weekday at 17:30
	app.Cron().MustAdd("uploadUKShortFile", "30 17 * * 1-5", func() {
		uploadUKShortFile(app)
	})

	// UK SHORT HANDLER - every weekday at 17:35
	app.Cron().MustAdd("handleUKShortFile", "35 17 * * 1-5", func() {
		handleUKShortFile(app)
	})

}
