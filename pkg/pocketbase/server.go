package pocketbase

import (
	"fmt"
	"log"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "github.com/homethings/migrations"
	"github.com/homethings/pkg/cron"
)

// Config holds the application configuration
var Config *envvar

type envvar struct {
	ENV                   string
	STORAGE_KEY           string
	STORAGE_SECRET        string
	STORAGE_ENDPOINT      string
	STORAGE_BUCKET        string
	STORAGE_BACKUP_BUCKET string
	SMTP_SERVER           string
	SMTP_PORT             string
	SMTP_USERNAME         string
	SMTP_PASSWORD         string
	OPENROUTER_API_KEY    string
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	env := envvar{
		ENV:                   os.Getenv("ENV"),
		STORAGE_KEY:           os.Getenv("STORAGE_KEY"),
		STORAGE_SECRET:        os.Getenv("STORAGE_SECRET"),
		STORAGE_ENDPOINT:      os.Getenv("STORAGE_ENDPOINT"),
		STORAGE_BUCKET:        os.Getenv("STORAGE_BUCKET"),
		STORAGE_BACKUP_BUCKET: os.Getenv("STORAGE_BACKUP_BUCKET"),
		SMTP_SERVER:           os.Getenv("SMTP_SERVER"),
		SMTP_PORT:             os.Getenv("SMTP_PORT"),
		SMTP_USERNAME:         os.Getenv("SMTP_USERNAME"),
		SMTP_PASSWORD:         os.Getenv("SMTP_PASSWORD"),
		OPENROUTER_API_KEY:    os.Getenv("OPENROUTER_API_KEY"),
	}

	v := reflect.ValueOf(env)
	if v.Kind() != reflect.Struct {
		log.Fatal("Invalid struct")
	}

	for i := 0; i < v.NumField(); i++ {
		if v.Field(i).Kind() == reflect.String && v.Field(i).String() == "" {
			log.Fatalf(fmt.Sprintf("Missing environment variable: %s", v.Type().Field(i).Name))
		}
	}
	Config = &env
}

func Run() {
	app := pocketbase.New()

	// loosely check if it was executed using "go run"
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,
	})

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		settings := e.App.Settings()
		// for all available settings fields you could check
		// https://github.com/pocketbase/pocketbase/blob/develop/core/settings_model.go#L121-L130
		settings.Meta = core.MetaConfig{
			AppName:       "homethings",
			AppURL:        "https://homethings.ytsruh.com",
			HideControls:  false,
			SenderName:    "homethings",
			SenderAddress: "homethings@webiliti.com",
		}

		// SMTP Settings
		port, err := strconv.Atoi(Config.SMTP_PORT)
		if err != nil {
			log.Fatal("Invalid SMTP port")
		}
		smtpSettings := core.SMTPConfig{
			Enabled:    true,
			Host:       Config.SMTP_SERVER,
			Port:       port,
			Username:   Config.SMTP_USERNAME,
			Password:   Config.SMTP_PASSWORD,
			AuthMethod: "PLAIN",
			TLS:        false,
		}
		err = smtpSettings.Validate()
		if err != nil {
			log.Fatal(err)
		}
		settings.SMTP = smtpSettings

		// S3 Storage settings
		storageSettings := core.S3Config{
			Enabled:        true,
			Region:         "auto",
			ForcePathStyle: false,
			Bucket:         Config.STORAGE_BUCKET,
			Endpoint:       Config.STORAGE_ENDPOINT,
			AccessKey:      Config.STORAGE_KEY,
			Secret:         Config.STORAGE_SECRET,
		}
		err = storageSettings.Validate()
		if err != nil {
			log.Fatal(err)
		}
		settings.S3 = storageSettings

		// Backup settings
		backupSettings := core.BackupsConfig{
			Cron: "0 1 * * *",
			S3: core.S3Config{
				Enabled:        true,
				Region:         "auto",
				ForcePathStyle: false,
				Bucket:         Config.STORAGE_BACKUP_BUCKET,
				Endpoint:       Config.STORAGE_ENDPOINT,
				AccessKey:      Config.STORAGE_KEY,
				Secret:         Config.STORAGE_SECRET,
			},
			CronMaxKeep: 30,
		}
		err = backupSettings.Validate()
		if err != nil {
			log.Fatal(err)
		}
		settings.Backups = backupSettings

		app.Save(settings)

		return nil
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Initialize the OpenAI client
		initClient()
		// register routes (allowed only for authenticated users)
		se.Router.POST("/api/chat", postChat).Bind(apis.RequireAuth())

		// Start the cron jobs here to ensure settings are loaded
		cron.RunJobs(app)

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
