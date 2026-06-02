package controllers

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type WealthController struct {
	db *db.DB
}

func NewWealthController(database *db.DB) *WealthController {
	return &WealthController{db: database}
}

type AccountResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	IsLiquid  bool   `json:"isLiquid"`
	IsClosed  bool   `json:"isClosed"`
	CreatedAt string `json:"createdAt"`
}

type AccountValueResponse struct {
	ID        string `json:"id"`
	AccountID string `json:"accountId"`
	YearMonth string `json:"yearMonth"`
	Value     int64  `json:"value"`
	CreatedAt string `json:"createdAt"`
}

type TotalsResponse struct {
	TotalAssets      int64    `json:"totalAssets"`
	TotalLiabilities int64    `json:"totalLiabilities"`
	NetWorth         int64    `json:"netWorth"`
	LiquidAssets     int64    `json:"liquidAssets"`
	LiquidPercent    float64  `json:"liquidPercent"`
	MoMChange        int64    `json:"moMChange"`
	MoMPercent       *float64 `json:"moMPercent"`
	YoYPercent       *float64 `json:"yoYPercent"`
}

type CreateAccountRequest struct {
	Name     string `json:"name" validate:"required"`
	Type     string `json:"type" validate:"required"`
	IsLiquid bool   `json:"isLiquid"`
}

type UpdateAccountRequest struct {
	Name     *string `json:"name"`
	Type     *string `json:"type"`
	IsLiquid *bool   `json:"isLiquid"`
	IsClosed *bool   `json:"isClosed"`
}

type UpsertValueRequest struct {
	AccountID string `json:"accountId" validate:"required"`
	YearMonth string `json:"yearMonth" validate:"required"`
	Value     int64  `json:"value"`
}

func parseAccount(dbAccount db.WealthAccount) AccountResponse {
	return AccountResponse{
		ID:        dbAccount.ID,
		Name:      dbAccount.Name,
		Type:      dbAccount.Type,
		IsLiquid:  dbAccount.IsLiquid == 1,
		IsClosed:  dbAccount.IsClosed == 1,
		CreatedAt: formatTimestampISO8601(dbAccount.CreatedAt),
	}
}

func parseAccountValue(dbValue db.WealthAccountValue) AccountValueResponse {
	return AccountValueResponse{
		ID:        dbValue.ID,
		AccountID: dbValue.AccountID,
		YearMonth: dbValue.YearMonth,
		Value:     dbValue.Value,
		CreatedAt: formatTimestampISO8601(dbValue.CreatedAt),
	}
}

func (ctrl *WealthController) ListAccounts(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)

	accounts, err := ctrl.db.Queries().ListAccountsByUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch accounts"})
	}

	response := make([]AccountResponse, 0, len(accounts))
	for _, account := range accounts {
		response = append(response, parseAccount(account))
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *WealthController) CreateAccount(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)

	var req CreateAccountRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Name is required"})
	}

	accountType := req.Type
	if accountType != "asset" && accountType != "liability" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Type must be 'asset' or 'liability'"})
	}

	now := time.Now().Unix()
	accountID := uuid.New().String()

	isLiquid := 0
	if req.IsLiquid {
		isLiquid = 1
	}

	created, err := ctrl.db.Queries().CreateAccount(context.Background(), db.CreateAccountParams{
		ID:        accountID,
		Name:      req.Name,
		Type:      accountType,
		IsLiquid:  int64(isLiquid),
		IsClosed:  0,
		UserID:    user.UserID,
		CreatedAt: now,
	})
	if err != nil {
		fmt.Printf("CreateAccount error: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create account"})
	}

	return c.JSON(http.StatusCreated, parseAccount(created))
}

