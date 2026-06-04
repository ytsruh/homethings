package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	turso "turso.tech/database/tursogo"
	"ytsruh.com/homethings/internal/utils"
)

func parseMonthHeader(header string) string {
	months := map[string]int{
		"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
		"Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
	}

	parts := strings.Split(header, "-")
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

// Example usage:
// USER_ID=<your-user-id> DATABASE_PATH=./data/homethings.db CSV_PATH=./data/Money.csv go run ./cmd/import_wealth/
func main() {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "homethings.db"
	}

	env, err := utils.LoadAndValidateEnv()
	if err != nil {
		log.Fatalf("Failed to load environment: %v", err)
	}

	ctx := context.Background()

	syncDb, err := turso.NewTursoSyncDb(ctx, turso.TursoSyncDbConfig{
		Path:      dbPath,
		RemoteUrl: env.TURSO_DATABASE_URL,
		AuthToken: env.TURSO_AUTH_TOKEN,
	})
	if err != nil {
		log.Fatalf("Failed to create turso sync db: %v", err)
	}

	db, err := syncDb.Connect(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to Turso sync database")

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
	for i := 2; i < len(headerRow); i++ {
		ym := parseMonthHeader(headerRow[i])
		if ym != "" {
			monthHeaders = append(monthHeaders, ym)
		}
	}

	if len(monthHeaders) == 0 {
		log.Fatal("No valid month headers found")
	}

	fmt.Printf("Found %d months from %s to %s\n", len(monthHeaders), monthHeaders[0], monthHeaders[len(monthHeaders)-1])

	now := time.Now().Unix()

	for rowIdx := 1; rowIdx < len(records); rowIdx++ {
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

		isLiability := len(row) > 1 && strings.TrimSpace(row[1]) == "Liabilties"

		accountID := uuid.New().String()

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

		_, err = db.ExecContext(ctx, `
			INSERT INTO wealth_accounts (id, name, type, is_liquid, is_closed, user_id, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, accountID, accountName, accountType, isLiquid, 0, userID, now)
		if err != nil {
			fmt.Printf("Error inserting account %s: %v\n", accountName, err)
		}

		for colIdx := 2; colIdx < len(row) && colIdx-2 < len(monthHeaders); colIdx++ {
			val := row[colIdx]
			valInt, hasValue := parseValue(val)
			if !hasValue {
				continue
			}

			valueID := uuid.New().String()
			_, err = db.ExecContext(ctx, `
				INSERT INTO wealth_account_values (id, account_id, year_month, value, created_at)
				VALUES (?, ?, ?, ?, ?)
			`, valueID, accountID, monthHeaders[colIdx-2], valInt, now)
			if err != nil {
				fmt.Printf("Error inserting value for %s, month %s: %v\n", accountName, monthHeaders[colIdx-1], err)
			}
		}
	}

	fmt.Println("Import complete! Clearing any stale sync state...")
	if _, err := syncDb.Pull(ctx); err != nil {
		fmt.Printf("Warning: pull failed (may be expected if no remote changes): %v\n", err)
	}

	time.Sleep(1 * time.Second)

	fmt.Println("Pushing to Turso...")
	if err := syncDb.Push(ctx); err != nil {
		log.Fatalf("Failed to push to Turso: %v", err)
	}

	for i := 0; i < 3; i++ {
		time.Sleep(2 * time.Second)
		stats, err := syncDb.Stats(ctx)
		if err != nil {
			log.Fatalf("Failed to get sync stats: %v", err)
		}

		if stats.CdcOperations == 0 {
			break
		}

		fmt.Printf("Attempt %d: %d operations still pending, retrying push...\n", i+1, stats.CdcOperations)
		if err := syncDb.Push(ctx); err != nil {
			log.Fatalf("Failed to push to Turso: %v", err)
		}
	}

	stats, err := syncDb.Stats(ctx)
	if err != nil {
		log.Fatalf("Failed to get sync stats: %v", err)
	}

	if stats.CdcOperations > 0 {
		fmt.Printf("Warning: %d operations still pending. Data is likely synced but sync engine has lingering state.\n", stats.CdcOperations)
		fmt.Println("Check Turso dashboard to confirm data reached the cloud.")
	} else {
		fmt.Println("Sync confirmed - all changes pushed to Turso cloud")
	}

	var totalAccounts, totalValues int64
	db.QueryRowContext(ctx, "SELECT COUNT(*) FROM wealth_accounts WHERE user_id = ?", userID).Scan(&totalAccounts)
	db.QueryRowContext(ctx, "SELECT COUNT(*) FROM wealth_account_values").Scan(&totalValues)
	fmt.Printf("Created %d accounts and %d values\n", totalAccounts, totalValues)
}
