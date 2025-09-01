package cron

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/homethings/pkg/utils"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func uploadVixFile(app *pocketbase.PocketBase) {
	filePath := "vix/" + strconv.Itoa(time.Now().Year()) + "/" + time.Now().Month().String() + "/" + time.Now().Format("2006-01-02") + ".csv"
	src := "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv"

	resp, err := http.Get(src)
	if err != nil {
		fmt.Println("error retrieving vix rate data for today")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error reading vix rate data for today")
		return
	}

	// initialize the filesystem/storage
	storage, err := app.NewFilesystem()
	if err != nil {
		fmt.Println("Error creating new storage instance")
		return
	}
	defer storage.Close()

	// upload the file to the storage
	err = storage.Upload(body, filePath)
	if err != nil {
		fmt.Println("error uploading vix rate data for today")
		return
	}

	fmt.Println("successfully stored todays VIX file")
}

func handleVixFile(app *pocketbase.PocketBase) {
	fileDate := time.Now().Format("2006-01-02") // Format to yyyy-mm-dd
	month := time.Now().Month().String()
	year := strconv.Itoa(time.Now().Year())
	filePath := "vix/" + year + "/" + month + "/" + fileDate + ".csv"

	// initialize the filesystem/storage
	storage, err := app.NewFilesystem()
	if err != nil {
		fmt.Println("Error creating new storage instance")
		return
	}
	defer storage.Close()

	// retrieve a file reader for the avatar key
	file, err := storage.GetFile(filePath)
	if err != nil {
		fmt.Println("Error getting todays VIX file")
		return
	}
	defer file.Close()

	// Read the file into memory and check the size
	b, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error reading file")
		return
	}

	// Create a new CSV reader & read all rows from the CSV
	bytesreader := bytes.NewReader(b)
	reader := csv.NewReader(bytesreader)
	records, err := reader.ReadAll()
	if err != nil {
		fmt.Println("error opening file")
		slog.Error("Handle VIX Cron Job", slog.String("error", "error opening file"))
		return
	}

	lbd := utils.GetLastBusinessDay().Format("01/02/2006") // Format to mm/dd/yyyy
	for _, row := range records {
		if row[0] == lbd {
			date, err := time.Parse("01/02/2006", row[0])
			if err != nil {
				fmt.Println("Error parsing date:", err)
				continue
			}
			open, err := strconv.ParseFloat(row[1], 64)
			if err != nil {
				fmt.Println("error parsing vix open value")
				continue
			}
			high, err := strconv.ParseFloat(row[2], 64)
			if err != nil {
				fmt.Println("error parsing vix high value")
				continue
			}
			low, err := strconv.ParseFloat(row[3], 64)
			if err != nil {
				fmt.Println("error parsing vix low value")
				continue
			}
			close, err := strconv.ParseFloat(row[4], 64)
			if err != nil {
				fmt.Println("error parsing vix close value")
				continue
			}

			// Create a new VIX data entry
			collection, err := app.FindCollectionByNameOrId("vix")
			if err != nil {
				fmt.Println("error getting the vix collection")
				continue
			}
			record := core.NewRecord(collection)
			record.Set("date", date)
			record.Set("open", open)
			record.Set("high", high)
			record.Set("low", low)
			record.Set("close", close)
			err = app.Save(record)
			if err != nil {
				fmt.Println("error saving the vix record")
				continue
			}

		}
	}
	slog.Info("Handle VIX Cron Job", slog.String("success", "successfully handled todays VIX file"))
}
