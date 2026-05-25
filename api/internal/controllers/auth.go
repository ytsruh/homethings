package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type AuthController struct {
	db       *db.DB
	validate *validator.Validate
	jwtSvc   *utils.JWTService
}

func NewAuthController(database *db.DB, jwtSvc *utils.JWTService) *AuthController {
	return &AuthController{
		db:       database,
		validate: validator.New(),
		jwtSvc:   jwtSvc,
	}
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required"`
}

type UpdateUserRequest struct {
	Name     *string `json:"name" validate:"optional"`
	Email    *string `json:"email" validate:"optional,email"`
	Password *string `json:"password" validate:"optional,min=6"`
}

func (ctrl *AuthController) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if err := ctrl.validate.Struct(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid email or password"})
	}

	ctx := context.Background()
	user, err := ctrl.db.Queries().GetUserByEmail(ctx, req.Email)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid email or password"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid email or password"})
	}

	token, err := ctrl.jwtSvc.Sign(utils.UserPayload{UserID: user.ID, Email: user.Email})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
	}

	cookie := &http.Cookie{
		Name:     utils.CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Login successful",
		"user": map[string]string{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
		},
	})
}

func (ctrl *AuthController) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if err := ctrl.validate.Struct(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid email or password"})
	}

	ctx := context.Background()
	_, err := ctrl.db.Queries().GetUserByEmail(ctx, req.Email)
	if err == nil {
		return c.JSON(http.StatusConflict, map[string]string{"message": "Email already registered"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
	}

	id := uuid.New().String()
	now := time.Now().Unix()

	_, err = ctrl.db.Queries().CreateUser(ctx, db.CreateUserParams{
		ID:           id,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		CreatedAt:    now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
	}

	token, err := ctrl.jwtSvc.Sign(utils.UserPayload{UserID: id, Email: req.Email})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
	}

	cookie := &http.Cookie{
		Name:     utils.CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Registration successful",
		"user": map[string]string{
			"id":    id,
			"email": req.Email,
			"name":  req.Name,
		},
	})
}

func (ctrl *AuthController) Logout(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     utils.CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Logout successful"})
}

func (ctrl *AuthController) Me(c echo.Context) error {
	userPayload, ok := c.Get("user").(*utils.UserPayload)
	if !ok || userPayload == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}

	ctx := context.Background()
	user, err := ctrl.db.Queries().GetUserByID(ctx, userPayload.UserID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "User not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user": map[string]string{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
		},
	})
}

func (ctrl *AuthController) UpdateProfile(c echo.Context) error {
	userPayload, ok := c.Get("user").(*utils.UserPayload)
	if !ok || userPayload == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}

	var req UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.Name == nil && req.Email == nil && req.Password == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "No fields to update"})
	}

	ctx := context.Background()
	queries := ctrl.db.Queries()

	if req.Email != nil {
		_, err := queries.GetUserByEmail(ctx, *req.Email)
		if err == nil {
			return c.JSON(http.StatusConflict, map[string]string{"message": "Email already in use"})
		}
	}

	if req.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
		}
		_, err = queries.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
			PasswordHash: string(hashedPassword),
			ID:           userPayload.UserID,
		})
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
		}
	}

	if req.Name != nil || req.Email != nil {
		name := req.Name
		email := req.Email
		if name == nil {
			user, _ := queries.GetUserByID(ctx, userPayload.UserID)
			name = &user.Name
		}
		if email == nil {
			user, _ := queries.GetUserByID(ctx, userPayload.UserID)
			email = &user.Email
		}
		_, err := queries.UpdateUserNameEmail(ctx, db.UpdateUserNameEmailParams{
			Email: *email,
			Name:  *name,
			ID:    userPayload.UserID,
		})
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Internal server error"})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Profile updated"})
}
