package routes

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/controllers"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/middleware"
	"ytsruh.com/homethings/internal/utils"
)

type Handler struct {
	authCtrl    *controllers.AuthController
	recipesCtrl *controllers.RecipesController
	authMw      *middleware.AuthMiddleware
	jwtService  *utils.JWTService
}

func NewHandler(database *db.DB, jwtService *utils.JWTService) *Handler {
	return &Handler{
		authCtrl:    controllers.NewAuthController(database, jwtService),
		recipesCtrl: controllers.NewRecipesController(database),
		authMw:      middleware.NewAuthMiddleware(jwtService),
		jwtService:  jwtService,
	}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	auth := e.Group("/auth")
	auth.Use(h.authMw.OptionalAuth)
	auth.POST("/login", h.authCtrl.Login)
	auth.POST("/register", h.authCtrl.Register)
	auth.POST("/logout", h.authCtrl.Logout)
	auth.GET("/me", h.authCtrl.Me)
	auth.PATCH("/me", h.authCtrl.UpdateProfile)

	api := e.Group("/api")
	api.POST("/recipes/extract", h.recipesCtrl.Extract)
	api.GET("/recipes", h.recipesCtrl.List)
	api.GET("/recipes/:id", h.recipesCtrl.Get)
	api.POST("/recipes", h.recipesCtrl.Create)
	api.PATCH("/recipes/:id", h.recipesCtrl.Update)
	api.DELETE("/recipes/:id", h.recipesCtrl.Delete)
	api.POST("/recipes/:id/upload-url", h.recipesCtrl.GetUploadURL)
	api.GET("/recipes/:id/image-url", h.recipesCtrl.GetImageURL)
}
