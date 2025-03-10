package pkg

import (
	"fmt"
	"log"
	"os"
	"reflect"
	"strings"

	"github.com/joho/godotenv"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

// Config holds the application configuration
var Config *envvar

type envvar struct {
	ENV         string
	TURSO_TOKEN string
	TURSO_URL   string
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	env := envvar{
		ENV:         os.Getenv("ENV"),
		TURSO_TOKEN: os.Getenv("TURSO_TOKEN"),
		TURSO_URL:   os.Getenv("TURSO_URL"),
	}

	v := reflect.ValueOf(env)
	if v.Kind() != reflect.Struct {
		log.Fatal("Invalid struct")
	}

	for i := 0; i < v.NumField(); i++ {
		if v.Field(i).Kind() == reflect.String && v.Field(i).String() == "" {
			log.Fatal(fmt.Sprintf("Missing environment variable: %s", v.Type().Field(i).Name))
		}
	}
	Config = &env
}

// register the libsql driver to use the same query builder implementation as the already existing sqlite3 builder
func init() {
	dbx.BuilderFuncMap["libsql"] = dbx.BuilderFuncMap["sqlite3"]
}

func Run() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DBConnect: func(dbPath string) (*dbx.DB, error) {
			if strings.Contains(dbPath, "data.db") {
				return dbx.Open("libsql", fmt.Sprintf("%s?authToken=%s", Config.TURSO_URL, Config.TURSO_TOKEN))
			}
			// optionally for the logs (aka. pb_data/auxiliary.db) use the default local filesystem driver
			return core.DefaultDBConnect(dbPath)
		},
	})

	// any custom hooks or plugins...

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
