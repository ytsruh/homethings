package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/a-h/templ"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/models"
	"homethings.ytsruh.com/views"
	"homethings.ytsruh.com/views/components"
)

type AdminClaims struct {
	User                 string `json:"user"`
	Id                   string `json:"id"`
	jwt.RegisteredClaims `json:"claims"`
}

type AdminHandler struct {
	User     models.User
	Settings models.SearchSettings
}

type loginInput struct {
	Email    string `form:"email"`
	Password string `form:"password"`
}

type settingsInput struct {
	Amount   uint   `form:"amount"`
	SearchOn string `form:"searchOn"`
	AddNew   string `form:"addNew"`
}

// This custom Render replaces Echo's echo.Context.Render() with templ's templ.Component.Render().
func (h *AdminHandler) Render(ctx echo.Context, statusCode int, t templ.Component) error {
	ctx.Response().Writer.WriteHeader(statusCode)
	ctx.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)
	return t.Render(ctx.Request().Context(), ctx.Response().Writer)
}

func (h *AdminHandler) DashboardHandler(c echo.Context) error {
	err := h.Settings.Get()
	if err != nil {
		return h.Render(c, http.StatusInternalServerError, views.ErrorPage())
	}
	amount := strconv.FormatUint(uint64(h.Settings.Amount), 10)
	return h.Render(c, http.StatusOK, views.AdminPage(amount, h.Settings.SearchOn, h.Settings.AddNew))
}

func (h *AdminHandler) DashboardPostHandler(c echo.Context) error {
	input := new(settingsInput)
	if err := c.Bind(input); err != nil {
		fmt.Println(err)
		return h.Render(c, http.StatusBadRequest, components.Alert("Error", "Something went wrong"))
	}
	// Convert checkbox 'on' values to boolean
	addNew := false
	if input.AddNew == "on" {
		addNew = true
	}
	searchOn := false
	if input.SearchOn == "on" {
		searchOn = true
	}
	fmt.Println(input.Amount, searchOn, addNew)
	h.Settings.Amount = input.Amount
	h.Settings.SearchOn = searchOn
	h.Settings.AddNew = addNew
	err := h.Settings.Update()
	if err != nil {
		fmt.Println(err)
		return h.Render(c, http.StatusBadRequest, components.Alert("Error", "Something went wrong saving the settings"))
	}
	return h.Render(c, http.StatusOK, components.Alert("Success", "Settings Updated"))
}

func (h *AdminHandler) LoginHandler(c echo.Context) error {
	return h.Render(c, http.StatusOK, views.LoginPage())
}

func (h *AdminHandler) LoginPostHandler(c echo.Context) error {
	u := new(loginInput)
	if err := c.Bind(u); err != nil {
		return h.Render(c, http.StatusBadRequest, components.Alert("Error", "Something went wrong"))
	}
	user, err := h.User.LoginAsAdmin(u.Email, u.Password)
	if err != nil {
		return h.Render(c, http.StatusUnauthorized, components.Alert("Unauthorised", "Invalid email or password"))
	}

	// Create JWT
	claims := AdminClaims{
		user.Email,
		user.ID,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			Issuer:    "homethings",
		},
	}
	// Create & sign and get the complete encoded token as a string using the secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		return h.Render(c, http.StatusBadRequest, components.Alert("Error", "Something went wrong logging you in"))
	}
	cookie := &http.Cookie{
		Name:     "homethings-admin",
		Value:    signedToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
	}
	c.SetCookie(cookie)
	c.Response().Header().Set("HX-Redirect", "/admin/")
	return c.NoContent(http.StatusOK)
}

func (h *AdminHandler) LogoutHandler(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     "homethings-admin",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	}
	c.SetCookie(cookie)
	c.Response().Header().Set("HX-Redirect", "/admin/login")
	return c.NoContent(http.StatusOK)
}

func (h *AdminHandler) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get the cookie by name
		cookie, err := c.Cookie("homethings-admin")
		if err != nil {
			c.Redirect(http.StatusFound, "/admin/login")
			return nil

		}
		// Parse the cookie & check for errors
		token, err := jwt.ParseWithClaims(cookie.Value, &AdminClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET_KEY")), nil
		})
		if err != nil {
			return c.Redirect(http.StatusFound, "/admin/login")
		}
		// Parse the custom claims & check jwt is valid
		_, ok := token.Claims.(*AdminClaims)
		if ok && token.Valid {
			return next(c)
		}
		return c.Redirect(http.StatusFound, "/admin/login")
	}
}
