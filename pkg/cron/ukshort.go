package cron

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/homethings/pkg/utils"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/xuri/excelize/v2"
)

func uploadUKShortFile(app *pocketbase.PocketBase) {
	filePath := "uk-short/" + strconv.Itoa(time.Now().Year()) + "/" + time.Now().Month().String() + "/" + time.Now().Format("2006-01-02") + ".xlsx"
	src := "https://www.fca.org.uk/publication/data/short-positions-daily-update.xlsx"

	resp, err := http.Get(src)
	if err != nil {
		fmt.Println("error retrieving uk short file for today")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error reading uk short file for today")
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
		fmt.Println("error uploading uk short file for today")
		return
	}
	fmt.Println("successfully stored todays UK Short file")
}

func handleUKShortFile(app *pocketbase.PocketBase) {
	fileDate := time.Now().Format("2006-01-02") // Format to yyyy-mm-dd
	month := time.Now().Month().String()
	year := strconv.Itoa(time.Now().Year())
	filePath := "uk-short/" + year + "/" + month + "/" + fileDate + ".xlsx"

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
		fmt.Println("Error getting todays UK Short file")
		return
	}
	defer file.Close()

	// Read the file into memory
	b, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error reading file")
		return
	}

	// Convert the byte array into an io.Reader & open the spreadsheet
	reader := bytes.NewReader(b)
	f, err := excelize.OpenReader(reader)
	if err != nil {
		fmt.Println("error opening spreadsheet")
		return
	}
	// Close the spreadsheet.
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()
	// Get the list of sheets
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Println("error retrieving sheets")
		return
	}

	var dataErr error
	// Handle Current Data
	err = handleCurrentData(app, f, sheets[0])
	if err != nil {
		fmt.Println(err)
		dataErr = errors.New("error handling current data")
	}
	// Handle Historical Data
	err = handleHistoricalData(app, f, sheets[0])
	if err != nil {
		fmt.Println(err)
		dataErr = errors.New("error handling historical data")
	}
	if dataErr != nil {
		fmt.Println("error handling UK Short file" + dataErr.Error())
		return
	}
	fmt.Println("successfully handled UK Short file")
}

func handleCurrentData(app *pocketbase.PocketBase, file *excelize.File, sheet string) error {
	// Get the current data as rows
	rows, err := file.GetRows(sheet)
	if err != nil {
		fmt.Println(err)
		return errors.New("error retreiving current rows")
	}

	// Get the collection & truncate it
	collection, err := app.FindCollectionByNameOrId("uk_short_current")
	if err != nil {
		fmt.Println("error getting the vix collection")
		return errors.New("error getting the vix collection")
	}
	err = app.TruncateCollection(collection)
	if err != nil {
		fmt.Println("error truncating the uk_short_current collection")
		return errors.New("error truncating the uk_short_current collection")
	}

	// Range of the current data & insert into DB
	for _, row := range rows {
		netShortPosition, err := strconv.ParseFloat(row[3], 64)
		if err != nil {
			fmt.Println("----------")
			fmt.Println(err)
			fmt.Println(row)
			fmt.Println("error parsing Net Short Position")
			fmt.Println("----------")
			continue
		}
		date, err := time.Parse("01-02-06", row[4])
		if err != nil {
			fmt.Println("Error parsing date:", err)
			continue
		}
		// Create a new VIX data entry
		record := core.NewRecord(collection)
		record.Set("date", date)
		record.Set("holder", row[0])
		record.Set("issuer", row[1])
		record.Set("isin", row[2])
		record.Set("net_short_position", netShortPosition)

		err = app.Save(record)
		if err != nil {
			fmt.Println("error creating UK Short Current record")
			continue
		}
	}
	return nil
}

func handleHistoricalData(app *pocketbase.PocketBase, file *excelize.File, sheet string) error {
	lbd := utils.GetLastBusinessDay()
	lastBusinessDay := lbd.Format("01-02-06") // Format to mm-dd-yy
	historicalRows, err := file.GetRows(sheet)
	if err != nil {
		fmt.Println("error retreiving historical rows")
		return errors.New("error retreiving historical rows")
	}

	// Get the collection
	collection, err := app.FindCollectionByNameOrId("uk_short_historical")
	if err != nil {
		fmt.Println("error getting the vix collection")
		return errors.New("error getting the vix collection")
	}

	// Range over rows to find records for the last business day
	var inserterr error
	for _, row := range historicalRows {
		// Check if date is last business day - Excel changes the format of the date to dd/mm/yyyy
		if row[4] == lastBusinessDay {
			netShortPosition, err := strconv.ParseFloat(row[3], 64)
			if err != nil {
				fmt.Println("error parsing Net Short Position")
				inserterr = err
				continue
			}
			date, err := time.Parse("01-02-06", row[4])
			if err != nil {
				fmt.Println("Error parsing date:", err)
				inserterr = err
				continue
			}

			// Create a new VIX data entry
			record := core.NewRecord(collection)
			record.Set("date", date)
			record.Set("holder", row[0])
			record.Set("issuer", row[1])
			record.Set("isin", row[2])
			record.Set("net_short_position", netShortPosition)

			err = app.Save(record)
			if err != nil {
				fmt.Println("error creating UK Short Historical record")
				continue
			}

		}
	}
	if inserterr != nil {
		return inserterr
	}
	return nil
}
