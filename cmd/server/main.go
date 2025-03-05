package main

import (
	"log"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

// register the libsql driver to use the same query builder
// implementation as the already existing sqlite3 builder
func init() {
	dbx.BuilderFuncMap["libsql"] = dbx.BuilderFuncMap["sqlite3"]
}

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DBConnect: func(dbPath string) (*dbx.DB, error) {
			if strings.Contains(dbPath, "data.db") {
				return dbx.Open("libsql", "libsql://[data.db DATABASE].turso.io?authToken=[TOKEN]")
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