func (ctrl *WealthController) UpdateAccount(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Account ID required"})
	}

	existing, err := ctrl.db.Queries().GetAccountByID(context.Background(), db.GetAccountByIDParams{
		ID:     id,
		UserID: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Account not found"})
	}

	var req UpdateAccountRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	name := existing.Name
	if req.Name != nil {
		name = *req.Name
	}

	accountType := existing.Type
	if req.Type != nil {
		if *req.Type == "asset" || *req.Type == "liability" {
			accountType = *req.Type
		}
	}

	isLiquid := existing.IsLiquid
	if req.IsLiquid != nil {
		if *req.IsLiquid {
			isLiquid = 1
		} else {
			isLiquid = 0
		}
	}

	isClosed := existing.IsClosed
	if req.IsClosed != nil {
		if *req.IsClosed {
			isClosed = 1
		} else {
			isClosed = 0
		}
	}

	updated, err := ctrl.db.Queries().UpdateAccount(context.Background(), db.UpdateAccountParams{
		Name:     name,
		Type:     accountType,
		IsLiquid: isLiquid,
		IsClosed: isClosed,
		ID:       id,
		UserID:   user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to update account"})
	}

	return c.JSON(http.StatusOK, parseAccount(updated))
}

func (ctrl *WealthController) DeleteAccount(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Account ID required"})
	}

	_, err := ctrl.db.Queries().DeleteAccount(context.Background(), db.DeleteAccountParams{
		ID:     id,
		UserID: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Account not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Account deleted"})
}

func (ctrl *WealthController) GetValuesByMonth(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	yearMonth := c.Param("yearMonth")

	if yearMonth == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Year-month required"})
	}

	if !isValidYearMonth(yearMonth) {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid year-month format (use YYYY-MM)"})
	}

	values, err := ctrl.db.Queries().ListValuesByYearMonth(context.Background(), db.ListValuesByYearMonthParams{
		UserID:    user.UserID,
		YearMonth: yearMonth,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch values"})
	}

	accounts, err := ctrl.db.Queries().ListAccountsByUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch accounts"})
	}

	type AccountWithValue struct {
		Account AccountResponse   `json:"account"`
		Value   *AccountValueResponse `json:"value"`
	}

	result := make([]AccountWithValue, 0, len(accounts))
	for _, account := range accounts {
		awv := AccountWithValue{
			Account: parseAccount(account),
			Value:   nil,
		}
		for _, v := range values {
			if v.AccountID == account.ID {
				val := parseAccountValue(v)
				awv.Value = &val
				break
			}
		}
		result = append(result, awv)
	}

	return c.JSON(http.StatusOK, result)
}

func (ctrl *WealthController) UpsertValue(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)

	var req UpsertValueRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.AccountID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Account ID required"})
	}

	if !isValidYearMonth(req.YearMonth) {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid year-month format (use YYYY-MM)"})
	}

	_, err := ctrl.db.Queries().GetAccountByID(context.Background(), db.GetAccountByIDParams{
		ID:     req.AccountID,
		UserID: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Account not found"})
	}

	now := time.Now().Unix()
	valueID := uuid.New().String()

	upserted, err := ctrl.db.Queries().UpsertValue(context.Background(), db.UpsertValueParams{
		ID:        valueID,
		AccountID: req.AccountID,
		YearMonth: req.YearMonth,
		Value:     req.Value,
		CreatedAt: now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to upsert value"})
	}

	return c.JSON(http.StatusOK, parseAccountValue(upserted))
}

func (ctrl *WealthController) GetTotals(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	yearMonth := c.Param("yearMonth")

	if yearMonth == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Year-month required"})
	}

	if !isValidYearMonth(yearMonth) {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid year-month format (use YYYY-MM)"})
	}

	accounts, err := ctrl.db.Queries().ListAccountsByUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch accounts"})
	}

	values, err := ctrl.db.Queries().ListValuesByYearMonth(context.Background(), db.ListValuesByYearMonthParams{
		UserID:    user.UserID,
		YearMonth: yearMonth,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch values"})
	}

	valueMap := make(map[string]int64)
	for _, v := range values {
		valueMap[v.AccountID] = v.Value
	}

	var totalAssets, totalLiabilities, liquidAssets int64
	for _, account := range accounts {
		val := valueMap[account.ID]
		if account.Type == "asset" {
			totalAssets += val
			if account.IsLiquid == 1 {
				liquidAssets += val
			}
		} else {
			totalLiabilities += val
		}
	}

	netWorth := totalAssets - totalLiabilities

	var liquidPercent float64
	if totalAssets > 0 {
		liquidPercent = float64(liquidAssets) / float64(totalAssets) * 100
	}

	prevMonth := getPreviousMonth(yearMonth)
	prevNetWorth := computeNetWorthForMonth(user.UserID, ctrl.db, prevMonth)

	moMChange := netWorth - prevNetWorth
	var moMPercent *float64
	if prevNetWorth != 0 {
		pct := float64(moMChange) / float64(prevNetWorth) * 100
		moMPercent = &pct
	}

	yearAgo := getYearAgoMonth(yearMonth)
	yearAgoNetWorth := computeNetWorthForMonth(user.UserID, ctrl.db, yearAgo)

	var yoYPercent *float64
	if yearAgoNetWorth != 0 {
		pct := float64(netWorth-yearAgoNetWorth) / float64(yearAgoNetWorth) * 100
		yoYPercent = &pct
	}

	return c.JSON(http.StatusOK, TotalsResponse{
		TotalAssets:     totalAssets,
		TotalLiabilities: totalLiabilities,
		NetWorth:        netWorth,
		LiquidAssets:    liquidAssets,
		LiquidPercent:   liquidPercent,
		MoMChange:       moMChange,
		MoMPercent:      moMPercent,
		YoYPercent:      yoYPercent,
	})
}

