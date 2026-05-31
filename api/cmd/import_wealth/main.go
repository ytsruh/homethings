package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

func parseMonthHeader(header string) string {
	months := map[string]int{
		"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
		"Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
	}

	parts := strings.Split(header, " ")
	if len(parts) != 2 {
		return ""
	}

	monthStr := parts[0]
	yearStr := parts[1]

	month, ok := months[monthStr]
	if !ok {
		return ""
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		return ""
	}

	if year < 50 {
		year += 2000
	} else {
		year += 1900
	}

	return fmt.Sprintf("%d-%02d", year, month)
}

func parseValue(val string) (int64, bool) {
	val = strings.TrimSpace(val)
	val = strings.ReplaceAll(val, " ", "")
	val = strings.ReplaceAll(val, "", "")
	val = strings.ReplaceAll(val, ",", "")

	if val == "-" || val == "" {
		return 0, false
	}

	re := regexp.MustCompile(`[-]?[\d.]+`)
	matches := re.FindAllString(val, 1)
	if len(matches) == 0 {
		return 0, false
	}

	numStr := matches[0]
	if strings.HasPrefix(numStr, "-") {
		neg := strings.TrimPrefix(numStr, "-")
		valFloat, err := strconv.ParseFloat(neg, 64)
		if err != nil {
			return 0, false
		}
		return int64(valFloat * 100), true
	}

	valFloat, err := strconv.ParseFloat(numStr, 64)
	if err != nil {
		return 0, false
	}

	return int64(valFloat * 100), true
}

func main() {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "homethings.db"
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	userID := os.Getenv("USER_ID")
	if userID == "" {
		log.Fatal("USER_ID environment variable is required")
	}

	csvPath := os.Getenv("CSV_PATH")
	if csvPath == "" {
		csvPath = "Money.csv"
	}

	file, err := os.Open(csvPath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	if len(records) < 3 {
		log.Fatal("CSV must have at least 3 rows")
	}

	headerRow := records[0]
	monthHeaders := make([]string, 0)
	for i := 1; i < len(headerRow); i++ {
		ym := parseMonthHeader(headerRow[i])
		if ym != "" {
			monthHeaders = append(monthHeaders, ym)
		}
	}

	if len(monthHeaders) == 0 {
		log.Fatal("No valid month headers found")
	}

	fmt.Printf("Found %d months from %s to %s\n", len(monthHeaders), monthHeaders[0], monthHeaders[len(monthHeaders)-1])

	accountIDMap := make(map[string]string)
	now := time.Now().Unix()

	for rowIdx := 2; rowIdx < len(records); rowIdx++ {
		row := records[rowIdx]
		if len(row) == 0 || row[0] == "" {
			continue
		}

		accountName := strings.TrimSpace(row[0])

		if accountName == "Assets" || accountName == "Liabilties" || accountName == "" {
			continue
		}

		if accountName == "Closed" {
			continue
		}

		isLiability := rowIdx >= 24 && rowIdx <= 28

		accountID := uuid.New().String()
		accountIDMap[accountName] = accountID

		var isLiquid int64 = 0
		liquidAccounts := []string{"Marcus Cash ISA", "Katie Marcus", "Halifax Savings", "Katie Freetrade", "Freetrade ISA", "Freetrade GIA", "Katie HL", "Katie ISA", "Halifax B2L", "LSEG ShareSave 22", "LSEG ShareSave 21"}
		for _, la := range liquidAccounts {
			if accountName == la {
				isLiquid = 1
				break
			}
		}

		var accountType string
		if isLiability {
			accountType = "liability"
		} else {
			accountType = "asset"
		}

		_, err = db.Exec(`
			INSERT INTO wealth_accounts (id, name, type, is_liquid, is_closed, user_id, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, accountID, accountName, accountType, isLiquid, 0, userID, now)
		if err != nil {
			fmt.Printf("Error inserting account %s: %v\n", accountName, err)
		}

		for colIdx := 1; colIdx < len(row) && colIdx-1 < len(monthHeaders); colIdx++ {
			val := row[colIdx]
			valInt, hasValue := parseValue(val)
			if !hasValue {
				continue
			}

			valueID := uuid.New().String()
			_, err = db.Exec(`
				INSERT INTO wealth_account_values (id, account_id, year_month, value, created_at)
				VALUES (?, ?, ?, ?, ?)
			`, valueID, accountID, monthHeaders[colIdx-1], valInt, now)
			if err != nil {
				fmt.Printf("Error inserting value for %s, month %s: %v\n", accountName, monthHeaders[colIdx-1], err)
			}
		}
	}

	fmt.Println("Import complete!")

	var totalAccounts, totalValues int64
	db.QueryRow("SELECT COUNT(*) FROM wealth_accounts WHERE user_id = ?", userID).Scan(&totalAccounts)
	db.QueryRow("SELECT COUNT(*) FROM wealth_account_values").Scan(&totalValues)
	fmt.Printf("Created %d accounts and %d values\n", totalAccounts, totalValues)
}