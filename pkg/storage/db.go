package storage

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Account struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Name      string
	CreatedAt *time.Time
	UpdatedAt time.Time
}

var DBConn *gorm.DB

func InitDB() *gorm.DB {
	dburl := os.Getenv("DATABASE_URL")
	var err error
	DBConn, err = gorm.Open(postgres.Open(dburl))
	if err != nil {
		fmt.Println("Failed to connect to database")
		panic("Failed to connect to database")
	}

	// Enable uuid-ossp extension
	err = DBConn.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error
	if err != nil {
		fmt.Println("Failed to enable uuid-ossp extension")
		panic(err)
	}

	err = DBConn.AutoMigrate(&Account{}, &User{}, &Feedback{}, &Document{}, &Book{}, &SearchSettings{},
		&CrawledUrl{}, &SearchIndex{}, &SearchQuery{})
	if err != nil {
		fmt.Println("Failed to migrate")
		panic(err)
	}
	return DBConn
}

func GetDB() *gorm.DB {
	return DBConn
}