func isValidYearMonth(ym string) bool {
	if len(ym) != 7 {
		return false
	}
	if ym[4] != '-' {
		return false
	}
	year, err := strconv.Atoi(ym[:4])
	if err != nil {
		return false
	}
	month, err := strconv.Atoi(ym[5:])
	if err != nil {
		return false
	}
	return year >= 2000 && year <= 2100 && month >= 1 && month <= 12
}

func getPreviousMonth(ym string) string {
	year, _ := strconv.Atoi(ym[:4])
	month, _ := strconv.Atoi(ym[5:])
	if month == 1 {
		return strconv.Itoa(year-1) + "-12"
	}
	return fmt.Sprintf("%d-%02d", year, month-1)
}

func getYearAgoMonth(ym string) string {
	year, _ := strconv.Atoi(ym[:4])
	month, _ := strconv.Atoi(ym[5:])
	year -= 1
	return fmt.Sprintf("%d-%02d", year, month)
}

func computeNetWorthForMonth(userID string, database *db.DB, yearMonth string) int64 {
	accounts, err := database.Queries().ListAccountsByUser(context.Background(), userID)
	if err != nil {
		return 0
	}

	values, err := database.Queries().ListValuesByYearMonth(context.Background(), db.ListValuesByYearMonthParams{
		UserID:    userID,
		YearMonth: yearMonth,
	})
	if err != nil {
		return 0
	}

	valueMap := make(map[string]int64)
	for _, v := range values {
		valueMap[v.AccountID] = v.Value
	}

	var totalAssets, totalLiabilities int64
	for _, account := range accounts {
		val := valueMap[account.ID]
		if account.Type == "asset" {
			totalAssets += val
		} else {
			totalLiabilities += val
		}
	}

	return totalAssets - totalLiabilities
}

type MonthData struct {
	YearMonth string                     `json:"yearMonth"`
	Accounts  []AccountWithValueForMonth `json:"accounts"`
}

type AccountWithValueForMonth struct {
	Account AccountResponse `json:"account"`
	Value   *int64           `json:"value"`
}

func (ctrl *WealthController) GetAllMonthsData(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)

	accounts, err := ctrl.db.Queries().ListAccountsByUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch accounts"})
	}

	allValues, err := ctrl.db.Queries().GetAllValuesForUser(context.Background(), user.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch values"})
	}

	byMonth := make(map[string]map[string]int64)
	for _, v := range allValues {
		if _, ok := byMonth[v.YearMonth]; !ok {
			byMonth[v.YearMonth] = make(map[string]int64)
		}
		byMonth[v.YearMonth][v.AccountID] = v.Value
	}

	var yearMonths []string
	for ym := range byMonth {
		yearMonths = append(yearMonths, ym)
	}
	sort.Strings(yearMonths)

	result := make([]MonthData, 0, len(yearMonths))
	for _, ym := range yearMonths {
		monthData := MonthData{
			YearMonth: ym,
			Accounts:  make([]AccountWithValueForMonth, 0, len(accounts)),
		}
		for _, account := range accounts {
			awv := AccountWithValueForMonth{
				Account: parseAccount(account),
				Value:   nil,
			}
			if monthValues, ok := byMonth[ym]; ok {
				if val, ok := monthValues[account.ID]; ok {
					awv.Value = &val
				}
			}
			monthData.Accounts = append(monthData.Accounts, awv)
		}
		result = append(result, monthData)
	}

	return c.JSON(http.StatusOK, result)
}