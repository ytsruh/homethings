package db

import (
	"time"
)

type Account struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Name      string
	CreatedAt *time.Time
	UpdatedAt time.Time
	Documents []Document `gorm:"foreignKey:AccountId"`
}

type User struct {
	ID            string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Name          string `gorm:"default:'User Name'"`
	Email         string `gorm:"unique"`
	Password      string
	ProfileImage  *string
	ShowBooks     bool `gorm:"default:true"`
	ShowDocuments bool `gorm:"default:true"`
	AccountId     string
	Account       Account `gorm:"foreignKey:AccountId;references:ID"`
	CreatedAt     *time.Time
	UpdatedAt     time.Time
}

type Feedback struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Title     string
	Body      *string
	UserId    string `gorm:"type:uuid"`
	User      User   `gorm:"foreignKey:UserId;references:ID"`
	CreatedAt *time.Time
	UpdatedAt time.Time
}

func (f *Feedback) TableName() string {
	return "feedback"
}

type Document struct {
	ID          string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Title       string
	Description *string
	AccountId   string `gorm:"type:uuid"`
	FileName    string
	Account     Account `gorm:"foreignKey:AccountId;references:ID"`
	CreatedAt   *time.Time
	UpdatedAt   time.Time
}

// type Book struct {
// 	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
// 	Name      string
// 	Isbn      string
// 	Author    string
// 	Genre     string
// 	Rating    int
// 	Image     string
// 	Read      bool `gorm:"default:false"`
// 	Wishlist  bool `gorm:"default:false"`
// 	UserId    string
// 	User      User `gorm:"foreignKey:UserId;references:ID"`
// 	CreatedAt *time.Time
// 	UpdatedAt time.Time
// }
