package utils

import (
	"time"
)

func GetLastBusinessDay() time.Time {
	today := time.Now()
	if today.Weekday() == time.Monday {
		return today.AddDate(0, 0, -3)
	}
	return today.AddDate(0, 0, -1)
}
